import { useCallback, useEffect, useState } from "react";

export type WalkinDashboardScope = "ris-sales" | "rps-sales" | "overview" | "marketing";

export async function unlockWalkinDashboard(
  passcode: string,
  scope: WalkinDashboardScope,
  remember = false,
): Promise<boolean> {
  try {
    const response = await fetch("/api/walkin/crm-stats/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode, scope, remember }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function useWalkinDashboardSession(scope: WalkinDashboardScope) {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/walkin/crm-stats/session?scope=${encodeURIComponent(scope)}`, {
      signal: controller.signal, cache: "no-store",
    })
      .then(response => response.ok ? response.json() : { ok: false })
      .then(data => { if (!controller.signal.aborted) setAuthed(data.ok === true); })
      .catch(() => { if (!controller.signal.aborted) setAuthed(false); })
      .finally(() => { if (!controller.signal.aborted) setChecking(false); });
    return () => controller.abort();
  }, [scope]);
  const lock = useCallback(async () => {
    setAuthed(false);
    await lockWalkinDashboard(scope);
  }, [scope]);
  return { authed, checking, unlock: () => setAuthed(true), lock };
}

export async function lockWalkinDashboard(scope: WalkinDashboardScope): Promise<void> {
  await fetch("/api/walkin/crm-stats/session", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scope }),
  });
}
