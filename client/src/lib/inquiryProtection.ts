type InquiryChallenge = {
  token: string;
  expiresAt: number;
  difficulty: number;
};

type ChallengeResponse = {
  code?: string;
  challenge?: InquiryChallenge;
};

async function solveChallenge(challenge: InquiryChallenge): Promise<string> {
  if (!window.crypto?.subtle) {
    throw new Error("Security check is not supported by this browser.");
  }

  const encoder = new TextEncoder();
  const prefix = "0".repeat(challenge.difficulty);
  for (let counter = 0; counter <= 5_000_000; counter += 1) {
    const digest = await window.crypto.subtle.digest(
      "SHA-256",
      encoder.encode(`${challenge.token}:${counter}`),
    );
    const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
    if (hex.startsWith(prefix)) return String(counter);
  }
  throw new Error("Security check could not be completed.");
}

/**
 * Submit a public enquiry and transparently complete the server-issued
 * challenge if this IP has crossed the normal traffic threshold.
 */
export async function submitInquiry(payload: Record<string, unknown>): Promise<Response> {
  let requestBody = { ...payload };

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (response.status !== 403) {
      if (!response.ok) throw new Error("Inquiry submission failed.");
      return response;
    }

    let challengeResponse: ChallengeResponse;
    try {
      challengeResponse = await response.clone().json() as ChallengeResponse;
    } catch {
      return response;
    }
    if (challengeResponse.code !== "challenge_required" || !challengeResponse.challenge) {
      return response;
    }

    const challengeAnswer = await solveChallenge(challengeResponse.challenge);
    requestBody = {
      ...payload,
      challengeToken: challengeResponse.challenge.token,
      challengeAnswer,
    };
  }

  throw new Error("Security check could not be completed.");
}