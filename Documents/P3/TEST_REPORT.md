# P3 — отчёт проверки

[Pull Request №12](https://github.com/kqh2rnnnmm-dot/finrate/pull/12) открыт для приёмки, без merge/deploy.

Сборка **p3-goals01 /0.3.13-p3**, основа main **3add5d9c1bf4fe74c46f2609884d8527682aa9e4**. Ветка codex/p3-goals-reserves. Код функциональности с общей формой P1.2: **5500bdaca2705c22af50802943645f6987276835**. Окончательный код приложения: **37c5dd6633cf967631af1006c87f51b1b752da43**. PR/link указаны в верхней контрольной точке; текущий HEAD проверяется в PR; документы и протоколы не являются публикацией приложения.

**455/455 unit/integration и 61/61 release-заданий PASS; 0 FAIL, 0 SKIP.** [Unit TAP](../../Source/evidence/p3/unit-final.tap), [release](../../Source/evidence/p3/release-run.json), [console](../../Source/evidence/p3/final-release-console.log), [окончательная поставка](../../Source/evidence/p3/final-delivery-verification.json). Это разные уровни детализации; группы внутри browser-driver не складываются с455/61.

SHA-256 окончательного public index.html: `dc807a245625bdfbe4bea6b44ab7682f4291a2d161c604ce6857b3dac97ca2b2`. После полного прогона уточнена только подпись непокрытой части обязательств в planning-ui.mjs. Окончательная сборка отдельно прошла повтор P3 в обоих движках и verify-delivery; финансовые/защитные исходники не менялись. См. final-validation.json. Полный release-протокол сохранён с исходным hash, не переписан.

| Проверка | Фактический результат |
|---|---|
| P3 unit/integration | 40/40 PASS: allocate/release/use, оба прогресса, реальный refund/edit/cancel, архив/закрытие4 вариантов, quota/CAS/replay, строгие ссылки/root/drafts/flags/overflow,80 целей/резервов, A2/PIN/password/restore |
| Весь прежний unit/integration | Вместе с P3:455 PASS; старые415 тестов сохранены, не ослаблены |
| P3 Chromium | 19/19 групп PASS: реальные формы/IDB/квота/CAS/double tap/история/черновики/поиск/Home/счета/платёж/долг/архив/недостаточное покрытие/backup/reset/access/offline |
| P3 WebKit | 19/19 тех же групп PASS, WebKit 26.5; это не настоящий iPhone |
| Настоящая P2→P3 /old backup /rollback probe | По 4/4 групп в каждом движке. Семь исходных public-файлов3add5d9, реальная выгрузка старой копии, user-approved SW update без записи vault/generation, первая атомарная цель, независимый restore старой копии. Обратный P2 runtime сохраняет root, но игнорирует R — небезопасен |
| Геометрия | 320/375/390/402/430,844×390,1280×900; обе темы×обе палитры; цели/резервы/карточки/формы/Главная.12-значная сумма, имя100, note500 с абзацами/длинным словом, крупный текст320. Внешней горизонтальной прокрутки нет, Home неподвижна |
| Копии | Настоящий экспорт и независимый UI restore P3: точное равенство всего документа с действиями/связями/операциями/историей. Подписанный AES-GCM, но семантически повреждённый P3-link отклоняется до замены активной базы |
| A2/A3 | Три отдельных native IDB-хранилища, внешняя копия/recovery proof, PIN/password и независимое точное восстановление. Основная UI-база тестом не очищается |
| B1/P1.1/P1.2/P2/C1/D1/G1/A1–A3 | Полный штатный Chromium/WebKit release-набор:61 PASS, включая performance и verify. Legacy кейсы коротких месяцев/кредиток/планов/долгов/защиты не заменены P3-моками |
| Сохранность исходников | P3_MAIN_BASELINE_SHA256 +verify: operations/block02/credit/scheduled-payments/debts/service/store/crypto/device-access/navigation/surfaces/field-editor неизменны. Прежние model/forecast после снятия только extension hooks byte-identical; payments-ui после снятия optional context/export byte-identical. Все старые test assertions сохранены (в4 драйверах только текущее имя сборки) |
| Поставка |7 публичных файлов, root==dist, CSP SHA/same-origin, без внешних runtime-зависимостей/тестовых данных/ключей в bundle; старые CSS до P3 byte-identical, новая геометрия только data-goals-ui |
| npm audit | 3 low +4 moderate, 0 high /0 critical; exit1 из-за прежних advisories dev/build-цепочки, версии зависимостей не менялись |

## Точные команды

Из Source:

```sh
node --test --test-isolation=none --test-reporter=tap tests/goals*.test.mjs
node --test --test-isolation=none --test-reporter=tap tests/goals*.test.mjs tests/reset*.test.mjs
FINRATE_CHROMIUM=/tmp/chromium node tests/goals-browser.mjs
FINRATE_P3_WEBKIT=1 PLAYWRIGHT_BROWSERS_PATH=/tmp/finrate-playwright PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 node tests/goals-browser.mjs
FINRATE_CHROMIUM=/tmp/chromium node tests/goals-upgrade-browser.mjs
FINRATE_P3_WEBKIT=1 PLAYWRIGHT_BROWSERS_PATH=/tmp/finrate-playwright PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 node tests/goals-upgrade-browser.mjs
FINRATE_TEST_WEBKIT=1 FINRATE_CHROMIUM=/tmp/chromium PLAYWRIGHT_BROWSERS_PATH=/tmp/finrate-playwright PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 node tools/check-release.mjs
node tools/verify-delivery.mjs
npm audit --json
```

`--test-isolation=none` нужен из-за ограничения fork в sandbox; финансовые assertions не менялись. Локальный HTTP/браузеры запускались с разрешением среды. Путь к Chromium выбирает прежний browser-runtime; WebKit — Playwright. Облачные сервисы приложения не подключались. GitHub Actions автоматически не объявлены пройденными: workflow в дереве репозитория отсутствует, отдельные удалённые статусы фиксируются при проверке PR.

## RED → GREEN и сохранённая диагностика

- Исходные12 денежных тестов падали на отсутствующей P3-функциональности: red-core.tap. RED reset/overflow/new-use-extra/противоречивые detached-флаги сохранены; затем целевые GREEN.
- В первом GREEN исправлены округление процента и stale-ссылка после вложенной private-copy мутации закрытия. Четыре комбинации завершения/отмены с release/detach подтверждены отдельными assertions. Исходный FAIL не переименован в PASS.
- UI попытки: неоднозначный selector двух кнопок закрытия; скрытый мобильный dock на ПК; слишком широкий data-page-selector выбирал контейнер. Исправлены только helper/selector, старые assertions не ослаблялись.
- Отдельный настоящий дефект после backup: прямой app.run оставлял повторно используемый dock disabled. Воспроизведён в обоих движках (ui-attempt4 Chromium/attempt3 WebKit), исправлен finally; финальный сценарий нажимает Главную после backup без reload и только потом проверяет cold offline.
- Строгая проверка P3-draft ссылок: первый набросок теста ошибочно проверял атомарность в низкоуровневом saveDraft; boundary исправлен на настоящий service.mutate, RED сохранён. GREEN подтверждает отказ до seal/CAS и неизменность активного ciphertext. Новый intent создания допускается без преждевременной записи root.
- Дополнительный screenshot-fixture первоначально ссылался плиткой на ещё не созданную цель — валидатор правильно отказал GOAL_CHANGED. Исправлен порядок fixture, не приложение. Секреты/копии не публикуются.
- Ранний release-прогон намеренно остановлен после build/unit для проверки формулировок; не считается завершённым. Первый завершённый прогон:61/61 PASS с454 unit, сохранён first-full. Промежуточный прогон после draft validation остановлен для переиспользования единственного P1.2 paymentForm; его partial console сохранён, не засчитан как полный. Заключительные455/61 приведены выше.

Несколько диагностических node-команд были вызваны из неверного cwd; повторены из Source. Это ошибки пути команды, не ошибки приложения; завершённые тестовые протоколы сохранены отдельно.

## Реальные пределы доказательства

Native IndexedDB, поколение/CAS, native put/quota, повторный ID, atomic seal/commit/rollback и independent file restore действительно выполнялись. Для WebKit offline сервер намеренно отказывает во всех HTTP-запросах; это не аппаратный авиарежим. Узкое транспортное сообщение sw.js, если возникало только в этой управляемой фазе, отделяется от pageerror; остальные исключения дают FAIL. Старый строгий P1.1 инструментированный offline-тест не ослаблен, verify сравнивает все старые assertions.

**Настоящий iPhone OPEN.** A2/A3/P1.1/P1.2/P2 и исторический A2/WebKit PIN timeout остаются открытыми; успех нового прогона не означает их аппаратного исправления. [Чек-лист](IPHONE_ACCEPTANCE.md).

116 реальных PNG перечислены в [SCREENSHOTS](SCREENSHOTS.md), включая beforeP2/afterP3 и40 дополнительных showcase-снимков обоих движков. Исторические результаты прежних пакетов восстановлены в исходных каталогах; текущие job-логи/обновлённые metadata сохранены в Source/evidence/p3/regressions. Только вымышленные базы. В Git не сохранены финансовые копии, DEK/пароли/PIN владельца или дампы IDB.
