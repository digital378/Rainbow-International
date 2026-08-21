# Counselor Performance Live API

## Goal

Expose complete, stable, non-PII counselor/RA performance collections through
the existing RIS and RPS sales live endpoints:

- `/api/sales/live?account=ris`
- `/api/rps-sales/live?account=rps`

The collections must support individual performance analysis without changing
the dashboard-facing leaderboard behavior or combining RIS and RPS totals.

## Chosen approach

Add a top-level `counselorPerformance` object to both endpoint responses. It
contains an unpaginated `counselors` collection, while the existing
`counselorLeaderboard` remains unchanged for backwards-compatible dashboard
rendering.

A separate route is unnecessary: performance data is computed from the same
live source rows as each dashboard, and exposing it with the dashboard data
keeps the reporting timestamp and account scope aligned.

## Response contract

Both routes return:

```json
{
  "account": "ris",
  "generatedAt": "ISO-8601 timestamp",
  "counselorPerformance": {
    "period": {
      "academicYear": "2026-27",
      "month": "2026-08",
      "dateRange": { "from": "2026-08-01", "to": "2026-08-31" },
      "timezone": "Asia/Kolkata"
    },
    "appliedFilters": {
      "month": null,
      "from": null,
      "to": null,
      "academicYear": null,
      "branch": null,
      "counselor": null,
      "source": null
    },
    "totalCounselors": 0,
    "counselors": [
      {
        "counselor": "Counselor name",
        "branch": "Branch name or null",
        "assignedEnquiries": 0,
        "walkinsAssigned": 0,
        "followUps": 0,
        "admissions": 0,
        "conversionRate": 0,
        "periodStatus": {
          "open": 0,
          "closed": 0,
          "inProcess": 0,
          "futureProspect": 0,
          "provisional": 0
        },
        "activePipeline": {
          "open": 0,
          "followUps": 0,
          "inProcess": 0,
          "futureProspect": 0,
          "total": 0
        }
      }
    ]
  }
}
```

`assignedEnquiries` is the count of source records assigned to a counselor in
the reporting period. `walkinsAssigned` is the same row-level count for these
walk-in sales sources, retained as an explicit field for callers asking about
walk-ins. `conversionRate` is `(admissions / assignedEnquiries) * 100`, rounded
to one decimal place.

`periodStatus` and `followUps` apply the selected reporting period. The
`activePipeline` is a current snapshot of records that remain open; it ignores
the date constraints but respects the selected branch, counselor, and source
filters. This provides a useful current workload reading alongside historical
performance.

For RIS, `branch` is `Main` when no unit is recorded. For RPS, each
counselor/branch combination is returned separately so a counselor active in
multiple branches can be analysed without blending units.

## Filtering

Both routes accept:

- `month=YYYY-MM`
- `from=YYYY-MM-DD`
- `to=YYYY-MM-DD`
- `academicYear=YYYY-YY`
- `branch=<name>`
- `counselor=<name>`
- `source=<name>`

`month` is mutually exclusive with `from` and `to`. A range may specify one
bound or both; when both are given, `from` must not be after `to`. Invalid
formats and invalid combinations return a stable `400` JSON error. String
filters are case-insensitive exact normalized matches.

Academic years are derived using the school cycle of April through March when
the source does not provide an explicit academic-year column. RPS uses its
explicit source value where available.

## Data boundaries

Each endpoint only reads and aggregates the source data for its own account.
The response includes no student, parent, contact, email, or other personal
information. Existing detailed dashboard blocks are not expanded by this
change.

The aggregate response supports named counselor performance. Resolving a
particular student record to an owner requires a separate, access-controlled
CRM lookup with a non-PII record identifier; it is intentionally outside this
contract.

## Compatibility and verification

- Existing dashboard response fields, including top-limited leaderboard data,
  remain available and structurally unchanged.
- `counselorPerformance.counselors` is never paginated or top-limited.
- Tests cover RIS and RPS full collections, period and dimension filters,
  invalid filters, timestamp/account metadata, absence of PII fields, and the
  distinction between period follow-ups and the active pipeline snapshot.