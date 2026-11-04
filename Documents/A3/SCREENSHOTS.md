# A3 · снимки на вымышленной базе

Chromium/WebKit/Linux; 390×844 CSS px. Это не фотографии настоящего iPhone. Пароли/PIN скрыты штатным type=password, раскрытые значения закрыты серой маской; ключи/копии не приложены. Пустые формы и настройки сняты без маски.

| Состояние | До, main `7abfe0e` | После A3 |
|---|---|---|
| Смена основного пароля | [До](../../Source/evidence/a3/screenshots/chromium-before-password-form.png) | [После](../../Source/evidence/a3/screenshots/chromium-after-password-form.png) |
| Фон с незавершённой секретной формой | [Процесс остаётся видимым](../../Source/evidence/a3/screenshots/chromium-before-background.png) | [Поверхности скрыты](../../Source/evidence/a3/screenshots/chromium-after-background.png) |

| Тема / палитра | Пароль и вход | Пароль | PIN |
|---|---|---|---|
| Светлая / Нейтральная | [Настройки](../../Source/evidence/a3/screenshots/webkit-light-neutral-settings.png) | [Форма](../../Source/evidence/a3/screenshots/webkit-light-neutral-password.png) | [Форма](../../Source/evidence/a3/screenshots/webkit-light-neutral-pin.png) |
| Светлая / Цветная | [Настройки](../../Source/evidence/a3/screenshots/webkit-light-color-settings.png) | [Форма](../../Source/evidence/a3/screenshots/webkit-light-color-password.png) | [Форма](../../Source/evidence/a3/screenshots/webkit-light-color-pin.png) |
| Тёмная / Нейтральная | [Настройки](../../Source/evidence/a3/screenshots/webkit-dark-neutral-settings.png) | [Форма](../../Source/evidence/a3/screenshots/webkit-dark-neutral-password.png) | [Форма](../../Source/evidence/a3/screenshots/webkit-dark-neutral-pin.png) |
| Тёмная / Цветная | [Настройки](../../Source/evidence/a3/screenshots/webkit-dark-color-settings.png) | [Форма](../../Source/evidence/a3/screenshots/webkit-dark-color-password.png) | [Форма](../../Source/evidence/a3/screenshots/webkit-dark-color-pin.png) |

Все соответствующие Chromium-снимки лежат рядом с префиксом chromium. Геометрия автоматически измеряется на 320/375/390/402/430,844×390 и 1280×900. [Модель уменьшенной видимой области, пароль](../../Source/evidence/a3/screenshots/webkit-after-password-visualviewport-model.png) · [PIN](../../Source/evidence/a3/screenshots/webkit-after-pin-visualviewport-model.png): native-клавиатура не дорисовывалась, снимки показывают только реакцию приложения на VisualViewport.

Контроль финансов/защиты и ограничения — [TEST_REPORT](TEST_REPORT.md), [iPhone](IPHONE_ACCEPTANCE.md).
