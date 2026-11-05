# P1.1 · изменения модулей · 05.11.2026

| Модуль | Изменение |
|---|---|
| scheduled-payments.mjs (новый) | Календарь, версии/паузы, снимки, ссылки, остаток, атомарная оплата через saveOperation |
| payments-ui.mjs (новый) | Три представления, создание/правка/пауза, штатный редактор факта |
| model.mjs | Только optional payments validation; остальные байты защищены SHA |
| planning.mjs | Только подключение unpaid expenses в существующий прогноз и имя строки; остальная B1-логика защищена SHA |
| reset-policy/reset-ui | Allowlist новой сущности и счётчики предупреждения A2; прежние сбросы |
| focus/ui/app/context-menu/style | Подключение P1.1 к существующим редакторам/навигации/поиску/контексту; без новых CSS-правил |
| planning-ui/help | Правдивое описание состава прогноза и FAQ |
| tests, tools | Календарь/оплаты/rollback/CAS/backup/reset/access, браузерная матрица и release scope guard |

`operations`, `credit`, `block02`, `recurring-income`, `crypto`, `store`, `service`, `device-access`, A3/session/surfaces/navigation — byte-identical к main597b208. Архитектура шифрования, IDB и формат копий прежние.

---

## История предыдущих пакетов

# A3 · изменения модулей · 04.11.2026

| Модуль | Адресное изменение |
|---|---|
| access-fields.mjs (новый общий) | Существующая геометрия security-input/eye, current/new-password, маскирование/очистка, recovery-mode switch, aria-pressed; без хранилища |
| security-ui.mjs | Native hints, отмена временной авторизации, sensitive-поверхности, честные границы PIN/DEK |
| app.mjs | Синхронное privacy-скрытие, завершение busy auth с блокировкой, очистка PIN после ошибки, invalidation вкладок после security commit |
| ui.mjs | Явный sensitive-признак и очистка только такого процесса с дочерними поверхностями; обычные формы/guard прежние |
| style.css | Только правило скрытия всех поверхностей в фоне; дизайн/токены/палитры прежние |
| service.mjs | До записи запрещён одинаковый текущий новый пароль, включая recovery; штатное открытие существующего slot |
| help.mjs | FAQ по фактическому входу, фону, AutoFill и отсутствующей биометрии |
| build/check-release/verify-delivery | a3-access01, дополнительные проверки и byte guards от main7abfe0e, семь публичных файлов |

Crypto/device-access/store/session-policy/reset-ui/reset-policy/model/operations/credit/planning/SW не переписаны. [Аудит](A3/AUDIT.md) · [тесты](A3/TEST_REPORT.md).

---

# A2 · изменения модулей · 04.11.2026

| Компонент | Изменение / необходимость |
|---|---|
| reset-policy.mjs (новый) | Чистая политика трёх режимов, все поля/настройки, обзор состава и безопасный отказ неизвестных расширений |
| crypto.mjs | Линейный base64 и object/null guard; AES/KDF/slots/AAD не менялись |
| service.mjs | Проверенный текущий экспорт; intent/proof с привязкой к режиму/файлу/record; частичная/полная очистка |
| store.mjs | Атомарный active+safety cleanup при сохранении device-access; классификация подтверждённого quota-abort |
| reset-ui.mjs | Штатные sheet-поверхности: выбор, обзор/внешний файл/главный секрет, отдельное финальное подтверждение |
| app.mjs | Общий экспорт до restore, выбранный способ проверки, invalidation вкладок и безопасный порядок render после reset |
| ui.mjs, management.mjs, dashboard.mjs, surfaces.mjs | Сброс stale форм/поисков/кредитных кэшей/pointer-ссылки; deferRender только для финального cleanup |
| field-editor.mjs | Исключение новых auth/confirmation форм из вложенного редактора; текстовый редактор сохранён |
| feedback.mjs, style.css | Системный якорь, резервирование места, непрерывный gesture/cancel/queue, нативный скролл длинной ошибки |
| help.mjs | Помощь по трём режимам, пригодности файла и границам смены пароля |
| build/check-release/verify-delivery | Готовые 7 файлов, Chromium/WebKit A2 jobs, точные byte guards финансов/ключевой архитектуры и SHA |

model/operations/planning/credit/block02/recurring, device-access/security/session-policy/SW и цвета G1 не переписывались. [Подробности](A2/REPORT.md) · [Данные](A2/DATA_MATRIX.md) · [Тесты](A2/TEST_REPORT.md).

---

# G1 · изменения модулей · 03.11.2026

- `feedback.mjs`, `feedback-state.mjs`: два уровня, required/FIFO/filter, таймеры/жесты/снимок/lifecycle, без повторных мутаций.
- Новый `notification-events.mjs`: read-only классификация подтверждённых событий и snapshot реальных записей, без финансовых вычислений.
- Новый `ui-settings.mjs`: defaults необязательных параметров, gate ordinary/required и boolean checkbox values; ни базы, ни криптографии.
- `app.mjs`: проводка completion → notification, настройки фильтра, genuine-details delegate; прежние обработчики проверяются нормализованным SHA.
- `ui.mjs`: общая compact-сurface финансовых подробностей, настройки/dirty normalization, проверка актуальности retry. Стек и навигация прежние.
- `dashboard.mjs`, новый `color-theme.css`, `style.css`: отдельные selectors/checkboxes/swatches, palette+appearance, scoped цвета, общие стили уведомлений. D1 layout/editor исходники прежние.
- `help.mjs`: FAQ по фактическому G1. `G1_BASELINE_SHA256.json`, `tools/verify-delivery.mjs`, `tests/g1-*.mjs`: защита и адресные регрессии; `tools/compare-g1-neutral.mjs`: PNG-сравнение одного runtime.

[Карта вызовов](G1/NOTIFICATION_MAP.md) · [Палитра](G1/PALETTE.md). Не менялись model/operations/credit/planning/service/crypto/store/security-ui/device-access/reset-ui/session-policy/sw. Новых runtime-зависимостей нет.

---

# D1 · актуальные изменения модулей · 03.11.2026

- `field-editor.mjs`, `icons.mjs`, `style.css`: рамка общей note-field, разворачивание, счётчик/фокус; один scroller.
- `ui.mjs`, `edge-launcher.mjs/css`: общий chooser и morph из верхнего «+» и side; конечная безопасная симметричная геометрия.
- `dashboard.mjs`, `home-layout.mjs`, `home-config.mjs`, `style.css`: остаточная высота Главной, 1–6/три вида, плотности и прямой configure.
- `management.mjs`, `ui.mjs`, `style.css`: общие object-actions и разделение групп; `focus.mjs`: только подстановка остатка кредита.
- `help.mjs`: FAQ; `app.mjs`: только ID `d1-ui01`.
- `D1_BASELINE_SHA256.json`, `tools/verify-delivery.mjs`: защита 39 остальных файлов src/ и metadata-only app. `tests/d1-*.mjs`: новые адресные browser-матрицы; существующие тесты адаптированы только к утверждённым изменениям UI. Финансовые unit assertions не ослаблялись.

[Полная инвентаризация/аудит](D1/AUDIT.md). Стек surfaces/chrome/navigation, финансовые и защитные исходники прежние.

---

# C1 · дополнение карты модулей

- Source/src/field-editor.mjs: единый view/preview/open/enhance; сохранение пробелов и лимитов, textarea родителя остаётся источником формы.
- Source/src/focus.mjs, ui.mjs, management.mjs: существующие операции/счета используют общий механизм заметок.
- Source/src/activity-ui.mjs: полный просмотр исторических note без редактирования снимка.
- Source/src/planning-ui.mjs: доступ к существующим comment закрытых поступлений, без изменения финансовых полей.
- Source/src/surfaces.mjs: завершение числового поля при закрытии цифровой клавиатуры; общий стек сохранён.
- Source/src/navigation.mjs, style.css: границы жестов списков, выделение пользовательского текста, общие gap tokens.
- Source/src/help.mjs: FAQ по фактическому C1. app.mjs: только build ID.
- Source/tests/c1-browser.mjs, C1_BASELINE_SHA256.json, tools/verify-delivery.mjs: адресные проверки и побайтная защита остальных исходников.

Полная таблица поверхностей и полей: C1_UI_INVENTORY.md.

---

# Актуальный процесс разработки через GitHub · 02.11.2026

- Codex использует полный исходник B1.2.1 (`Source/src`, `Source/tests`, `Source/tools`, `Source/package.json` и `package-lock.json`) как кодовую базу, а GitHub `kqh2rnnnmm-dot/finrate` — как целевой репозиторий с отдельной веткой/PR.
- До кода сравнить опубликованные семь файлов в корне GitHub с `Source/dist/`, изучить наличие исходников в репозитории. Если в GitHub только собранные статические файлы, внести поддерживаемый исходный код в ветку C1 рядом с публичными файлами **без удаления работающей публикации**. Конкретные пути и CI выбирать, сверяясь с реальным деревом GitHub и существующей конфигурацией.
- Не менять `main` до принятия PR владельцем; если GitHub Pages автоматически публикуется из `main`, прямой push туда означал бы публикацию, которая отдельно не разрешена.
- Исторические инструкции «передавать ZIP владельцу для ручной загрузки в GitHub» не действуют для рабочего процесса Codex, у которого есть прямой доступ. Требование обновлять контрольную точку, FAQ, реестр решений, проверять iPhone и сохранять тестовый отчёт остаётся в силе.

---

## Прежняя карта модулей (исторические указания на ZIP и ручную публикацию неактуальны)

# FinRate · PATCH B1 · 23.10.2026

Подготовленная редакция для будущего обновления источников. Действующие проектные файлы в ChatGPT не заменены. Последнее явное уточнение владельца исключает обратную связь из B1; оно выше приложенного задания от 23.10.2026.

## Дополнение B1

planning.mjs — горизонты и прогноз, правила/экземпляры/связи доходов. planning-ui.mjs — экраны финансового планирования на прежних sheet/guard/field editor.

Изменены model, operations, credit, block02, dashboard, focus, management, ui, app, service (только настройка новой базы/сводка restore), activity, activity-ui, help. Общие стили, криптография, хранилище, PIN/доступ, политика сессии, боковая кнопка и система уведомлений не переписаны. Точный перечень с контрольными суммами — CHANGE_SCOPE.json.

---

## Архив предыдущих редакций

# FinRate · карта кода и порядок изменений

Основа R30: локальная PWA. Исходный код разделён по ответственности; выпускная сборка по-прежнему объединяет JS и CSS в `dist/index.html`. `GitHub/` содержит семь готовых файлов. Публикация выполняется владельцем.

| Область | Исходные файлы | Что проверять при изменении |
| --- | --- | --- |
| Финансовая модель | `model.mjs`, `operations.mjs`, `credit.mjs`, `block02.mjs`, `split-state.mjs` | Суммы, остатки, история, миграция, возвраты, ограничения кредита |
| Защищённые данные | `crypto.mjs`, `store.mjs`, `service.mjs`, `device-access.mjs`, `session-policy.mjs` | Сохранение, вход, шифрование, резерв и восстановление, блокировка |
| Оболочка и окна | `app.mjs`, `ui.mjs`, `surfaces.mjs`, `chrome.mjs`, `context-menu.mjs`, `leave-guard.mjs` | Навигация, модальные поверхности, несохранённый ввод, возвращение из фона |
| Боковое создание операции | `edge-launcher.mjs`, `edge-launcher.css`; вызов в `ui.mjs` | Правый и левый край, жесты, Back, возврат ручки, выбор формы |
| Стили и экранные разделы | `style.css`, `dashboard.mjs`, `focus.mjs`, `management.mjs`, `list-ui.mjs` и соседние UI-модули | Цвета, размеры, ввод, списки, оба режима и разные ширины |
| Сборка и офлайн | `tools/build.mjs`, `sw.mjs`, `tools/verify-delivery.mjs` | CSP, кеш, обновление установленной PWA, состав ZIP |

Процесс: сравнить с последней принятой полной базой; читать и менять только нужную область и непосредственные связи; в ходе работы запускать связанные проверки; перед выдачей ZIP собрать весь проект и пройти `tools/check-release.mjs`. Контрольные суммы R29 фиксируют неизменность файлов вне разрешённого объёма. Результаты браузера не подменяют приёмку на iPhone. Публикация — отдельное действие владельца.

Модули отвечают за порядок чтения и редактирования. Наличие полного `GitHub/` в каждом выпуске не означает переписывание исходников заново. Отдельные загружаемые JS-файлы и изменение ручной процедуры публикации сейчас не требуются.

R30: `credit-ui.mjs` и `focus.mjs` управляют правилами и распределением при создании; `credit.mjs`, `model.mjs`, `operations.mjs`, `block02.mjs` проверяют и рассчитывают сроки; `management.mjs` показывает старый долг и раскрывает категории; `help.mjs` содержит инструкцию; `style.css` применяет общие расстояния. `tools/verify-delivery.mjs` сверяет 37 неизменных модулей с R29 и защищённое ядро с отдельным baseline.
