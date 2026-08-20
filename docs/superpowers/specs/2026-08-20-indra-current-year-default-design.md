# Indra current academic-year default

## Goal

Make `2026-27` the default academic year for Indra CRM requests that omit
`academicYear`, so current-year tracker data is returned instead of next-year
`2027-28` records.

## Scope

- Change the default used by optional CRM academic-year parsing to `2026-27`.
- Document the default in the OpenAPI schema, catalog guidance, and bridge
  documentation.
- Keep all explicit academic-year queries working, including `2027-28` and
  older dashboard reports.
- Keep aggregate endpoints that require `academicYear` explicit; they will not
  silently choose a year.

## Expected behavior

| Request | Result |
| --- | --- |
| `GET /api/indra/v1/crm/leads` | Uses `2026-27` |
| `GET /api/indra/v1/crm/summary` | Uses `2026-27` |
| `GET /api/indra/v1/crm/leads?academicYear=2027-28` | Uses explicit `2027-28` |
| `GET /api/indra/v1/dashboard/reports?academicYear=all` | Continues to return every available year |
| Aggregate endpoints requiring `academicYear` | Continue to reject omitted years |

## Verification

- Regression test: omitted optional academic year filters to `2026-27`.
- Regression test: explicit `2027-28` still returns the requested year.
- Typecheck, focused Indra test suite, production build, and live endpoint
  checks pass.