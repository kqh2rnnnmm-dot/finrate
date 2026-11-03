# Корректирующий C1: итог проверок

База main: `4d3eccf143fd4644bfed46fbc655f00424b959bb`. Ветка: `codex/c1-input-geometry-fix`. Сборка `c1-input02`, пакет `0.3.5-c1-fix`.

## Результат

- npm ci: PASS, зафиксированный lockfile; новых runtime-зависимостей нет.
- Модульные тесты: **277/277 PASS**, FAIL 0, SKIP 0.
- Релизный набор: **33/33 PASS** (агрегированный результат основного check:release, адресного повтора и resume на том же SHA-256).
- Адресная геометрия: Chromium и Playwright WebKit/Linux; 320/375/390/402/430 CSS px, 844×390 landscape, 1280 desktop; обе темы; полная высота и уменьшенный VisualViewport. Три группы сценариев в каждом движке: одна текстовая прокрутка/геометрия, клавиатура/caret/guard/данные, вложенная сумма.
- Дополнительный c1-input-surfaces-browser: **2/2 PASS**, обе темы, вложенная кредитная форма/имя/сумма, восстановление родительского скролла и неизменность ciphertext.
- Все 7 публичных файлов корня идентичны Source/dist. CSP, precache, offline/обновление, no external runtime services: PASS.
- Сравнение с main: **47/52 исходных файлов побайтно прежние**, включая финансовую модель, кредитные расчёты, планирование, операции, store/crypto/PIN/reset/копии и исходник service worker. app отличается только ID сборки. Новый C1_CORRECTION_BASELINE_SHA256.json, старые baseline-файлы не переписаны.
- HTML SHA-256: `a808f76baa876875e1d68fbb0a33dacc9c33b61719712b4f9d98707a9bdfcb21`.

## Команды и прозрачность повтора

`PLAYWRIGHT_BROWSERS_PATH=/tmp/finrate-browsers PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 FINRATE_TEST_WEBKIT=1 npm run check:release`

WebKit установлен для тестов в /tmp с локальными библиотеками; стандартная проверка системной установки пропущена, фактический headless WPE WebKit запущен. Это не обход браузерных assertions и не изменение приложения. В другой среде нужен штатный Playwright WebKit с установленными библиотеками.

Основной прогон упал только на старом сравнении `innerText` у скрытого #app в тесте общего периода: новый полноэкранный ввод намеренно скрывает фон. Assertions сумм сохранены; тест читает текст фоновой модели через textContent. Повтор `node tests/b1-period-sync-browser.mjs`: все 8 групп PASS, включая пять режимов, сохранение периода, операции и offline. Финансовый код не изменялся.

`node tools/resume-c1-input-release.mjs` проверил совпадение SHA-256 готового HTML, единственность известного failed-этапа, успешность повтора и выполнил оставшиеся performance/verify. Он не пропускает неизвестные ошибки. Предыдущий итог сохранён в c1fix-before-resume-release-run.json; первый прогон не выдаётся за чистый PASS. Текущий release-run.json — итог 33 этапов на идентичном приложении.

Отдельный тест nested-forms сравнивает скролл непосредственно перед нажатием видимого поля, после штатного scrollIntoView браузера; ожидание от положения до автоматического раскрытия поля было скорректировано в harness, не в приложении.

## Этапы

| Проверка | Результат | Секунды / повтор |
|---|---|---:|
| release-build | PASS | 0.53 |
| patch-unit | PASS | 18.23 |
| c1-input-geometry | PASS | 6.22 |
| c1-input-geometry-webkit | PASS | 7.06 |
| c1-browser | PASS | 9.92 |
| b12-browser | PASS | 17.21 |
| b11-browser | PASS | 23.37 |
| b1-browser | PASS | 7.68 |
| r30-browser | PASS | 8.42 |
| edge-lifecycle-browser | PASS | 18.27 |
| credit-browser | PASS | 14.12 |
| notice-motion-browser | PASS | 12.47 |
| combined-browser | PASS | 31.25 |
| entryfix-browser | PASS | 16.52 |
| security-lifecycle-browser | PASS | 4.72 |
| security-browser | PASS | 42.19 |
| history-browser | PASS | 16.15 |
| compact-scroll-browser | PASS | 10.37 |
| feedback-browser | PASS | 14.62 |
| home-browser | PASS | 19.06 |
| modality-browser | PASS | 7.77 |
| revision-browser | PASS | 35.08 |
| layout-browser | PASS | 17.96 |
| shell-browser | PASS | 34.8 |
| control-browser | PASS | 36.53 |
| unified-browser | PASS | 86.5 |
| patch-navigation | PASS | 11.01 |
| patch-lists | PASS | 14.66 |
| patch-forms | PASS | 6.78 |
| patch-upgrade | PASS | 39.98 |
| b1-period-sync-browser | PASS | адресный повтор |
| patch-list-performance | PASS | 7.63 |
| verify-delivery | PASS | 0.08 |

## Артефакты и пределы

- [Диагностика и системный аудит](AUDIT.md), [карта представлений](SURFACE_INVENTORY.md).
- [До/после в обеих темах](SCREENSHOTS.md), данные измерений c1fix-before/after*-measurements.json в Source/evidence.
- Итоги geometry.json/nested-forms.json и логи каждого этапа в Source/evidence; публичные хэши C1_INPUT_FIX_PUBLIC_SHA256.json.
- **Реальный iPhone/Safari/PWA/VoiceOver — SKIP.** Изображения keyboard-model — модель VisualViewport без настоящей клавиатуры. Точный маленький textarea из IMG_2646 вне iOS не воспроизведён, хотя структурная зависимость от flex/процентной высоты устранена. Исходные IMG_2646/IMG_2647 не были доступны как файлы.
- [Аппаратный список проверки](IPHONE_ACCEPTANCE.md): состояние «готово к повторной аппаратной приёмке», не «полностью принято».

main и текущий Pages не изменены. Слияния, сторонней публикации, очистки пользовательской базы и будущих пакетов не было. Только синтетические записи в изолированных контекстах localhost. Обновления FAQ и checkpoint отражают только реализованный код и перечисленные ограничения.
