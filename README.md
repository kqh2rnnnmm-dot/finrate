# FinRate PATCH D1

`d1-ui01` от main `46d21be` (объединённый PR №2), C1 принят с замечаниями. D1 подготовлен в отдельной ветке, без слияния и публикации.

[Аудит и изменения](Documents/D1/AUDIT.md) · [Тесты](Documents/D1/TEST_REPORT.md) · [До/после](Documents/D1/SCREENSHOTS.md) · [iPhone](Documents/D1/IPHONE_ACCEPTANCE.md).

---

# Корректирующий FinRate C1

Сборка c1-input02 от main 4d3eccf. [Аудит](Documents/C1_INPUT_FIX/AUDIT.md) · [Проверки](Documents/C1_INPUT_FIX/TEST_REPORT.md) · [До/после](Documents/C1_INPUT_FIX/SCREENSHOTS.md) · [iPhone](Documents/C1_INPUT_FIX/IPHONE_ACCEPTANCE.md).

Исправление только в отдельной ветке, без слияния и публикации. Предыдущая справка сохранена ниже.

---

# FinRate

Локальная финансовая PWA. Рабочая ветка PATCH C1; без публикации main.

Исходники: [Source](Source). Сборка: `cd Source && npm ci && npm run build`.
Проверки: `npm run check:release` (Chromium: `FINRATE_CHROMIUM=/path/to/chromium` либо установленный Playwright Chromium).

[Инвентаризация C1](Documents/C1_UI_INVENTORY.md) · [Отчёт](Documents/C1_TEST_REPORT.md) · [Приёмка iPhone](Documents/C1_IPHONE_ACCEPTANCE.md).

Публичные семь файлов в корне соответствуют Source/dist; их наличие в рабочей ветке не означает разрешения на публикацию. Не сливать в main без решения владельца.
