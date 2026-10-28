# Lumi purchase repair

The existing `purchase_lumi_item` function declares an OUT parameter named
`balance` and uses an unqualified `balance` expression in UPDATE.
PostgreSQL's default variable-conflict policy rejects this path with SQLSTATE 42702.
The UI displayed errors below the catalog and did not validate inventory after a
successful-looking RPC result.

The additive migration `202610280002_lumi_purchase_atomic_fix.sql` qualifies the
wallet column, serializes purchases on the wallet row, binds request IDs to items
and preserves wallet/inventory/transaction atomicity. It does not change prices,
XP, unlock rules or existing balances. Apply only this new migration to an existing
installation; do not rerun the original schema migrations.

The historical 202610260001 migration also contained malformed single-dollar
function delimiters. These are corrected for fresh installations and CI.

Android now verifies ownership, updates the purchased card immediately and
presents errors/success in a visible alert. It only waits for pending educational
events when confirmed funds are insufficient, and joins an active synchronization
instead of assuming it already finished. New local credits are not deleted when
an older batch finishes. Pending events are acknowledged against the latest queue.

The workflow uses an isolated PostgreSQL 16 service, real schema migrations and
tests for the old failure, successful purchase/equip, balance, duplicate requests,
thematic restrictions, learning rewards, RLS, XP and concurrent purchases.
It has no production database credentials. Production migration application and
a real purchase on Samsung must be verified separately.
