export type WalkinDashboardScope = "ris-sales" | "rps-sales" | "overview" | "marketing";

export async function unlockWalkinDashboard(
  passcode: string,
  scope: WalkinDashboardScope,
): Promise<boolean> {
  try {
    const response = await fetch("/api/walkin/crm-stats/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode, scope }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function lockWalkinDashboard(scope: WalkinDashboardScope): Promise<void> {
  await fetch("/api/walkin/crm-stats/session", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scope }),
  });
}
