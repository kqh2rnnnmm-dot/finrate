# P5 · реальные снимки до/после

[PR №15](https://github.com/kqh2rnnnmm-dot/finrate/pull/15) **открыт, не слит**. Публикации нет; настоящий iPhone не проверен.

56 PNG из окончательного полного browser/upgrade прогона на `b83294201b0f44be3ca1f2db131d7c782a1ff50c`, новая сборка `p5-forecast01 /0.3.16-p5`. До — реальные7 public ACCESS A файлов из base `aad52c592c34858122844b5b439727318b9e4bcc`, не макет. Только вымышленные данные. Chromium153.0.8010.0 и настоящий Playwright WebKit26.5/Linux; **не физический iPhone**.

[Размеры и SHA каждого PNG](../../Source/evidence/p5/screenshots-manifest.json) · [Протокол](TEST_REPORT.md). Отдельные снимки ранних отказов в `Source/evidence/p5/attempt-screenshots/`, не подменяют итоговые.

## Основные сопоставления

### chromium

- [До: вкладка «Отчёты», прежняя заглушка · 390×844](../../Source/evidence/p5/screenshots/chromium-before-access-reports.png)
- [До: богатая P1–P4 Главная · 390×844](../../Source/evidence/p5/screenshots/chromium-before-access-home.png)
- [После: та же богатая Главная · 390×844](../../Source/evidence/p5/screenshots/chromium-after-p5-home.png)
- [После: прогноз прежнего P1–P4 документа · 390×844](../../Source/evidence/p5/screenshots/chromium-after-p5-rich-forecast.png)
- [Компактный начальный прогноз и ранняя нехватка · 390×844](../../Source/evidence/p5/screenshots/chromium-forecast-collapsed.png)
- [Раскрытые события и источники · 390×844](../../Source/evidence/p5/screenshots/chromium-forecast-expanded.png)
- [Сценарий: точное поле с копейками · 390×844](../../Source/evidence/p5/screenshots/chromium-what-if-exact-input.png)

### webkit

- [До: вкладка «Отчёты», прежняя заглушка · 390×844](../../Source/evidence/p5/screenshots/webkit-before-access-reports.png)
- [До: богатая P1–P4 Главная · 390×844](../../Source/evidence/p5/screenshots/webkit-before-access-home.png)
- [После: та же богатая Главная · 390×844](../../Source/evidence/p5/screenshots/webkit-after-p5-home.png)
- [После: прогноз прежнего P1–P4 документа · 390×844](../../Source/evidence/p5/screenshots/webkit-after-p5-rich-forecast.png)
- [Компактный начальный прогноз и ранняя нехватка · 390×844](../../Source/evidence/p5/screenshots/webkit-forecast-collapsed.png)
- [Раскрытые события и источники · 390×844](../../Source/evidence/p5/screenshots/webkit-forecast-expanded.png)
- [Сценарий: точное поле с копейками · 390×844](../../Source/evidence/p5/screenshots/webkit-what-if-exact-input.png)

## Обе темы и обе палитры

Мобильные forecast-снимки здесь сделаны **после раскрытия выплат/возврата из карточки**, с сохранённой внутренней позицией; они не выдаются за начальный экран. Scenario — реальный общий редактор/дата/ползунок после12-значного ввода, сравнение ниже по внутренней прокрутке. Home — прежняя главная. Верхний начальный свёрнутый вид отдельно показан выше.

| Движок/тема/палитра | Главная | Прогноз 390×844 | Сценарий 390×844 | Прогноз ПК | Сценарий ПК |
|---|---|---|---|---|---|
| chromium/light/neutral | [390×844](../../Source/evidence/p5/screenshots/chromium-light-neutral-home.png) | [390×844](../../Source/evidence/p5/screenshots/chromium-light-neutral-forecast.png) | [390×844](../../Source/evidence/p5/screenshots/chromium-light-neutral-scenario.png) | [1280×900](../../Source/evidence/p5/screenshots/chromium-light-neutral-forecast-desktop.png) | [1280×900](../../Source/evidence/p5/screenshots/chromium-light-neutral-scenario-desktop.png) |
| chromium/light/color | [390×844](../../Source/evidence/p5/screenshots/chromium-light-color-home.png) | [390×844](../../Source/evidence/p5/screenshots/chromium-light-color-forecast.png) | [390×844](../../Source/evidence/p5/screenshots/chromium-light-color-scenario.png) | [1280×900](../../Source/evidence/p5/screenshots/chromium-light-color-forecast-desktop.png) | [1280×900](../../Source/evidence/p5/screenshots/chromium-light-color-scenario-desktop.png) |
| chromium/dark/neutral | [390×844](../../Source/evidence/p5/screenshots/chromium-dark-neutral-home.png) | [390×844](../../Source/evidence/p5/screenshots/chromium-dark-neutral-forecast.png) | [390×844](../../Source/evidence/p5/screenshots/chromium-dark-neutral-scenario.png) | [1280×900](../../Source/evidence/p5/screenshots/chromium-dark-neutral-forecast-desktop.png) | [1280×900](../../Source/evidence/p5/screenshots/chromium-dark-neutral-scenario-desktop.png) |
| chromium/dark/color | [390×844](../../Source/evidence/p5/screenshots/chromium-dark-color-home.png) | [390×844](../../Source/evidence/p5/screenshots/chromium-dark-color-forecast.png) | [390×844](../../Source/evidence/p5/screenshots/chromium-dark-color-scenario.png) | [1280×900](../../Source/evidence/p5/screenshots/chromium-dark-color-forecast-desktop.png) | [1280×900](../../Source/evidence/p5/screenshots/chromium-dark-color-scenario-desktop.png) |
| webkit/light/neutral | [390×844](../../Source/evidence/p5/screenshots/webkit-light-neutral-home.png) | [390×844](../../Source/evidence/p5/screenshots/webkit-light-neutral-forecast.png) | [390×844](../../Source/evidence/p5/screenshots/webkit-light-neutral-scenario.png) | [1280×900](../../Source/evidence/p5/screenshots/webkit-light-neutral-forecast-desktop.png) | [1280×900](../../Source/evidence/p5/screenshots/webkit-light-neutral-scenario-desktop.png) |
| webkit/light/color | [390×844](../../Source/evidence/p5/screenshots/webkit-light-color-home.png) | [390×844](../../Source/evidence/p5/screenshots/webkit-light-color-forecast.png) | [390×844](../../Source/evidence/p5/screenshots/webkit-light-color-scenario.png) | [1280×900](../../Source/evidence/p5/screenshots/webkit-light-color-forecast-desktop.png) | [1280×900](../../Source/evidence/p5/screenshots/webkit-light-color-scenario-desktop.png) |
| webkit/dark/neutral | [390×844](../../Source/evidence/p5/screenshots/webkit-dark-neutral-home.png) | [390×844](../../Source/evidence/p5/screenshots/webkit-dark-neutral-forecast.png) | [390×844](../../Source/evidence/p5/screenshots/webkit-dark-neutral-scenario.png) | [1280×900](../../Source/evidence/p5/screenshots/webkit-dark-neutral-forecast-desktop.png) | [1280×900](../../Source/evidence/p5/screenshots/webkit-dark-neutral-scenario-desktop.png) |
| webkit/dark/color | [390×844](../../Source/evidence/p5/screenshots/webkit-dark-color-home.png) | [390×844](../../Source/evidence/p5/screenshots/webkit-dark-color-forecast.png) | [390×844](../../Source/evidence/p5/screenshots/webkit-dark-color-scenario.png) | [1280×900](../../Source/evidence/p5/screenshots/webkit-dark-color-forecast-desktop.png) | [1280×900](../../Source/evidence/p5/screenshots/webkit-dark-color-scenario-desktop.png) |

Геометрия дополнительно проверена assertions на320/375/390/402/430,844×390,1280×900 при всех4 оформлениях/обоих движках; снимок каждого сочетания не заменяет эти проверки. VoiceOver, системные клавиатуры и реальная iOS safe-area/панель браузера отдельно [OPEN](IPHONE_ACCEPTANCE.md).
