import { describe, expect, it } from "vitest";
import { updateLeadSchema } from "../server/walkinRoutes";

describe("CRM optional-field edits", () => {
  it("keeps explicit clears as null instead of dropping them", () => {
    const result = updateLeadSchema.parse({
      altPhone: null,
      email: null,
      closeReason: null,
      walkInDate: null,
      revisitDate: null,
      revisitDate2: null,
    });
    expect(result).toMatchObject({
      altPhone: null,
      email: null,
      closeReason: null,
      walkInDate: null,
      revisitDate: null,
      revisitDate2: null,
    });
  });

  it("normalizes empty optional fields to clear requests", () => {
    const result = updateLeadSchema.parse({
      altPhone: "",
      email: "",
      closeReason: "",
      walkInDate: "",
      revisitDate: "",
      revisitDate2: "",
    });
    expect(result).toMatchObject({
      altPhone: null,
      email: null,
      closeReason: null,
      walkInDate: null,
      revisitDate: null,
      revisitDate2: null,
    });
  });
});