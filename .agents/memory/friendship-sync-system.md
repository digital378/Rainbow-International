---
name: Friendship Schools Sync System
description: How the Friendship Schools lead portal syncs between DB, Google Sheet, and school portals — architecture, rules, and pitfalls.
---

## Architecture

- **DB is the master.** New leads enter only via the submission form (`POST /api/alliances/friendship/submit/:token`) or bulk upload. The Google Sheet ("All Friendship Leads" aggregate tab) is a status-editing surface for admins, not an import source.
- **Sheet is for status tracking.** Admin edits status in col I of the aggregate tab. REFRESH pulls those changes back into the DB.
- **School portal reads from DB**, not from the sheet. Status changes made by admin PATCH are visible in the portal instantly (no REFRESH needed for that direction).

## Sync Flow — REFRESH button

`POST /sync-all-from-sheets` is called first. It:
1. Reads the aggregate tab **once**
2. For every school in DB: updates statuses in DB from matching sheet rows (matched by school name col B + phone col F)
3. Deletes DB leads whose phone is absent from the entire tab AND `syncedToSheets=true`
4. Returns `{ updated, deleted, schools }`

After sync-all, the client re-fetches `/schools` (which auto-removes schools deleted from the Friendship Schools tab), `/stats`, and leads for the currently open school card. No per-school "Sync Status" button exists — REFRESH does everything.

## syncedToSheets Guard (critical)

Leads only become eligible for deletion-by-sync when `syncedToSheets=true`. This flag is set by `appendLeadsToAggregateTab` **after** the `values.append` call succeeds. Leads still pending their first sheet write (`syncedToSheets=false`) are never deleted by sync — this prevents a fresh lead from being wiped if REFRESH runs before the background append completes.

## Concurrent Append Queue (critical)

`values.append` reads the "last row" before writing. Two concurrent calls both see the same last row and one silently overwrites the other — the loser still gets `syncedToSheets=true` (API returned 200) but its phone is absent from the sheet, so the next REFRESH deletes it.

Fix: all `appendLeadsToAggregateTab` calls go through `queueAppend()`, a promise-chain serialization queue. Each append waits for the previous one to finish. HTTP submit responses are still instant — only the background write is serialized.

## School Deletion

Schools synced from the Friendship Schools tab (no `contactOverride`) are auto-deleted from DB when they disappear from the tab — even if they still have leads. Schools created manually via the admin panel have `contactOverride=true` and are protected from this auto-delete.

## PATCH Write-back

When admin changes a lead status via the dashboard (`PATCH /api/admin/alliances/friendship/leads/:id`), it fire-and-forgets an `updateAggregateLeadRow` call that finds all matching rows in the aggregate tab (by school name + phone) and updates col I (status) and col J (referral amount) in-place.

## What sync-all Does NOT Do

- Does **not** import sheet rows into DB (DB is master for new leads).
- Does **not** delete leads with `syncedToSheets=false`.
- Does **not** use per-school sheet tabs (they no longer exist).

## Key Pitfalls

- Phone matching normalises with `.replace(/\D/g, "")` — always normalise before comparing.
- Deletion check uses ALL phones from ALL rows in the tab (not just school-filtered rows) so leads appended under an old school name survive a school rename.
- `existingPhones` set in sync-all is per-school — do not reuse across schools.
