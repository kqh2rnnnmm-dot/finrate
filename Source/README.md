# Source FinRate C1

`0.3.5-c1-fix` · `c1-input02`, основа B1.2.1 (`b1.2.1-layout01`). Финансовый код и схема 5 прежние.

Сборка: `npm ci`, `npm run build`. Проверка: `npm run check:release` (включает модульные и браузерные проверки). Chromium задаётся через `FINRATE_CHROMIUM` либо устанавливается для Playwright. Только инструменты тестирования используют браузерный runtime; приложение не подключает внешние сервисы.

Отчёт: [C1_TEST_REPORT.md](../Documents/C1_TEST_REPORT.md). [Карта полей и компонентов](../Documents/C1_UI_INVENTORY.md). [Приёмка iPhone](../Documents/C1_IPHONE_ACCEPTANCE.md).

`dist/` и семь публичных файлов в корне репозитория соответствуют исходникам. Наличие файлов в ветке C1 не означает публикации: GitHub Pages использует main. Не сливать и не публиковать без отдельного согласия владельца.

Корректирующий аудит: [C1_INPUT_FIX](../Documents/C1_INPUT_FIX/AUDIT.md). Дополнительная проверка WebKit: `FINRATE_TEST_WEBKIT=1 npm run check:release` при установленном Playwright WebKit. Это тестовый WebKit/Linux, не iPhone.
