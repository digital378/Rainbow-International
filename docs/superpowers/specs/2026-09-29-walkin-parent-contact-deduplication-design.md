# 2027–28 walk-in parent-contact deduplication

## Goal
Stop a new RIS or RPS walk-in when either entered parent contact already appears as either parent contact on a non-archived 2027–28 walk-in at either school. Also reject two identical parent contacts on the same new form. Keep the existing Add Sibling Enquiry flow: siblings submitted together are one family's enquiry and may share its parent contacts.

## Behavior
- Normalize both required contacts as Indian mobile numbers. Invalid contacts cannot be saved.
- On blur of either field, check both entered numbers against both stored contact columns, across RIS and RPS within 2027–28. Show a generic duplicate warning; the public lookup must not disclose another family's school, enrolment status or record details, and must be rate-limited.
- A duplicate has no Continue Anyway override. The save endpoint performs the same check even if the client check was skipped or stale, and responds with a conflict without inserting a lead.
- Submit the main child and up to eight siblings together. Reject or save the group as a unit, so the duplicate rule does not block legitimate sibling entries or leave partial submissions.
- Archived leads do not count. Existing leads from other academic years do not count.

## Implementation
Use one shared server-side contact predicate for the check endpoint and create endpoint. Serialize competing creates for the same normalized contacts within a database transaction before checking and inserting; do not rely on the UI as enforcement. After commit, retain the existing audit and sheet-sync behavior for each created lead. The form rechecks on changes to either contact and shows a save-time conflict from the server.

## Verification
Check all four old/new father/mother combinations, both cross-school directions, invalid and same-field contacts, archived records, successful sibling groups, and simultaneous requests for the same contact. Type-check the app, run focused tests, and verify the form renders.