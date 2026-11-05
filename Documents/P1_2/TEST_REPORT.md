# P1.2 — отчёт проверки p1-2-payments01 /0.3.11-p1.2

Основа main4ac42ea, P1.1/PR9 объединён. Только вымышленные данные в одноразовых хранилищах/профилях на localhost. Chromium153 и настольный WebKit26.5 не являются настоящим iPhone. Аппаратная приёмка A2/A3/P1.1/P1.2 открыта.

**Итог: 381/381 unit/integration, 53/53 release jobs PASS; итоговых отказов0. По10 групп P1.2 в Chromium/WebKit; отдельно2 реальных сценария P1.1 upgrade/старой копии.** HTML SHA256: `eb86bc7d32894faaf70a920a25254ea920f50c8a401857f88da76d3ac25454b8`.

## RED → GREEN

- [red-variable.tap](../../Source/evidence/p1_2/red-variable.tap): оба обязательных дефекта1700/2300 воспроизведены до изменения механики.
- [green-variable.tap](../../Source/evidence/p1_2/green-variable.tap): новая полная/частичная оплата и прежние P1.1 тесты проходят.
- [red-batch.tap](../../Source/evidence/p1_2/red-batch.tap), [green-batch.tap](../../Source/evidence/p1_2/green-batch.tap): отсутствующая групповая механика, затем atomic group/duplicates/combined funds/error in second item.
- [red-instances.tap](../../Source/evidence/p1_2/red-instances.tap), [green-instances.tap](../../Source/evidence/p1_2/green-instances.tap): перенос, пропуск, условия и банк.
- [red-legacy-edit.tap](../../Source/evidence/p1_2/red-legacy-edit.tap), [green-legacy-edit.tap](../../Source/evidence/p1_2/green-legacy-edit.tap): сохранение inferred closing fact при правке ранней части старого P1.1 и запрет второго активного final.
- [extended-integration.tap](../../Source/evidence/p1_2/extended-integration.tap): A2 three modes, exact restore, password/PIN/recovery, batch quota/CAS/retry и кредитная модель B1.

Прежние финансовые assertions не удалялись и не ослаблялись. Старые browser-драйверы A3/upgrade изменены только для ожидания текущего build ID. Новый WebKit-драйвер отдельно записывает узко распознанный отказ сетевой проверки `/sw.js` только в фазе искусственно отключённого сервера; ошибки приложения и финансовые проверки остаются строгими.

## Браузер P1.2

[Chromium](../../Source/evidence/p1_2/chromium-extended.json) и [WebKit](../../Source/evidence/p1_2/webkit-extended.json), по10 групп:

1.1700/2300 полностью вместо2000, отмена и единственный расход.
2.600 частично +1100 полностью, исправление final1000 и отмена с сохранением600.
3.Части достигают ориентира → компактное явное уточнение2600 только за период, без преждевременной записи.
4.Массовая проверка общим редактором, сохранение правок при случайном возврате, bank не выбран сам; native IndexedDB quota → whole rollback; двойное нажатие →2 расхода/1 generation.
5.Защищённая пауза частичного остатка, перенос в другой месяц со стабильным ID, failed/unknown банка без расходов, пропуск неоплаченного срока.
6.Календарь paid/skipped/moved, смешанные состояния дня, одна карточка; условия одного120 и будущих150 с даты; частичная история и leap anchor сохранены.
7.Поздний банковский успех после failed/unknown и явного возобновления — тот же экземпляр, один расход.
8.Три представления +календарь ×7 размеров ×4 сочетания темы/палитры, крупный текст320, снимки штатного редактора.
9.Скачивание реального шифрованного файла и native File UI restore в независимом профиле: весь документ совпадает.
10.Холодная загрузка/unlock через service worker без сети: сохранённый vault неизменен.

Размеры320×568,375×667,390×844,402×874,430×932,844×390,1280×900. По112 измерений горизонтальных границ на движок, плюс крупный текст в4 сочетаниях. Общие формы/геометрия/поверхности дополнительно покрыты прежней регрессией.

Chromium — context.setOffline(true). WebKit — сервер отказывает всем HTTP-запросам отдельного профиля по cookie; navigator.onLine может оставаться true. WebKit setOffline ломает native File IO в этом стенде. Это проверка кэша при отказе сети, не аппаратный «Авиарежим». Ожидаемый сетевой отказ проверки sw.js, если возникает, хранится в expectedOfflineNetworkErrors.

## Настоящая P1.1-копия и обновление

[p11-upgrade.json](../../Source/evidence/p1_2/p11-upgrade.json):2 независимых сценария на точном public bundle main4ac42ea. До —1700 оставляет300,2300 запрещены. Из этой сборки реально скачан protected file. Затем нажата штатная кнопка обновления SW до P1.2: сохранённый ciphertext/generation неизменны, автоматической миграции нет. Явная правка старой1700 как полной закрывает долг без второго расхода;2300 подтверждается новым UI. Старый файл восстановлен в отдельном профиле, весь документ равен исходному.

[Снимки до/после](SCREENSHOTS.md). Указанный драйвер использует только семь публичных файлов исходного main в отдельной временной папке; файлы копий не сохраняются в GitHub.

## Общая регрессия и первоначальные отказы

Команда: `FINRATE_TEST_WEBKIT=1 node tools/check-release.mjs` (локальный Chromium через FINRATE_CHROMIUM и установленный WebKit). [Машинный release](../../Source/evidence/p1_2/regressions/release-run.json), [логи](../../Source/evidence/p1_2/regressions/), [CSP/7 public files/SHA](../../Source/evidence/p1_2/regressions/delivery-verification.json). Точный HTML SHA и число jobs находятся в итоговом JSON.

Первый предварительный набор378/378 PASS; после добавления двух проверок взаимодействия паузы итоговый набор381/381 PASS. Промежуточные запуски остановлены для небольших UI-исправлений после визуального просмотра: выбор группы переведён на существующие list-card, а день с paid+skipped больше не помечается как неоплаченный. Они не засчитываются итоговым release.

Первый A2/WebKit: тайм-аут PIN во второй офлайн-вкладке до финального сброса. [Исходный лог](../../Source/evidence/p1_2/a2-webkit-first-attempt.log), [диагностика](../../Source/evidence/p1_2/a2-webkit-first-attempt.json). Строгий адресный повтор без изменений A2-драйвера:13/13 групп (12 сочетаний очистки/темы/палитры +точная8MiB граница), failures0; [лог](../../Source/evidence/p1_2/a2-webkit-retry.log), [итог](../../Source/evidence/p1_2/a2-webkit-retry.json). Причина единичного bootstrap timeout не доказана; не объявляется исправленной и требует внимания на устройстве. Подтверждённой потери данных не было; обход защит/очистка пользовательского сайта не применялись.

Native audit: [npm-audit.json](../../Source/evidence/p1_2/npm-audit.json), high/critical0,4moderate+3low в прежнем build/dev графе. Runtime Dexie не затронут, lockfile зависимости не менялись. Следующий разбор до05.12.2026 или ближайшего релиза. Политика без принудительного audit fix.

Реальный iPhone: [10 шагов](IPHONE_ACCEPTANCE.md). Не подтверждены нативные клавиатуры, OS Dynamic Type/safe area, файл в Apple «Файлы», фон/перезапуск процесса, настоящий офлайн и установленная PWA. Ни merge, ни публикация не выполнялись.


После первого A2 timeout свежий полный итоговый прогон A2/WebKit также прошёл без ослабления проверок. [green-pause-overrides.tap](../../Source/evidence/p1_2/green-pause-overrides.tap):39 адресных проверок, включая исправление [red-pause-overrides.tap](../../Source/evidence/p1_2/red-pause-overrides.tap). Будущие неоплаченные overrides подчиняются бессрочной паузе; частичные и уже возникшие перенесённые долги сохраняются.


[red-cancel-paused-final.tap](../../Source/evidence/p1_2/red-cancel-paused-final.tap) → [green-cancel-paused-final.tap](../../Source/evidence/p1_2/green-cancel-paused-final.tap): отмена единственного final открывает обязательство и при родительской паузе. Любая история фактов сохраняет экземпляр; пауза подавляет лишь новые неоплаченные overrides без истории. При правке существующего факта сохраняется его прежний full/partial выбор; default full применяется к новой переменной оплате.
