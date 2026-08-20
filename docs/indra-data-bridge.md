# Indra Intelligence data bridge

This project provides a **broad read-only, versioned** API for Indra
Intelligence at `/api/indra/v1`. It gives Indra a named, live source for
Rainbow’s public site, operational records, and dashboard-equivalent metrics
without giving it a staff browser session, an admin login, or write access. It
deliberately uses a dedicated credential and does not accept this project's
existing admin, RIS, or RPS tokens.

## Source API

Use either header below with the dedicated `INDRA_API_TOKEN` value:

```http
Authorization: Bearer <INDRA_API_TOKEN>
# or
X-Indra-Api-Key: <INDRA_API_TOKEN>
```

The API is paginated (`page`, `pageSize`) with a maximum page size of 200.
All endpoints return an envelope that includes `apiVersion`, source,
dataset, timestamp, and pagination details where applicable.

| Endpoint | Purpose | Filters |
| --- | --- | --- |
| `GET /api/indra/v1` or `GET /api/indra/v1/catalog` | Available datasets and exclusions | — |
| `GET /api/indra/v1/health` | Credential and outbound-delivery status | — |
| `GET /api/indra/v1/crm/leads` | Walk-in CRM leads for an academic year | `brand`, `branchId`, `academicYear`, `updatedSince`, `includeArchived` |
| `GET /api/indra/v1/crm/reference` | Branches, staff, programs, sources, statuses, close reasons | `brand`, `includeInactive` |
| `GET /api/indra/v1/crm/summary` | Lead counts by brand, status, and source | `brand`, `academicYear` |
| `GET /api/indra/v1/crm/admissions` | Verified academic-year admissions KPIs without contact records | `brand=RIS|RPS|BOTH`, `academicYear`, `branchId` |
| `GET /api/indra/v1/crm/admissions-performance` | Live conversion-focused admissions KPIs by brand without contact records | `academicYear` (required), `brand`, `branchId` |
| `GET /api/indra/v1/dashboard/overview` | One live overview across CRM, website demand, Friendship Schools, content, and public site pages | `academicYear` (required), `brand`, `branchId` |
| `GET /api/indra/v1/dashboard/academic-years` | Discover historical dashboard provider coverage, availability, and limitations | — |
| `GET /api/indra/v1/dashboard/reports` | Aggregate-only historical Marketing, RIS Sales, RPS Sales, and current CRM reports | `academicYear` (`YYYY-YY` or `all`) |
| `GET /api/indra/v1/website/inquiries` | Website enquiries | `createdSince` |
| `GET /api/indra/v1/website/callback-requests` | Callback requests | `createdSince` |
| `GET /api/indra/v1/website/brochure-requests` | Brochure requests | `createdSince` |
| `GET /api/indra/v1/website/career-applications` | Career application metadata | `createdSince` |
| `GET /api/indra/v1/friendship/schools` | Friendship school profiles | — |
| `GET /api/indra/v1/friendship/leads` | Friendship-school leads | `createdSince` |
| `GET /api/indra/v1/content/blogs` | Database and code-owned blog metadata | `publishedSince` |
| `GET /api/indra/v1/site/pages` | Canonical public site-page inventory and page metadata | — |
| `GET /api/indra/v1/repository/context` | Official GitHub repository and repository-access boundary | — |

The browser CORS policy is limited to
`https://indra-intelligence-assistant.replit.app`. Server-to-server calls are
still recommended.

## OpenAPI schema import

For an importable, GPT-style connection schema, use:

```text
https://rainbowinternationalschool.in/openapi-indra.yaml
```

This public schema link contains endpoint descriptions and authentication
requirements only; it never contains an API token or live data. Configure the
dedicated `INDRA_API_TOKEN` in Indra's secure credential field as a Bearer
token, then import the schema. After import, read
`/api/indra/v1/catalog` to refresh current resource and routing guidance.

Do not use the older `/openapi.yaml` for Indra. It belongs to the legacy
Rainbow Group Marketing/GPT integration and describes a different, older API
contract.

## Broad read-only source registry

Start each new Indra connection by reading `/api/indra/v1/catalog`. In
addition to the endpoint groups above, it returns a machine-readable
`resources` list. Each resource states:

- its stable path and business purpose;
- valid filters;
- source of truth and freshness behaviour;
- whether it may contain personal data;
- whether it is a CRM, dashboard, website, Friendship, content, site, or
  repository resource.

For performance questions, use aggregate resources such as
`/crm/admissions`, `/crm/admissions-performance`, or
`/dashboard/overview`, always supplying an explicit `academicYear` in
`YYYY-YY` form. Do not infer a school-level metric by counting one page of
`/crm/leads`. The catalog's `queryRouting` entries make this distinction
machine-readable for Indra source setup and refresh.

`/dashboard/overview` is a non-cached live read. Its `academicYear`, `brand`,
and `branchId` filters apply **only to its nested CRM admissions section**.
The website-demand, Friendship School, content, and public-site sections are
explicitly labelled as all-time, organisation-wide values because those
sources do not consistently contain the same CRM filter attributes. A
`no_matching_records` freshness status means the requested CRM filter was
valid but did not match current records.

## Historical dashboard reporting

Use `GET /api/indra/v1/dashboard/academic-years` before asking a historical
dashboard question. It lists the approved provider coverage for every
academic year currently represented in the bridge. Then call
`GET /api/indra/v1/dashboard/reports?academicYear=2026-27` for the legacy
Marketing, RIS Sales, and RPS Sales dashboard aggregates, or
`academicYear=all` to read every known provider.

The response is deliberately provider-labelled. The legacy dashboard sheets
use different date fields, status definitions, and reporting periods, so Indra
must not merge their figures into one total unless the requested comparison
explicitly supports it. Each provider reports its source, coverage, freshness,
and availability. `provider_unavailable` means the source could not be read;
it never means zero. The resource exposes only allowed aggregate series:
monthly KPIs, funnel/status/source/grade/branch counts, and marketing spend.
It never includes raw spreadsheet rows, people’s names, contacts, remarks,
free-text closure reasons, sheet IDs, credentials, or uploaded files.

`/site/pages` inventories canonical public website pages from the deployed
route metadata. Blogs remain discoverable from `/content/blogs`, including
code-owned posts. Private browser routes are intentionally not proxied as
HTML; Indra should use the named API resource that supplies their underlying
data instead.

## Repository context

`/repository/context` identifies the official Rainbow repository:

```text
https://github.com/digital378/Rainbow-International
```

Repository contents are not copied into or proxied through the Rainbow API.
Use the attached read-only GitHub connector to read repository metadata,
source files, commits, issues, and pull requests. The connector is separate
from live operational-data authorization: GitHub access does not grant
dashboard data, and the Indra API token does not grant GitHub access.

If the Indra application runs in a different workspace, attach a read-only
GitHub connection there as well; do not copy a GitHub token into source code,
chat, or an environment variable.

## Data exclusions

The bridge has explicit output allowlists. It does **not** send:

- resume files, resume links, or resume contents;
- branch PINs, friendship-school tokens, credentials, session data, API keys,
  connection strings, or unrestricted database records;
- free-text internal remarks and messages, which can contain unstructured
  sensitive information;
- user-provided file uploads.

The operational records that remain may contain contact information. Indra
must keep this data private, use it only for approved school operations, and
avoid re-exposing it in public responses.

### Admissions KPI definition

Use `/api/indra/v1/crm/admissions` for questions about admissions performance,
with an explicit `academicYear`; do not infer admissions by counting a page of
`/crm/leads` results. The endpoint excludes archived leads and counts a lead as
an admission only when its current status is exactly `ADMISSION DONE`. It also
reports the academic year, applied filters, live-read freshness, total leads,
walk-ins, bookings, status breakdown, and aggregate breakdowns by branch and
source. A valid filter with no current matches returns
`freshness.status: "no_matching_records"` and zeroed aggregates.

`GET /api/indra/v1/crm/admissions-performance` is the conversion-focused
resource. It requires `academicYear` in `YYYY-YY` form and returns only
per-brand lead, walk-in, admission, lead-to-admission, and
walk-in-to-admission counters. Every response includes the database source,
the non-cached read timestamp, applied filters, and the exact normalized-status
definition. Conversion rates are percentages and are `null` when the relevant
denominator is zero; no lead rows or contact data are returned. A valid filter
with no current matches likewise reports
`freshness.status: "no_matching_records"`.

## Scheduled outbound delivery

Scheduled delivery is off by default. When enabled, the source sends an
initial snapshot once and then incremental records using the last successfully
delivered checkpoint. An archived CRM lead is sent with `isArchived: true`, so
the receiver can suppress a record it received earlier. Reference records,
Friendship School records, and blog metadata are declared current snapshots so
Indra can reconcile sheet-driven updates and removals that do not have a
reliable update timestamp.

The fixed receiver contract for the Indra project is:

```text
POST https://indra-intelligence-assistant.replit.app/api/integrations/rainbow/v1/deliveries
```

The Indra receiver must:

1. Read the raw request body.
2. Verify `X-Indra-Signature` against the raw JSON using HMAC-SHA256 and the
   shared `INDRA_PUSH_SECRET`.
3. De-duplicate using `X-Indra-Delivery-Id` before applying data.
4. Return a 2xx response only after safely accepting the batch.
5. Store incremental records with upserts or a transaction so a retry cannot
   duplicate them, and reconcile any dataset marked `mode: "snapshot"` by
   stable ID so records removed from the source are removed or suppressed in
   Indra too.

The source sends headers similar to:

```http
X-Indra-Delivery-Id: <UUID>
X-Indra-Signature: sha256=<hex hmac of raw JSON>
User-Agent: Rainbow-Indra-Bridge/1.0
```

The payload includes a `delivery` object with the ID, delivery type
(`initial` or `incremental`), `since`, and `checkpointAt`, followed by the
allowlisted CRM, website, Friendship School, and content datasets.

### Enable only after the receiver is deployed

Set these values through the workspace secret/environment settings—not in
source code:

| Name | Where | Purpose |
| --- | --- | --- |
| `INDRA_API_TOKEN` | Secret in this project; copy securely to Indra as its source API token | Authenticates Indra's on-demand reads |
| `INDRA_PUSH_SECRET` | Same secret in both projects | Signs and verifies scheduled deliveries |
| `INDRA_PUSH_ENABLED=true` | Environment setting in this project | Explicit opt-in after receiver verification |
| `INDRA_PUSH_INTERVAL_MINUTES=60` | Environment setting in this project | Delivery cadence; minimum is 5 |
| `INDRA_PUSH_URL` | Optional environment setting in this project | Overrides the fixed receiver path, but must remain HTTPS on the Indra host |

Delivery retries up to three times for a batch. A database-backed lease
prevents overlapping processes from delivering or advancing the same
checkpoint. Delivery metadata, failures, and the most recent successful
checkpoint are stored locally; payloads are never persisted or logged.