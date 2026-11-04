# Снимки A2

Все данные вымышленные. Это Chromium/WebKit Linux, не фотографии настоящего iPhone. Скриншоты keyboard — **модель VisualViewport**, без нарисованной системной клавиатуры.

## Новые диалоги

| Тема / палитра | Три режима | Финансовые данные | Данные и категории | Полный сброс |
|---|---|---|---|---|
| light / neutral | [Выбор](../../Source/evidence/a2/screenshots/chromium-light-neutral-modes.png) | [Обзор](../../Source/evidence/a2/screenshots/chromium-light-neutral-financial-preview.png) · [Финал](../../Source/evidence/a2/screenshots/chromium-light-neutral-financial-confirm-action.png) | [Обзор](../../Source/evidence/a2/screenshots/chromium-light-neutral-categories-preview.png) · [Финал](../../Source/evidence/a2/screenshots/chromium-light-neutral-categories-confirm-action.png) | [Обзор](../../Source/evidence/a2/screenshots/chromium-light-neutral-all-preview.png) · [Финал](../../Source/evidence/a2/screenshots/chromium-light-neutral-all-confirm-action.png) |
| light / color | [Выбор](../../Source/evidence/a2/screenshots/chromium-light-color-modes.png) | [Обзор](../../Source/evidence/a2/screenshots/chromium-light-color-financial-preview.png) · [Финал](../../Source/evidence/a2/screenshots/chromium-light-color-financial-confirm-action.png) | [Обзор](../../Source/evidence/a2/screenshots/chromium-light-color-categories-preview.png) · [Финал](../../Source/evidence/a2/screenshots/chromium-light-color-categories-confirm-action.png) | [Обзор](../../Source/evidence/a2/screenshots/chromium-light-color-all-preview.png) · [Финал](../../Source/evidence/a2/screenshots/chromium-light-color-all-confirm-action.png) |
| dark / neutral | [Выбор](../../Source/evidence/a2/screenshots/chromium-dark-neutral-modes.png) | [Обзор](../../Source/evidence/a2/screenshots/chromium-dark-neutral-financial-preview.png) · [Финал](../../Source/evidence/a2/screenshots/chromium-dark-neutral-financial-confirm-action.png) | [Обзор](../../Source/evidence/a2/screenshots/chromium-dark-neutral-categories-preview.png) · [Финал](../../Source/evidence/a2/screenshots/chromium-dark-neutral-categories-confirm-action.png) | [Обзор](../../Source/evidence/a2/screenshots/chromium-dark-neutral-all-preview.png) · [Финал](../../Source/evidence/a2/screenshots/chromium-dark-neutral-all-confirm-action.png) |
| dark / color | [Выбор](../../Source/evidence/a2/screenshots/chromium-dark-color-modes.png) | [Обзор](../../Source/evidence/a2/screenshots/chromium-dark-color-financial-preview.png) · [Финал](../../Source/evidence/a2/screenshots/chromium-dark-color-financial-confirm-action.png) | [Обзор](../../Source/evidence/a2/screenshots/chromium-dark-color-categories-preview.png) · [Финал](../../Source/evidence/a2/screenshots/chromium-dark-color-categories-confirm-action.png) | [Обзор](../../Source/evidence/a2/screenshots/chromium-dark-color-all-preview.png) · [Финал](../../Source/evidence/a2/screenshots/chromium-dark-color-all-confirm-action.png) |

Те же состояния WebKit лежат в этой папке с префиксом `webkit-`. Снимки `*-confirm.png` показывают начало финального обзора, `*-confirm-action.png` — опасную кнопку и подтверждение после прокрутки. Все состояния проверены на 7 размерах; screenshots сняты при ширине 390.

## До / после G1

| Состояние | Исходный G1 | A2 |
|---|---|---|
| light/neutral | [До](../../Source/evidence/a2/screenshots/before-chromium-light-neutral-toast.png) | [После](../../Source/evidence/a2/screenshots/after-chromium-light-neutral-toast.png) |
| light/color | [До](../../Source/evidence/a2/screenshots/before-chromium-light-color-toast.png) | [После](../../Source/evidence/a2/screenshots/after-chromium-light-color-toast.png) |
| dark/neutral | [До](../../Source/evidence/a2/screenshots/before-chromium-dark-neutral-toast.png) | [После](../../Source/evidence/a2/screenshots/after-chromium-dark-neutral-toast.png) |
| dark/color | [До](../../Source/evidence/a2/screenshots/before-chromium-dark-color-toast.png) | [После](../../Source/evidence/a2/screenshots/after-chromium-dark-color-toast.png) |

Короткий toast привязан к модельной системной области; крупные сообщения резервируют место для заголовка. Положение относительно часов/Dynamic Island проверяется отдельно на iPhone. Плавность жеста подтверждают проверки первого кадра/отмены/очереди, статический PNG её не доказывает.

## Редактор заметки

- Модель открытой клавиатуры/пана: [до](../../Source/evidence/a2/screenshots/before-chromium-note-keyboard-pan.png), [после](../../Source/evidence/a2/screenshots/after-chromium-note-keyboard-pan.png).
- После скрытия модельной клавиатуры: [до](../../Source/evidence/a2/screenshots/before-chromium-note-no-keyboard.png), [после](../../Source/evidence/a2/screenshots/after-chromium-note-no-keyboard.png).

Это проверка сохранения существующего редактора. Неуточнённое замечание после D1 не объявляется исправленным. Аналогичные after-снимки WebKit находятся в той же папке.
