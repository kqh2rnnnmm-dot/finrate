# FinRate · модули после P5 merge · 06.11.2026

PR [№15](https://github.com/kqh2rnnnmm-dot/finrate/pull/15) **слит в `main`**, merge `d2bf7b04bc1a70a6eb0d9867563a833cfe5759cc`, версия `0.3.16-p5 / p5-forecast01`. Базовый код до merge `aad52c592c34858122844b5b439727318b9e4bcc` сохранён в `backup/pre-p5-main-2026-11-06`. Новые `Source/src/full-forecast.mjs` (чистый read-only расчёт событий/риска без записи) и `Source/src/forecast-ui.mjs` (прошлые UI-поверхности, раскрытие, временный сценарий). Узкие hooks `ui.mjs`, `planning-ui.mjs`, `app.mjs`, scoped CSS/FAQ и тесты. `model/planning/credit/scheduled-payments/debts/goals/limits/crypto/store/device-access/emergency-reset` неизменны. Тесты по протоколу Codex: 568 unit, 75 release PASS; настоящий iPhone OPEN.

**Следующий P6.1:** развитие нынешнего «Отчёты» до фактических income/expense/net и категоризированной детализации; [проектный объём](P6_1/NEXT_SCOPE_PROPOSAL.md). Документы ниже «PR15 открыт» исторические. P6.2 поиск/экспорт отдельно, ACCESS B/Apple отложен бессрочно.

---

# P5 · карта адресных изменений · 06.11.2026

[PR №15](https://github.com/kqh2rnnnmm-dot/finrate/pull/15) **открыт, не слит**. Публикации нет; настоящий iPhone не проверен.

`0.3.16-p5 /p5-forecast01`, отдельная ветка `codex/p5-full-forecast`; **не слито/не опубликовано, iPhone OPEN**.

| Модуль | Роль |
|---|---|
| `Source/src/full-forecast.mjs` — новый | Pure selector поверх forecast/totals/P1/P2/P3/credit/incomes: устойчивые события, даты/счета, первое отрицательное состояние, неизвестность, однократное покрытие и RAM-сценарий |
| `Source/src/forecast-ui.mjs` — новый | Existing sheet/details/cards, период/итог/риски, shared money/native dates/slider, source callbacks/Back, временный sensitive scenario |
| `ui.mjs` / `planning-ui.mjs` | Только wiring Reports/источников/контекста Free/captureReturn/clear/bind; старые тела защищены baseline SHA |
| `app.mjs` | Existing Reports view → forecast page, build label; persisted pageshow очищает RAM sensitive UI |
| `style.css` / `help.mjs` | Только scoped P5 CSS и bounded FAQ; прежний контент SHA-защищён |
| `tests/full-forecast*.test.mjs`, `forecast-fixture.mjs`, `forecast*-browser.mjs` | 54 unit/integration; native browser no-write/full visual/upgrade/restore/offline доказательства |
| build/check-release/verify-delivery/package/lock | Метаданные/75 release jobs/P5 strict baseline/delivery; зависимости прежние |

Прежние planning/model/dashboard/home-config/operations/credit/scheduled-payments/debts/goals/limits, reset/service/store/crypto/device-access/access-fields/session-policy/focus/surfaces/navigation/field-editor **не изменены**. Никакого нового root/settings/черновика, allowlist/reset/schema extension не потребовалось. [Аудит](P5/AUDIT.md) · [Тесты](P5/TEST_REPORT.md).

---

# ACCESS A · карта модулей после слияния · 06.11.2026

[PR №14](https://github.com/kqh2rnnnmm-dot/finrate/pull/14) **слит в `main`**, merge `e3f4e8fe70caa9883e5336b1dadd613725493ec3`; текущая кодовая версия `0.3.15-access-a`. База до слияния `e7b3f631187b16b7b01fc49cb975968a2439f93c` сохранена в `backup/pre-access-a-main-2026-11-06`.

- Новые `Source/src/emergency-reset.mjs` (одноразовый locked-only intent/proof, ciphertext export без decrypt, CAS-подтверждение) и `Source/src/emergency-reset-ui.mjs` (переиспользование A3-входа, предупреждения, явная irreversible-confirmation последовательность).
- Адресные изменения `Source/src/service.mjs`/`store.mjs` (atomic vault+safety removal, защита гонок, post-PIN проверка), `app.mjs` (вызов с экрана входа, жизненный цикл и вкладки), scoped CSS/FAQ и сценарии тестов. Финансовые ядра, `crypto.mjs`, `device-access.mjs`, `SCHEMA=5` и формат backup не изменены.
- Следующий отдельный этап — ACCESS B **сначала архитектура, затем выбранная и отдельно согласованная реализация Apple Account**, без автоматического подключения облака. iPhone-испытания текущего этапа OPEN.

[Подробная карта](ACCESS_AFTER_P4/RESET_A_AUDIT.md) · [Проверки](ACCESS_AFTER_P4/RESET_A_TEST_REPORT.md) · [План B](ACCESS_AFTER_P4/PLAN.md). Исторический «PR открыт» ниже — прежний статус.

---

# ACCESS-after-P4 A · карта изменений · 06.11.2026

[PR №14](https://github.com/kqh2rnnnmm-dot/finrate/pull/14) **открыт, не слит**. Публикации нет; настоящий iPhone не проверен.

codex/access-emergency-reset; access-emergency-reset01 /0.3.15-access-a; base e7b3f631187b16b7b01fc49cb975968a2439f93c. Не слито/не опубликовано.

| Компонент | Адресная ответственность |
|---|---|
| emergency-reset.mjs (новый) | Locked ciphertext export/allowlist, bounded readable identity, private WeakMap proof/epoch/copy choice, exact final acknowledgment, no-decrypt guard, one-use transaction authorization |
| emergency-reset-ui.mjs (новый) |3 маршрута через прежний sheet/perform/A3 callbacks, честное предупреждение без счётчиков, download/manual claim vs skip risk, native final word/click, lifecycle cancel/no auto resume; transitions only after perform/onSuccess |
| service.mjs | Узкие exclusive wrappers/lock invalidation/clear memory; финальный post-PIN assertCurrent. Прежние A2/finance/backup/security bodies сохранены после снятия только известных hooks |
| store.mjs | Прежние таблицы/DBversion1; усиленный ciphertext CAS; optional synchronous guard и empty verification в той же прежней reset-транзакции. Нет deleteDatabase/общего Web Storage wipe |
| app.mjs | Кнопка закрытого входа, повторное использование A3 routes/access fields, shared A2 completion, scoped errors/committed terminal flow, privacy/lifecycle/broadcast+foreground fallback/read-failure diagnosis |
| help.mjs/style.css | FAQ и2 исключительно [data-emergency-reset] правила hidden/wrap. Нет изменения старых токенов/палитр/шрифтов/геометрии |
| tests/emergency-* / tools build/check-release/verify | RED/GREEN, rich P4 fixtures, реальные IDB/copy/rollback/CAS/lifecycle/offline/upgrade, оба движка; fresh source/build/public fingerprint и сохранность109 старых test-файлов |

Побайтно прежние60 из65 исходных файлов, в том числе model/operations/credit/planning/payments/debts/goals/limits, crypto/device-access/access-fields/session-policy/reset-ui/reset-policy, общий ui/surfaces/focus/field-editor/navigation/dashboard/home-config.5 адресных изменений +2 новых модуля. Формат финансового документа и контейнера копий прежний; новые временные поля не сохраняются. [Аудит](ACCESS_AFTER_P4/RESET_A_AUDIT.md), [проверки](ACCESS_AFTER_P4/RESET_A_TEST_REPORT.md).

---

# P4 · карта реализованных модулей после слияния · 06.11.2026

PR [№13](https://github.com/kqh2rnnnmm-dot/finrate/pull/13) **объединён в `main`**, merge `86395cd65616590f3377b38c9c5023b52ed76a21`; `p4-limits01 / 0.3.14-p4`. Предыдущий код сохранён в `backup/pre-p4-main-2026-11-06` (SHA `eea169f4605a0afa155ab69c95a867ee39749fda`). Новые `Source/src/limits.mjs` и `limits-ui.mjs`; точечная интеграция в `model/app/ui/dashboard/notification-events/context-menu/activity/reset-*/help` и ограниченный CSS. Фактические операции, финансовые формулы, `service/store/crypto/device-access` не переписывались.

**Следующий:** ACCESS-after-P4 — отдельная подготовка аварийного сброса + Apple Account/recovery, не часть P4. [Детали P4](P4/AUDIT.md) · [Тесты](P4/TEST_REPORT.md). Исторические пометки ниже «готово к ревизии» неактуальны.

---

# P4 — карта адресных изменений · 06.11.2026

`codex/p4-limits`, p4-limits01 /0.3.14-p4, base `eea169f4605a0afa155ab69c95a867ee39749fda`. Готово для ревизии, не слито/не опубликовано.

| Модуль | Ответственность P4 |
|---|---|
| limits.mjs (новый) | Optional version1, strict validation/CRUD/idempotence, месячные canonical allocations/refund, parent/child, точные суммы/состояния, delta transitions, draft validation |
| limits-ui.mjs (новый) | Существующий маршрут/формы/карточки/архив/месяцы, общие редакторы/категории/guard/drafts/Back, настройки предупреждений, search/context/history |
| model.mjs | Только вызовы optional limits/draft validators; остальные формулы/валидация побайтно прежние |
| app/ui/context-menu | Подключение маршрута/плюса/draft/search/общего контекста, foreground committed feedback, явное подавление исторических restore-предупреждений |
| notification-events.mjs | Новые delta notices через существующие разрешения/очередь; прежние финансовые receipts побайтно прежние |
| dashboard.mjs | Существующий metric limits — counts/priority без суммы; Settings→Limits; прежние Home-стили/1–6 сохранены |
| activity.mjs/activity-ui.mjs | Общий зашифрованный аудит правил/состояний/настроек, ссылки на те же карточки, точные signed cents; не новый финансовый журнал |
| reset-policy/reset-ui | Только известные limits/settings allowlist/summary и прежние3 режима |
| help.mjs/style.css | FAQ и исключительно [data-limits-ui] геометрия; прежние CSS/палитры byte-identical |
| tests/limits*.mjs, tools/check-release, verify-delivery | RED/GREEN, реальный IDB/CAS/quota/backup/upgrade/offline, оба движка; SHA allowlist/старые assertions/public7 |

**Побайтно нетронуты**: planning/home-config/focus/surfaces/field-editor/navigation, operations/block02/credit/scheduled-payments/debts/goals, service/store/crypto/device-access и остальные51 из63 исходных файлов (12 разрешённых изменений,2 новых модуля). Модель и прежние receipts дополнительно сравниваются после удаления только P4-hooks. Из101 прежних test-файлов в5 изменена только ожидаемая текущая build-метка; assertions не ослаблены. ACCESS contract также SHA-защищён. [Аудит](P4/AUDIT.md), [проверки](P4/TEST_REPORT.md).

---

# P3 · карта модулей после слияния · 05.11.2026

PR №12 объединён в `main` (`a35a3e71c156713581dc7dfac9516ae27b1cb237`), `p3-goals01` / `0.3.13-p3`. Новые `Source/src/goals.mjs` и `goals-ui.mjs` отвечают за цели, резервы и связи; точечные hooks `model/planning/planning-ui`, `ui/dashboard/home-config`, `focus/payments-ui/debts-ui`, `reset-*`, `activity-*`, FAQ и scoped CSS выполняют интеграцию. Прежние operations/credit/scheduled-payments/debts/service/store/crypto/device-access/navigation/surfaces/field-editor не переписывались. Дальнейшая работа — отдельный PATCH по утверждённой дорожной карте; он не начат.

[Аудит P3](P3/AUDIT.md) · [Изменения](P3/CHANGELOG.md) · [Ограничения](P3/OPEN_ITEMS.md).

---

# P3 · карта модулей · 05.11.2026

В рабочей ветке codex/p3-goals-reserves от main3add5d9. Не объединено/не опубликовано. p3-goals01 /0.3.13-p3.

| Модуль | Адресная ответственность P3 |
|---|---|
| goals.mjs | Optional goals/version1, выделения/освобождения/использования, строгие ссылки/лимиты, прогресс/refund/закрытие, покрытие обязательств, account-shortfall и рекомендации |
| goals-ui.mjs | Два представления существующей вкладки, карточки/формы/архив, явные действия/выбор закрытия, общий поиск/context/draft/notes |
| model.mjs | Только validation hooks P3 root/drafts с проверкой ссылок/optional tilegoalId; postings/totals прежние |
| planning.mjs | Источник reserveForecast в прежнем reserves/cover seam и запрет повторного именованного ID; B1-формулы неизменны |
| focus.mjs /payments-ui.mjs /debts-ui.mjs | Контекст резерва вокруг существующего saveFact/confirmPayment/repayDebt в одной атомарной мутации, источник фиксирован |
| ui.mjs /context-menu.mjs | Existing navigation/search/history/drafts/Back integration, без новой overlay-системы |
| dashboard.mjs /home-config.mjs | Настоящие показатели резервов/выбранной цели и optional goalId в прежнем редакторе блока |
| activity.mjs /activity-ui.mjs | Общая зашифрованная история метаданных и производного прогресса, суммы/счёт/связи/закрытие |
| reset-policy.mjs /reset-ui.mjs | Allowlist только goals/goalId, точные P3-счётчики и предупреждения; три прежних режима |
| app.mjs /help.mjs /planning-ui.mjs | Маршрут/сообщения/FAQ/пояснение покрытия, точечное снятие disabled после backup с сохранённым dock |
| style.css | Только [data-goals-ui], прежние токены/темы/палитры до P3 byte-identical |
| tests/goals* /tools | P3 unit/integration/browser/upgrade/rollback; полный release и SHA-проверка сохранности старых исходников/тестовых assertions |

operations/block02/credit/scheduled-payments/debts/service/store/crypto/device-access/navigation/surfaces/field-editor не изменены относительно принятого P2. SCHEMA5, backup1, DEK/PIN прежние. [Аудит](P3/AUDIT.md), [финансовая матрица](P3/FINANCIAL_MATRIX.md), [ограничения](P3/OPEN_ITEMS.md). Историческое «P3 не реализован» ниже заменено этой записью.

---

# P2 · состояние модулей после слияния · 05.11.2026

PR №11 объединён в `main` (`4bcb3154fc92973fa7cfa45161b134beb3178e9f`), версия `0.3.12-p2`. Новые `debts.mjs` и `debts-ui.mjs` реализуют учёт долгов; узкие hooks добавлены в `model.mjs`, `operations.mjs`, `planning.mjs`, `payments-ui.mjs`, `dashboard.mjs`, `ui.mjs`, `focus.mjs`, `reset-*`, поиск/историю/FAQ и связанный scoped CSS. Прежние `scheduled-payments.mjs`, crypto/store/service/device-access и формат копии не переписывались. Подробности: [P2 AUDIT](P2/AUDIT.md), [P2 CHANGELOG](P2/CHANGELOG.md). Следующий P3 пока не реализован.

---

# P2 · карта реализованных модулей · 05.11.2026

Ветка `codex/p2-personal-debts`, `p2-debts01` / `0.3.12-p2`, исходный main d1a415a. Не объединено и не опубликовано; исторические статусы «P2 не начат» ниже относятся к прежней контрольной точке.

| Компонент | Адресное изменение |
|---|---|
| debts.mjs (новый) | Optional debts/version1, строгая валидация, вычисляемые остатки, два способа создания, canonical returns/edit/link, archive/reopen, due/forecast source, проверка совпадений и stale metadata |
| debts-ui.mjs (новый) | Два направления, список/архив, карточка и факты, shared forms/pickers/notes, черновики, контекст, история, явное подтверждение различающихся обязательств |
| model.mjs | Только validator нового root и помеченных долговых черновиков; SCHEMA/postings/totals прежние |
| operations.mjs | Только разрешение edit для связанных loan/repayment и reconciliation архива; прежняя запись/отмена/таймлайн по SHA |
| planning.mjs | Один дополнительный источник непогашенных owe по горизонту; прежние формулы/доходы неизменны |
| payments-ui.mjs | Отдельные строки «Возврат долга» и вызов карточки; исключение из expense batch; проверка потенциального дублирования при создании/правке плана |
| focus.mjs | Опциональный debitOnly существующего picker/inline creation; общие редакторы не заменены |
| ui/app/context-menu | Реальный маршрут дополнительного меню, поиск/переходы/операции/контекст, сообщения ошибок/build |
| dashboard/planning-ui | Настоящий показатель долгов; пояснение горизонтов/неизвестного срока и предупреждения совпадений |
| activity/activity-ui | Читаемая история долгов/связанных фактов, прежняя карточка объекта |
| reset-policy/reset-ui | Только известный debts в strict allowlist/summary; прежние три режима и защита |
| style.css | Только два правила [data-debt-list] для min-content/peer spacing; все старые токены/правила byte-identical |
| help/FAQ/tests/tools | Действующие ответы, RED/GREEN, native IDB/crypto/CAS/reset/restore, P1.2 update, visual matrix, baseline guards |

`scheduled-payments`, `recurring-income`, `credit`, `block02`, `service/store/crypto/device-access`, `navigation/surfaces/field-editor`, `feedback/notification-*` не менялись. Полная карта доказательств: [P2/TEST_REPORT](P2/TEST_REPORT.md), [P2/AUDIT](P2/AUDIT.md).

---

# P1.2 · статус карты модулей после слияния · 05.11.2026

PR №10 объединён в `main` (`34415e018c0573391d65129da7da2ef6cbd57eb5`), версия `0.3.11-p1.2`. Описанные ниже изменения P1.2 уже реализованы, не являются предложением. Финансовое ядро model/operations/planning/credit, crypto/store/service, A2 reset, защитные слоты и backup/1 по SHA не изменены. Следующий P2 «Долги» не начат.

---

# P1.2 · карта изменений ·05.11.2026

| Компонент | Адресное изменение |
|---|---|
| scheduled-payments.mjs | Связанный final/partial, explicit estimate, legacy inference при правке, batch, stable move/skip/future/history, bank metadata/availability; existing expense engine |
| focus.mjs | Дополнительный выбор для связанного variable fact, компактное уточнение оценки, review callback/DTO для групп; стандартные поля/notes/guard сохранены |
| payments-ui.mjs | Selection/review, прежний source form для scoped conditions, команды/история, календарь и банк; прежние три названия/пять вкладок |
| app.mjs | Только новые payment messages и build ID |
| style.css | Только scoped calendar geometry; старые правила/палитры byte-identical |
| help.mjs | FAQ по утверждённому поведению |
| tests/tools | RED/GREEN, native IDB/CAS/quota, P1.1 real SW upgrade/copy, обе темы/палитры/движки и общий release/SHA |

`model`, `operations`, `planning`, `planning-ui`, `recurring-income`, `credit/block02`, `service/store/crypto/device-access`, `reset-*`, `navigation/surfaces/field-editor`, `feedback-*` не изменены относительно main4ac42ea. Нет новых зависимостей или data-format version. [Совместимость](P1_2/AUDIT.md).

---

## История предыдущих пакетов

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
