# Source FinRate D1

`0.3.6-d1` · `d1-ui01`, основа main `46d21be` после C1/c1-input02/PR №2. Финансовая модель B1.2.1, схема 5 и защитные механизмы прежние.

Сборка: `npm ci`, `npm run build`. Проверки: `npm run check:release`; дополнительно `FINRATE_TEST_WEBKIT=1` включает два набора WebKit при установленном Playwright WebKit. Chromium задаётся `FINRATE_CHROMIUM` либо штатным runtime. Браузеры и пакеты сборки — инструменты разработки; приложение не подключает внешние сервисы.

[Аудит](../Documents/D1/AUDIT.md) · [Проверки](../Documents/D1/TEST_REPORT.md) · [Снимки](../Documents/D1/SCREENSHOTS.md) · [Приёмка iPhone](../Documents/D1/IPHONE_ACCEPTANCE.md). WebKit/Linux не является настоящим iPhone.

Семь файлов dist совпадают с публичными файлами корня **рабочей ветки**. Это не публикация. Не объединять main, не публиковать и не сбрасывать базу без отдельного согласия владельца. `D1_BASELINE_SHA256.json` фиксирует все 52 исходника исходного main; проверка защищает финансовые/защитные модули от скрытых изменений.
