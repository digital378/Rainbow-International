/**
 * Indian mobile phone number normalizer.
 * Strips all non-digit characters, removes leading country code (91) or trunk prefix (0),
 * and validates the result is exactly 10 digits starting with 6–9.
 *
 * Returns { normalized: string } on success, or { error: string } on failure.
 * Safe to run on both client and server.
 */
export function normalizePhone(raw: string): { normalized: string } | { error: string } {
  if (!raw) return { error: "Phone number is required." };

  // Strip all non-digit characters (spaces, +, -, /, parentheses, dots)
  let digits = raw.replace(/\D/g, "");

  // Remove leading country code: 91XXXXXXXXXX → XXXXXXXXXX
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  }

  // Remove leading trunk prefix: 0XXXXXXXXXX → XXXXXXXXXX
  if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  if (digits.length !== 10) {
    return { error: `Phone must be 10 digits (got ${digits.length} after normalization).` };
  }

  const firstDigit = parseInt(digits[0], 10);
  if (firstDigit < 6 || firstDigit > 9) {
    return { error: "Phone must be a valid Indian mobile number (starts with 6–9)." };
  }

  return { normalized: digits };
}

/**
 * Returns the normalized 10-digit phone or throws.
 * Convenience wrapper for server-side code that wants to throw on invalid input.
 */
export function normalizePhoneOrThrow(raw: string): string {
  const result = normalizePhone(raw);
  if ("error" in result) throw new Error(result.error);
  return result.normalized;
}
