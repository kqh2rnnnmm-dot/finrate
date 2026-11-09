# ADK Lite — месячный срез P6.1

Начальный HEAD `a2430c0635f948f3730db96d38e77b912ecb0ab8`; функциональная база `d41a8efb09724d1d3911b768876b8fad21384284`. Ветка experiment/p61-adk-lite. До реализации проверки NOT RUN.

## До изменений: пять связей требований

| Требование | Реальный контракт / адресная работа | Доказательство приёмки |
|---|---|---|
| Три суммы календарного месяца, копейки/год | model.totals с from/to, новый чистый selector | RED/GREEN: границы, отрицательный результат, safe integers |
| Возвраты/split/исправления, без вторых денег | model/operations канонические записи, их не менять | Покупка/возврат в разных месяцах, отмена/правка/комиссия/кредит/loans |
| Честные пустые и валютные состояния | Один currency документа; без курсов/новых записей | empty vs invalid, четыре currency отдельно, отказ mixed |
| Reports UX + P5 остаётся | ui Reports route, прежний forecast-ui, shared formatMoney/panel | Native browser: месяц, Back, фокус, 320–430/ПК, 3 стиля/темы |
| Read-only и обратимость | service/store/crypto/schema/reset/Главная не трогать | Снимок vault до/после, IDB guards, SHA/diff, локальный build вне dist |

Нельзя предполагать курс, считать plan фактом, прибавлять кредитный лимит/резерв/заём как доход или запускать новый движок. Успех — правильные три суммы с выбором месяца, действующий P5 и отсутствие writes; недоказанное не PASS. Только синтетика, без merge/deploy/Actions/dependencies.

Закреплённый frontend-design skill прочитан из `.agents/skills/frontend-design/SKILL.md` (anthropics/skills@ca45fc496a3436251f191354091d557da31c15b5). Применение ограничено существующим языком FinRate: простая панель с подписями/точными значениями и штатным выбором месяца. Ни новой палитры/типографики, ни команд из текста skill. Контракт FinRate выше творческих предложений навыка.

Ограничение честности: это продолжение сессии с известным контекстом skills-only, не чистая независимая сессия; другую ветку/коммиты/артефакты не читаем и не переносим. Версия backend-модели/reasoning не доступна, равенство условий не доказано. В роли указано Codex/GPT-6; точный ID NOT VERIFIED. Каталог cloud skills унаследован, другие сторонние skills для этой реализации не подключаются. Полезность Lite против другого процесса не установлена и не будет заявлена по этому запуску.

## Реализация и Diff Summary

- `Source/src/report-period.mjs` (новый): границы месяца, проверка доступности исходного документа/валюты, проекция прежнего `totals` без второго счётчика. Выход — income/expense/result/empty/даты/currency. Ожидается документ, уже проверенный штатным сервисом; повторный собственный валидатор всех операций не создаётся.
- `Source/src/report-view.mjs` (новый): одна существующая panel, native month, три точных суммы через штатный ui-values.formatMoney, пояснение результата/пустого состояния. Выбор периода только в RAM и очищается при общем clear.
- `Source/src/ui.mjs`: import/создание view, bind/clear, Reports page wrapper. P5 page добавляется прежним forecast.page; сам forecast-ui не изменён.
- `Source/src/style.css`:локальные scoped geometry rules в конце, только period-report. Значения не переносятся, локальная прокрутка доступна с tabindex/ARIA, шрифты не уменьшаются. Home/общие токены/палитры не менялись.
- Два новых test-файла `report-period.test.mjs` (10 cases), `report-view-browser.mjs` (12 комбинаций native браузера). Отчёт и raw evidence — только в текущем подкаталоге эксперимента. Новых зависимостей/версий/settings/schema/drafts нет.

## Команды, доказательства и статусы

Все browser/build команды выполнены из новой временной копии `/tmp/finrate-adk-lite/Source`, собранной **только из этой ветки**; src/tests/tools/package/lock скопированы, node_modules — symlink на уже установленные зависимости. Прежние `/tmp` результаты другой ветки не использовались. Штатный `npm run build` PASS ([лог](evidence/finrate-adk-build.log)); его public/root/dist/standalone остаются только в `/tmp`, запрещённые веточные release artifacts не перезаписываются.

| Проверка | Статус | Доказательство |
|---|---|---|
| `node --test --test-isolation=none --test-reporter=tap Source/tests/report-period.test.mjs` из корня, до selector | RED |10/10 ожидаемых FAIL отсутствующего модуля, [red.tap](evidence/red.tap)|
| Та же focused команда после selector | PASS |10/10,0 FAIL/SKIP, [green.tap](evidence/green.tap)|
| Полный unit, первая попытка из корня | FAIL |574 PASS/4 FAIL/0 SKIP: artifact.test.mjs не нашёл FinRate.html/evidence/build.json/dist из неверного cwd; [unit.tap](evidence/unit.tap). Старые asserts не менялись|
| Полный unit из Source временной сборки | PASS |578/578,0 FAIL/SKIP; `node --test --test-isolation=none --test-reporter=tap tests/*.test.mjs`, [unit-final.tap](evidence/unit-final.tap)|
| `FINRATE_CHROMIUM=/usr/bin/chromium node tests/report-view-browser.mjs` | PASS |12/12 комбинаций, [overview-chromium.json](evidence/overview-chromium.json), [лог](evidence/overview.log)|
| `FINRATE_CHROMIUM=/usr/bin/chromium node tests/forecast-browser.mjs` | PASS |18/18 прежних P5 групп, [p5-chromium.json](evidence/p5-chromium.json), [лог](evidence/p5.log)|
| `ADK_WEBKIT=1 node tests/report-view-browser.mjs` | BLOCKED |WebKit executable `/home/agent/.cache/ms-playwright/webkit-2336/pw_run.sh` отсутствует, [реальная попытка](evidence/overview-webkit-blocked.json). Установка не выполнялась|
| Полный release-run / verify-delivery | NOT RUN |Точный release allowlist P5 не допускает экспериментальные новые src; verifier не ослаблялся. Вместо него отдельно SHA/diff и штатный build. Версию/root/dist менять запрещено|
| Настоящий iPhone/VoiceOver | NOT RUN |Нет физического устройства; не заменяются Chromium|

Browser matrix:3 прежних Home стиля ×light/dark ×neutral/color, каждая комбинация320/375/390/402/430,844×390,1280×900 и дополнительный крупный текст20px на320. Native input имеет доступное имя, checked focus/Tab, денежные значения имеют ARIA/tabindex и literal проверку12-значных сумм с копейками. Проверены текущий месяц по frozen clock, декабрь→январь, пустой февраль, возврат из P5 к тому же месяцу, неизменная Home. IDB active/access/safety сравниваются SHA до/после; put/add/delete/clear заменены fail-closed guards после синтетического seed/unlock, native write attempts=0. Это не имитация backend и не настоящие данные.

Исходники model/operations/credit/planning/P1–P5/goals/debts/limits/service/store/crypto/reset не менялись; старые тесты сохранены побайтно. Машинный [review.json](evidence/review.json) содержит baseline SHA для прежних src/tests кроме двух разрешённых UI/style файлов, отсутствие новых write calls, неизменность root/dist/FinRate/package/lock. Schema5/finrate-backup1/keys прежние. Большие финансовые документы/копии/ключи в evidence не сохраняются — только hashes/assertions и синтетические UI снимки.

## Компактная матрица готовности Lite

| Ось | Статус и свидетельство |
|---|---|
| Финансовая точность | PASS focused10: canonical totals, refund date, split, real edit/cancel, transfer+fee, credit/principal exclusions, currency/invalid/safe integers |
| Нет записей/миграций | PASS native IDB guards/hash + SHA review, нет нового root/settings/schema |
| Доступность UI | PASS в Chromium для12×7 сочетаний и ARIA/focus/large text; WebKit BLOCKED; VoiceOver/iPhone NOT RUN. Полная аппаратная приёмка не объявляется |
| Безопасность | PASS в пределах diff/native tests: нет новых секретов/внешних API/проводок/зависимостей, crypto/storage/reset не изменены |
| Тесты | Focused10/P5 browser18/overview12 PASS; первая full попытка FAIL из-за cwd сохранена; итоговый full578/578 PASS |
| Обратимость | PASS для кода: нет расширений/миграции/автозаписи, возврат к branch-start SHA; это не отмена финансовых действий пользователя |

Статус — кандидат для Draft ревизии, **не утверждённый production результат**. Непроверенный обязательный пункт не получает PASS: WebKit/device проверки остаются открытыми, выпуск/аппаратная готовность не заявлены.

## Учёт процедуры, ограничения и review UX

Одна причинная RED-серия10 тестов; один focused GREEN10, без исправлений продуктовой математики после GREEN. При сверке канонического API перед первым GREEN добавлен editBase в новую тестовую фикстуру (сохранённые старые asserts не менялись). Один продуктовый проход selector/UI, рефакторинг сверх этого не понадобился. Один полный unit-repeat нужен из-за cwd; браузерный месячный набор прошёл с первого запуска. Отдельный P5 прогон18 и одна blocked WebKit-попытка. Не считаем изменение тестовой фикстуры доказательством выигрыша Lite; строгое улучшение против другого процесса **не установлено**.

Модель/версия: системная роль Codex на базе GPT-6, точный backend ID и effort не доступны; равенство с другой сессией NOT VERIFIED. Время всего запуска/токены не измерялись. Инструменты: shell/git/Python, Node24.19.0, esbuild/npm build/node:test, Playwright/system Chromium, GitHub connector для Draft PR. Новые сторонние skills/dependencies/AI/API не подключались. Единственный использованный GitHub Skill — закреплённый frontend-design из AGENTS; cloud-runtime skill и более широкий каталог были унаследованы в истории общей сессии, не являются независимым контролем среды. Другая ветка не читалась; ограничение чистой сессии остаётся.

Самокритика по действительному dark screenshot: суммы читаемы и без разрыва цифр, P5 доступен в следующей штатной карточке, нижний остров/цвета прежние. Native month picker в Linux рисует English month несмотря на locale ru-RU — это системный компонент, не самодельный перевод. Его локализация/фокус/клавиатура на iPhone требуют проверки; отдельный новый picker в scope не добавляется. Обзор намеренно не изобретает три новых layout:3 настройки Главной сохраняются, отчёт — одна существующая panel. Новых графиков/категорий/экспорта/настроек нет.

Снимки: [light/neutral](evidence/light-neutral.png), [light/color](evidence/light-color.png), [dark/neutral](evidence/dark-neutral.png), [dark/color](evidence/dark-color.png). Это Chromium/Linux, не iPhone. Для будущего отдельного вымышленного профиля на iPhone: открыть Reports, проверить текущий месяц/годовой переход/пустой месяц, сверить расход и refund следующего месяца, прочитать длинные суммы через VoiceOver/крупный текст, открыть P5 и вернуться, убедиться в неизменности истории/фактов и Main. Тестовый сайт не публикуется.

Main/Pages/домен/release artifacts/реальная база/secrets не менялись. Workflow файлов в checkout нет, Actions не запускаются. Только Draft PR, без merge/deploy. Условие независимости сравнения нарушено общей историей сессии, никакого вывода о превосходстве Lite.

Окончательная сверка: 578/578 unit,10/10 новых focused,12/12 overview browser комбинаций,18/18 P5 browser. Chromium154.0.8037.57/Linux. Числа перекрываются, не суммируются. Продуктовых исправлений после первого GREEN не было; один полный повтор из-за cwd, WebKit не запускался успешно. Draft для ревизии, аппаратное принятие NOT RUN.
