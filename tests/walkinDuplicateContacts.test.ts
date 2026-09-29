import { describe, expect, it } from "vitest";
import { PgDialect } from "drizzle-orm/pg-core";
import { matchingParentContact, normalizeParentContacts } from "../server/walkinDuplicateContacts";

describe("walk-in parent contact duplicate rules", () => {
  it("normalizes both contacts and rejects the same number in both fields", () => {
    expect(normalizeParentContacts("+91 98765 43210", "08765 432109")).toEqual({
      phone: "9876543210", altPhone: "8765432109",
    });
    expect(() => normalizeParentContacts("9876543210", "+91 98765 43210"))
      .toThrow("contacts must be different");
    expect(() => normalizeParentContacts("9876543210", "not-a-phone")).toThrow();
  });

  it("matches either entered number in either saved field, across schools but within year", () => {
    const dialect = new PgDialect();
    const query = dialect.sqlToQuery(matchingParentContact(
      ["9876543210", "8765432109"], "2027-28",
    )!);
    expect(query.sql).toContain('"academic_year"');
    expect(query.sql).toContain('"is_archived"');
    expect(query.sql).not.toContain('"brand"');
    expect(query.sql.match(/"phone" =/g)).toHaveLength(2);
    expect(query.sql.match(/"alt_phone" =/g)).toHaveLength(2);
    expect(query.params).toEqual([
      "2027-28", false,
      "9876543210", "9876543210",
      "8765432109", "8765432109",
    ]);
  });
});