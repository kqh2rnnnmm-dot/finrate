# P1.1 — Платежи: рабочая основа

Base: main597b2086b7ab3826f14777bc2addecd96dc5b7e3, A3 merged/accepted without iPhone. User authorizes implementation, branch/push/PR; no merge/deploy/reset or later packages. Detailed accepted specification: Documents/P1_1/TASK.md. Existing financial/crypto/UX contracts take precedence over stylistic invention. This plan implements that authorization; no new approval gate for routine steps.

## Architecture and dependencies

- Existing Payments tab is a placeholder. Reuse ui.sheet/perform/captureReturn, focus text/account/category pickers, operation card/edit/cancel, native dates, standard tabs/list cards, tokens.
- New scheduled-payments module: deterministic date-bound identity, optional version1 payments root (plans/versions/pauses, frozen occurrences, operation links). Keep SCHEMA5/crypto/IDB architecture. Old documents unchanged until first plan; unknown versions rejected, A2 removes new root in both partial modes. Document code rollback limitation: old UI cannot interpret new obligations, old A2 safely refuses unknown extensions; no automatic destructive downgrade.
- Every payment uses saveOperation, one request ID per form, one actual expense and one link; all changes inside existing copy/validate/seal/CAS commit. Paid/remaining derived from canonical actual operation amount/date/account/cancelled state; ordinary editing/cancellation must trigger payment validation.
- Forecast uses existing expenses seam, never duplicates B1 credit lots. Keep income implementation unchanged. Finite horizons include unpaid planned expenses; all-debts only due/overdue obligations, not infinite recurring future. Explicit overrides to forecast remain compatible.
- Edit/pause freeze due/current and previously paid instances. Future conditions do not rewrite paid history; pause/resume preserve outstanding arrears and skip pause interval. Calendar changes conflicting with prepaid future instances fail safely; complex per-instance changes remain P1.2.
- Variable over-estimate choice pending owner: safe implementation disallows excess until explicit clarification; no silent tariff changes or inferred overpayment.

## Ordered slices

1. Calendar + optional validated storage + one payment: red tests, once/weekly/monthly/yearly/clamping, stable queries, debit/credit single fact, partial and repeated request; build and B1 unit regressions.
2. Future edit/pause lifecycle + edited/cancelled facts: preserve snapshots and identity; reject overpay, no retroactive resumption; targeted unit tests.
3. Forecast/A2 integration: exact actual/free arithmetic, credit/refund/repayment without double count, all cleanup modes and encrypted restore; integration tests.
4. Working three-view UI: create/edit/pause/resume/one confirmation, actual date/account/amount, paid→existing card/edit/cancel and Back; browser smoke after each path.
5. Failure/compatibility/visual matrix: CAS/quota rollback/double tap/offline/SW, 320/375/390/402/430/landscape/desktop, large text, two themes/palettes; full release and scope guards.
6. Docs/screens/checkpoint/FAQ and commit/push/PR; no merge/publication. Final acceptance list8–12 simple iPhone steps; hardware remains unverified.

## Checkpoints and verification

After1–2: pure model tests plus existing npm test, no source financial formulas changed beyond declared composition/validation seams. After3: integration restores identical documents and preserves local entry rules/A2 policy. After4: actual browser chain plan→due→partial/full→paid/operation works. After5: release, public7 file/CSP/hash checks pass; retain failed trials honestly. After6: remote PR open, main unchanged, durable report/screens, owner-ready result.

Tasks tracked in tasks/todo.md. No delegation authorized or needed. Risks: accidental double counting, unbounded recurrence, stale/cancelled links, unknown payment extension during reset/restore, iPhone-native behavior. Mitigations: canonical operations + derived remaining, bounded date arithmetic, strict optional shape, atomic existing service/store, hardware checklist.
