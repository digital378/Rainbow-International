export type WalkinPageScope = "leads" | "panel";

const STORAGE_KEYS: Record<WalkinPageScope, string> = {
  leads: "walkin_leads_page_session",
  panel: "walkin_panel_page_session",
};

export function savedPageSession(scope: WalkinPageScope): string {
  try { return sessionStorage.getItem(STORAGE_KEYS[scope]) || ""; } catch { return ""; }
}

export function forgetPageSession(scope: WalkinPageScope): void {
  try { sessionStorage.removeItem(STORAGE_KEYS[scope]); } catch {}
}

export async function signInPage(scope: WalkinPageScope, passcode: string): Promise<string | null> {
  const response = await fetch("/api/walkin/page-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scope, passcode }),
  });
  if (response.status === 429) throw new Error("Too many attempts. Try again in 15 minutes.");
  if (response.status >= 500) throw new Error("Sign-in is unavailable. Try again later.");
  if (!response.ok) return null;
  const data = await response.json();
  if (data.ok !== true || typeof data.token !== "string") return null;
  try { sessionStorage.setItem(STORAGE_KEYS[scope], data.token); } catch {}
  return data.token;
}

export async function restorePageSession(scope: WalkinPageScope): Promise<string | null> {
  const token = savedPageSession(scope);
  if (!token) return null;
  try {
    const response = await fetch(`/api/walkin/page-session?scope=${scope}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const result = response.ok ? await response.json() : { ok: false };
    if (result.ok === true) return token;
  } catch {
    // Fail closed when the session cannot be verified.
  }
  forgetPageSession(scope);
  return null;
}