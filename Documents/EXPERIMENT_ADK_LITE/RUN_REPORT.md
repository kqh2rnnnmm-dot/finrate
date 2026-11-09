# experiment/p61-skills-only — RUN_REPORT

Статус реализации: минимальный read-only месячный обзор готов для Draft PR, не prod. Работали только в `experiment/p61-skills-only`; другая экспериментальная ветка не читалась. Начальный HEAD ветки `c229b1ed0d7d9b9ffe179969341444b693f22d08`, функциональная база `d41a8efb09724d1d3911b768876b8fad21384284` — проверенный предок. Git origin: `https://github.com/kqh2rnnnmm-dot/finrate.git`. Main не переключался/не изменялся.

## Условия эксперимента и Skills

Системная роль — Codex на базе GPT-6; точный backend model ID/версия и reasoning effort не доступны через инструменты, равенство параметров второй сессии **NOT VERIFIED**. Эта работа начата **в продолжении прежней сессии P5**, а не в отдельной чистой сессии: контекст/каталог cloud skills унаследованы. Поэтому строго контролируемым сравнением A/B результат не является. Время/токены всего запуска не измерялись, не приводятся.

Прочитаны корневой AGENTS.md, TASK.md, актуальные верхние checkpoint/decisions, NEXT_SCOPE_PROPOSAL, канонические model/totals/operations и P5 entry/UI/tests. Применён единственный закреплённый GitHub Skill `.agents/skills/frontend-design/SKILL.md` из `anthropics/skills@ca45fc496a3436251f191354091d557da31c15b5`, LICENSE.txt сохранён, без команд из стороннего текста. План/самокритика: существующая panel, подписи и точные суммы, native month selector, прежние шрифты/цвета/токены; новый стиль запрещён контрактом FinRate, приоритет над предложениями skill. Новый skill не скачивался.

В окружении также доступен большой cloud-каталог skills (включая agent-skills, superpowers, frontend-design-premium и прочие); для реализации они не читались/не подключались. По обязательному правилу managed runtime прочитан инфраструктурный cloud skill `c16/cloud-environment-runtime` (`skill://plugin_connector_1p_c5b7d5df5d7081918f2c4be5a633ed5d/cloud-environment-runtime/SKILL.md`); его версия SHA не предоставлена. Это дополнительное ограничение сопоставимости, не второй GitHub design skill. Не вызывались AI/API, агенты, платные сервисы или Actions.

Инструменты: shell/git/Python, Node v24.19.0, штатные esbuild/build, node:test, Playwright с установленным `/usr/bin/chromium`, GitHub connector для Draft PR. Никаких новых зависимостей или установки браузеров.

## Diff Summary

- Новые `Source/src/monthly-report.mjs` и `monthly-report-ui.mjs`: границы календарного месяца, неизменённый `totals(d,{from,to})`, явное пустое состояние, защита неизвестных входов/валют; три суммы, input month, точный прежний formatter, RAM-only выбранный месяц.
- `Source/src/ui.mjs`: только wrapper Reports page, bind/clear. Старый forecast-ui не менялся, кнопка P5 остаётся. `style.css`:7 локальных строк для однострочных прокручиваемых сумм без уменьшения шрифта, без глобального редизайна.
- Два новых тестовых файла:10 unit cases и native browser matrix. Browser harness переиспользует копию проверенных P5 fixture/no-write helpers; это локальное дублирование тестового кода, не новый финансовый движок.
- Этот отчёт и первичные свидетельства только внутри Documents/EXPERIMENT_ADK_LITE/. Общие контрольные документы/FAQ/версия не обновляются для временного эксперимента.

Доходы/расходы/результат берутся из канонического totals: refund уменьшает расходы в месяце возврата; split не второй факт; cancelled/pending исключены. Собственные transfers/тело loans/repayments/adjustments/лимит/остатки не доход и не расход. Внешний transfer и реальная отдельная комиссия следуют существующей модели. Кредитная покупка учитывается один раз, погашение своим переводом — нет. Документ single-currency; RUB/USD/EUR/GBP проверены отдельно, смешанные валюты отвергаются без конвертации. Нет новых сущностей/схем/записей.

## Реальные команды и результаты

Команды из Source, если не указано иначе. Первичные результаты в [evidence](evidence/).

| Проверка | Статус | Результат |
|---|---|---|
| `node --test --test-isolation=none --test-reporter=tap tests/monthly-report.test.mjs` до модуля | RED |10 ожидаемых FAIL, отсутствует selector; p61-red-final.tap |
| Та же focused команда | PASS |10/10,0 FAIL/SKIP; p61-green-final.tap |
| `node --test --test-isolation=none --test-reporter=tap tests/*.test.mjs` | PASS |578/578,0 FAIL/SKIP; unit-full.tap |
| `npm run build` | PASS |В `/tmp/p61-build/Source`, идентичные src/tools/package/lock и symlink существующих node_modules, без установки; build-final.log |
| `FINRATE_CHROMIUM=/usr/bin/chromium node tests/monthly-report-browser.mjs` | PASS |12/12 комбинаций:3 стиля ×2 темы ×2 палитры, в каждой320/375/390/402/430/844×390/1280×900; native IDB write guard/snapshot, точные12-значные деньги, фокус, граница года, empty, P5 Back |
| `FINRATE_CHROMIUM=/usr/bin/chromium node tests/forecast-browser.mjs` | PASS |18/18 P5 групп на итоговой временной сборке; p5-chromium.json/log |
| `FINRATE_P5_WEBKIT=1 node tests/forecast-browser.mjs` | BLOCKED |Отсутствует `/home/agent/.cache/ms-playwright/webkit-2336/pw_run.sh`; p61-webkit.log |
| Full release-run / verify-delivery | NOT RUN |Эксперимент не релиз: прежний строгий verifier фиксирует exact P5 source allowlist; изменять его/публиковать dist запрещено. Выполнен адресный diff-review вместо ослабления verifier |
| iPhone / VoiceOver / системный month picker | NOT RUN |Физического устройства нет; Chromium не выдаётся за iPhone |

Unit-команда выполнена после последнего изменения расчёта; последующий UI-only import штатного formatter проверяется итоговой браузерной матрицей. Build/browser выполнялись в изолированной временной копии: веточные root/dist/FinRate.html не перезаписывались. Native contexts с синтетическими зашифрованными документами сравнивают active/access/safety/backup hashes и generation, глобальные IDB put/add/delete/clear блокируются после setup; попыток записи при просмотре/месяцах/Back нет.

Честные ошибки/повторы: первый unit harness импортировал несуществующий cancel; после исправления получен причинный RED. Первый GREEN6/10 выявил неверные fixture ID (post возвращает boolean), отсутствие recipient у внешнего перевода и overflow при подготовке фикстуры; исправлены тестовые данные, core не менялся. Далее8/10, затем10/10. После уточнения fixture повторно подтверждены10 RED при отсутствии модуля и10 GREEN с ним; старые assertions не менялись. Первые browser попытки ссылались на отсутствующий `/tmp/chromium`/Playwright binary; найден системный Chromium. При переходе к штатному formatter тест ожидал лишние нулевые копейки (0,00 вместо принятого0), исправлен presentation harness с отдельной literal проверкой12-значной дробной суммы. Лог сохранён. Несколько shell-команд ошиблись cwd (Source/Source), они не результаты тестов; случайный каталог с синтетическими логами удалён, файлы владельца не затронуты.

## Review, trade-offs и OPEN

[diff-review.json](evidence/diff-review.json) фиксирует SHA прежних src, кроме двух узких UI/style hooks, и неизменность release artifacts. Model/planning/P1–P5/credit/debts/goals/limits/service/store/crypto/reset/SCHEMA/backup/старые тесты не менялись. Новые selector/UI не импортируют сервис записи, не вызывают mutate/IndexedDB/сетевые API. UI state — только память, no new drafts/settings. Открытие карточки не создаёт истории.

Минимальный срез намеренно без категорий, графиков, детализации, экспорта, сравнения периодов, нового режима Main или финансового движка. При недоступных данных — ошибка с пояснением, не фиктивные нули. Пустой действительный месяц — нули с явным пояснением. Нет функционального известного дефекта на проверенном Chromium; WebKit/iOS поведение не подтверждено. Native month picker выбран ради штатного ввода без нового редактора, его реальная клавиатура/доступность iOS OPEN.

На настоящем iPhone в отдельной вымышленной тестовой среде: открыть Reports; выбрать ноябрь→декабрь→январь; проверить refund следующего месяца и пустой период; прочитать длинные суммы/копейки с VoiceOver; обе темы/палитры и крупный текст; открыть P5 и вернуться; убедиться, что история/факты не изменились. Никакой тестовой публикации этим PR не создаётся.

Main/Pages/dist/домен/secrets/пользовательская база и другие репозитории не изменялись. Actions не запускались; workflow файлов в checkout нет. Только Draft PR, без merge/deploy. Условие сравнения с другой веткой не проверялось и её содержимое не читалось.

Финальный Chromium: `154.0.8037.57`. [Месячный JSON](evidence/monthly-browser.json) · [P5 JSON](evidence/p5-chromium.json). Снимки: [light/neutral](evidence/monthly-light-neutral.png), [light/color](evidence/monthly-light-color.png), [dark/neutral](evidence/monthly-dark-neutral.png), [dark/color](evidence/monthly-dark-color.png).
