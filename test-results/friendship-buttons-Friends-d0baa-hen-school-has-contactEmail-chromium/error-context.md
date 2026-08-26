# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: friendship-buttons.spec.ts >> FriendshipQRTab — WA and Email buttons >> Mail button appears with correct href when school has contactEmail
- Location: tests/e2e/friendship-buttons.spec.ts:176:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: apiRequestContext.delete: Target page, context or browser has been closed
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - region "Notifications (F8)":
    - list
  - generic [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]:
        - generic [ref=e6]:
          - img "Rainbow Group of Companies" [ref=e7]
          - generic [ref=e9]:
            - generic [ref=e10]: Strategic Alliances Dashboard
            - generic [ref=e11]: Loading…
        - button "REFRESH" [ref=e12]:
          - img [ref=e13]
          - generic [ref=e15]: REFRESH
      - generic [ref=e17]:
        - button "Overview" [ref=e18]
        - button "Brand Partners" [ref=e19]
        - button "Corporates" [ref=e20]
        - button "Friendship Schools" [ref=e21]
        - button "Parent Advocacy" [ref=e22]
        - button "FS Leads" [ref=e23]
    - generic [ref=e25]: Failed to load data. Please click REFRESH to try again.
```

# Test source

```ts
  1   | /**
  2   |  * E2E tests for WhatsApp and Email buttons on Friendship School cards.
  3   |  *
  4   |  * Covers both pages that render these buttons:
  5   |  *  - AdminFriendshipSchools (/admin/alliances/friendship) — selectors: button-whatsapp-*, button-email-*
  6   |  *  - FriendshipQRTab (/alliances → QR Leads tab) — selectors: button-qr-whatsapp-*, button-qr-email-*
  7   |  *
  8   |  * For each page, tests verify:
  9   |  *  - WA button present + href contains correct wa.me URL with encoded portal link
  10  |  *  - Mail button present + href has correct mailto with subject and body (decoded body has portal link)
  11  |  *  - Neither button appears when the respective contact field is blank
  12  |  *
  13  |  * Schools are created via API with unique names/slugs and deleted after each
  14  |  * test to ensure full determinism on re-runs.
  15  |  */
  16  | 
  17  | import { test, expect, APIRequestContext, Page } from "@playwright/test";
  18  | 
  19  | const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? "";
  20  | const BASE = "http://localhost:5000";
  21  | 
  22  | async function createSchool(
  23  |   request: APIRequestContext,
  24  |   overrides: Record<string, unknown>,
  25  | ): Promise<{ id: number; token: string }> {
  26  |   const suffix = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  27  |   const body = {
  28  |     name: `E2E School ${suffix}`,
  29  |     contactPerson: "E2E Test Contact",
  30  |     sheetsTabName: `e2e-tab-${suffix}`,
  31  |     isActive: true,
  32  |     ...overrides,
  33  |   };
  34  |   const res = await request.post(`${BASE}/api/admin/alliances/friendship/schools`, {
  35  |     data: body,
  36  |     headers: { Authorization: `Bearer ${ADMIN_TOKEN}`, "Content-Type": "application/json" },
  37  |   });
  38  |   if (!res.ok()) {
  39  |     throw new Error(`Failed to create school: ${res.status()} ${await res.text()}`);
  40  |   }
  41  |   return res.json() as Promise<{ id: number; token: string }>;
  42  | }
  43  | 
  44  | async function deleteSchool(request: APIRequestContext, id: number): Promise<void> {
> 45  |   await request.delete(`${BASE}/api/admin/alliances/friendship/schools/${id}`, {
      |                       ^ Error: apiRequestContext.delete: Target page, context or browser has been closed
  46  |     headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
  47  |   });
  48  | }
  49  | 
  50  | /**
  51  |  * Inject the admin auth token into sessionStorage, then navigate to the
  52  |  * AdminFriendshipSchools page and wait for the school list panel to appear.
  53  |  */
  54  | async function openAdminPage(page: Page): Promise<void> {
  55  |   await page.goto("/admin/alliances/friendship");
  56  |   await page.evaluate(
  57  |     (token) => sessionStorage.setItem("ris_admin_auth", token),
  58  |     ADMIN_TOKEN,
  59  |   );
  60  |   await page.goto("/admin/alliances/friendship");
  61  |   await expect(page.getByTestId("button-add-school")).toBeVisible({ timeout: 15_000 });
  62  | }
  63  | 
  64  | /**
  65  |  * Inject both the Alliances PIN and the admin token into sessionStorage, then
  66  |  * navigate to /alliances and click the QR Leads tab to render FriendshipQRTab.
  67  |  */
  68  | async function openQRLeadsTab(page: Page): Promise<void> {
  69  |   await page.goto("/alliances");
  70  |   await page.evaluate((token) => {
  71  |     sessionStorage.setItem("alliances_auth_v1", "1");
  72  |     sessionStorage.setItem("ris_admin_auth", token);
  73  |   }, ADMIN_TOKEN);
  74  |   await page.goto("/alliances");
  75  |   await page.getByTestId("tab-qrLeads").click();
  76  |   await expect(page.getByTestId("button-qr-add-school")).toBeVisible({ timeout: 15_000 });
  77  | }
  78  | 
  79  | // ════════════════════════════════════════════════════════════════════════════
  80  | // AdminFriendshipSchools (/admin/alliances/friendship)
  81  | // ════════════════════════════════════════════════════════════════════════════
  82  | 
  83  | test.describe("AdminFriendshipSchools — WA and Email buttons", () => {
  84  |   test("WA button appears with correct href when school has contactPhone", async ({ page, request }) => {
  85  |     const school = await createSchool(request, { contactPhone: "9876543210" });
  86  |     try {
  87  |       await openAdminPage(page);
  88  | 
  89  |       const waButton = page.getByTestId(`button-whatsapp-${school.id}`);
  90  |       await expect(waButton).toBeVisible({ timeout: 10_000 });
  91  | 
  92  |       const href = await waButton.getAttribute("href");
  93  |       expect(href).toContain("wa.me/919876543210");
  94  |       expect(decodeURIComponent(href ?? "")).toContain(`/alliances/friendship/${school.token}`);
  95  | 
  96  |       await expect(page.getByTestId(`button-email-${school.id}`)).not.toBeVisible();
  97  |     } finally {
  98  |       await deleteSchool(request, school.id);
  99  |     }
  100 |   });
  101 | 
  102 |   test("Mail button appears with correct href when school has contactEmail", async ({ page, request }) => {
  103 |     const email = `admin-${Date.now()}@testschool.example`;
  104 |     const school = await createSchool(request, { contactEmail: email });
  105 |     try {
  106 |       await openAdminPage(page);
  107 | 
  108 |       const mailButton = page.getByTestId(`button-email-${school.id}`);
  109 |       await expect(mailButton).toBeVisible({ timeout: 10_000 });
  110 | 
  111 |       const href = await mailButton.getAttribute("href");
  112 |       expect(href).toContain(`mailto:${email}`);
  113 |       expect(href).toContain("subject=");
  114 |       expect(href).toContain("body=");
  115 |       const body = decodeURIComponent((href ?? "").match(/body=([^&]*)/)?.[1] ?? "");
  116 |       expect(body).toContain(`/alliances/friendship/${school.token}`);
  117 | 
  118 |       await expect(page.getByTestId(`button-whatsapp-${school.id}`)).not.toBeVisible();
  119 |     } finally {
  120 |       await deleteSchool(request, school.id);
  121 |     }
  122 |   });
  123 | 
  124 |   test("Neither button appears when school has no phone or email", async ({ page, request }) => {
  125 |     const school = await createSchool(request, {});
  126 |     try {
  127 |       await openAdminPage(page);
  128 |       await expect(page.getByTestId(`card-school-${school.id}`)).toBeVisible({ timeout: 10_000 });
  129 |       await expect(page.getByTestId(`button-whatsapp-${school.id}`)).not.toBeVisible();
  130 |       await expect(page.getByTestId(`button-email-${school.id}`)).not.toBeVisible();
  131 |     } finally {
  132 |       await deleteSchool(request, school.id);
  133 |     }
  134 |   });
  135 | 
  136 |   test("Both buttons appear when school has both phone and email", async ({ page, request }) => {
  137 |     const email = `admin-both-${Date.now()}@testschool.example`;
  138 |     const school = await createSchool(request, { contactPhone: "9123456789", contactEmail: email });
  139 |     try {
  140 |       await openAdminPage(page);
  141 |       const waButton = page.getByTestId(`button-whatsapp-${school.id}`);
  142 |       const mailButton = page.getByTestId(`button-email-${school.id}`);
  143 |       await expect(waButton).toBeVisible({ timeout: 10_000 });
  144 |       await expect(mailButton).toBeVisible({ timeout: 10_000 });
  145 |       expect(await waButton.getAttribute("href")).toContain("wa.me/919123456789");
```