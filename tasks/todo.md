# P1.1 task list

- [x] 1. Validated calendar and single payment (deps:none; 3 files): deterministic dates; one operation/link and partial remainder; verify red→green scheduled payment unit tests + build.
- [x] 2. Edit/pause lifecycle (deps:1; 2 files): preserve due/paid history, skip pauses, operation edit/cancel validation; targeted tests.
- [x] Checkpoint1–2: core tests/build green.
- [ ] 3. Forecast and A2 (deps:1–2; 4 files): no double count, clear new collections safely, exact encrypted roundtrip; integration/B1/A2 tests.
- [ ] 4. Three-view UI (deps:1–3; 4 files): shared forms/pickers, true payment confirmation and canonical paid details; browser smoke/Back/guards.
- [ ] Checkpoint3–4: end-to-end chain and failure rollback verified.
- [ ] 5. Release/browser matrix (deps:4; test/tools): quotas/CAS/duplicates/offline/restore, size/theme/palette, release and protected SHA; machine evidence.
- [ ] 6. Docs and delivery (deps:5): audit/changelog/tests/open items/iPhone8–12 steps/screens, checkpoint/FAQ/decisions; push branch and open PR; no merge/deploy.

Owner question: variable over-estimate treatment pending. No dependent excess-payment flow before answer. A2/A3 hardware verification remains deferred.
