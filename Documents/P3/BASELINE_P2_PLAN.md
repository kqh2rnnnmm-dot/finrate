# P2 personal debts — implementation plan

Base main d1a415a, P1.2 merged/accepted without device test. Only feature codex/p2-personal-debts, no agents/main/deploy/reset/cloud.

## Design
- Optional debts/version1 with items (owe/owed, participant, agreed amount/date, due, note, origin existing/now/linked, archive/history) and role source/repayment links to canonical operations. No second money ledger.
- Existing principal from item; now/linked principal/date derive active source fact. Canceled source with no repayments retains canceled history; source cancellation with active returns fails. Active repayments derive remainder. Any fact change reopening an archived debt unarchives through a narrow operations reconciliation hook.
- Use saveOperation/cancelOperation and existing seal/CAS. Only linked four kinds get edit permission; credit accounts prohibited for these personal-loan facts. No credit.mjs rewrite.
- Genuine historic loan/repayment facts may be explicitly linked after checking role/direction/account/date/unused ID; never re-post. External transfers remain unchanged/unlinked with honest limitation.
- Dated owe debt due list has distinct source/action; never expense or batch-confirmPayment. Forecast composes unpaid owe only once, unknown due in all mode only; receivables never forecast income. Potential duplicate plan/credit conflicts require explicit different-obligation confirmation, not heuristic merging.
- Reuse common sheets, text/money/account controls, operation cards, draft save/discard/continue. Tagged loan drafts extend validator narrowly and resume through debts UI; no schema/crypto changes.

## Ordered slices
1. Audit + RED numeric four cases; optional debt core/validation + creation (3 files). Tests/build checkpoint.
2. Repay/edit/cancel/archive/reconciliation + explicit legacy linking, atomic error/ID guards (3 files). Focused tests.
3. Forecast/due + A2 allowlist/counters, conflicts, all horizons/old copies/reset/access (4 files). Integration checkpoint.
4. Debt page/forms/cards/drafts + operations/global search/home tile routing (5 files), shared components only. Browser path before visual matrix.
5. Chromium/WebKit 7 sizes ×4 combinations, native IDB quota/CAS/doubletap, actual P1.2 old bundle/copy/SW upgrade, protected restore/offline, full regression and native audit. No weakening old tests.
6. Docs/checkpoint/decisions/map/FAQ, finance matrix/screens/iPhone; commits/push/PR, no merge/deploy. Hardware acceptance open; inherited A2/WebKit timeout remains diagnosed/unresolved.

Risks: wrong loan direction; duplicated cash; source edit/orphan return; archived reopened debt hidden; expense batch capture; duplicate credit/plan claims; draft data lost; root extension dropped by A2; rollback to P1.2 cannot interpret new data. Mitigate typed canonical links, full-document validation, one transaction, explicit conflict verification, tagged encrypted drafts, strict reset extension, genuine old-copy tests and pre-P2 external snapshot.
