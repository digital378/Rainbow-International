/**
 * E2E tests: bulk upload panel survives a phone-sleep / page-visibility cycle.
 *
 * Mobile browsers can fire `visibilitychange` (document.hidden → visible) when
 * the screen turns off and back on. The FriendshipPortal uses CSS show/hide
 * (display:none) to preserve tab state, but nothing in that pattern should
 * cause the file selection or parsed-row preview to reset.
 *
 * These tests verify:
 *  1. After document.hidden toggles hidden → visible, `fileName` (shown in the
 *     dropzone) and `parsedRows` (shown via the Confirm & Upload button count)
 *     are still populated — no "Choose file" reset.
 *  2. `pickFile` is not called again after the visibility event — the file
 *     input's change event does not fire a second time.
 *  3. The same guarantee holds when the bulk tab is not the *active* tab at
 *     the time the visibility event fires (simulating the user having switched
 *     away then the screen going to sleep and waking up).
 *
 * Implementation note — duplicate DOM elements:
 *  FriendshipPortal renders `bulkPanel` in BOTH the mobile tabbed layout AND
 *  the desktop two-column layout, so every data-testid inside bulkPanel appears
 *  twice in the DOM. A mobile viewport (390 × 844) is used so that the mobile
 *  section is the visible one, but both instances still exist in the DOM.
 *  Therefore all bulk-panel element selectors use `.first()` to target the
 *  mobile instance unambiguously.
 *
 * Schools are created via the admin API and deleted after each test.
 */

import { test, expect, APIRequestContext } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { createRequire } from "module";

const _require = createRequire(import.meta.url);

/* ── viewport ─────────────────────────────────────────────────────────────── */

// Mobile viewport keeps the tabbed layout visible and lets us click tab-bulk.
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
    name: `E2E Visibility School ${suffix}`,
    contactPerson: "E2E Visibility Test",
    sheetsTabName: `e2e-vis-${suffix}`,
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
 * Build a minimal valid .xlsx buffer with the friendship-portal column schema.
 * Uses the `xlsx` package already present in the project via createRequire.
 * Returns the absolute path to a temp file so Playwright can setInputFiles().
 */
function buildXlsxTempFile(): string {
  const XLSX = _require("xlsx");
  const ws = XLSX.utils.aoa_to_sheet([
    ["Student Name", "Grade", "Parent Name", "Phone", "Email"],
    ["Alice Sharma", "Grade 5", "Priya Sharma", "9876543210", "priya@example.com"],
    ["Bob Patel", "Grade 3", "Raj Patel", "9123456789", ""],
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  const buffer: Buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  const tmpPath = path.join(os.tmpdir(), `ris-bulk-test-${Date.now()}.xlsx`);
  fs.writeFileSync(tmpPath, buffer);
  return tmpPath;
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

/* ── tests ────────────────────────────────────────────────────────────────── */

test.describe("FriendshipPortal — bulk panel survives page-visibility cycle", () => {

  /**
   * Core scenario: user picks a file on the bulk tab, screen goes to sleep,
   * then wakes up. fileName and parsedRows must still be shown.
   */
  test(
    "fileName and parsedRows remain after document hidden → visible (bulk tab active)",
    async ({ page, request }) => {
      const school = await createSchool(request);
      const xlsxPath = buildXlsxTempFile();

      try {
        await page.goto(`/alliances/friendship/${school.token}`);

        // Wait for the portal to finish loading — the mobile tab bar is only
        // rendered once the school data is fetched successfully.
        await expect(page.getByTestId("tab-bulk")).toBeVisible({ timeout: 15_000 });

        // Switch to the Bulk Upload tab (mobile layout).
        await page.getByTestId("tab-bulk").click();

        // bulkPanel is rendered in both mobile + desktop DOM sections, so every
        // testid appears twice. Use .first() to target the mobile instance.
        const fileInput   = page.getByTestId("input-file-bulk").first();
        const dropzone    = page.getByTestId("dropzone-bulk").first();
        const uploadBtn   = page.getByTestId("button-upload-confirm").first();
        const xlsxBasename = path.basename(xlsxPath);

        // Upload the xlsx via the hidden file input.
        await fileInput.setInputFiles(xlsxPath);

        // Parsing is async (xlsx import + sheet processing). Wait for the
        // Confirm & Upload button to appear — it only renders when parsedRows > 0.
        await expect(uploadBtn).toBeVisible({ timeout: 8_000 });

        // Verify the fileName is shown in the dropzone before the visibility cycle.
        await expect(dropzone).toContainText(xlsxBasename);

        // ── Simulate phone screen going to sleep then waking up ──
        await cycleVisibility(page);

        // ── Assertions after wakeup ──────────────────────────────

        // 1. The file name is still shown in the dropzone (no "Choose file" reset).
        await expect(dropzone).toContainText(xlsxBasename);

        // 2. The Confirm & Upload button is still visible, meaning parsedRows is
        //    still non-empty. The label shows the count — our xlsx has 2 data rows.
        await expect(uploadBtn).toBeVisible();
        await expect(uploadBtn).toContainText("2");

        // 3. No "Drag & drop" placeholder text visible (file selection not cleared).
        await expect(dropzone).not.toContainText("Drag & drop");
        await expect(dropzone).not.toContainText("Choose file");
      } finally {
        fs.unlinkSync(xlsxPath);
        await deleteSchool(request, school.id);
      }
    },
  );

  /**
   * Regression guard: pickFile must NOT be invoked again by the visibility
   * event. Specifically, the file input's `change` event must not fire a
   * second time after the visibility cycle.
   */
  test(
    "file input change event does not fire again after visibility cycle (no re-parse)",
    async ({ page, request }) => {
      const school = await createSchool(request);
      const xlsxPath = buildXlsxTempFile();

      try {
        await page.goto(`/alliances/friendship/${school.token}`);
        await expect(page.getByTestId("tab-bulk")).toBeVisible({ timeout: 15_000 });

        await page.getByTestId("tab-bulk").click();

        // .first() throughout — see note on duplicate DOM sections above.
        const uploadBtn = page.getByTestId("button-upload-confirm").first();
        await page.getByTestId("input-file-bulk").first().setInputFiles(xlsxPath);

        // Wait for parse to complete.
        await expect(uploadBtn).toBeVisible({ timeout: 8_000 });

        // Attach a counter to the file input AFTER the initial pick is done,
        // so we measure only spurious re-fires caused by the visibility event.
        // `getElementById` returns the first element with that id (the mobile one).
        await page.evaluate(() => {
          const input = document.getElementById("bulk-file-input") as HTMLInputElement | null;
          if (input) {
            (window as Record<string, unknown>).__bulkChangeCount = 0;
            input.addEventListener("change", () => {
              (window as Record<string, unknown>).__bulkChangeCount =
                ((window as Record<string, unknown>).__bulkChangeCount as number) + 1;
            });
          }
        });

        // Cycle visibility.
        await cycleVisibility(page);
        await page.waitForTimeout(300); // let any spurious events settle.

        // The change event must not have fired again.
        const changeCount = await page.evaluate(
          () => (window as Record<string, unknown>).__bulkChangeCount as number,
        );
        expect(changeCount).toBe(0);

        // parsedRows still intact — upload button still shows the row count.
        await expect(uploadBtn).toBeVisible();
        await expect(uploadBtn).toContainText("2");
      } finally {
        fs.unlinkSync(xlsxPath);
        await deleteSchool(request, school.id);
      }
    },
  );

  /**
   * Edge case: user picks file on the bulk tab, switches to a different tab
   * (e.g. leads), then the screen goes to sleep and wakes up. On returning
   * to the bulk tab, the file state must be preserved.
   */
  test(
    "fileName and parsedRows survive when bulk tab is NOT active during visibility cycle",
    async ({ page, request }) => {
      const school = await createSchool(request);
      const xlsxPath = buildXlsxTempFile();

      try {
        await page.goto(`/alliances/friendship/${school.token}`);
        await expect(page.getByTestId("tab-bulk")).toBeVisible({ timeout: 15_000 });

        // Pick file on bulk tab.
        await page.getByTestId("tab-bulk").click();
        const xlsxBasename = path.basename(xlsxPath);

        // .first() throughout — see note on duplicate DOM sections above.
        const fileInput = page.getByTestId("input-file-bulk").first();
        const dropzone  = page.getByTestId("dropzone-bulk").first();
        const uploadBtn = page.getByTestId("button-upload-confirm").first();

        await fileInput.setInputFiles(xlsxPath);
        await expect(uploadBtn).toBeVisible({ timeout: 8_000 });

        // Switch AWAY from bulk tab (simulate user browsing around).
        await page.getByTestId("tab-leads").click();

        // Visibility cycle while the bulk panel is hidden via display:none.
        await cycleVisibility(page);

        // Switch back to bulk tab.
        await page.getByTestId("tab-bulk").click();

        // File name and row count must be exactly as before.
        await expect(dropzone).toContainText(xlsxBasename);
        await expect(uploadBtn).toBeVisible();
        await expect(uploadBtn).toContainText("2");
        await expect(dropzone).not.toContainText("Drag & drop");
      } finally {
        fs.unlinkSync(xlsxPath);
        await deleteSchool(request, school.id);
      }
    },
  );

});
