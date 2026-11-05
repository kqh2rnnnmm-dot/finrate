# P1.2 implementation plan

Base: main4ac42ea; P1.1 merged. User approved variable full/partial on 2026-11-05; previous pending restriction is superseded. No changes to schema5, payments/version1, crypto, keys, container, service/store, financial operations or planned incomes. No agents/deployment/main mutation.

## Decisions
- Optional final:boolean on canonical expense links; final closure derives only from active facts. Old links retain P1.1 semantics; queries never migrate/write old data.
- Optional occurrence effective dueDate, skipped flag, bankResult and bounded history; original date and ID remain stable. Estimate clarification applies only to that snapshot, with explicit user action.
- Batch operates on a private document and calls existing expense engine; service performs one seal/CAS commit. Repeated IDs no-op only when the whole group already exists; mixed/invalid groups fail untouched.
- Instance commands reuse shared source form/editor, picker and sheet/guard. Calendar alone may need scoped layout rules, using existing tokens; no global CSS redesign.
- Existing operation edit/cancel remains canonical; variable status edits routed through payment helper, cancellation always derives closure from remaining active linked facts.

## Ordered slices (<=5 primary files each)
1. RED variable1700/2300, then payment-core GREEN; partial/final/edit/cancel, old compatibility. Verify targeted tests/build.
2. Shared variable expense editor full/partial default full + compact estimate clarification; browser flow. Checkpoint1–2: fixed legacy suite unchanged.
3. Atomic batch core + service quota/CAS/idempotence tests, then UI review through shared editor. Verify unit/integration/browser.
4. Instance-only/future conditions, stable moves and guarded month skip; pure calendar tests, forecast and neighboring UI. Checkpoint3–4: payment history/actual/free integrity.
5. Calendar view + manual bank outcomes and present known-account availability; scoped component, browser/geometry/status tests.
6. Full unit/integration/release Chromium+WebKit, actual IDB quota/restore/offline/A2/A3/B1; native audit, SHA/CSP/7 files. Final screenshots/before/after.
7. FAQ/checkpoint/decisions/module map/reports; feature push and PR. No merge/deploy/reset. Hardware iPhone pending.

## Risks
False remaining after variable final; final cancelled; moves duplicated in original month; paid snapshots rewritten by future edit; partial debts hidden by skip; half batches; old copies rejected; unsafe downgrade. Mitigate by linked active facts, stable original IDs, explicit snapshot/history, partial/paid guards, one transaction and old-copy fixtures, byte-protected core. Rollback code alone cannot interpret new optional fields; retain own external pre-P1.2 copy.
