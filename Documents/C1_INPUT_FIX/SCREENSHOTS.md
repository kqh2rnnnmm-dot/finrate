# Снимки до/после

До: неизменённый main 4d3eccf. После: корректировка c1-input02. Только синтетические данные. Исходные IMG_2646/IMG_2647 не были доступны в среде.

**keyboard-model означает модель VisualViewport, не настоящую клавиатуру iPhone.** На снимке показан layout viewport целиком; его нижняя область вне уменьшенного VisualViewport соответствует месту, занятому моделируемой клавиатурой. Эти изображения не подтверждают поведение нативной клавиатуры iOS. Playwright WebKit здесь работает на Linux.

| Сценарий | До | После |
|---|---|---|
| Примечание, light, полный экран | [До](../../Source/evidence/c1fix-before-note-light-full.png) | [После](../../Source/evidence/c1fix-after-note-light-full.png) |
| Примечание, dark, полный экран | [До](../../Source/evidence/c1fix-before-note-dark-full.png) | [После](../../Source/evidence/c1fix-after-note-dark-full.png) |
| Примечание, light, модель клавиатуры | [До](../../Source/evidence/c1fix-before-note-light-keyboard-model.png) | [После](../../Source/evidence/c1fix-after-note-light-keyboard-model.png) |
| Примечание, dark, модель клавиатуры | [До](../../Source/evidence/c1fix-before-note-dark-keyboard-model.png) | [После](../../Source/evidence/c1fix-after-note-dark-keyboard-model.png) |
| Сумма дохода, light, модель клавиатуры | [До](../../Source/evidence/c1fix-before-amount-light-keyboard-model.png) | [После](../../Source/evidence/c1fix-after-amount-light-keyboard-model.png) |
| Сумма дохода, dark, модель клавиатуры | [До](../../Source/evidence/c1fix-before-amount-dark-keyboard-model.png) | [После](../../Source/evidence/c1fix-after-amount-dark-keyboard-model.png) |
| Кредитная форма, light | [До](../../Source/evidence/c1fix-before-nested-credit-form-light.png) | [После](../../Source/evidence/c1fix-after-nested-credit-form-light.png) |
| Кредитная форма, dark | [До](../../Source/evidence/c1fix-before-nested-credit-form-dark.png) | [После](../../Source/evidence/c1fix-after-nested-credit-form-dark.png) |
| Вложенное имя, light | [До](../../Source/evidence/c1fix-before-nested-name-light-keyboard-model.png) | [После](../../Source/evidence/c1fix-after-nested-name-light-keyboard-model.png) |
| Вложенное имя, dark | [До](../../Source/evidence/c1fix-before-nested-name-dark-keyboard-model.png) | [После](../../Source/evidence/c1fix-after-nested-name-dark-keyboard-model.png) |
| WebKit: заметка, light, модель клавиатуры | [До](../../Source/evidence/c1fix-before-webkit-note-light-keyboard-model.png) | [После](../../Source/evidence/c1fix-after-webkit-note-light-keyboard-model.png) |
| WebKit: заметка, dark, модель клавиатуры | [До](../../Source/evidence/c1fix-before-webkit-note-dark-keyboard-model.png) | [После](../../Source/evidence/c1fix-after-webkit-note-dark-keyboard-model.png) |

Заметка в тесте — 500 символов, с абзацами, пробелами, длинным словом и HTML-подобным фрагментом. Числовое поле проверено во вложенном мастере плана. До прозрачный backdrop и основной экран видны за границей уменьшенного редактора; после фон изолирован. Точную маленькую высоту textarea из пользовательского iPhone вне iOS воспроизвести не удалось — не выдаём эти пары за её нативное воспроизведение.
