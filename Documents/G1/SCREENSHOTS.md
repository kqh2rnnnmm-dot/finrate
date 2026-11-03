# G1: основные экраны и сообщения

Вымышленные данные, одинаковые viewport/runtime. «До» — main `025fa8e` с D1; «после» — `g1-theme01`. Снимки Chromium/WebKit Linux не являются снимками настоящего iPhone. Файлы keyboard-model показывают уменьшенную VisualViewport, без изображения нативной клавиатуры.

| Экран | Нейтральная светлая | Нейтральная тёмная | Цветная светлая | Цветная тёмная |
| Главная | [снимок](../../Source/evidence/g1-after-chromium-neutral-light-home.png) | [снимок](../../Source/evidence/g1-after-chromium-neutral-dark-home.png) | [снимок](../../Source/evidence/g1-after-chromium-color-light-home.png) | [снимок](../../Source/evidence/g1-after-chromium-color-dark-home.png) |
| Операции | [снимок](../../Source/evidence/g1-after-chromium-neutral-light-operations.png) | [снимок](../../Source/evidence/g1-after-chromium-neutral-dark-operations.png) | [снимок](../../Source/evidence/g1-after-chromium-color-light-operations.png) | [снимок](../../Source/evidence/g1-after-chromium-color-dark-operations.png) |
| Счета | [снимок](../../Source/evidence/g1-after-chromium-neutral-light-accounts.png) | [снимок](../../Source/evidence/g1-after-chromium-neutral-dark-accounts.png) | [снимок](../../Source/evidence/g1-after-chromium-color-light-accounts.png) | [снимок](../../Source/evidence/g1-after-chromium-color-dark-accounts.png) |
| Планы | [снимок](../../Source/evidence/g1-after-chromium-neutral-light-plans.png) | [снимок](../../Source/evidence/g1-after-chromium-neutral-dark-plans.png) | [снимок](../../Source/evidence/g1-after-chromium-color-light-plans.png) | [снимок](../../Source/evidence/g1-after-chromium-color-dark-plans.png) |
| Настройки | [снимок](../../Source/evidence/g1-after-chromium-neutral-light-settings.png) | [снимок](../../Source/evidence/g1-after-chromium-neutral-dark-settings.png) | [снимок](../../Source/evidence/g1-after-chromium-color-light-settings.png) | [снимок](../../Source/evidence/g1-after-chromium-color-dark-settings.png) |
| Ввод операции | [снимок](../../Source/evidence/g1-after-chromium-neutral-light-form.png) | [снимок](../../Source/evidence/g1-after-chromium-neutral-dark-form.png) | [снимок](../../Source/evidence/g1-after-chromium-color-light-form.png) | [снимок](../../Source/evidence/g1-after-chromium-color-dark-form.png) |
| Новая операция | [снимок](../../Source/evidence/g1-after-chromium-neutral-light-chooser.png) | [снимок](../../Source/evidence/g1-after-chromium-neutral-dark-chooser.png) | [снимок](../../Source/evidence/g1-after-chromium-color-light-chooser.png) | [снимок](../../Source/evidence/g1-after-chromium-color-dark-chooser.png) |
| Редактор D1: только цвета | [снимок](../../Source/evidence/g1-after-chromium-neutral-light-note.png) | [снимок](../../Source/evidence/g1-after-chromium-neutral-dark-note.png) | [снимок](../../Source/evidence/g1-after-chromium-color-light-note.png) | [снимок](../../Source/evidence/g1-after-chromium-color-dark-note.png) |
| Пароль и вход | [снимок](../../Source/evidence/g1-after-chromium-neutral-light-security.png) | [снимок](../../Source/evidence/g1-after-chromium-neutral-dark-security.png) | [снимок](../../Source/evidence/g1-after-chromium-color-light-security.png) | [снимок](../../Source/evidence/g1-after-chromium-color-dark-security.png) |
| Копии | [снимок](../../Source/evidence/g1-after-chromium-neutral-light-data.png) | [снимок](../../Source/evidence/g1-after-chromium-neutral-dark-data.png) | [снимок](../../Source/evidence/g1-after-chromium-color-light-data.png) | [снимок](../../Source/evidence/g1-after-chromium-color-dark-data.png) |
| Категории | [снимок](../../Source/evidence/g1-after-chromium-neutral-light-categories.png) | [снимок](../../Source/evidence/g1-after-chromium-neutral-dark-categories.png) | [снимок](../../Source/evidence/g1-after-chromium-color-light-categories.png) | [снимок](../../Source/evidence/g1-after-chromium-color-dark-categories.png) |
| FAQ | [снимок](../../Source/evidence/g1-after-chromium-neutral-light-faq.png) | [снимок](../../Source/evidence/g1-after-chromium-neutral-dark-faq.png) | [снимок](../../Source/evidence/g1-after-chromium-color-light-faq.png) | [снимок](../../Source/evidence/g1-after-chromium-color-dark-faq.png) |

## До → после

- Главная: [D1 светлая](../../Source/evidence/g1-before-chromium-neutral-light-home.png), [D1 тёмная](../../Source/evidence/g1-before-chromium-neutral-dark-home.png); четыре варианта G1 — в таблице. [Побайтовая сверка нейтральных PNG](../../Source/evidence/g1-neutral-before-after.json).
- Системное сообщение: [D1 светлая](../../Source/evidence/g1-before-chromium-light-system.png), [D1 тёмная](../../Source/evidence/g1-before-chromium-dark-system.png), [G1 цветная](../../Source/evidence/g1-chromium-system.png), [WebKit](../../Source/evidence/g1-webkit-system.png).
- Финансовое сообщение: [D1 светлая](../../Source/evidence/g1-before-chromium-light-financial.png), [D1 тёмная](../../Source/evidence/g1-before-chromium-dark-financial.png); в D1 образец расхода, в G1 ниже образец перевода, общая механика проверена на всех трёх типах.
- Financial neutral/light: [compact](../../Source/evidence/g1-chromium-neutral-light-financial.png), [подробности расхода](../../Source/evidence/g1-chromium-neutral-light-financial-details.png), [WebKit](../../Source/evidence/g1-webkit-neutral-light-financial-details.png).
- Financial neutral/dark: [compact](../../Source/evidence/g1-chromium-neutral-dark-financial.png), [подробности расхода](../../Source/evidence/g1-chromium-neutral-dark-financial-details.png), [WebKit](../../Source/evidence/g1-webkit-neutral-dark-financial-details.png).
- Financial color/light: [compact](../../Source/evidence/g1-chromium-color-light-financial.png), [подробности расхода](../../Source/evidence/g1-chromium-color-light-financial-details.png), [WebKit](../../Source/evidence/g1-webkit-color-light-financial-details.png).
- Financial color/dark: [compact](../../Source/evidence/g1-chromium-color-dark-financial.png), [подробности расхода](../../Source/evidence/g1-chromium-color-dark-financial-details.png), [WebKit](../../Source/evidence/g1-webkit-color-dark-financial-details.png).

## Обязательные предупреждения и клавиатура

- [Ошибка при общем off](../../Source/evidence/g1-chromium-required-error-all-off.png), [WebKit](../../Source/evidence/g1-webkit-required-error-all-off.png).
- [Ошибка над моделью клавиатуры](../../Source/evidence/g1-chromium-required-keyboard-model.png), [WebKit](../../Source/evidence/g1-webkit-required-keyboard-model.png).
- [Безопасность при off](../../Source/evidence/g1-chromium-security-all-off.png), [WebKit](../../Source/evidence/g1-webkit-security-all-off.png).

Все 12 экранов также измерены на 320/375/390/402/430×844, 844×390 и 1280×844. WebKit имеет отдельную матрицу и снимки g1-after-webkit-* в evidence. Числа и названия на изображениях вымышлены; исходных финансовых баз/ключей/копий владельца нет.
