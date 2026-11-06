# P5 · протокол проверки

[PR №15](https://github.com/kqh2rnnnmm-dot/finrate/pull/15) **открыт, не слит**. Публикации нет; настоящий iPhone не проверен.

Статус: **финальный полный release75/75 PASS; unit568/568 PASS,0 FAIL/0 SKIP**. Это полный новый прогон после исправления; первый прерванный запуск ниже сохранён отдельно. Кандидат `0.3.16-p5 /p5-forecast01`. Base `aad52c592c34858122844b5b439727318b9e4bcc`; окончательный код/тесты/публичная сборка заморожены в `b83294201b0f44be3ca1f2db131d7c782a1ff50c`. Последующие коммиты — отчёты/артефакты. Настоящий iPhone OPEN.


## Окончательный результат

| Проверка | PASS | FAIL | SKIP | Первичный результат |
|---|---:|---:|---:|---|
| Полный unit/integration |568|0|0|[unit-final.tap](../../Source/evidence/p5/unit-final.tap)|
| Включая новые P5 |54|0|0|47 модельных +7 интеграционных, внутри568, не прибавлять повторно|
| Полный release jobs |75|0|0|[release-run.json](../../Source/evidence/p5/release-run.json), [console](../../Source/evidence/p5/release-final-console.log)|
| P5 Chromium, fullScope |18|0|0|[JSON](../../Source/evidence/p5/chromium-browser.json)|
| P5 WebKit, fullScope |18|0|0|[JSON](../../Source/evidence/p5/webkit-browser.json)|
| Actual ACCESS→P5/independent restore, Chromium |4|0|0|[JSON](../../Source/evidence/p5/chromium-upgrade.json)|
| Actual ACCESS→P5/independent restore, WebKit |4|0|0|[JSON](../../Source/evidence/p5/webkit-upgrade.json)|
| Delivery/public/source/old assertions |1|0|0|[delivery-final.json](../../Source/evidence/p5/delivery-final.json)|
| npm audit |не clean|7 advisories|0|[raw JSON](../../Source/evidence/p5/npm-audit.json):3low+4moderate,0high/critical|
| Физический iPhone |0|0|OPEN|Не проверялся; старые аппаратные задачи не закрыты|

Числа разных строк перекрываются: release включает unit и browser процессы; browser groups включают много assertions. Они **не суммируются** в фиктивное общее число тестов. Нативный WebKit выполнен, `PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS` отключает лишь предварительную проверку Linux-пакетов, а не browser-тесты. Режимы/темы и сценарии проверены, реальный VoiceOver/клавиатура не объявлены PASS.

[Сводка с SHA](../../Source/evidence/p5/final-validation.json) · [Архив старых регрессий](../../Source/evidence/p5/archive-manifest.json) · [Галерея](SCREENSHOTS.md). Public HTML SHA256 `537896673b6f49a4f8cc70d72c816f5bdfc17552860344c7fd99917941c2c528`; код/тесты/сборка `b83294201b0f44be3ca1f2db131d7c782a1ff50c`, base `aad52c592c34858122844b5b439727318b9e4bcc`. Поздние изменения — только документы/evidence, fingerprint и повторная delivery это проверяют.

Оба окончательных engine JSON отдельно фиксируют реальный `backgroundUpdateSettlement`; это наблюдение конкретного прогона, а не обещание iOS-тайминга. Никаких skipped CI/checks в локальный PASS не включено. Финансовые payload/копии/vault/IDB dumps не архивируются: сохраняются выводы/hashes/assertions/вымышленные UI-снимки; старые отслеживаемые evidence восстановлены, текущие копии помещены только в P5/regressions.

## Команды и окружение

Из `Source`, Node v24.19.0; Chromium153.0.8010.0 `/tmp/chromium`; настоящий Playwright WebKit26.5/Linux `/tmp/finrate-playwright`. Все данные вымышленные, отдельные native browser contexts/локальные IDB; никакой базы владельца. Сетевые обращения тестов — только локальный HTTP. `npm audit` отдельно обращается к реестру зависимостей, не к финансовым сервисам.

```bash
node --test --test-isolation=none --test-reporter=tap tests/full-forecast.test.mjs tests/full-forecast-integration.test.mjs tests/b1-period-sync.test.mjs tests/b1-planning.test.mjs tests/b11-recurring.test.mjs tests/b12-plans.test.mjs
FINRATE_CHROMIUM=/tmp/chromium node tests/forecast-browser.mjs
FINRATE_P5_WEBKIT=1 PLAYWRIGHT_BROWSERS_PATH=/tmp/finrate-playwright PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 node tests/forecast-browser.mjs
FINRATE_CHROMIUM=/tmp/chromium node tests/forecast-upgrade-browser.mjs
FINRATE_P5_WEBKIT=1 PLAYWRIGHT_BROWSERS_PATH=/tmp/finrate-playwright PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 node tests/forecast-upgrade-browser.mjs
FINRATE_CHROMIUM=/tmp/chromium PLAYWRIGHT_BROWSERS_PATH=/tmp/finrate-playwright PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 FINRATE_TEST_WEBKIT=1 node tools/check-release.mjs
node tools/verify-delivery.mjs
npm audit --json
```

Окончательная команда release сохраняет полный набор 75 jobs: build, 568 unit/integration, старые browser/security/restore/reset/финансовые regressions, P5 по обоим движкам, performance и delivery. Jobs — процессы, не количество вложенных assertions. P5 browser =18 групп/движок (в т.ч. 7 размеров ×4 оформления), upgrade =4/движок. Выбранные CASE-запуски диагностические, `fullScope:false`; их нельзя суммировать как полный комплект.

## RED → GREEN и честные повторы

- `red-model.tap`: 36 ожидаемых FAIL отсутствующего селектора. `red-model-harness-attempt1.tap`: отдельно неверные import-имена harness. Начальный GREEN35/36 выявил неверную transfer-фикстуру; исправлены штатные `inTransit`/debit и отмена/pending flags. Старые asserts не менялись.
- `red-ui.*` против старой сборки: нет рабочего Reports entry; `green-ui-smoke.log` подтверждает маршрут. Дополнительный причинный `red-account-certainty.tap` доказывает недостоверность точного остатка счёта при неизвестном будущем плательщике; GREEN не угадывает счёт.
- `red-context-loop.*`: две независимые панели в петле Forecast→Free→Forecast. Общий captureReturn переиспользует прежнюю, `green-context-loop.log`.
- `red-compact-layout.*`: риск ниже первого 390×844 экрана из-за inherited margins+gap. Scoped группировка/нулевые inherited margins без уменьшения шрифта, `green-compact-layout.log`.
- Первые browser-запуски выявили ошибку ожидаемой суммы теста и неверное ожидание Home вместо корректного A3-возврата в Reports. Исправлен harness, не продукт/старые assertions; первичные логи сохранены.
- WebKit первый focused-прогон прерван после11 групп из-за неограниченного ожидания offline update; не PASS. `setOffline` дал internal error WebKit. HTTP503-проверка кэшированного запуска работала, update-пromise не завершился за20с. Harness проверяет требуемую работоспособность при настоящем отказе TCP всего origin и отдельно записывает settlement фонового update. Старый ACCESS offline кейс выполнен неизменённым и сохранён как диагностический, не весь ACCESS pack.
- Первый **полный** release `full-attempt1/`: unit568/568 PASS, WebKit-upgrade4/4 PASS; P5 WebKit FAIL после6 групп из-за длинного native option на320px. Прогон остановлен для исправления; не называется полным GREEN. `red-webkit-long-option.*` и `red-webkit-overflow-detail.*` фиксируют причину, `green-webkit-long-option.log` — повтор7 размеров после scoped frame fix. Окончательный полный release запускается заново без CASE.
- Несколько команд раннего аудита использовали cwd репозитория вместо Source и не нашли файл/команду. Они не являются тестовыми результатами. Старый baseline verify уже отказывал из-за изменённого владельцем документа Apple defer; `baseline-delivery.log`, новая база защищает актуальные owner docs.

## Денежные/защитные доказательства

54 новых unit/integration: ранний дефицит при положительном конце; отдельные счета; неизвестный порядок дня; просрочка/части/резервы/однократное покрытие; P2/кредит/перевод в пути/refund/split/P4; календарь/31/февраль/високосность/год/all; неизвестные данные; строгий сценарий/overflow. Native browser IDB put/add/delete/clear traps переживают reload; active/access/safety/backup сравниваются byte-for-byte. Никаких revision/events/drafts/writes при просмотре, раскрытии, симуляции, отмене, фоне, lock/reload/bfcache.

Upgrade реально сервирует7 публичных ACCESS A файлов из base, создаёт стандартную защищённую копию богатого P1–P4 документа/PIN, обновляет SW на P5. Нет autowrite/migration/reset; прежние секреты и полный документ сохранены. Копия независимо восстановлена старым паролем и recovery в разных native профилях. Дополнительно новый export после симуляции восстановлен независимо.

Delivery сохраняет 62/67 прежних src побайтно; 5 остальных допускают только конкретные P5 hooks, старая часть защищена SHA. 114 старых test-файлов — все asserts сохранены, в10 драйверах только build label. Финансовые/криптографические/хранилищные ядра прежние. Dependencies/normalized lock прежние. SCHEMA5, finrate-backup/1,7 public files, CSP, root==dist, свежий fingerprint, standalone — прежняя точная трансформация без2 PWA links. Нет тестовых контейнеров/секретов в публичной сборке.

`npm-audit.json`: **3 low +4 moderate,0 high/critical**, exit1 advisory; без force-fix/смены зависимостей. Отсутствие GitHub Actions/CodeRabbit skipped не является PASS. Фактический CI-статус после PR фиксируется отдельно.

## Первичные артефакты

Все пути относительно `Source/evidence/p5/`: финальные `release-run.json`, `release-final-console.log`, `unit-final.tap`, `delivery-final.json`, `chromium-browser.json`, `webkit-browser.json`, `chromium-upgrade.json`, `webkit-upgrade.json`, `archive-manifest.json`, `final-validation.json`; старые регрессионные driver JSON/log/PNG в `regressions/`. Ранние попытки сохранены рядом с понятными именами, первый полный запуск — `full-attempt1/`. Снимки/размеры/SHA: [SCREENSHOTS](SCREENSHOTS.md).

Аппаратная Safari/PWA приёмка, VoiceOver, клавиатуры, Files и авиарежим **OPEN**, включая A2–P4/ACCESS A и исторический A2/WebKit PIN timeout. [Чек-лист](IPHONE_ACCEPTANCE.md). WebKit/Linux не является iPhone PASS.

Техническая проверка diff: весь raw RED TAP содержит исходные trailing spaces в YAML diagnostic indentation (`red-model`, `green-model-attempt1`, `green-boundaries-fixture-attempt`, `red-account-certainty`), поэтому общий `git diff --check <base>` сообщает whitespace warnings. Первичные логи намеренно не переписывались. Отдельный diff-check исходников/тестов/tools/документов/package/tasks — чистый. Это не функциональные FAIL окончательного тестового прогона.

GitHub после открытия PR15 на `c0aa67ef4d61fd6995a620dba0051dd154383234`: PR open/merged=false/mergeable=true; combined statuses=[], PR workflow_runs=[]. Запусков Actions/статусов не предоставлено, это не CI PASS и не CodeRabbit review. Финальная ссылка на HEAD берётся из PR; последующий коммит меняет только документы/статус. Main перед push повторно aad52c5.
