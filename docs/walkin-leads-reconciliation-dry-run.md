# AY 2027–28 walk-in leads: read-only reconciliation and proposed recovery

**Status:** Review only. I have not transferred, linked, imported, synced, or written any live data as part of this investigation; a future live change needs separate approval.

**Observed:** 30 September 2026. Counts and identities must be rechecked immediately before any future operation.

## Goal and boundaries

Make the 65 already-linked visit rows editable on the published `/leads` page without changing their existing Lead IDs or disturbing the 13 existing published lead records. Do **not** clone the whole development database, rewrite either WALKINs tab, or link those 65 rows again. The other 10 visits with empty IDs are a separate, manually reviewed step.

The published and Preview databases are separate, but the 75 displayed visits are drawn from the same underlying records. Publishing code alone cannot reconcile them.

## Read-only preflight findings

| Classification | RIS | RPS | Total |
| --- | ---: | ---: | ---: |
| Visit IDs that exist in Preview only | 39 | 26 | 65 |
| Visits with empty Lead ID | 5 | 5 | 10 |
| All displayed visits | 44 | 31 | 75 |

- Every one of the 65 nonempty IDs identifies a Preview lead with the same brand, child identity, and normalized phone. None identifies a live lead. No nonempty visit ID occurs on more than one visit; repeated Lead ID columns have no extra populated values in the read-only export.
- There are 141 saved Preview leads and 13 saved live leads for this academic year, with no overlapping record IDs. None of the 13 live records matches the identity of these 75 visits; eight of the 13 are archived. Preserve all 13.
- None of the 10 empty-ID visits has a matching live lead. Eight have no Preview identity candidate; two have multiple Preview candidates and must not be auto-linked.
- The 65 Preview leads have 65 audit events (63 `created`, two `visit_linked`) and 65 branch-specific sync checkpoints (39 RIS, 26 RPS). Live has no checkpoints for those 65 IDs. Source labels differ between some saved leads and visits, so do not blindly overwrite current visit fields with old saved fields.
- The relevant lead, audit, and checkpoint table columns match between environments. Of the 65 leads, 25 have a branch reference and 40 do not. All six distinct referenced Preview branch numbers differ from the corresponding live branch numbers; match branches by **brand and stable code**, not by numeric ID.
- Two of the 65 brand-specific reference numbers collide with existing live reference numbers. Preserve each visit's existing Lead ID, but allocate safe live reference numbers for collisions. Do not copy the legacy global sequence number.
- At the time of the check, live had no pending reconciliation scopes and no active sheet-operation lease. These are transient observations, not permission to write.

The read-only public export may omit leading blank/title rows. It was used for identity and ID classification, **not** as an authoritative workbook row-number source. Any later row-specific action must use a fresh authenticated read.

## Proposed dry-run manifest (no data write)

Generate a private, access-controlled manifest at execution time; do not put names, phone numbers, IDs, or raw rows into this repository or chat. It should list, for each of the 65:

1. Existing visit ID, brand, verified child/phone identity, latest visit fingerprint, and current workbook row location from an authenticated read.
2. Matching Preview record and historical audit event; whether the stored fields and current visit fields disagree, particularly source/status/owner/remarks.
3. Mapped live branch by brand + code (or an explicit null), candidate live reference number, and the two reference-number collisions requiring reallocation.
4. Live absence by record ID **and** child/phone identity, duplicate-ID checks across visit rows, and the intended destination snapshot scope.
5. A hash and capture time for the source, destination, and visit-row snapshots; a precise before/after expected count and a per-record pass/fail. Fail closed on any changed row, changed identity, unexpected match, new collision, unavailable source, or pending sync error.

Expected pre-transfer counts **if nothing has changed**: 65 linked-visit candidates, zero corresponding live records, 65 Preview audit events, 65 Preview checkpoints, 10 empty-ID visits held out. Counts are gates, not an instruction to proceed automatically.

## Execution proposal — requires a separate approval

1. **Prepare a maintenance window and recovery copies.** Export encrypted, access-controlled backups of the affected Preview records/history/checkpoints, the existing live leads/branch mapping/sequence state, and the exact visit rows. Record hashes and operator/time outside the repository. Confirm how to restore those backups before any change.
2. **Quiesce all writers, not only the timer.** A migration-only maintenance guard must block/queue lead edits, linking, archiving, manual sync/resync, and incoming pull hooks; stop and drain automatic pulls on **all** running instances. The current durable lease prevents simultaneous sheet operations but is not, by itself, a migration lock. No such guard has been installed as part of this runbook. Do not begin until this guard is implemented and verified and active operations have drained. Preserve pending reconciliation markers; do not clear them as a shortcut.
3. **Re-run the manifest against fresh data.** Check all 65 IDs, identity matches, existing live records, branch mappings, collisions, audit history, and current visit values. An unexpected change stops the operation for review.
4. **Stage a targeted transactional transfer.** Insert only the 65 verified lead records with their existing IDs. Translate non-null branch references by brand + code. Assign collision-free live brand reference numbers and let the live global sequence allocate its own values. Copy historical audit events with new audit primary keys while preserving their timestamps, and add an explicit migration audit event. Do not replace the 13 existing live records. Use an atomic transaction for the database changes; do not write visit rows.
5. **Establish live sync baselines deliberately.** Do not blindly copy Preview checkpoints: they may not describe the current live visit rows. Compare each current visit against the transferred record, resolve differing fields under the established source-of-truth rules, and create destination-specific checkpoints only after that comparison. Keep incremental, ID-targeted reconciliation; never run a full-tab rewrite over historical ID-less rows.
6. **Validate before releasing the guard.** Confirm exactly 65 new live IDs with correct identity/branch, no lost live records, correct audit history and checkpoints, no duplicate reference numbers, unchanged visit IDs and content, and that all 65 now show the editable **Actions** control. Confirm the other 10 still need review. Only then resume workers and monitor the first pull and sync-health results.

The current application has no reviewed one-click operation for this exact cross-environment transfer. A future operator must implement and review a bounded migration path; **do not** use the CRM import, a bulk `/leads` edit, or a publish as a substitute.

## Rollback and stop rules

- **Before commit:** Any failed gate or transaction error means no production transfer is committed. Keep the maintenance guard active, diagnose, and re-run the read-only checks before retrying.
- **After commit but before resuming writers:** If a validation fails, restore only migration-created leads, audit events, and checkpoints from the captured before-state under a reviewed transaction. Confirm the 13 pre-existing live records, visit IDs, and original workbook rows are unchanged. Do not reset shared sequences blindly; gaps are safer than reusing a number.
- **After writers resume or an external edit occurs:** Do **not** blindly delete the 65 leads. Stop writers again, compare new dependencies/audit events and current visit rows, then design a compensating correction with explicit approval. A database-only rollback may otherwise orphan links or discard staff edits.
- Never clear/rewrite a visit tab, overwrite occupied Lead ID cells, delete every lead for an academic year, or silently replace current visit values from old Preview data.

**Approval gate:** First review the dry-run manifest, maintenance guard, backup/restore test, field-conflict decisions, and the two reference-number reallocations. Only then seek explicit authorization for any live mutation. The 10 blank-ID visits require a separate identity review and explicit linking action.