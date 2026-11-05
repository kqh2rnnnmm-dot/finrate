# FinRate · актуальный статус после P1.2 (05.11.2026)

[PR №10](https://github.com/kqh2rnnnmm-dot/finrate/pull/10) объединён, merge `34415e018c0573391d65129da7da2ef6cbd57eb5`; сборка `p1-2-payments01` / `0.3.11-p1.2`. Резервная ветка до обновления: `backup/pre-p1-2-main-2026-11-05` (код `4ac42ea`). Переменные/фиксированные и массовые платежи, календарь, паузы/переносы/ручная проверка банковского исхода добавлены. Источники: [отчёт](Documents/P1_2/TEST_REPORT.md), [ограничения](Documents/P1_2/OPEN_ITEMS.md), [iPhone](Documents/P1_2/IPHONE_ACCEPTANCE.md). Настоящий iPhone не проверен. Отдельной публикации Pages и сброса данных не было; конфигурация автоматической публикации не проверялась. Старые статусы «PR открыт» ниже носят исторический характер.

---

# FinRate PATCH P1.2 — расширенная механика платежей

[Pull Request №10](https://github.com/kqh2rnnnmm-dot/finrate/pull/10) — открыт для приёмки.

Ветка `codex/p1-2-payments-extended` от main `4ac42ea024d5676a0e0d076b235b90b57d4f970c` (P1.1/PR9 объединён). Сборка `p1-2-payments01`, версия `0.3.11-p1.2`. P1.2 ещё не принят; merge/публикации нет.

Переменный период закрывается по явно подтверждённому реальному итогу; фиксированный cap прежний. Работают атомарная массовая оплата, условия одного/будущих периодов, переносы, защищённые месячные пропуски, календарь и ручные результаты банковского способа. Реальные операции/финансовое ядро/ключи/хранилище сохранены.

[Аудит/совместимость](Documents/P1_2/AUDIT.md) · [изменения](Documents/P1_2/CHANGELOG.md) · [проверки](Documents/P1_2/TEST_REPORT.md) · [снимки](Documents/P1_2/SCREENSHOTS.md) · [остатки](Documents/P1_2/OPEN_ITEMS.md) · [iPhone](Documents/P1_2/IPHONE_ACCEPTANCE.md).

A2/A3/P1.1/P1.2 аппаратно не подтверждены. Первый A2/WebKit PIN timeout сохранён с успешной строгой адресной перепроверкой; статус устройства остаётся открытым. Новые optional поля требуют P1.2 runtime, для возврата состояния нужна внешняя копия до обновления.

---

## История предыдущих пакетов

# FinRate · статус после слияния P1.1 (05.11.2026)

PATCH P1.1 / PR [#9](https://github.com/kqh2rnnnmm-dot/finrate/pull/9) **объединён в main**: `e561a3134e78ea69d7350857dcc4e02423f81720`. Сборка `p1-1-payments01`, версия `0.3.10-p1.1`. Резервная ветка перед слиянием: `backup/pre-p1-1-main-2026-11-05` (A3, `597b208`). Реальный iPhone не проверен. Ограничение переменного ориентира остаётся открытым; [отчёт](Documents/P1_1/TEST_REPORT.md), [остатки](Documents/P1_1/OPEN_ITEMS.md), [приёмка iPhone](Documents/P1_1/IPHONE_ACCEPTANCE.md).

Никакой отдельной публикации Pages или сброса данных при проверке/слиянии не выполнялось. Старые статусы «PR открыт» ниже относятся к историческим точкам разработки, а не текущему `main`.

---

# FinRate PATCH P1.1 — платежи

[Pull Request №9](https://github.com/kqh2rnnnmm-dot/finrate/pull/9) — открыт для приёмки.

Ветка `codex/p1-1-scheduled-payments` от main `597b208` (объединённый A3). Сборка `p1-1-payments01`, версия `0.3.10-p1.1`. P1.1 ещё не принят владельцем; merge и публикация не выполнялись.

Работают планы разовых/регулярных платежей, «К оплате», подтверждение частями через обычный расход, «Оплаченные», правка/отмена, будущие условия и бессрочная пауза с возобновлением. Прогноз учитывает непогашенный остаток; копии/очистки A2 сохраняют утверждённую защиту.

Превышение переменного ориентира ожидает решения владельца и пока отклоняется. P1.2 не входит в эту ветку. A2/A3 и P1.1 не прошли аппаратную приёмку iPhone.

[Аудит](Documents/P1_1/AUDIT.md) · [изменения](Documents/P1_1/CHANGELOG.md) · [тесты](Documents/P1_1/TEST_REPORT.md) · [снимки](Documents/P1_1/SCREENSHOTS.md) · [ограничения](Documents/P1_1/OPEN_ITEMS.md) · [iPhone](Documents/P1_1/IPHONE_ACCEPTANCE.md).

---

## История предыдущих пакетов

# FinRate PATCH A3

Pull Request: [https://github.com/kqh2rnnnmm-dot/finrate/pull/8](https://github.com/kqh2rnnnmm-dot/finrate/pull/8) — открыт для приёмки, без merge/deploy.

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
