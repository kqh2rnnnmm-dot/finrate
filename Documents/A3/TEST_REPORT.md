# A3 · отчёт проверок

Сборка `a3-access01` / `0.3.9-a3`, база main `7abfe0e84442e6b1c8cdf624767ed1341a668473`. Только вымышленные документы/секреты; Node fake-indexeddb и независимые одноразовые браузерные профили на loopback. Рабочий origin/база владельца не открывались, сервер/публикация не создавались.

**Итог: 332/332 unit/integration PASS; 49/49 этапов release PASS после адресного завершения проверки resize на неизменных байтах; 27/27 новых браузерных сценариев и 56 измерений геометрии в каждом движке.** [Машинная сводка](../../Source/evidence/a3/release-run.json) · [49 журналов](../../Source/evidence/a3/release-logs).

Первый прогон сохранил [три отказа](../../Source/evidence/a3/release-first-failed.json): WebKit offline-эмулятор, обнаруженная двойная auth-отрисовка и устаревший ожидаемый ID A2 в upgrade-драйвере. После исправлений весь набор заново выполнен на финальных байтах. В нём одна старая проверка форм измерила Home до существующего ResizeObserver/rAF; [исходный результат](../../Source/evidence/a3/release-before-forms-retry.json) сохранён. В тест добавлено только ожидание двух кадров, денежные/геометрические assertions не ослаблены. Пересборка дала идентичный SHA, затем формы17/17, performance и delivery прошли через tools/resume-a3-release.mjs; [журнал завершения](../../Source/evidence/a3/release-completion.log). Это адресное завершение, не заявление о безотказном первом запуске.

Оба A3-драйвера дополнительно полностью повторены после проверки снимков: уточнена проверка положения фокусного поля и устранён артефакт маски пустых полей. Байты приложения прежние; [Chromium](../../Source/evidence/a3/screens-recheck-chromium.log) / [WebKit](../../Source/evidence/a3/screens-recheck-webkit.log).

## Доказательства и границы

- [Красные unit до исправления](../../Source/evidence/a3/red-unit.log): 2 FAIL для одного дефекта совпадения пароля, авторизация password/recovery. [Исходный браузерный отчёт](../../Source/evidence/a3/chromium-before.json): 4 ожидаемых FAIL на точных публичных файлах main. [Дополнительный дефект WebKit](../../Source/evidence/a3/red-webkit-visibility.log) выявлен расширенным тестом, не скрыт Chromium-результатом.
- Node: **332/332 PASS**, включая 26 новых A3-проверок. Полный TAP — [unit-final.tap](../../Source/evidence/a3/unit-final.tap). Смена защиты меняет только предусмотренные revision/time/security event; финансовый payload, предыдущая история, recovery и точные контейнеры/поколения при отказе проверяются assertions.
- Новый браузерный драйвер: Chromium 153 и WebKit 26.5/Linux, **не iOS Safari**. [Chromium](../../Source/evidence/a3/chromium-after.json) · [WebKit](../../Source/evidence/a3/webkit-after.json). 27 сценариев на движок и 56 измерений геометрии на движок фиксируются машинно, не выводятся из количества снимков.
- Фактическое обновление через SW: семь файлов **из git7abfe0e** → текущие семь файлов, пользовательский «Обновить», повторный вход, reload без HTTP и неизменный persisted vault/access/safety. Chromium использует `setOffline(true)`. В WebKit этот флаг отдельно дал internal navigation error; окончательный тест требует реального отказа всех HTTP-соединений данного профиля и успешной загрузки из SW, `navigator.onLine` остаётся true. Это не аппаратный режим полёта iPhone.
- VisibleViewport/клавиатура: модель `VisualViewport.height/offsetTop`, реальные scroll/focus/геометрия в двух движках; текст сохраняется при расширении области, PIN и submit доступны. **Нативная клавиатура iPhone не воспроизводилась.** Часы0/5/15/30/-1 управляются тестовым clock, не выдаются за ожидание на телефоне.
- Консоль, запросы, URL/history/localStorage/sessionStorage и cache оболочки проверяются без сериализации секретов в отчёты. На снимках пароль/PIN скрыты штатным type=password; раскрытые значения закрыты серой маской. Примеры ключей/дампы/backup-файлы не коммитятся.

## Матрица фактического покрытия

| ID | Источник записи / испытание | Проверенный результат | Статус |
|---|---|---|---|
| 01 | crypto/security tests, вымышленный полный auditDocument | password/recovery открывают, чужой секрет нет, полный roundtrip | PASS auto |
| 02–05 | a3-security: password/recovery × password/PIN/none | Старый пароль не открывает новый vault; новый/recovery работают; локальный режим/все финансовые коллекции сохранены | PASS auto |
| 06 | a3-browser + service boundary | Неверный секрет/повтор/Назад/отмена не меняют active/safety/access; показ/скрытие и уничтожение формы | PASS auto |
| 07 | a3-security + a3-browser, реальная native IDB-инъекция квоты и удержанная crypto-запись с peer commit | Полный rollback, тот же hash/generation/access/safety; явный retry ровно один security event; STALE не перезаписывает peer | PASS auto |
| 08 | Старый Blob/новый фактически сериализованный Blob → openVault/clean IDB restore | Старый файл на прежнем секрете, новый на новом; recovery/полный документ/финансы сохранены | PASS auto |
| 09–11 | security.test/browser, a3-security/browser | PIN4/6, ведущий ноль, максимум ввода, пятая верная/пять неверных, reload counter, main/recovery fallback, удаление/повтор | PASS auto |
| 12 | security-browser и a3 transitions | Красное явное none-подтверждение; отмена ничего не меняет; password slot/шифротекст остаются | PASS auto |
| 13 | session-policy/a3-session, browser clock, ручная блокировка | 0/5/15/30/-1, без продления повторным hide; DOM скрыт; секреты очищены, при истечении вход | PASS модели; DEVICE-REQUIRED |
| 14 | security-lifecycle, a3 delayed unlock/commit | Подтверждённая запись либо целая, либо rollback; фон не раскрывает готовую базу/форму, возврат и Назад работают | PASS модели; DEVICE-REQUIRED |
| 15 | Шесть сочетаний смены защиты → независимая IDB; A2 независимые браузерные профили | Файл восстановлен без локального PIN/none, полное совпадение документа | PASS auto |
| 16 | a3-security PIN/none × A2 F/C/A после смены пароля + весь reset suite | Два частичных сохраняют slots/access/autoLock, полный удаляет; каждый внешний файл восстанавливается независимо | PASS auto; A2 iPhone отложен |
| 17 | access-fields/UI, inputmode/maxlength/aria-pressed и autocomplete switch | Стандартные current/new-password, off для PIN/recovery/старого файла, ручной submit; своего plaintext-хранилища нет | PASS DOM; OS AutoFill DEVICE-REQUIRED |
| 18–19 | Исследование первичных источников + delivery guard/отсутствие UI | Фиктивного unlock и WebAuthn create/get/store нет; password/recovery fallback сохранён | NEEDS-DEVICE, биометрия не реализована |
| 20 | Две темы × две палитры, system appearance, 7 размеров, G1 contrast, C1/D1 geometry | 320/375/390/402/430, landscape844×390 и desktop1280; изоляция/inert/scroll, без horizontal overflow; существующие токены | PASS auto; native keyboard/VoiceOver DEVICE-REQUIRED |
| 21 | Настоящие SW A2→A3, cached cold reload и локальный PIN | Без сервера для доступа к сохранённой базе, точный контейнер не изменяется | PASS auto; iOS lifecycle DEVICE-REQUIRED |
| 22 | Runtime capture + delivery/artifact scan | Нет секретов в проверенных каналах, запрет внешних runtime вызовов/нового secret store | PASS ограниченного объёма, не сертификат |
| 23 | SHA baseline/verify-delivery + полный release | Финансовые модули, schema/crypto/store/A2, G1 и прочие соседние функции | PASS 49/49, SHA в release-run |

## Неизменность и поставка

[A3_MAIN_BASELINE_SHA256.json](../../Source/A3_MAIN_BASELINE_SHA256.json) фиксирует все 56 src-файлов main. `verify-delivery` разрешает только 6 изменённых владельцев и новый access-fields. Остальные 50 совпадают побайтно; отдельно проверяется service вне changeSecurity. Crypto, device-access, store, session-policy, reset-ui/reset-policy и финансовые модули идентичны main. [Delivery SHA/CSP](../../Source/evidence/a3/delivery.json).

Публичная поставка — ровно 7 файлов; root совпадает с dist, CSP hash соответствует inline JS, connect-src self, manifest/scope прежние. Готовые файлы сохранены только в рабочей ветке; наличие сборки в Git не означает публикацию.

## Контраст

[Сводка реальных token probes](../../Source/evidence/a3/contrast-summary.json) и [исходные измерения](../../Source/evidence/a3/contrast) привязаны к SHA текущего HTML. Для текста/кнопок доступа на используемых поверхностях минимальное отношение 4.61:1, в обеих палитрах/темах и двух движках. Это проверка CSS-токенов, не аппаратный аудит native iOS select.

У прежней нейтральной палитры остаются отдельные низкие сочетания на menu-selected (muted/blue: 2.48–4.47) и некоторые семантические token pairs. Это не доказательство их использования в форме A3: она не применяет menu-selected. Токены не менялись; универсальное соответствие всех возможных комбинаций WCAG не заявляется. Цветная палитра проходит имеющиеся44 пары во всех вариантах.

## Зависимости

Read-only npm audit текущего lockfile04.11.2026: **7** затронутых пакетов (4 moderate, 3 low, 0 high/critical); `--omit=dev` — 0. Исторический A1-аудит сообщал 11: advisory-база меняется без изменения lockfile. Актуальные JSON: [все](../../Source/evidence/a3/npm-audit.json) / [omit-dev](../../Source/evidence/a3/npm-runtime-audit.json).

Затронуты deepmerge/@rollup/plugin-node-resolve, fast-uri, glob/minimatch, serialize-javascript и workbox-build. Это build/test-цепочка с доверенными локальными шаблонами/файлами; внешние финансовые контейнеры не передаются этим функциям. Отдельные Workbox precaching/routing включаются в runtime, поэтому нулевой omit-dev не является доказательством безопасности всего bundle. Пакеты не обновлялись и force-remediation не выполнялась. Адресный разбор/совместимые обновления остаются отдельной задачей перед следующим выпуском.

## Непроверенное

Настоящие Safari/PWA, системное сохранение/обновление пароля, аппаратная Face/Touch ID PRF-церемония, клавиатурная панель/VoiceOver, снимки переключателя и реальное длительное ожидание — **NOT VERIFIED ON IPHONE**. [Аппаратный список](IPHONE_ACCEPTANCE.md) · [остатки](OPEN_ITEMS.md). Ни merge, ни публикации, ни сброса пользовательской базы нет.
