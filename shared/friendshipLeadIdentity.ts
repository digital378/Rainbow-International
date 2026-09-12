export const FRIENDSHIP_AGGREGATE_HEADERS = [
  "Date",
  "School Name",
  "Student Name",
  "Grade",
  "Parent Name",
  "Phone",
  "Email",
  "Source",
  "Status",
  "Referral Amount",
  "Remarks",
] as const;

export function normalizeFriendshipPhone(phone: string): string {
  return phone
    .split(/[\/,;|]+/)
    .map(value => {
      let digits = value.replace(/\D/g, "");
      if (digits.startsWith("00")) digits = digits.slice(2);
      if (digits.length === 13 && digits.startsWith("091")) digits = digits.slice(3);
      if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
      if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
      return digits;
    })
    .filter(Boolean)
    .join("|");
}

export function normalizeFriendshipStudent(studentName: string): string {
  return studentName
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase("en-US")
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

export function friendshipLeadIdentity(studentName: string, phone: string): string {
  const student = normalizeFriendshipStudent(studentName);
  const digits = normalizeFriendshipPhone(phone);
  return `${student}|${digits}`;
}

export function validFriendshipAggregateRows(rows: unknown[][]): boolean {
  if (!Array.isArray(rows) || rows.length === 0 || !Array.isArray(rows[0])) return false;
  const header = rows[0].map(value => String(value ?? "").trim().toLowerCase());
  return FRIENDSHIP_AGGREGATE_HEADERS.every(
    (expected, index) => header[index] === expected.toLowerCase(),
  );
}