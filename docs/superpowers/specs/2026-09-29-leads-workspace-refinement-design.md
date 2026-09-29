# Brand-scoped leads workspace and dates

## Purpose
Give RIS and RPS staff a calmer AY 2027–28 leads workspace with independent access, an unambiguous walk-in date, and a distinct admission date.

## Access and flow
- Sign-in accepts separate RIS and RPS Leads passcodes. Sessions carry a server-verified brand and can read or edit only that brand's leads, including searches, exports, histories, detail views and archives. Request parameters cannot expand the scope. The existing group Leads passcode remains for group admins with access to both brands.
- The group Leads passcode is no longer exposed in the general internal staff directory. Brand Leads passcodes are also not listed there. Administrators distribute them separately. For effective separation, the old group Leads passcode should be rotated if it was previously shared with branch staff.
- The initial kiosk enquiry form remains able to create a new lead, and the existing Source lock remains in force on later edits.

## Dates and data
- Existing walk-in dates remain walk-in dates. The historical sheet column named "Admission Date" currently contains walk-in dates and is not reinterpreted.
- A new nullable admission date is stored separately and displayed next to the walk-in date. New admissions can record this date on the lead edit form. Earlier records remain blank unless staff supply a verified date.
- Add a distinct append-only sheet column for the actual admission date, leaving all existing column positions, protections, and hidden IDs unchanged.

## Visual direction
- Preserve the existing school identity but make the header, brand/status tabs, filters, table and edit panel easier to scan. Provide roomier controls and responsive mobile presentation.
- Group admins may switch brands; RIS and RPS users see their own brand only. Status tabs and filters remain usable together.

## Verification
- Test brand sessions cannot read or mutate another brand through any leads endpoint or query trick; group admins can access both.
- Test separate date storage, validation, exports and sheet reconciliation without altering historical walk-in dates.
- Check desktop and mobile views and existing sign-in, search, editing, and save behavior.