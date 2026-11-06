# P4 — отчёт проверки

[PR №13](https://github.com/kqh2rnnnmm-dot/finrate/pull/13) открыт для ревизии; не объединён и не опубликован. Исходный main не менялся.
Статус: рабочая ветка `codex/p4-limits`, готово для ревизии, не слито/не опубликовано. База/main **eea169f4605a0afa155ab69c95a867ee39749fda**, повторный fetch не показал чужих изменений. Приложение **3f5cd7f465470fbbc3f4af0603a18774f64b0a64**, финальный тестовый комплект **fa79f19d4055cc670181ac1f1eb41025852213f5**. Сборка **p4-limits01 /0.3.14-p4**. Последующие документальные коммиты не меняют сборку; итоговый head — в PR/передаче владельцу.

**Unit/integration: 491 PASS,0 FAIL,0 SKIP**, включая36 новых причинных P4-тестов и455 прежних. **Окончательный полный release-run:67/67 PASS,0 FAIL,0 SKIP**. [Unit TAP](../../Source/evidence/p4/unit-final.tap), [release JSON](../../Source/evidence/p4/release-run.json), [первичный console](../../Source/evidence/p4/final-release-console.log), [verify-delivery](../../Source/evidence/p4/final-delivery-verification.json), [архив текущих job-логов/metadata](../../Source/evidence/p4/archive-manifest.json). Это один завершённый финальный прогон для неизменённого конечного приложения; ранний частичный запуск отдельно и в67 не включён.

Public HTML SHA-256: **f6433dfbc732c6900cd499f8d6851401fcddc7baea8f104310f02d9afb0df4d1**. Продуктовый код после полного прогона не меняется. Тестовые браузеры: Chromium153.0.8010.0, WebKit26.5, Node24.19.0, Linux. Это не настоящий iPhone.

| Область | Доказательство |
|---|---|
| Правила/денежные инварианты |36 P4 unit/integration: родитель/3 ребёнка/100 split, расходы/external/категоризированная и некатегоризированная fee/refund, дата/split/edit/cancel, P1/P2/P3/credit исключения, safe-integer/BigInt, архив/merge conflict/explicit reassign, replay/STale/no-op |
| Уведомления |79/80/81/100/101, early settings/permission/no repeat/read/reload/restore/no old-month; quota не создаёт сообщение или факт, повторное нажатие — один commit |
| Нативный браузер P4 |По18 групп Chromium/WebKit: реальные формы, IDB, quota/rollback/CAS второго экземпляра, double tap, encrypted draft, поиск/история/контекст/клавиатура/Back/scroll, соседние P1/P2/P3/credit, Home, independent backup restore/access/reset/offline |
| Предельная сумма |По1 дополнительной группе в обоих движках: защищённая fixture с MAX_SAFE_INTEGER, карточка/история сохраняют91 копейку, readonly не меняет vault, UI-правка только месяца сохраняет точную сумму за одно поколение. Новая арифметика для общей истории не потребовалась |
| Реальное обновление/старые копии |По4 группы обоих движков: реальные7 файлов неизменённого P3/main, выгрузка копии именно P3, явный SW update, ciphertext/generation без autowrite, первая P4-запись одним поколением, independent P4 restore исходной копии полностью равен документу |
| Откат |Настоящий P3-runtime отдельно восстанавливает P4-файл: optional rules сохраняются, но UI/предупреждений нет. Прежние деньги P4 не меняет; это не полная feature/reset compatibility. Своя проверенная внешняя копия до первого изменения P4 необходима для полного возврата |
| Геометрия |320/375/390/402/430,844×390 landscape,1280×900 ПК,2 темы×2 палитры; список/карточки/формы/Home,12-значные суммы/длинные названия, крупный root-font320 в списке. Home:3 стиля×1–6 блоков без обычного вертикального скролла; внешнего горизонтального overflow нет |
| Защита/восстановление |Реальный экспорт P4 и независимый UI restore равны всему документу, не только rules. Реальные3 отдельных native IDB/A2-reset со счётчиками/проверенной внешней копией, PIN/password/recovery и независимым restore; основная тестовая UI-база при reset не очищается. Signed-but-invalid AES-GCM payload с неправильной категорией отклонён до замены активной базы |
| Регрессии |67/67 release-заданий PASS: полный штатный pack B1/P1.1/P1.2/P2/P3/A1–A3/C1/D1/G1, Chromium и предусмотренные старым runner WebKit-задачи, performance и verify; новые P4-driver не заменяют старые проверки |
| Сохранность |51/63 исходных файлов побайтно неизменны,12 адресных интеграций/2 новых модуля. model/прежние receipts дополнительно byte-identical после снятия только optional P4-hooks.101 старый test-файл сравнен по SHA, в5 только ожидаемая current-build метка. ACCESS future contract SHA неизменён |
| Поставка |7 public-files, root==dist, CSP SHA и connect self, локальные ассеты/SW/manifest, без тестовых фикстур/документов/ключей/реальных данных в bundle. src/sw/crypto/service/store/access неизменны; generated SW отличается только новым precache содержимым |
| npm audit |Исходный JSON:3 low +4 moderate, high0/critical0, exit1 из-за известных dev/build advisories; npm audit fix --force не запускался. Версии зависимостей прежние |

## Точные команды

Из `Source`:

```sh
node --test --test-isolation=none --test-reporter=tap tests/limits*.test.mjs
node --test --test-isolation=none --test-reporter=tap tests/limits*.test.mjs tests/reset*.test.mjs
FINRATE_CHROMIUM=/tmp/chromium node tests/limits-browser.mjs
FINRATE_P4_WEBKIT=1 PLAYWRIGHT_BROWSERS_PATH=/tmp/finrate-playwright PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 node tests/limits-browser.mjs
FINRATE_CHROMIUM=/tmp/chromium node tests/limits-upgrade-browser.mjs
FINRATE_P4_WEBKIT=1 PLAYWRIGHT_BROWSERS_PATH=/tmp/finrate-playwright PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 node tests/limits-upgrade-browser.mjs
FINRATE_CHROMIUM=/tmp/chromium node tests/limits-precision-browser.mjs
FINRATE_P4_WEBKIT=1 PLAYWRIGHT_BROWSERS_PATH=/tmp/finrate-playwright PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 node tests/limits-precision-browser.mjs
FINRATE_TEST_WEBKIT=1 FINRATE_CHROMIUM=/tmp/chromium PLAYWRIGHT_BROWSERS_PATH=/tmp/finrate-playwright PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 node tools/check-release.mjs
node tools/verify-delivery.mjs
npm audit --json
```

`--test-isolation=none` — ограничение fork в sandbox; assertions не ослаблены. Chromium из штатного dev runtime @sparticuz, WebKit установлен Playwright. В среде не было GTK/WebKit-библиотек; системный install-deps не получил root и ничего не установил. Недостающие Debian-пакеты загружены/распакованы исключительно в /tmp и доступны только тестовому браузеру. В приложении новых зависимостей и внешних сервисов нет. Локальный HTTP/браузер запускались с разрешением исполнения среды.

## RED → GREEN, ранние ошибки и повторы

- RED core12/12 отсутствовавших возможностей на scaffold, notices4/4 на отсутствующем adapter, history2/2, storage3 FAIL/5 PASS (недостающие A2 allowlist/summary), unfinished intent1 FAIL/7 PASS. Первичные TAP сохранены, затем GREEN. Дополнительные boundary-проверки добавлялись по мере адресной реализации; не выдаются все36 за один исходный RED-набор.
- Первый core GREEN:11 PASS/1 FAIL. Тестовая fixture ошибочно ожидала категорию у современной saveFact-комиссии, где она по B1 не сохраняется. Исправлена fixture на каноническую saveOperation с явно категоризированной fee; отдельно добавлен тест фактической современной unallocated fee. Старые тесты/финансовые правила не менялись.
- Первый запуск Chromium не нашёл ранее выбранный /tmp/chromium; runtime распакован из установленной dev-зависимости. WebKit сначала не смог загрузить недостающие системные библиотеки; после локальной подготовки выполнены настоящие тесты, а ошибки запуска не объявлены PASS.
- WebKit focused-attempt1: после fill календарного месяца ещё не завершилось текстовое редактирование fallback input и change не произошёл. Сохранены первичные FAIL/PNG; helper завершает ввод штатным blur, после чего тот же UI-contract/денежные assertions прошли. Продуктовый обработчик change не менялся.
- Первый upgrade-fixture не передавал обязательную дату в создание вымышленной P3-цели (GOAL_DATE). Исправлен только тестовый DTO. Повторные Chromium/WebKit upgrade прошли; копии/секреты не коммитились.
- Первый полный run остановлен после19 успешных заданий ради дополнительной проверки гипотезы о точности максимальной суммы в истории. Гипотеза **не подтвердилась**: прежний formatMoney уже сохраняет91 копейку. Продуктовых изменений не делалось, дополнительный browser-тест сохранён. Частичный console сохранён отдельно и не засчитан как полный run. Окончательный полный run начат заново с дополнительными2 заданиями precision.
- При архивировании прежних результатов защитный фильтр ошибочно принял4 сводных P2/P3 upgrade-JSON с полем формата копии за сами контейнеры. Первичные полные job-логи/скриншоты сохранены;4 JSON получены отдельным успешным повтором в `metadata-repeat`, происхождение отмечено в archive-manifest. Эти4 повтора не добавлены к67 задачам исходного завершённого run. Текущие P4 JSON и первичный verify-delivery сохранены полностью; файлов vault/дампов/ключей в архиве нет. Исторические каталоги затем восстановлены из Git.
- Несколько диагностических команд первоначально получили неверный cwd и были исправлены. Это ошибки пути инструмента, не скрытые ошибки приложения.

Исходные RED/первый ошибочный GREEN/частичный run не переименованы в финальные PASS. Числа unit-тестов, release-заданий и групп browser-driver — разные уровни детализации, их нельзя складывать.

## Пределы доказательства

Native IndexedDB/put quota/CAS/rollback/поколения/повторный ID и независимые файловые restore выполнялись фактически. Для WebKit offline сервер отказывает HTTP; на финале принудительно доказан отказ update(/sw.js), не только декларация offline. Ожидаемый точный sw.js transport error допускается только в этой фазе; остальные pageerror дают FAIL. Это не аппаратный авиарежим.

**Настоящий iPhone OPEN**, в том числе все отложенные A2/A3/P1.1/P1.2/P2/P3 и старый A2/WebKit PIN timeout. VoiceOver, нативные клавиатуры Safari/PWA, фактическое сохранение файла в «Файлах» — ручная приёмка. Успех WebKit/Linux не закрывает эти вопросы. После открытия PR №13 API вернул пустые commit statuses и PR Actions runs ([наблюдение](../../Source/evidence/p4/github-observation.json)); это не PASS удалённого CI. CodeRabbit/пропуск проверки не считаются завершёнными тестами. merge_commit_sha в GitHub — предварительный merge preview, PR остаётся merged=false.

[Снимки](SCREENSHOTS.md) · [iPhone](IPHONE_ACCEPTANCE.md) · [Открытые вопросы](OPEN_ITEMS.md). Логи предыдущих пакетов сохраняются в прежнем виде; текущие результаты архивируются под P4/regressions. В Git нет реальных финансовых данных, пользовательских файлов копий, паролей/recovery/DEK или дампов IndexedDB. Нет merge/deploy/изменений Pages/доменов/живой базы.
