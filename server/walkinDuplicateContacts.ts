import { and, eq, or } from "drizzle-orm";
import { walkinLeads } from "@shared/schema";
import { normalizePhoneOrThrow } from "@shared/phoneNormalizer";

export function normalizeParentContacts(father: string, mother: string) {
  const phone = normalizePhoneOrThrow(father);
  const altPhone = normalizePhoneOrThrow(mother);
  if (phone === altPhone) {
    throw new Error("Father's and mother's contacts must be different.");
  }
  return { phone, altPhone };
}

export function matchingParentContact(phones: string[], academicYear: string) {
  return and(
    eq(walkinLeads.academicYear, academicYear),
    eq(walkinLeads.isArchived, false),
    or(...phones.flatMap(phone => [
      eq(walkinLeads.phone, phone),
      eq(walkinLeads.altPhone, phone),
    ])),
  );
}