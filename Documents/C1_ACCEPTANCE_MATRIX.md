# C1: фактический статус матрицы

PASS ниже означает автоматическую/браузерную проверку. Аппаратная приёмка не выполнена. Все ссылки на логи относительны корню репозитория: `Source/evidence/`; сценарии — `Source/tests/`. Итог выпуска — C1_TEST_REPORT.md.

| ID | Автоматическая проверка | Доказательство | Настоящий iPhone |
|---|---|---|---|
| C1-SHELL-01 | PASS | c1-browser, shell/layout; матрица ширин и тем | SKIP: safe-area, клавиатура и возврат PWA требуют устройства |
| C1-SHELL-02 | PASS | compact-scroll, lists/performance, navigation, forms | SKIP |
| C1-NAV-01 | PASS | unified/navigation, c1-browser | SKIP |
| C1-NAV-02 | PASS | c1-browser: Continue/Discard/Save; unified: write failure | SKIP |
| C1-INPUT-01 | PASS | c1-browser, money-input unit, unified | SKIP |
| C1-INPUT-02 | PASS в Chromium, включая модель VisualViewport | c1-browser: Enter и закрытие цифровой клавиатуры | SKIP: штатная клавиатура iOS не проверена |
| C1-TEXT-01 | PASS по CSS/браузерным жестам | style.css, combined/navigation | SKIP: системное меню iOS не проверено |
| C1-TEXT-02 | PASS по доступности выделения в браузере | c1-browser, note-content user-select=text | SKIP: системное копирование iOS не проверено |
| C1-MENU-01 | PASS | combined, b12, navigation: hold/drag/release/cancel | SKIP |
| C1-STYLE-01 | PASS | b12, unified, layout; скриншоты обеих тем | SKIP: крупный текст и WebKit |
| C1-STYLE-02 | PASS | C1_UI_INVENTORY, b12/category/credit/forms | SKIP |
| C1-NOTES-01 | PASS | C1_UI_INVENTORY: все реально существующие поля, без новых полей | SKIP: ручной сквозной обход |
| C1-NOTES-02 | PASS | c1-browser: четыре вида операций, счёт, история, comment; полный текст | SKIP |
| C1-NOTES-03 | PASS | c1-browser, unified: guard, ciphertext, 500, отказ записи | SKIP |
| C1-NOTES-04 | PASS | c1-browser: буквальный img/onerror, нет HTML-элементов | Не требуется для автоматической проверки |
| C1-GESTURE-01 | PASS в Chromium touch | navigation: список остаётся в Операциях; dock scrub | SKIP: системные жесты iOS |
| C1-FAQ-01 | PASS | help.mjs, FAQ_B1.md; существующие названия сохранены | Ручное чтение желательно |
| C1-REG-01 | PASS | 277 unit; b1/b11/b12/credit/period-sync; notes totals equality | Контрольные сценарии B1.2.1 остаются в плане |
| C1-REG-02 | PASS | security/lifecycle/control/offline/upgrade; 41/52 исходника побайтно прежние | Пользовательская база не затронута |
| C1-RELEASE-01 | PASS после сохранения итогового коммита и PR | release-run.json, C1_PUBLIC_SHA256.json, рабочая ветка | main/Pages не публикуются |

Сценарии аппаратной приёмки: [C1_IPHONE_ACCEPTANCE.md](C1_IPHONE_ACCEPTANCE.md). Статус «полностью принят» не присваивается.
