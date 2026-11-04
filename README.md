# FinRate PATCH A3

`a3-access01` / `0.3.9-a3`, от main `7abfe0e` после A2/PR #7. A2 принят владельцем без проверки iPhone. A3 сохраняет существующие пароль/PIN/recovery/none и исправляет жизненный цикл секретных форм/блокировки; добавлены стандартные подсказки менеджеру паролей. Отдельный Face/Touch ID не включён: NEEDS-DEVICE.

[Аудит](Documents/A3/AUDIT.md) · [Тесты](Documents/A3/TEST_REPORT.md) · [Биометрия](Documents/A3/BIOMETRY_FEASIBILITY.md) · [Снимки](Documents/A3/SCREENSHOTS.md) · [iPhone](Documents/A3/IPHONE_ACCEPTANCE.md).

Только рабочая ветка `codex/a3-security-access`: без merge/deploy/сброса данных владельца. Исторические записи ниже не заменяют текущую контрольную точку.

---

# FinRate PATCH G1

`g1-theme01` (`0.3.7-g1`) от main `025fa8e` после D1/PR №3. Два уровня внутренних сообщений и независимая глобальная Цветная палитра. G1 в отдельной ветке/PR, без слияния, публикации и сброса. D1-замечания редактора отложены.

[Аудит/до → после](Documents/G1/AUDIT.md) · [Цвета/контраст](Documents/G1/PALETTE.md) · [Тесты](Documents/G1/TEST_REPORT.md) · [Снимки](Documents/G1/SCREENSHOTS.md) · [iPhone](Documents/G1/IPHONE_ACCEPTANCE.md).

---

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
