/**
 * E2E tests: manual lead form fields survive tab switches on mobile.
 *
 * The FriendshipPortal uses CSS display:none to hide/show panels when the
 * user switches between the Add Lead, Bulk Upload, and My Leads tabs on mobile.
 * This means React state is preserved — the component never unmounts — and
 * all partially-typed values must still be present when the user returns.
 *
 * These tests verify:
 *  1. Switching from the manual tab to Bulk and back preserves all five fields
 *     (studentName, grade, parentName, phone, email).
 *  2. Switching from the manual tab to Leads and back preserves all five fields.
 *  3. Multiple round-trips (manual → bulk → leads → manual) still preserve data.
 *
 * Implementation note — duplicate DOM elements:
 *  FriendshipPortal renders `manualPanel` in BOTH the mobile tabbed layout AND
 *  the desktop two-column layout, so every data-testid inside manualPanel appears
 *  twice in the DOM. A mobile viewport (390 × 844) is used so that the mobile
 *  section is the visible one, but both instances still exist in the DOM.
 *  Therefore all manual-panel element selectors use `.first()` to target the
 *  mobile instance unambiguously.
 *
 * Schools are created via the admin API and deleted after each test.
 */

import { test, expect, APIRequestContext } from "@playwright/test";

/* ── viewport ─────────────────────────────────────────────────────────────── */

// Mobile viewport activates the tabbed layout and its display:none switching.
test.use({ viewport: { width: 390, height: 844 } });

/* ── constants ────────────────────────────────────────────────────────────── */

const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? "";
const BASE = "http://localhost:5000";

/* ── helpers ──────────────────────────────────────────────────────────────── */

async function createSchool(
  request: APIRequestContext,
  overrides: Record<string, unknown> = {},
): Promise<{ id: number; token: string }> {
  const suffix = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const body = {
    name: `E2E Manual Form School ${suffix}`,
    contactPerson: "E2E Manual Form Test",
    sheetsTabName: `e2e-mf-${suffix}`,
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

/** Simulate document going hidden then visible (phone screen off → on). */
async function cycleVisibility(page: import("@playwright/test").Page): Promise<void> {
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", {
      value: "hidden", writable: true, configurable: true,
    });
    Object.defineProperty(document, "hidden", {
      value: true, writable: true, configurable: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });

  // Brief pause — mimics the screen being off for a moment.
  await page.waitForTimeout(400);

  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", {
      value: "visible", writable: true, configurable: true,
    });
    Object.defineProperty(document, "hidden", {
      value: false, writable: true, configurable: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
}

/* ── test data ────────────────────────────────────────────────────────────── */

const PARTIAL_FORM = {
  studentName: "Aarav Mehta",
  grade: "Grade 5",
  parentName: "Priya Mehta",
  phone: "9876543210",
  email: "priya@example.com",
};

/* ── tests ────────────────────────────────────────────────────────────────── */

test.describe("FriendshipPortal — manual form fields survive tab switches", () => {

  /**
   * Core scenario: user partially fills the manual form, switches to Bulk Upload,
   * then returns. All five field values must be exactly as entered.
   */
  test(
    "all five fields are preserved after switching to Bulk tab and back",
    async ({ page, request }) => {
      const school = await createSchool(request);

      try {
        await page.goto(`/alliances/friendship/${school.token}`);

        // Wait for the portal to finish loading — the mobile tab bar is only
        // rendered once the school data is fetched successfully.
        await expect(page.getByTestId("tab-manual")).toBeVisible({ timeout: 15_000 });

        // The manual tab is the default; fill in all fields.
        // manualPanel is rendered in both mobile + desktop DOM sections, so every
        // testid appears twice. Use .first() to target the mobile instance.
        const studentNameInput = page.getByTestId("input-student-name").first();
        const gradeSelect      = page.getByTestId("select-grade").first();
        const parentNameInput  = page.getByTestId("input-parent-name").first();
        const phoneInput       = page.getByTestId("input-phone").first();
        const emailInput       = page.getByTestId("input-email").first();

        await studentNameInput.fill(PARTIAL_FORM.studentName);
        await gradeSelect.selectOption(PARTIAL_FORM.grade);
        await parentNameInput.fill(PARTIAL_FORM.parentName);
        await phoneInput.fill(PARTIAL_FORM.phone);
        await emailInput.fill(PARTIAL_FORM.email);

        // Verify values before switching.
        await expect(studentNameInput).toHaveValue(PARTIAL_FORM.studentName);
        await expect(gradeSelect).toHaveValue(PARTIAL_FORM.grade);
        await expect(parentNameInput).toHaveValue(PARTIAL_FORM.parentName);
        await expect(phoneInput).toHaveValue(PARTIAL_FORM.phone);
        await expect(emailInput).toHaveValue(PARTIAL_FORM.email);

        // Switch away to Bulk tab.
        await page.getByTestId("tab-bulk").click();

        // Brief wait to ensure any potential state reset would have fired.
        await page.waitForTimeout(300);

        // Switch back to Manual tab.
        await page.getByTestId("tab-manual").click();

        // All values must be intact.
        await expect(studentNameInput).toHaveValue(PARTIAL_FORM.studentName);
        await expect(gradeSelect).toHaveValue(PARTIAL_FORM.grade);
        await expect(parentNameInput).toHaveValue(PARTIAL_FORM.parentName);
        await expect(phoneInput).toHaveValue(PARTIAL_FORM.phone);
        await expect(emailInput).toHaveValue(PARTIAL_FORM.email);
      } finally {
        await deleteSchool(request, school.id);
      }
    },
  );

  /**
   * Switching to the Leads tab (not just Bulk) must also preserve the form.
   */
  test(
    "all five fields are preserved after switching to Leads tab and back",
    async ({ page, request }) => {
      const school = await createSchool(request);

      try {
        await page.goto(`/alliances/friendship/${school.token}`);
        await expect(page.getByTestId("tab-manual")).toBeVisible({ timeout: 15_000 });

        const studentNameInput = page.getByTestId("input-student-name").first();
        const gradeSelect      = page.getByTestId("select-grade").first();
        const parentNameInput  = page.getByTestId("input-parent-name").first();
        const phoneInput       = page.getByTestId("input-phone").first();
        const emailInput       = page.getByTestId("input-email").first();

        await studentNameInput.fill(PARTIAL_FORM.studentName);
        await gradeSelect.selectOption(PARTIAL_FORM.grade);
        await parentNameInput.fill(PARTIAL_FORM.parentName);
        await phoneInput.fill(PARTIAL_FORM.phone);
        await emailInput.fill(PARTIAL_FORM.email);

        // Switch away to Leads tab.
        await page.getByTestId("tab-leads").click();
        await page.waitForTimeout(300);

        // Switch back to Manual tab.
        await page.getByTestId("tab-manual").click();

        // All values must be intact.
        await expect(studentNameInput).toHaveValue(PARTIAL_FORM.studentName);
        await expect(gradeSelect).toHaveValue(PARTIAL_FORM.grade);
        await expect(parentNameInput).toHaveValue(PARTIAL_FORM.parentName);
        await expect(phoneInput).toHaveValue(PARTIAL_FORM.phone);
        await expect(emailInput).toHaveValue(PARTIAL_FORM.email);
      } finally {
        await deleteSchool(request, school.id);
      }
    },
  );

  /**
   * Screen-sleep scenario: user partially fills the manual form, the phone
   * screen turns off (document hidden) and then turns back on (document
   * visible). All five field values must be exactly as entered — the
   * visibilitychange event must not cause any state reset.
   */
  test(
    "all five fields are preserved after document hidden → visible (screen-sleep cycle)",
    async ({ page, request }) => {
      const school = await createSchool(request);

      try {
        await page.goto(`/alliances/friendship/${school.token}`);

        // Wait for the portal to finish loading.
        await expect(page.getByTestId("tab-manual")).toBeVisible({ timeout: 15_000 });

        // The manual tab is the default; fill in all fields.
        // manualPanel is rendered in both mobile + desktop DOM sections, so every
        // testid appears twice. Use .first() to target the mobile instance.
        const studentNameInput = page.getByTestId("input-student-name").first();
        const gradeSelect      = page.getByTestId("select-grade").first();
        const parentNameInput  = page.getByTestId("input-parent-name").first();
        const phoneInput       = page.getByTestId("input-phone").first();
        const emailInput       = page.getByTestId("input-email").first();

        await studentNameInput.fill(PARTIAL_FORM.studentName);
        await gradeSelect.selectOption(PARTIAL_FORM.grade);
        await parentNameInput.fill(PARTIAL_FORM.parentName);
        await phoneInput.fill(PARTIAL_FORM.phone);
        await emailInput.fill(PARTIAL_FORM.email);

        // Verify values are set before simulating screen sleep.
        await expect(studentNameInput).toHaveValue(PARTIAL_FORM.studentName);
        await expect(gradeSelect).toHaveValue(PARTIAL_FORM.grade);
        await expect(parentNameInput).toHaveValue(PARTIAL_FORM.parentName);
        await expect(phoneInput).toHaveValue(PARTIAL_FORM.phone);
        await expect(emailInput).toHaveValue(PARTIAL_FORM.email);

        // ── Simulate phone screen going to sleep then waking up ──
        await cycleVisibility(page);

        // ── Assertions after wakeup ──────────────────────────────
        // All five field values must still be exactly as entered.
        await expect(studentNameInput).toHaveValue(PARTIAL_FORM.studentName);
        await expect(gradeSelect).toHaveValue(PARTIAL_FORM.grade);
        await expect(parentNameInput).toHaveValue(PARTIAL_FORM.parentName);
        await expect(phoneInput).toHaveValue(PARTIAL_FORM.phone);
        await expect(emailInput).toHaveValue(PARTIAL_FORM.email);
      } finally {
        await deleteSchool(request, school.id);
      }
    },
  );

  /**
   * Multiple round-trips: manual → bulk → leads → manual.
   * Each intermediate switch must not disturb the form state.
   */
  test(
    "all five fields survive multiple tab switches (manual → bulk → leads → manual)",
    async ({ page, request }) => {
      const school = await createSchool(request);

      try {
        await page.goto(`/alliances/friendship/${school.token}`);
        await expect(page.getByTestId("tab-manual")).toBeVisible({ timeout: 15_000 });

        const studentNameInput = page.getByTestId("input-student-name").first();
        const gradeSelect      = page.getByTestId("select-grade").first();
        const parentNameInput  = page.getByTestId("input-parent-name").first();
        const phoneInput       = page.getByTestId("input-phone").first();
        const emailInput       = page.getByTestId("input-email").first();

        await studentNameInput.fill(PARTIAL_FORM.studentName);
        await gradeSelect.selectOption(PARTIAL_FORM.grade);
        await parentNameInput.fill(PARTIAL_FORM.parentName);
        await phoneInput.fill(PARTIAL_FORM.phone);
        await emailInput.fill(PARTIAL_FORM.email);

        // Round-trip 1: manual → bulk → manual (intermediate check).
        await page.getByTestId("tab-bulk").click();
        await page.waitForTimeout(200);
        await page.getByTestId("tab-manual").click();

        await expect(studentNameInput).toHaveValue(PARTIAL_FORM.studentName);
        await expect(gradeSelect).toHaveValue(PARTIAL_FORM.grade);
        await expect(parentNameInput).toHaveValue(PARTIAL_FORM.parentName);
        await expect(phoneInput).toHaveValue(PARTIAL_FORM.phone);
        await expect(emailInput).toHaveValue(PARTIAL_FORM.email);

        // Round-trip 2: manual → leads → manual (final assertion).
        await page.getByTestId("tab-leads").click();
        await page.waitForTimeout(200);
        await page.getByTestId("tab-manual").click();

        await expect(studentNameInput).toHaveValue(PARTIAL_FORM.studentName);
        await expect(gradeSelect).toHaveValue(PARTIAL_FORM.grade);
        await expect(parentNameInput).toHaveValue(PARTIAL_FORM.parentName);
        await expect(phoneInput).toHaveValue(PARTIAL_FORM.phone);
        await expect(emailInput).toHaveValue(PARTIAL_FORM.email);
      } finally {
        await deleteSchool(request, school.id);
      }
    },
  );

});
