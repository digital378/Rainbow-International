import { describe, expect, it, beforeEach } from "vitest";
import {
  decryptGoogleRefreshToken,
  encryptGoogleRefreshToken,
  googleOAuthSuccessPage,
} from "../server/googleCredentials";

describe("Google OAuth credential protection", () => {
  beforeEach(() => {
    process.env.SESSION_SECRET = "test-session-secret";
  });

  it("encrypts and decrypts refresh tokens without storing plaintext", () => {
    const refreshToken = "test-refresh-token-that-must-not-appear-in-storage";
    const encrypted = encryptGoogleRefreshToken(refreshToken);

    expect(encrypted.encryptedRefreshToken).not.toContain(refreshToken);
    expect(decryptGoogleRefreshToken(encrypted)).toBe(refreshToken);
  });

  it("rejects tampered encrypted credentials", () => {
    const encrypted = encryptGoogleRefreshToken("test-refresh-token");

    expect(() => decryptGoogleRefreshToken({
      ...encrypted,
      authTag: "not-a-valid-authentication-tag",
    })).toThrow("Unable to decrypt the stored Google OAuth credential");
  });

  it("never places a refresh token in the OAuth success HTML", () => {
    const refreshToken = "test-refresh-token-that-must-not-reach-html";
    const html = googleOAuthSuccessPage();

    expect(html).not.toContain(refreshToken);
    expect(html).not.toContain("Copy the refresh token");
    expect(html).toContain("No credential is displayed");
  });
});