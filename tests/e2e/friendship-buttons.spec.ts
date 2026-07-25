/**
 * E2E tests for WhatsApp and Email buttons on Friendship School cards.
 *
 * Covers both pages that render these buttons:
 *  - AdminFriendshipSchools (/admin/alliances/friendship) — selectors: button-whatsapp-*, button-email-*
 *  - FriendshipQRTab (/alliances → QR Leads tab) — selectors: button-qr-whatsapp-*, button-qr-email-*
 *
 * For each page, tests verify:
 *  - WA button present + href contains correct wa.me URL with encoded portal link
 *  - Mail button present + href has correct mailto with subject and body (decoded body has portal link)
 *  - Neither button appears when the respective contact field is blank
 *
 * Schools are created via API with unique names/slugs and deleted after each
 * test to ensure full determinism on re-runs.
 */

import { test, expect, APIRequestContext, Page } from "@playwright/test";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? "";
const BASE = "http://localhost:5000";

async function createSchool(
  request: APIRequestContext,
  overrides: Record<string, unknown>,
): Promise<{ id: number; token: string }> {
  const suffix = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const body = {
    name: `E2E School ${suffix}`,
    contactPerson: "E2E Test Contact",
    sheetsTabName: `e2e-tab-${suffix}`,
    isActive: true,
    ...overrides,
  };
  const res = await request.post(`${BASE}/api/admin/alliances/friendship/schools`, {
    data: body,
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}`, "Content-Type": "application/json" },
  });
  if (!res.ok()) {
    throw new Error(`Failed to create school: ${res.status()} ${await res.text()}`);
  }
  return res.json() as Promise<{ id: number; token: string }>;
}

async function deleteSchool(request: APIRequestContext, id: number): Promise<void> {
  await request.delete(`${BASE}/api/admin/alliances/friendship/schools/${id}`, {
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
  });
}

/**
 * Inject the admin auth token into sessionStorage, then navigate to the
 * AdminFriendshipSchools page and wait for the school list panel to appear.
 */
async function openAdminPage(page: Page): Promise<void> {
  await page.goto("/admin/alliances/friendship");
  await page.evaluate(
    (token) => sessionStorage.setItem("ris_admin_auth", token),
    ADMIN_TOKEN,
  );
  await page.goto("/admin/alliances/friendship");
  await expect(page.getByTestId("button-add-school")).toBeVisible({ timeout: 15_000 });
}

/**
 * Inject both the Alliances PIN and the admin token into sessionStorage, then
 * navigate to /alliances and click the QR Leads tab to render FriendshipQRTab.
 */
async function openQRLeadsTab(page: Page): Promise<void> {
  await page.goto("/alliances");
  await page.evaluate((token) => {
    sessionStorage.setItem("alliances_auth_v1", "1");
    sessionStorage.setItem("ris_admin_auth", token);
  }, ADMIN_TOKEN);
  await page.goto("/alliances");
  await page.getByTestId("tab-qrLeads").click();
  await expect(page.getByTestId("button-qr-add-school")).toBeVisible({ timeout: 15_000 });
}

// ════════════════════════════════════════════════════════════════════════════
// AdminFriendshipSchools (/admin/alliances/friendship)
// ════════════════════════════════════════════════════════════════════════════

test.describe("AdminFriendshipSchools — WA and Email buttons", () => {
  test("WA button appears with correct href when school has contactPhone", async ({ page, request }) => {
    const school = await createSchool(request, { contactPhone: "9876543210" });
    try {
      await openAdminPage(page);

      const waButton = page.getByTestId(`button-whatsapp-${school.id}`);
      await expect(waButton).toBeVisible({ timeout: 10_000 });

      const href = await waButton.getAttribute("href");
      expect(href).toContain("wa.me/919876543210");
      expect(decodeURIComponent(href ?? "")).toContain(`/alliances/friendship/${school.token}`);

      await expect(page.getByTestId(`button-email-${school.id}`)).not.toBeVisible();
    } finally {
      await deleteSchool(request, school.id);
    }
  });

  test("Mail button appears with correct href when school has contactEmail", async ({ page, request }) => {
    const email = `admin-${Date.now()}@testschool.example`;
    const school = await createSchool(request, { contactEmail: email });
    try {
      await openAdminPage(page);

      const mailButton = page.getByTestId(`button-email-${school.id}`);
      await expect(mailButton).toBeVisible({ timeout: 10_000 });

      const href = await mailButton.getAttribute("href");
      expect(href).toContain(`mailto:${email}`);
      expect(href).toContain("subject=");
      expect(href).toContain("body=");
      const body = decodeURIComponent((href ?? "").match(/body=([^&]*)/)?.[1] ?? "");
      expect(body).toContain(`/alliances/friendship/${school.token}`);

      await expect(page.getByTestId(`button-whatsapp-${school.id}`)).not.toBeVisible();
    } finally {
      await deleteSchool(request, school.id);
    }
  });

  test("Neither button appears when school has no phone or email", async ({ page, request }) => {
    const school = await createSchool(request, {});
    try {
      await openAdminPage(page);
      await expect(page.getByTestId(`card-school-${school.id}`)).toBeVisible({ timeout: 10_000 });
      await expect(page.getByTestId(`button-whatsapp-${school.id}`)).not.toBeVisible();
      await expect(page.getByTestId(`button-email-${school.id}`)).not.toBeVisible();
    } finally {
      await deleteSchool(request, school.id);
    }
  });

  test("Both buttons appear when school has both phone and email", async ({ page, request }) => {
    const email = `admin-both-${Date.now()}@testschool.example`;
    const school = await createSchool(request, { contactPhone: "9123456789", contactEmail: email });
    try {
      await openAdminPage(page);
      const waButton = page.getByTestId(`button-whatsapp-${school.id}`);
      const mailButton = page.getByTestId(`button-email-${school.id}`);
      await expect(waButton).toBeVisible({ timeout: 10_000 });
      await expect(mailButton).toBeVisible({ timeout: 10_000 });
      expect(await waButton.getAttribute("href")).toContain("wa.me/919123456789");
      expect(await mailButton.getAttribute("href")).toContain(`mailto:${email}`);
    } finally {
      await deleteSchool(request, school.id);
    }
  });
});

// ════════════════════════════════════════════════════════════════════════════
// FriendshipQRTab (/alliances → QR Leads tab)
// ════════════════════════════════════════════════════════════════════════════

test.describe("FriendshipQRTab — WA and Email buttons", () => {
  test("WA button appears with correct href when school has contactPhone", async ({ page, request }) => {
    const school = await createSchool(request, { contactPhone: "9876501234" });
    try {
      await openQRLeadsTab(page);

      const waButton = page.getByTestId(`button-qr-whatsapp-${school.id}`);
      await expect(waButton).toBeVisible({ timeout: 10_000 });

      const href = await waButton.getAttribute("href");
      expect(href).toContain("wa.me/919876501234");
      expect(decodeURIComponent(href ?? "")).toContain(`/alliances/friendship/${school.token}`);

      await expect(page.getByTestId(`button-qr-email-${school.id}`)).not.toBeVisible();
    } finally {
      await deleteSchool(request, school.id);
    }
  });

  test("Mail button appears with correct href when school has contactEmail", async ({ page, request }) => {
    const email = `qr-${Date.now()}@testschool.example`;
    const school = await createSchool(request, { contactEmail: email });
    try {
      await openQRLeadsTab(page);

      const mailButton = page.getByTestId(`button-qr-email-${school.id}`);
      await expect(mailButton).toBeVisible({ timeout: 10_000 });

      const href = await mailButton.getAttribute("href");
      expect(href).toContain(`mailto:${email}`);
      expect(href).toContain("subject=");
      expect(href).toContain("body=");
      const body = decodeURIComponent((href ?? "").match(/body=([^&]*)/)?.[1] ?? "");
      expect(body).toContain(`/alliances/friendship/${school.token}`);

      await expect(page.getByTestId(`button-qr-whatsapp-${school.id}`)).not.toBeVisible();
    } finally {
      await deleteSchool(request, school.id);
    }
  });

  test("Neither button appears when school has no phone or email", async ({ page, request }) => {
    const school = await createSchool(request, {});
    try {
      await openQRLeadsTab(page);
      await expect(page.getByTestId(`card-qr-school-${school.id}`)).toBeVisible({ timeout: 10_000 });
      await expect(page.getByTestId(`button-qr-whatsapp-${school.id}`)).not.toBeVisible();
      await expect(page.getByTestId(`button-qr-email-${school.id}`)).not.toBeVisible();
    } finally {
      await deleteSchool(request, school.id);
    }
  });

  test("Both buttons appear when school has both phone and email", async ({ page, request }) => {
    const email = `qr-both-${Date.now()}@testschool.example`;
    const school = await createSchool(request, { contactPhone: "9001234567", contactEmail: email });
    try {
      await openQRLeadsTab(page);
      const waButton = page.getByTestId(`button-qr-whatsapp-${school.id}`);
      const mailButton = page.getByTestId(`button-qr-email-${school.id}`);
      await expect(waButton).toBeVisible({ timeout: 10_000 });
      await expect(mailButton).toBeVisible({ timeout: 10_000 });
      expect(await waButton.getAttribute("href")).toContain("wa.me/919001234567");
      expect(await mailButton.getAttribute("href")).toContain(`mailto:${email}`);
    } finally {
      await deleteSchool(request, school.id);
    }
  });
});
