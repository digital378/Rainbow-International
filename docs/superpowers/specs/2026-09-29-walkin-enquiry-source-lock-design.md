# Lock the original enquiry source

## Decision
The enquiry Source is selected or assigned when a RIS or RPS lead is created. It cannot be changed afterward, including when a referred lead is recorded as a walk-in. This preserves attribution: a lead sent by DM remains DM when branch staff record the visit.

## Behavior
- The existing lead editor displays the saved Source as read-only, even if that label is no longer in the active Source lookup list.
- The lead update endpoint rejects any attempted Source change and does not include Source in its mutable fields or audit changes. Sending an unchanged Source for compatibility is allowed but does not write it.
- The initial walk-in capture form can still choose Source when creating a brand-new lead. Walk-in status and date updates to an existing lead remain possible.
- The Google Sheets pull already restricts imports to its editable status/follow-up fields and does not change Source.

## Verification
Test a changed Source request is rejected without writing data; an unchanged legacy Source request is harmless; a walk-in status/date update preserves Source. Type-check and check the editor visually.