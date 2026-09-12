import { describe, expect, it } from "vitest";
import {
  FRIENDSHIP_AGGREGATE_HEADERS,
  friendshipLeadIdentity,
  normalizeFriendshipPhone,
  validFriendshipAggregateRows,
} from "../shared/friendshipLeadIdentity";

describe("friendship lead identity", () => {
  it("treats phone formatting and student-name spacing as the same lead", () => {
    expect(friendshipLeadIdentity("Aarav Shah", "+91 98765-43210"))
      .toBe(friendshipLeadIdentity(" aarav   shah ", "9876543210"));
  });

  it("keeps siblings with the same parent phone distinct", () => {
    expect(friendshipLeadIdentity("Aarav Shah", "9876543210"))
      .not.toBe(friendshipLeadIdentity("Anaya Shah", "9876543210"));
  });

  it("normalizes common Indian prefixes without changing paired phone numbers", () => {
    expect(normalizeFriendshipPhone("0091 98765 43210")).toBe("9876543210");
    expect(normalizeFriendshipPhone("091-98765-43210")).toBe("9876543210");
    expect(normalizeFriendshipPhone("+91 98765 43210")).toBe("9876543210");
    expect(normalizeFriendshipPhone("9876543210 / 9123456789")).toBe("9876543210|9123456789");
  });

  it("preserves non-Latin student names as distinct identities", () => {
    expect(friendshipLeadIdentity("आरव", "9876543210"))
      .not.toBe(friendshipLeadIdentity("अनाया", "9876543210"));
  });
});

describe("friendship aggregate sheet validation", () => {
  it("accepts the complete expected header", () => {
    expect(validFriendshipAggregateRows([[...FRIENDSHIP_AGGREGATE_HEADERS]])).toBe(true);
  });

  it("rejects empty, truncated, or shifted headers before reconciliation", () => {
    expect(validFriendshipAggregateRows([])).toBe(false);
    expect(validFriendshipAggregateRows([["Date", "School Name"]])).toBe(false);
    expect(validFriendshipAggregateRows([["School Name", ...FRIENDSHIP_AGGREGATE_HEADERS]])).toBe(false);
  });
});