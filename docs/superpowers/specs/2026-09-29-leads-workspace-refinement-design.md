# Leads workspace filters and dates

## Purpose
Give RIS and RPS staff a calmer AY 2027–28 leads workspace with easy brand and branch filters, an unambiguous walk-in date, and a distinct admission date.

## Access and flow
- Keep the existing shared Leads passcode. Anyone signed in to Leads can view both schools; no separate RIS or RPS Leads passcodes are needed.
- Staff can filter the list and export by RIS, RPS, or all brands, then by a branch within the chosen brand. Changing brands clears an incompatible branch choice.
- The initial kiosk enquiry form remains able to create a new lead, and the existing Source lock remains in force on later edits.

## Dates and data
- Existing walk-in dates remain walk-in dates. The historical sheet column named "Admission Date" currently contains walk-in dates and is not reinterpreted.
- A new nullable admission date is stored separately and displayed next to the walk-in date. New admissions can record this date on the lead edit form. Earlier records remain blank unless staff supply a verified date.
- Add a distinct append-only sheet column for the actual admission date, leaving all existing column positions, protections, and hidden IDs unchanged.

## Visual direction
- Preserve the existing school identity but make the header, brand/status tabs, filters, table and edit panel easier to scan. Provide roomier controls and responsive mobile presentation.
- All signed-in staff may switch between RIS, RPS, and all brands. Status tabs and filters remain usable together.

## Verification
- Test the existing shared sign-in and brand/branch filters across list and export; both schools remain accessible.
- Test separate date storage, validation, exports and sheet reconciliation without altering historical walk-in dates.
- Check desktop and mobile views and existing sign-in, search, editing, and save behavior.