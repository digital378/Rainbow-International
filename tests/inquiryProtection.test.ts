import { beforeEach, describe, expect, it, vi } from "vitest";

const mockExecute = vi.hoisted(() => vi.fn());

vi.mock("../server/db", () => ({
  db: { execute: mockExecute },
}));

import { checkInquiryProtection } from "../server/inquiryProtection";
import { insertInquirySchema } from "../shared/schema";

const inquiry = {
  ipAddress: "203.0.113.25",
  parentName: "Test Parent",
  studentName: "Test Child",
  phone: "9876543210",
  email: "parent@example.com",
  grade: "Class 1",
};

describe("public enquiry abuse protection", () => {
  beforeEach(() => {
    mockExecute.mockReset();
  });

  it("rejects a filled honeypot before making a database request", async () => {
    await expect(checkInquiryProtection({ ...inquiry, honeypot: "bot value" }))
      .resolves.toEqual({ allowed: false, reason: "honeypot" });
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it("rejects forms submitted too quickly before making a database request", async () => {
    await expect(checkInquiryProtection({ ...inquiry, formStartedAt: Date.now() }))
      .resolves.toEqual({ allowed: false, reason: "too_fast" });
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it("rejects a rate-limited source before duplicate lookup", async () => {
    mockExecute.mockResolvedValueOnce({ rows: [{ request_count: 6 }] });

    await expect(checkInquiryProtection(inquiry))
      .resolves.toEqual({ allowed: false, reason: "rate_limited" });
    expect(mockExecute).toHaveBeenCalledTimes(1);
  });

  it("rejects a duplicate without allowing a downstream side effect", async () => {
    mockExecute
      .mockResolvedValueOnce({ rows: [{ request_count: 1 }] })
      .mockResolvedValueOnce({ rows: [{ request_count: 1 }] })
      .mockResolvedValueOnce({ rows: [{ exists: 1 }] });

    await expect(checkInquiryProtection(inquiry))
      .resolves.toEqual({ allowed: false, reason: "duplicate" });
    expect(mockExecute).toHaveBeenCalledTimes(3);
  });

  it("uses normalized phone and email values for duplicate detection", async () => {
    mockExecute
      .mockResolvedValueOnce({ rows: [{ request_count: 1 }] })
      .mockResolvedValueOnce({ rows: [{ request_count: 1 }] })
      .mockResolvedValueOnce({ rows: [{ exists: 1 }] });

    await expect(checkInquiryProtection({
      ...inquiry,
      phone: "+91 98765 43210",
      email: " Parent@Example.com ",
    })).resolves.toEqual({ allowed: false, reason: "duplicate" });

    const duplicateQuery = mockExecute.mock.calls[2]?.[0]?.queryChunks
      ?.map((chunk: { value?: unknown }) => chunk.value)
      ?.join("") ?? "";
    expect(duplicateQuery).toContain("regexp_replace(phone");
  });

  it("allows one valid submission after durable checks pass", async () => {
    mockExecute
      .mockResolvedValueOnce({ rows: [{ request_count: 1 }] })
      .mockResolvedValueOnce({ rows: [{ request_count: 1 }] })
      .mockResolvedValueOnce({ rows: [] });

    await expect(checkInquiryProtection({
      ...inquiry,
      formStartedAt: Date.now() - 3_000,
      honeypot: "",
    })).resolves.toEqual({ allowed: true });
  });

  it("rejects template payloads in tracking fields", () => {
    expect(() => insertInquirySchema.parse({
      parentName: "Parent",
      studentName: "Student",
      phone: "9876543210",
      grade: "Class 1",
      utmSource: "{{7*7}}",
      pagePath: "{{7*7}}",
    })).toThrow();
  });
});