# P2 — исходный аудит и решение

Фактический main `d1a415a3558bdb348ddf29353398090c87367538`, P1.2/PR10 объединён и принят без iPhone. Ветка codex/p2-personal-debts. SHA исходных модулей — Source/P2_MAIN_BASELINE_SHA256.json. Точка кода для отката — d1a415a; прежний backup/pre-p1-2 сохраняет более старый P1.1, не пользовательские данные.

model уже содержит loan-out/in и repayment-out/in: postings меняет счета, totals не относит тело займа к обычным доходам/расходам. saveOperation умеет запись и общие проверки средств, но edit guard принимает лишь expense/income/refund/transfer. cancelOperation уже сохраняет audit/отмену и проверяет остатки. Раздел «Долги» и Home metric debts — заглушки. forecast имеет expense composition seam, Payments UI — отдельный источник обычных планов и атомарную expense-группу. service/store/crypto уже дают общий validate→seal→CAS commit. A2 strict root allowlist нужно расширить известным debts, не разрешать unknown root.

Необходимы лишь optional debts/version1, validation/reconcile hooks, narrow linked-kind edit permission и интеграция по типу источника. SCHEMA5/backup1/IDB/ключи не меняются. Личные движения доступны только по дебетовым счетам: creditLedger не покрывает все loan-классы безопасно, входящие loan-in/repayment-in на кредитку прямо запрещены CREDIT_INCOME. Исторические внешние переводы не переклассифицируем.

Forward read P1.2 без записи; первая долговая запись атомарна. Старый P1.2 не умеет учитывать/проверять debts и не является runtime откатом новой базы. Для возврата состояния нужна собственная защищённая копия до P2; автоматического сброса нет. Изолированные тесты только вымышленные.
