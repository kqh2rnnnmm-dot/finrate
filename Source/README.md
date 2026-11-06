# P4 · лимиты · p4-limits01 /0.3.14-p4

Рабочая ветка codex/p4-limits от main `eea169f4605a0afa155ab69c95a867ee39749fda`, не слито/не опубликовано. Новые limits.mjs/limits-ui.mjs; optional rules/settings внутри прежнего шифрованного документа, деньги только из прежних канонических фактов.

Из Source: `npm run build`, `npm run test:p4`, `node tests/limits-browser.mjs`, `node tests/limits-upgrade-browser.mjs`, `FINRATE_TEST_WEBKIT=1 node tools/check-release.mjs`, `npm run verify:delivery`. Параметры runtime/точные результаты в [TEST_REPORT](../Documents/P4/TEST_REPORT.md). Браузерные движки — тестовый инструмент, не подтверждение настоящего iPhone.

[Приёмка](../Documents/P4/IPHONE_ACCEPTANCE.md), [границы](../Documents/P4/OPEN_ITEMS.md). Нет merge/deploy/live reset. Аварийный login reset/Apple Account не входят в P4.

---

# P3 · цели и резервы

Рабочая сборка `p3-goals01` /`0.3.13-p3`, основа main3add5d9. Данные local-first, SCHEMA5/backup1, без внешних runtime-сервисов и новых зависимостей. Новый код: goals.mjs/goals-ui.mjs; существующие факты, кредитки, платежи, долги и криптография не переписаны.

Из каталога Source: `npm run build`, `npm run test:p3`, `node tests/goals-browser.mjs`, `node tests/goals-upgrade-browser.mjs`, полный `FINRATE_TEST_WEBKIT=1 node tools/check-release.mjs`. Браузерные runtime/бинарники выбираются существующим tools/browser-runtime.mjs и Playwright. Команды/окружение фактического прогона в [P3 TEST_REPORT](../Documents/P3/TEST_REPORT.md). `tools/p3-screenshots.mjs` снимает дополнительные реальные экраны на вымышленных данных, не публикует их как приложение.

[Приёмка](../Documents/P3/IPHONE_ACCEPTANCE.md) остаётся открытой для настоящего iPhone. Никакого merge/deploy/сброса пользовательской базы.

---

# Source FinRate G1

`0.3.7-g1` · `g1-theme01`, основа main `025fa8e` после объединённого D1. Финансовая модель B1.2.1, схема 5 и защитные механизмы прежние. Новые optional UI preferences не требуют миграции базы.

Сборка: `npm ci`, `npm run build`. Проверки: `npm run check:release`; `FINRATE_TEST_WEBKIT=1` добавляет WebKit при установленном Playwright WebKit. Chromium — `FINRATE_CHROMIUM` либо штатный runtime. `node tools/compare-g1-neutral.mjs` сравнивает до/после PNG, снятые одним runtime; для иного OS/font-renderer сначала переснять baseline, а не выдавать разницу шрифтов за смену палитры.

[Аудит](../Documents/G1/AUDIT.md) · [Контраст](../Documents/G1/PALETTE.md) · [Проверки](../Documents/G1/TEST_REPORT.md) · [Снимки](../Documents/G1/SCREENSHOTS.md) · [iPhone](../Documents/G1/IPHONE_ACCEPTANCE.md). WebKit/Linux и VisualViewport-модель не равны iPhone.

G1_BASELINE_SHA256 фиксирует 52 исходных файла актуального main; 45 не изменены, три новых файла только для UI. Сборка содержит семь публичных файлов, SHA-256 перечислены в G1_PUBLIC_SHA256. Это рабочая ветка, не публикация. Не объединять main, не публиковать и не сбрасывать данные без отдельного согласия владельца. Runtime не подключает внешние сервисы; push-уведомлений нет.
