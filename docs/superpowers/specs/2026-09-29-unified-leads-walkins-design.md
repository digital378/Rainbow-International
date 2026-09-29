# Unified leads and completed walk-ins

## Temporary operational scope (29 September 2026)

Until the Master automations are reviewed, the Leads list, report and export show only rows fetched from the RIS and RPS WALKINs tabs. Do not fetch Master or CRM Tracker for this view. Existing CRM imports remain stored but are hidden rather than deleted. Master read/write sync is paused; restoring either source to this view requires a separate decision. The original approved combined-source behavior below remains the longer-term design, not the current view.

## Approved behavior

The platform lists all leads. CRM Leads Tracker is a DM enquiry source; WALKINs is the record of completed visits, including visits whose later status becomes open or follow-up. Importing or editing a pre-visit DM enquiry must not create a WALKINs row.

Merge a CRM enquiry with a completed visit only when the school, normalized phone and normalized child name identify one unique record on each side. Enquiry and walk-in dates can differ. Never merge on phone alone, and leave multiple possible matches separate for manual review. The completed WALKINs record supplies current status, remarks, visit details and other operational fields; the CRM record supplies original enquiry date and DM source. The platform shows one lead. Unmatched DM enquiries stay in the platform; unmatched completed visits also appear once.

For an unambiguous match, fill only the blank primary Lead ID cell of the existing WALKINs row, never a repeated ID column. Reject occupied or duplicate IDs and concurrent row changes. Preserve every existing historical value. Once linked, edits use the managed CRM record and update the existing linked visit row rather than appending a second row. Data unavailable from either source must be reported as an incomplete view, not silently presented as a complete total.

The status badge reveals the available follow-up/calling remarks and close reason in a small note on hover or keyboard focus; touch users can tap to open it. No empty note is shown.

## Synchronization and cleanup

Disable the old all-leads reconciliation that would copy the reviewed CRM import into WALKINs. Sheet writes are permitted only for an existing linked visit, a uniquely matched visit being linked in place, or a genuinely completed new visit; future follow-up statuses do not remove an established visit. Keep ambiguous candidates and unexpected sheet layouts out of writes.

The earlier limited mirror created extra CRM rows in the branch and Master WALKINs tabs. Identify only those known rows by their managed IDs; remove a row only if its present cells match the data written by the mirror and it remains at the end of the data. If any cell changed, leave it untouched for review. Never clear/rewrite a historical tab or remove unrelated rows.

## Verification

Use fixtures for same-child/same-phone with different dates, siblings sharing a phone, multiple candidate visits, later open/follow-up status, remarks, read-only/incomplete sources, and duplicate IDs. Confirm pagination, export and reports use the same merged list. Verify a linked edit targets the existing row without altering extra columns, and a pre-visit enquiry never writes to WALKINs. Compare preserved rows before and after limited live linking/cleanup with formula-level fingerprints.