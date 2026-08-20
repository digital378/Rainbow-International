# Indra Intelligence data bridge

This project provides a **read-only, versioned** API for Indra Intelligence at
`/api/indra/v1`. It deliberately uses a dedicated credential and does not
accept this project's existing admin, RIS, or RPS tokens.

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
| `GET /api/indra/v1/website/inquiries` | Website enquiries | `createdSince` |
| `GET /api/indra/v1/website/callback-requests` | Callback requests | `createdSince` |
| `GET /api/indra/v1/website/brochure-requests` | Brochure requests | `createdSince` |
| `GET /api/indra/v1/website/career-applications` | Career application metadata | `createdSince` |
| `GET /api/indra/v1/friendship/schools` | Friendship school profiles | — |
| `GET /api/indra/v1/friendship/leads` | Friendship-school leads | `createdSince` |
| `GET /api/indra/v1/content/blogs` | Database and code-owned blog metadata | `publishedSince` |

The browser CORS policy is limited to
`https://indra-intelligence-assistant.replit.app`. Server-to-server calls are
still recommended.

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

Use `/api/indra/v1/crm/admissions` for questions about admissions performance;
do not infer admissions by counting a page of `/crm/leads` results. The
endpoint excludes archived leads and counts a lead as an admission only when
its current status is exactly `ADMISSION DONE`. It also reports the academic
year, total leads, walk-ins, bookings, status breakdown, and aggregate
breakdowns by branch and source.

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