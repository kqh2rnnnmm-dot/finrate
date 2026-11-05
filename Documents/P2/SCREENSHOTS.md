# P2 — экранные снимки

Снимки настоящих локальных сборок с вымышленными данными. Playwright Chromium/WebKit; **это не фотографии настоящего iPhone и не подтверждение системной клавиатуры**. Код не опубликован.

| Сценарий | Chromium | WebKit |
|---|---|---|
| До: неизменённый main P1.2, раздел-заглушка | [до](../../Source/evidence/p2/screenshots/chromium-before-p12-placeholder.png) | [до](../../Source/evidence/p2/screenshots/webkit-before-p12-placeholder.png) |
| После: P2, новая база без долгов | [после](../../Source/evidence/p2/screenshots/chromium-after-p2-empty.png) | [после](../../Source/evidence/p2/screenshots/webkit-after-p2-empty.png) |
| Первый старый долг после обновления | [после](../../Source/evidence/p2/screenshots/chromium-after-p2-first-debt.png) | [после](../../Source/evidence/p2/screenshots/webkit-after-p2-first-debt.png) |
| Частичный возврат, осталось 7 000 ₽ | [карточка](../../Source/evidence/p2/screenshots/chromium-owe-partial-detail.png) | [карточка](../../Source/evidence/p2/screenshots/webkit-owe-partial-detail.png) |
| Общая форма возврата | [форма](../../Source/evidence/p2/screenshots/chromium-repayment-form.png) | [форма](../../Source/evidence/p2/screenshots/webkit-repayment-form.png) |
| Отдельный источник в «К оплате» | [платежи](../../Source/evidence/p2/screenshots/chromium-payments-due.png) | [платежи](../../Source/evidence/p2/screenshots/webkit-payments-due.png) |
| Большая сумма, 320 px | [форма](../../Source/evidence/p2/screenshots/chromium-large-amount-320.png) | [форма](../../Source/evidence/p2/screenshots/webkit-large-amount-320.png) |
| Проверка совпавших обязательств | [проверка](../../Source/evidence/p2/screenshots/chromium-conflict-review.png) | [проверка](../../Source/evidence/p2/screenshots/webkit-conflict-review.png) |
| Архив погашенного долга | [архив](../../Source/evidence/p2/screenshots/chromium-archive-detail.png) | [архив](../../Source/evidence/p2/screenshots/webkit-archive-detail.png) |
| Чтение длинной заметки | [заметка](../../Source/evidence/p2/screenshots/chromium-note-reading.png) | [заметка](../../Source/evidence/p2/screenshots/webkit-note-reading.png) |

В том же каталоге для **каждого движка** есть четыре сочетания `neutral-light`, `neutral-dark`, `color-light`, `color-dark`: `-list.png`, `-detail.png`, `-form.png` (390×844), `-list-desktop.png` (1280×900). Это один действующий FinRate, без новой палитры/шрифтов/поверхностей.

- [Нейтральная светлая, WebKit](../../Source/evidence/p2/screenshots/webkit-neutral-light-list.png)
- [Нейтральная тёмная, WebKit](../../Source/evidence/p2/screenshots/webkit-neutral-dark-list.png)
- [Цветная светлая, WebKit](../../Source/evidence/p2/screenshots/webkit-color-light-list.png)
- [Цветная тёмная, WebKit](../../Source/evidence/p2/screenshots/webkit-color-dark-list.png)
- [ПК, цветная тёмная, Chromium](../../Source/evidence/p2/screenshots/chromium-color-dark-list-desktop.png)

Геометрия дополнительно проверена на 320/375/390/402/430 px, 844×390 и ПК; крупный текст — на 320 px. Промежуточное переполнение min-content на 320 px обнаружено тестами и устранено только в списках долгов (`minmax(0,1fr)`/`--peer-gap`); старые CSS-правила сохранены. Первоначальные ошибки тестовых селекторов закрытия и гонки автоматически исчезающих notices сохранены в протоколах и не объявляются дефектами финансовой модели.
