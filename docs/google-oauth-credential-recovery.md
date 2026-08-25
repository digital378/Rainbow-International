# Google OAuth Credential Recovery

The server encrypts the stored Google refresh credential with `SESSION_SECRET`.
Keep the same `SESSION_SECRET` for the lifetime of an encrypted credential.

## If the application cannot decrypt its stored credential

1. Do not replace `SESSION_SECRET` with a new value.
2. Restore the exact prior `SESSION_SECRET` from the team’s secure secret record.
3. Restart the application and confirm the sync status reports an encrypted
   server credential.

If the prior `SESSION_SECRET` is permanently unavailable, the encrypted
credential cannot be recovered. An administrator must first remove that
unrecoverable encrypted credential from the application database, then complete
the Google authorization flow again while a new, durable `SESSION_SECRET` is
already configured.

## When the legacy refresh-token secret may be removed

Keep the legacy refresh-token secret until all of the following are true:

1. Google authorization has completed successfully.
2. The admin sync panel reports an encrypted server credential.
3. The application has been restarted successfully and synchronization is
   operational.

Only then may an administrator remove the legacy secret. Do not remove it
while the credential status is legacy or unavailable.