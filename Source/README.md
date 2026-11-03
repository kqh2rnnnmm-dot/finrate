# Source FinRate G1

`0.3.7-g1` · `g1-theme01`, основа main `025fa8e` после объединённого D1. Финансовая модель B1.2.1, схема 5 и защитные механизмы прежние. Новые optional UI preferences не требуют миграции базы.

Сборка: `npm ci`, `npm run build`. Проверки: `npm run check:release`; `FINRATE_TEST_WEBKIT=1` добавляет WebKit при установленном Playwright WebKit. Chromium — `FINRATE_CHROMIUM` либо штатный runtime. `node tools/compare-g1-neutral.mjs` сравнивает до/после PNG, снятые одним runtime; для иного OS/font-renderer сначала переснять baseline, а не выдавать разницу шрифтов за смену палитры.

[Аудит](../Documents/G1/AUDIT.md) · [Контраст](../Documents/G1/PALETTE.md) · [Проверки](../Documents/G1/TEST_REPORT.md) · [Снимки](../Documents/G1/SCREENSHOTS.md) · [iPhone](../Documents/G1/IPHONE_ACCEPTANCE.md). WebKit/Linux и VisualViewport-модель не равны iPhone.

G1_BASELINE_SHA256 фиксирует 52 исходных файла актуального main; 45 не изменены, три новых файла только для UI. Сборка содержит семь публичных файлов, SHA-256 перечислены в G1_PUBLIC_SHA256. Это рабочая ветка, не публикация. Не объединять main, не публиковать и не сбрасывать данные без отдельного согласия владельца. Runtime не подключает внешние сервисы; push-уведомлений нет.
