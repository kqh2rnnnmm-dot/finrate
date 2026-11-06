# Диагностика P4

- red-*.tap и green-core-attempt1.tap в родительском каталоге — исходные RED и первая ошибочная fee-fixture (11/12).
- webkit-month-before-blur.png и ../webkit-focused-attempt1.json — первичный focused FAIL: month fallback input ещё редактировался, до штатного change/blur. Контракт/приложение не менялись, helper завершает ввод.
- webkit-system-dependencies.log — неуспешная попытка системной установки без root; библиотек системы не меняла. Успешный runtime подготовлен исключительно в /tmp.
- precision-existing-formatter-confirmed.log — дополнительная гипотеза не подтвердилась: существующий formatter уже точен, это GREEN на рабочем механизме, не RED исправленного дефекта.
- release-partial-before-precision.log —19 завершённых PASS первого, намеренно остановленного полного запуска; остальные задачи не закончены, summary отсутствует. Это не полный release PASS. После добавления precision-драйвера полный run выполнен заново.
- chromium-focused*.log/../*-focused.json — адресные проверки до окончательного полного прогона, не подмена final-release-console/release-run.

Некоторые начальные ошибки запуска Chromium/WebKit и GOAL_DATE тестовой fixture зафиксированы в рабочей tool-трассе, но отдельные первичные файлы не сохранились; их отсутствие не скрывается реконструированным «первичным» логом. Позднейшие окончательные сырые job-логи/JSON/PNG сохранены отдельно. Никаких пользовательских копий, дампов IDB или секретов здесь нет.
