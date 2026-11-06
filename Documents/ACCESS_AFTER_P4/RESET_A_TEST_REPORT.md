# ACCESS-after-P4 A — отчёт проверки

Статус: рабочая ветка codex/access-emergency-reset, готово для ревизии; не слито/не опубликовано. База **e7b3f631187b16b7b01fc49cb975968a2439f93c**. Версия **0.3.15-access-a**, build **access-emergency-reset01**, замороженный код/комплект **1d6b60ed79cecd9823f806f5dfaa016ceba57682**. Последующие документы/артефакты не меняют приложение. Полный HEAD будет указан в PR и передаче владельцу.

Первый полный run для60acf05: **514/514 unit/integration и71/71 release PASS**. Он сохранён отдельно в [first-full](../../Source/evidence/access/first-full/release-run.json). Второй повтор для a6e128c остановлен после воспроизведённого WebKit-отказа: ранняя новая форма позволяла кликнуть до освобождения общей perform/refresh-блокировки;7 групп WebKit успели пройти. [Первичный отказ](../../Source/evidence/access/attempts/full-repeat-webkit-busy.json), [статус прерванного повтора](../../Source/evidence/access/attempts/second-run-status.json). Это не полный PASS.

Заключительный полный run для **1d6b60ed79cecd9823f806f5dfaa016ceba57682**: **514/514 unit/integration PASS (23 новых +491 прежний),71/71 release PASS;0 FAIL/0 SKIP/0 cancelled, ни одного timeout**. Chromium и WebKit: по27 новых browser-групп и4 upgrade-группы, оба отчёта full. Public HTML SHA-256: `b0eba90fff623ba2ee0cdc0cc0d60df96aefd5df840fe87ceb18f3a83cc08034`. Выбранные CASE-пробы и первый run не подменяют этот итог. [Unit TAP](../../Source/evidence/access/unit-final.tap), [release JSON](../../Source/evidence/access/release-run.json), [console](../../Source/evidence/access/release-final-console.log), [verify-delivery](../../Source/evidence/access/delivery-final.json), [архив job-логов](../../Source/evidence/access/archive-manifest.json).

| Область | Фактически проверяется |
|---|---|
| Locked export | Никаких decrypt/derive/encrypt/authorize/unlock; guard запрещает decrypt/derive/encrypt и IDB-write в настоящем браузере. parseBackup/validateVault, идентичность исходного vault/dataset/revision, полный independent restore богатого P4, правильный и неправильный секрет. Device-access/CryptoKey/PIN/recovery/plaintext/safety в файл не попадают |
| Intent/proof |23 unit: opaque WeakMap, closed-only, forged/cloned/lost/older token, copy-issued+manual claim vs no-copy risk, ack/exact phrase, no-op cancel/new preview/lock, use-once error/duplicate BUSY, bounded identity, stale/new dataset/password/ciphertext |
| Транзакция | Настоящие native IDB rw/CAS/clear, quota/AbortError/InvalidStateError после safety clear, rollback обеих таблиц, proof-consumed/restart, native очередь IDB при уходе в фон, подтверждение успеха только после commit/проверки пустых таблиц внутри transaction |
| Гонки доступа | RED подтвердил post-PIN race после resetAttempts; финальный assertCurrent запрещает публикацию старого результата. Password/PIN старой вкладки, stale old writer без BC, чужой commit/смена пароля/restore не могут стереть новое/воскресить удалённое |
| UI | Полные27 групп на движок:3 маршрута, PIN/password/recovery/5 ошибок, обе copy-ветки, все отмены/Enter/submit/неверная фраза/пробел на явной кнопке/double click, обычный setup и независимый restore, actual native read failure/коррупция/blocked download/post-commit read failure, BC+IDB fallback, offline |
| Lifecycle | visibility/pagehide/pageshow/bfcache/cold reload; дополнительно выбранный RED pageshow.persisted без pagehide, затем GREEN в обоих движках. Никаких поздних файлов/удалений, зависших подтверждений или сохранённого proof при modeled background |
| P4→ACCESS | По4 группы каждого движка:7 неизменённых public-файлов текущего P4/main, реальный P4-export, user-approved SW upgrade с неизменным ciphertext/generation, новый пункт без autowrite, прежний PIN, locked export того же vault, независимый restore исходного P4-file равен целому документу |
| Геометрия |320/375/390/402/430,844×390 landscape,1280×900 desktop;2 темы×2 палитры через настоящие settings→lock, крупный root-font320, фокус native-поля/скролл/cancel. Старые поверхности/шрифты/Главная не менялись. Это не iOS-клавиатура/VoiceOver |
| Совместимость | SCHEMA5/finrate-backup/1/DBversion1/PBKDF2/AES-GCM/DEK/слоты неизменны. Ни нового поля финансового документа, ни миграции чтения. Защищены SHA60 из65 прежних исходных файлов; service/store сравниваются после снятия только новых hooks/CAS/guard и post-PIN check.109 старых test-файлов: в8 только current build label, assertions не ослаблены |
| Поставка |7 public-files/root==dist/CSP/same-origin/SW. Source/FinRate.html отдельно проверен как результат прежнего build-transform (без manifest/icon links). Дополнительно SHA всех src/package/lock/build inputs и publicHTML: устаревший bundle/сломанная версия больше не проходит verify. Нет test-harness/фикстур/секретов/внешних runtime-зависимостей в public |
| npm audit | Прежние3 low +4 moderate dev/build, high0/critical0; raw JSON сохранён, exit1 из-за advisories, force-fix не выполнялся |

## Команды и окружение

Из Source (Node24.19.0, Chromium153.0.8010.0, настоящий Playwright WebKit26.5/Linux):

```sh
node --test --test-isolation=none --test-reporter=tap tests/emergency-*.test.mjs
node --test --test-isolation=none --test-reporter=tap tests/emergency-*.test.mjs tests/reset*.test.mjs tests/a3*.test.mjs tests/backup-safety.test.mjs
FINRATE_ACCESS_RED_P4=1 FINRATE_CHROMIUM=/tmp/chromium node tests/emergency-browser.mjs
FINRATE_CHROMIUM=/tmp/chromium node tests/emergency-browser.mjs
FINRATE_ACCESS_WEBKIT=1 PLAYWRIGHT_BROWSERS_PATH=/tmp/finrate-playwright PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 node tests/emergency-browser.mjs
FINRATE_CHROMIUM=/tmp/chromium node tests/emergency-upgrade-browser.mjs
FINRATE_ACCESS_WEBKIT=1 PLAYWRIGHT_BROWSERS_PATH=/tmp/finrate-playwright PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 node tests/emergency-upgrade-browser.mjs
FINRATE_ACCESS_CASE=6 FINRATE_CHROMIUM=/tmp/chromium node tests/emergency-browser.mjs
FINRATE_ACCESS_CASE=6 FINRATE_ACCESS_WEBKIT=1 PLAYWRIGHT_BROWSERS_PATH=/tmp/finrate-playwright PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 node tests/emergency-browser.mjs
FINRATE_TEST_WEBKIT=1 FINRATE_CHROMIUM=/tmp/chromium PLAYWRIGHT_BROWSERS_PATH=/tmp/finrate-playwright PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 node tools/check-release.mjs
node tools/verify-delivery.mjs
npm audit --json
```

CASE=6 — lifecycle, CASE=10 — Retry, CASE=27 — переход после refresh; каждый только выбранная проверка, report.fullScope=false/checks1; она не считается полным browser run. Финальный runner не задаёт CASE и проверяет полные27 групп каждого движка. --test-isolation=none нужен из-за fork sandbox; старые assertions сохранены. Локальные HTTP/браузеры требуют разрешения исполнения среды. Runtime-бинарники/библиотеки временного тестового окружения переиспользованы из предыдущего этапа, в приложение/зависимости ничего не добавлялось.

Сервисные фикстуры используют уникальные имена IndexedDB. Public UI имеет штатное имя finrate-local-v1, но каждый опыт идёт в новом изолированном browser context/origin; это не пользовательский Safari/PWA или реальное хранилище владельца. Экспорты остаются ephemeral тестовыми файлами, в Git только отчёты/хеши/вымышленные скриншоты.

## RED/GREEN и реальные ранние ошибки

- Исходный RED export:5/5 ожидаемых FAIL из-за отсутствовавших методов. Затем RED всех новых intent/atomic сценариев:21/21 FAIL; отдельный старый CAS отвергал требуемую семантику —1 FAIL. Контейнер/фикстуры созданы действующим P4, не подменялись ради зелёного.
- Первый GREEN сервиса46/47: усиленный assertCurrent изменил старый A2 BACKUP_INVALID на STALE для подменённого ciphertext. Не ослабляя тест, сохранён прежний version-only assertCurrent; более строгий ciphertext CAS используется в commit/reset. Следующий объединённый80/80 PASS. После RED post-PIN race —81/81 PASS (23 ACCESS +58 выбранных прежних).
- Actual public P4 UI RED: кнопки помощи нет, проверка0≠1. Первый новый Chromium UI остановился на преждевременном enable кнопки; исходный disabled устранил ошибку. Следующий нашёл глобально переопределённый hidden; добавлен только scoped hidden. Третья остановка — ошибочный selector #security-open вместо существующего #open-security, исправлен только helper. Затем оба движка нашли nowrap overflow320; подписи переносятся локально без уменьшения шрифтов.
- WebKit отдельно воспроизвёл невидимый native select после modal teardown/auth-render. Применён существующий shell-style flush; force selection/подмена Safari user-agent не использовались.
- Post-PIN RED: отсутствовал финальный отказ уже удалённой базы после завершения resetAttempts, добавлен assertCurrent до публикации document/key. Pageshow-only RED: осталась открыта прежняя destructive форма; теперь cancel на persisted pageshow выполняется независимо от доставки pagehide.
- После первого полного PASS отдельно обнаружен и воспроизведён RED общей feedback-кнопки «Повторить»: после израсходования proof она отправляла форму с пустым обработчиком. Новый обработчик при потерянном proof начинает новую процедуру **с первого шага**, а не повторяет удаление; Enter при этом по-прежнему заблокирован. Выбранный CASE=10 GREEN сохранён, затем полный пакет запущен заново для a6e128c. Старый first-full не переименован в окончательный run.
- Повторный full-run WebKit обнаружил гонку: review/confirm показывались из тела async-action до окончания общей run-refresh, новые кнопки выглядели доступными, но ui.perform ещё оставался locked. Новый детерминированный RED задерживает **настоящий IDB success второго чтения** и проверяет отсутствие преждевременной новой формы (1≠0). Переходы и ручная отметка copy теперь выполняются в существующем onSuccess, после освобождения perform. GREEN CASE=27 выполнен в обоих движках; исходная native-busy проверка WebKit тоже GREEN. Старые ожидания не ослаблены, добавлена27-я группа. Отказавший второй run остановлен с сохранением протокола, затем весь пакет запущен заново.
- В helper-записи package.json однажды оказался буквальный хвост \n, build корректно отказал. JSON исправлен. Обнаружена также слабость прежнего verify: он не связывал разрешённые source changes с конкретным bundle. Добавлен build input/publicHTML fingerprint и проверка package/lock версии; новая проверка проходит только после свежей сборки.
- Несколько диагностических копирований/чтений были запущены с неверным cwd; повторены с правильным Source-префиксом. Эти ошибки инструмента не выдаются за отказ приложения. Первичные выбранные FAIL/PNG/TAP сохранены отдельно; окончательный полный run не заменяется повторными частичными результатами.

Прежние форматы некоторых regression JSON сохраняют исторические имена пакетов в поле build. Фактический контекст их нового запуска — code SHA и publicHTMLSHA256 итогового release/архивного manifest; это не отдельный запуск старого бинарника. P4-before в upgrade проверяется отдельно настоящими прежними7 public-файлами.

## Реальные пределы доказательства

Native IndexedDB/rollback/CAS/очереди/счётчики/независимые файловые restore выполнены фактически. Для WebKit offline сервер отказывает HTTP; отказ update(/sw.js) специально подтверждён. Точный ожидаемый sw.js transport error допускается только в этой управляемой фазе; остальные pageerror дают FAIL. Это не реальный авиарежим iPhone.

**iPhone OPEN**, включая ранее отложенные пакеты и старый A2/WebKit PIN timeout. Физические «Файлы», нативная share-панель/AutoFill/VoiceOver/Face ID диалог ОС не проверены. CodeRabbit skipped/пустые Actions не считаются PASS; удалённые статусы фиксируются после создания PR отдельно. [Риски](RESET_A_OPEN_ITEMS.md), [аппаратная приёмка](RESET_A_IPHONE_ACCEPTANCE.md), [скриншоты](RESET_A_SCREENSHOTS.md).

Дополнительная ручная cmp-проверка standalone против dist сначала отказала: по прежнему build.mjs standalone намеренно не содержит двух manifest/icon links. Формат не менялся; проверено полное равенство именно результату существующего transform, включая тот же script/CSP. Сгенерированный standalone сохранён отдельным build-коммитом d08da54; это тот же проверенный код, не новая логика. [Первичная метадата](../../Source/evidence/access/standalone-delivery.json).
