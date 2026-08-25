# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: friendship-buttons.spec.ts >> FriendshipQRTab — WA and Email buttons >> WA button appears with correct href when school has contactPhone
- Location: tests/e2e/friendship-buttons.spec.ts:158:3

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
            - generic [ref=e11]: Live · synced 07:09 am
        - button "REFRESH" [ref=e12]:
          - img [ref=e13]
          - generic [ref=e15]: REFRESH
      - generic [ref=e17]:
        - button "Overview" [ref=e18]
        - button "Brand Partners268" [ref=e19]
        - button "Corporates64" [ref=e20]
        - button "Friendship Schools75" [ref=e21]
        - button "Parent Advocacy132" [ref=e22]
        - button "FS Leads" [ref=e23]
    - generic [ref=e25]:
      - generic [ref=e27]:
        - generic [ref=e28]: View by
        - generic [ref=e29]:
          - button "All Verticals" [ref=e30]
          - button "Brand Partners" [ref=e31]
          - button "Corporates" [ref=e32]
          - button "Friendship Schools" [ref=e33]
          - button "Parent Advocacy" [ref=e34]
      - generic [ref=e35]:
        - generic [ref=e37]: All Verticals Snapshot
        - generic [ref=e38]:
          - generic [ref=e39]:
            - generic [ref=e40]:
              - img [ref=e41]
              - generic [ref=e45]: "539"
            - generic [ref=e46]:
              - generic [ref=e47]: Total
              - generic [ref=e48]: Targeted Entities
          - generic [ref=e49]:
            - generic [ref=e50]:
              - img [ref=e51]
              - generic [ref=e54]:
                - generic [ref=e55]: "39"
                - generic [ref=e56]: / 539
            - generic [ref=e57]:
              - generic [ref=e58]: MOU Done
              - generic [ref=e59]: Tie-ups signed
          - generic [ref=e60]:
            - generic [ref=e61]:
              - img [ref=e62]
              - generic [ref=e65]:
                - generic [ref=e66]: "59"
                - generic [ref=e67]: / 539
            - generic [ref=e68]:
              - generic [ref=e69]: MOU Sent
              - generic [ref=e70]: Awaiting signature
          - generic [ref=e71]:
            - generic [ref=e72]:
              - img [ref=e73]
              - generic [ref=e76]:
                - generic [ref=e77]: "475"
                - generic [ref=e78]: / 539
            - generic [ref=e79]:
              - generic [ref=e80]: In Pipeline
              - generic [ref=e81]: Active pursuit
          - generic [ref=e82]:
            - generic [ref=e83]:
              - img [ref=e84]
              - generic [ref=e87]:
                - generic [ref=e88]: "25"
                - generic [ref=e89]: / 539
            - generic [ref=e90]:
              - generic [ref=e91]: Dropped
              - generic [ref=e92]: Not interested
          - generic [ref=e93]:
            - generic [ref=e94]:
              - img [ref=e95]
              - generic [ref=e98]:
                - generic [ref=e99]: "0"
                - generic [ref=e100]: / 1
            - generic [ref=e101]:
              - generic [ref=e102]: Admissions
              - generic [ref=e103]: Referred till date
      - generic [ref=e104]:
        - generic [ref=e105]:
          - generic [ref=e106]: Conversion by Vertical
          - generic [ref=e107]:
            - generic [ref=e108]:
              - generic [ref=e109]:
                - img [ref=e110]
                - generic [ref=e113]:
                  - generic [ref=e114]: 2%
                  - generic [ref=e115]: / 100
              - generic [ref=e116]:
                - generic [ref=e117]: Brand Partners
                - generic [ref=e118]: 5 of 268 MOUs
            - generic [ref=e119]:
              - generic [ref=e120]:
                - img [ref=e121]
                - generic [ref=e124]:
                  - generic [ref=e125]: 0%
                  - generic [ref=e126]: / 100
              - generic [ref=e127]:
                - generic [ref=e128]: Corporates
                - generic [ref=e129]: 0 of 64 MOUs
            - generic [ref=e130]:
              - generic [ref=e131]:
                - img [ref=e132]
                - generic [ref=e135]:
                  - generic [ref=e136]: 45%
                  - generic [ref=e137]: / 100
              - generic [ref=e138]:
                - generic [ref=e139]: Friendship Schools
                - generic [ref=e140]: 34 of 75 MOUs
            - generic [ref=e141]:
              - generic [ref=e142]:
                - img [ref=e143]
                - generic [ref=e146]:
                  - generic [ref=e147]: 70%
                  - generic [ref=e148]: / 100
              - generic [ref=e149]:
                - generic [ref=e150]: Parent Advocacy
                - generic [ref=e151]: 92 of 132 Onboarded
          - generic [ref=e152]:
            - generic [ref=e155]:
              - generic [ref=e156]: Brand Partners
              - generic [ref=e157]: "268"
            - generic [ref=e162]:
              - generic [ref=e163]: Corporates
              - generic [ref=e164]: "64"
            - generic [ref=e169]:
              - generic [ref=e170]: Friendship Schools
              - generic [ref=e171]: "75"
            - generic [ref=e176]:
              - generic [ref=e177]: Parent Advocacy
              - generic [ref=e178]: "132"
        - generic [ref=e181]:
          - generic [ref=e182]: Pipeline Stage Distribution
          - generic [ref=e183]:
            - generic [ref=e184]:
              - generic [ref=e186]: "230"
              - generic [ref=e187]: Not Contacted
            - generic [ref=e188]:
              - generic [ref=e190]: "13"
              - generic [ref=e191]: Initial Discussion
            - generic [ref=e192]:
              - generic [ref=e194]: "40"
              - generic [ref=e195]: Touchbase Done
            - generic [ref=e196]:
              - generic [ref=e198]: "1"
              - generic [ref=e199]: Waiting for Revert
            - generic [ref=e200]:
              - generic [ref=e202]: "59"
              - generic [ref=e203]: MOU Sent
            - generic [ref=e204]:
              - generic [ref=e206]: "0"
              - generic [ref=e207]: MOU Signing Pending
            - generic [ref=e208]:
              - generic [ref=e210]: "39"
              - generic [ref=e211]: MOU Done
            - generic [ref=e212]:
              - generic [ref=e214]: "25"
              - generic [ref=e215]: Not Interested / Dropped
          - generic [ref=e216]:
            - generic [ref=e217]:
              - generic [ref=e218]: Brand Partners
              - generic [ref=e219]:
                - generic [ref=e220]: MOU Done
                - generic [ref=e221]: "5"
              - generic [ref=e222]:
                - generic [ref=e223]: MOU Sent
                - generic [ref=e224]: "8"
              - generic [ref=e225]:
                - generic [ref=e226]: Touchbase Done
                - generic [ref=e227]: "30"
              - generic [ref=e228]:
                - generic [ref=e229]: Initial Discussion
                - generic [ref=e230]: "7"
            - generic [ref=e231]:
              - generic [ref=e232]: Corporates
              - generic [ref=e233]:
                - generic [ref=e234]: MOU Done
                - generic [ref=e235]: "0"
              - generic [ref=e236]:
                - generic [ref=e237]: MOU Sent
                - generic [ref=e238]: "49"
              - generic [ref=e239]:
                - generic [ref=e240]: Touchbase Done
                - generic [ref=e241]: "3"
              - generic [ref=e242]:
                - generic [ref=e243]: Initial Discussion
                - generic [ref=e244]: "2"
            - generic [ref=e245]:
              - generic [ref=e246]: Friendship Schools
              - generic [ref=e247]:
                - generic [ref=e248]: MOU Done
                - generic [ref=e249]: "34"
              - generic [ref=e250]:
                - generic [ref=e251]: MOU Sent
                - generic [ref=e252]: "2"
              - generic [ref=e253]:
                - generic [ref=e254]: Touchbase Done
                - generic [ref=e255]: "7"
              - generic [ref=e256]:
                - generic [ref=e257]: Initial Discussion
                - generic [ref=e258]: "4"
            - generic [ref=e259]:
              - generic [ref=e260]: Parent Advocacy
              - generic [ref=e261]:
                - generic [ref=e262]: Accepted
                - generic [ref=e263]: "92"
              - generic [ref=e264]:
                - generic [ref=e265]: To be Decided
                - generic [ref=e266]: "33"
              - generic [ref=e267]:
                - generic [ref=e268]: Not Yet Reached
                - generic [ref=e269]: "0"
              - generic [ref=e270]:
                - generic [ref=e271]: Rejected
                - generic [ref=e272]: "7"
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