import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DESTINATION_READ_ONLY_ENV,
  blockDestinationMutations,
  isDestinationReadOnly,
} from "../server/destinationReadOnly";

vi.mock("../server/db", () => ({ db: {} }));

import { runIndraPush, startIndraPushScheduler } from "../server/indraIntegration";

const originalFlag = process.env[DESTINATION_READ_ONLY_ENV];

afterEach(() => {
  if (originalFlag === undefined) delete process.env[DESTINATION_READ_ONLY_ENV];
  else process.env[DESTINATION_READ_ONLY_ENV] = originalFlag;
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("destination read-only mode", () => {
  it("defaults off and only enables when explicitly set to true", () => {
    expect(isDestinationReadOnly({})).toBe(false);
    expect(isDestinationReadOnly({ [DESTINATION_READ_ONLY_ENV]: "false" })).toBe(false);
    expect(isDestinationReadOnly({ [DESTINATION_READ_ONLY_ENV]: "true" })).toBe(true);
  });

  it("keeps GET pages available while blocking unsafe HTTP methods", () => {
    process.env[DESTINATION_READ_ONLY_ENV] = "true";
    const next = vi.fn();
    const response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;
    blockDestinationMutations({ method: "POST" } as any, response, next);
    expect(response.status).toHaveBeenCalledWith(503);
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringMatching(/read-only/i) }));
    expect(next).not.toHaveBeenCalled();

    blockDestinationMutations({ method: "GET" } as any, response, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("prevents Indra delivery and scheduling before any outbound request", async () => {
    process.env[DESTINATION_READ_ONLY_ENV] = "true";
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const timerSpy = vi.spyOn(globalThis, "setTimeout");

    await expect(runIndraPush()).resolves.toEqual({
      deliveryId: "",
      sent: false,
      reason: "Destination copy is read-only",
    });
    startIndraPushScheduler();

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(timerSpy).not.toHaveBeenCalled();
  });
});