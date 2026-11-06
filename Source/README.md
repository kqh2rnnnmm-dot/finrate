# P5 · полный прогноз · 0.3.16-p5 /p5-forecast01

[PR №15](https://github.com/kqh2rnnnmm-dot/finrate/pull/15) **открыт, не слит**. Публикации нет; настоящий iPhone не проверен.

`codex/p5-full-forecast` от `aad52c592c34858122844b5b439727318b9e4bcc`, **для ревизии, не слито/не опубликовано; iPhone OPEN**. Pure full-forecast + existing forecast-ui sheet, узкие hooks ui/app/planning-ui/FAQ/scoped CSS. Новый формат данных/миграция/зависимости не нужны.

Из Source: `npm run build`, `npm run test:p5`, `npm run test:p5:browser`, `FINRATE_TEST_WEBKIT=1 node tools/check-release.mjs`, `node tools/verify-delivery.mjs`, `npm audit --json`. Точные browser env/версии/команды и первичные результаты — [P5/TEST_REPORT](../Documents/P5/TEST_REPORT.md). CASE — только диагностика, не полный run. Node24 использует `--test-isolation=none`.

Семь публичных файлов dist==root, standalone — прежняя build-трансформация без manifest/icon links. Source fingerprint не допускает устаревшую сборку. 62 прежних src побайтно/5 только узкие hooks,114 прежних тестов без ослабления asserts. Финансовые ядра/SCHEMA5/backup1/crypto/store/ACCESS A прежние. [Риски](../Documents/P5/OPEN_ITEMS.md) · [iPhone](../Documents/P5/IPHONE_ACCEPTANCE.md). Apple/облако не входят и отложены бессрочно.

---

# ACCESS-after-P4 A · аварийный локальный сброс

[PR №14](https://github.com/kqh2rnnnmm-dot/finrate/pull/14) **открыт, не слит**. Публикации нет; настоящий iPhone не проверен.

access-emergency-reset01 /0.3.15-access-a, codex/access-emergency-reset от main e7b3f631187b16b7b01fc49cb975968a2439f93c; не слито/не опубликовано. Новые emergency-reset.mjs /emergency-reset-ui.mjs, узкие hooks service/store/app; финансовые/криптографические owners сохранены.

Из Source: `npm run build`, `npm run test:access`, `node tests/emergency-browser.mjs`, `node tests/emergency-upgrade-browser.mjs`, `FINRATE_TEST_WEBKIT=1 node tools/check-release.mjs`, `npm run verify:delivery`, `npm audit --json`. Полные команды/результаты в [RESET_A_TEST_REPORT](../Documents/ACCESS_AFTER_P4/RESET_A_TEST_REPORT.md). CASE-выбор — только адресная диагностика, не полный run.

Нет новых runtime-сервисов/зависимостей/SCHEMA/backup форматов; build fingerprint защищает согласованность src/public. [Настоящий iPhone OPEN](../Documents/ACCESS_AFTER_P4/RESET_A_IPHONE_ACCEPTANCE.md). Apple/OAuth/облако не входят в A.

---

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
