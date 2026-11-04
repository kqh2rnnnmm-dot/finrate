# A2 — матрица до изменения model/store · 04.11.2026

Основа `83eee2560728c8a392cb2ab7fd4e021325281d4e`, SCHEMA=5. Режимы: F — «Очистить финансовые данные», C — «Очистить данные и категории», A — «Полный сброс FinRate». Ниже перечислены все существующие поля и владельцы состояния; новые финансовые сущности не вводятся.

| Поле / запись | F | C | A |
|---|---|---|---|
| schema | 5 (поддерживаемый legacy сначала штатно мигрируется в памяти) | то же | удалить |
| datasetId, createdAt, currency | сохранить | сохранить | удалить |
| revision, updatedAt | следующий номер / время операции, без финансового события | то же | удалить |
| accounts[] со всеми name/kind/opening/archived/financeType/credit/note; credit.limit/grace/openingLots/statement и иными вложенными данными | удалить целиком | удалить | удалить |
| operations[] со всеми переводами/возвратами/корректировками/кредитными сроками, splits, fees, balanceSnapshot, notes, pending/cancelled/stages и связями | удалить целиком | удалить | удалить |
| drafts[].form, updatedAt и любая незавершённая финансовая форма | удалить | удалить | удалить |
| events[] (id/at/action/revision/details, включая суммы и названия) | удалить, не создавать событие с прежним документом | удалить | удалить |
| operationEdits[], accountEdits[], categoryEdits[] и все before/links/drafts/planningIncomeCategories/afterRevision | удалить | удалить, включая прошлые названия категорий | удалить |
| categories[].id/name/type/parentId/archived/mergedInto | сохранить текущий каталог полностью, включая объединённые/архивные узлы и структуру | удалить; без автозаполнения стартового набора | удалить |
| planning.version | штатное значение 1 | то же | удалить |
| planning.incomes[], occurrences[], links[] со всеми суммами/датами/комментариями/ссылками/историческими schedules | удалить | удалить | удалить |
| planning.mode / legacy lastMode/defaultMode | сохранить действующий режим прогноза (legacy aliases убрать) | month | удалить |
| planning.onboarding | skipped: не создавать планы/операции и не показывать прежний onboarding | skipped | удалить |
| settings.defaultOperation, theme, appearance, topPalette, bottomPalette, edgeSide, homeTileStyle | сохранить существующие | начальные expense/sand/system/sand/plum/right/numbers | удалить |
| settings.colorPalette, notificationsEnabled, financialNotifications, systemNotifications | сохранить, включая отсутствие optional ключа | neutral / true / true / true (штатные G1 defaults) | удалить |
| settings.autoLock | сохранить (защита) | **сохранить**: это параметр защиты, не оформление | удалить |
| settings.lastAccountId | null | null | удалить |
| settings.homeTiles[] | сохранить метрики/порядок/число; убрать accountId и финансовые поля; credit заменить на account без привязки (credit без существующего счёта невалиден) | штатные expense + last | удалить |
| Других persistent settings в действующем коде нет | неизвестные поля не угадывать: безопасный отказ частичного режима | то же | полное удаление объяснено явно |
| Незнакомые root/category/tile поля расширения, допускаемые общим валидатором | остановить частичный режим с RESET_UNSUPPORTED, не отбрасывать молча | то же | удалить всё по явному полному режиму |
| Отдельные документы платежей, долгов, целей, резервов, лимитов | не существуют; placeholders/чистые расчётные функции не являются сохранёнными сущностями | то же | то же |
| vault/active.id,generation | active + поколение CAS +1 | то же | удалить |
| vault/active.vault: format/datasetId/slots password+recovery/KDF/соль/обёртки DEK | сохранить идентичность/слоты и DEK; новое тело/случайный IV/revision/time | то же | удалить |
| vault/device-access: id/format/accessId/datasetId/tag/mode/length/salt/iterations/pinIV/failed/deviceKey/iv/data | сохранить байт-в-байт в транзакции; slots/tag не меняются, PIN/none работают | то же | удалить |
| safety[]: id/createdAt/reason/vault | очистить **в той же транзакции** с новым active; не добавлять скрытую страховку | то же | очистить в общей транзакции |
| Индексы Dexie v1 vault(id), safety(id,createdAt) / DB | структура остаётся, данные по строкам выше | то же | структура пустой БД остаётся; другие DB не трогать |
| Cache Storage / SW | только публичная оболочка; не база, остаётся | то же | остаётся оболочка для первого запуска; секретов/настроек в ней нет |
| localStorage/sessionStorage | приложение финансовые данные туда не пишет; не использовать для очистки/новых секретов | то же | не удалять посторонние данные |
| app.document/key/record/needsMigration/entry | заменить очищенным документом, прежним ключом, новым record; обновить entry | то же | null/reset, первый запуск |
| prepared/recovery/returnContext, UI panels/forms/quick/quickBank, lists/search/query/scroll, activity/settings drafts, credit caches, financial feedback/retry | уничтожить ссылки и DOM после успеха; другие вкладки заблокировать, stale запись невозможна CAS | то же | то же |
| html dataset.appearance/theme/palette | F из сохранённых настроек | C из начальных | убрать прежнюю тему/палитру до первого запуска |
| reset intents/proofs, File, пароль/recovery в auth form | только временные capability/DOM; привязать режим/record; отмена/фон/lock очищают | то же | то же |
| history.state / URL | только существующий back sentinel; не писать документ/секреты | то же | то же |
| Внешний файл, отдельно сохранённый recovery; браузерные пароли; другие origin/устройства | не трогать | не трогать | не трогать |

Выбор безопасности: продолжение без пригодного внешнего файла **не предусмотрено**. На каждом режиме пользователь выбирает внешний файл, открываемый главным паролем или recovery и точно соответствующий текущему контейнеру; затем отдельно подтверждает сохранение в «Файлах» и последствия выбранного режима. PIN недостаточен. Proof привязан к режиму, generation/dataset и файлу, без хранения секрета.

Критических неразрешённых значений в текущей схеме не обнаружено. Неизвестное расширение блокирует только соответствующий частичный режим, сохраняя данные. Любое последующее несовместимое поле требует отдельного решения, а не расширения allowlist по догадке.
