# P3 goals and reserves — implementation plan

Base: actual main 3add5d9c1bf4fe74c46f2609884d8527682aa9e4, merged P2 accepted without physical iPhone. Direct user P3 task authorizes implementation, commits/push/PR, not merge/deploy/reset/cloud. P2 plan completed and archived under Documents/P3.

## Design and boundaries
- Optional goals/version1 inside unchanged SCHEMA5/backup1. Goal items (save/purchase), real debit-account reserves, immutable virtual allocate/release/use events; standard activity records metadata edits/closure. No second journal of actual money.
- Remaining reserve derives virtual events. New allocation checks account balance minus all its current assignments; independent spending may create a visible shortfall and is never blocked or silently reversed. Deficient account assignment remains intact; affected goal progress/coverage is explicitly uncertain until user resolves it, no invented allocation of the shortage.
- One actual expense can have one active reserve/goal association. Entire purchase belongs to that goal; amount consumed from its one reserve may be smaller and is explicit. Split-category purchases stay one whole purchase; distribution among several reserves/goals is deferred. Expense edits/cancellation/refunds change actual goal progress, never auto-restore reserve. Invalid account edit requires explicit detach of usage first; historical consumption stays recorded.
- Reuse saveFact/saveOperation, P1.2 confirmPayment and P2 repayDebt. Obligation-linked payment/debt use goes through its existing canonical editor and same atomic mutation. Debt repayment is never goal purchase progress. Existing-operation link must match the same obligation where applicable. No automatic pairing/transfer.
- Forecast composes persisted reserves into its existing reserve/cover seam with namespaced payment/debt IDs. Account conflict/unresolved/missing obligation means warning and no asserted coverage. Dynamic credit-lot linkage is deferred. available() formula unchanged.
- Close goal requires release/detach choice when allocated money remains; closure/history/current facts preserved. 100% never closes automatically. Recommendation explicitly informational, no future schedule/forecast P5.
- Shared sheets/fields/notes/guard/drafts/context/search, real Home reserve/selected-goal tiles through existing config. Minimal scoped geometry only, single-line money and compact-name ellipsis, full names in cards.

## Sequential slices / checkpoints
1. Audit/baseline; RED numeric scenarios → optional core creation/allocate/release/forecast hook (goals, model, planning; tests). Verify no monetary operations, insufficient/reused funding, range bounds.
2. Whole-fact use/edit/refund/cancel/closure/obligation coverage + strict refs and drafts; canonical core stays owned by existing modules. Targeted lifecycle tests.
3. A2 allowlist/counters + real service/IDB/crypto/restore/CAS/quota/access integration. Unknown extensions rejected, no forced old-document migration.
4. Shared goal/reserve list/cards/forms/actions and standard activity; focused browser path. Guard/drafts/read-only no writes, source-account constraint.
5. Focus/P1.2/P2 canonical use integration, Home config/tiles/search/context/navigation; neighboring views verified. No duplicated actual movements.
6. Browser matrix both engines/themes/palettes/sizes, real old P2 SW/copy/independent restore, native IDB/rollback/replay/offline. Full existing unit/release, native npm audit, protected-source/public-delivery verification.
7. FAQ/checkpoint/decisions/module map, P3 reports/finance matrix/actual screenshots/iPhone checklist; small commits/push/one PR to main. No merge/deploy. Physical iPhone acceptance OPEN for P3 and prior packets.

Each slice: RED → minimal GREEN → review/refactor → relevant tests before next. High risks: overlap between reserve/obligation/fact, partial-commit, uncertain funding, source edit, stale refs, unsafe integer sums, loss of history and A2 root drop. Mitigations: typed canonical references, one exclusive whole-fact association, retained virtual events, strict validation and existing private-copy/seal/CAS, explicit user review, actual backup/old-runtime tests. No new external dependencies or crypto/storage changes.
