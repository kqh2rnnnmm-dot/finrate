# G1: отчёт проверки

03.11.2026 · `g1-theme01` (`0.3.7-g1`), main `025fa8e` после D1. PR: https://github.com/kqh2rnnnmm-dot/finrate/pull/4 — открыт, не объединён.

Итог: **43/43 итоговых этапов PASS**, 283/283 unit/integration PASS, 20/20 нейтральных PNG идентичны. SHA-256 HTML: `ad6bad5b2bca53412135af706c8f33f4e09c264eda9143dc489b32c06fd1b833`. Цветная светлая минимум 4.6542:1, тёмная 4.6078:1; reduced-transparency минимум 4.5422:1. Измерения в обоих движках и все 336×2 раскладки PASS.

Команда: `PLAYWRIGHT_BROWSERS_PATH=/tmp/finrate-browsers PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 FINRATE_TEST_WEBKIT=1 npm run check:release`. Browser-пути относятся только к среде проверки. `node tools/compare-g1-neutral.mjs` сверяет PNG одного runtime. Runtime приложения не имеет внешних сервисов.

| Проверка | Содержание |
|---|---|
| Unit/integration | 283 теста: прежние финансовые/защитные инварианты + optional defaults, независимые фильтры, priority/FIFO, required errors/retry callbacks, genuine immutable snapshot, encrypted legacy/new roundtrip |
| G1 financial Chromium/WebKit | Обе палитры/темы: реальные expense/income/transfer Save; открытие snapshot, отсутствие compact ×; inert/X/outside/свайп; FIFO двух разных действий и отдельные суммы; без повторных записей |
| G1 required Chromium/WebKit | Финансовые/системные отдельно off и master off; ошибка записи видна дольше прежних 8s, ciphertext/форма прежние; явный retry даёт одну операцию; предупреждение security.none не скрыто; правильный вход убирает старую ошибку; pagehide очищает раскрытые данные; VisualViewport 390 и вертикальная доступность ошибки |
| Настройки Chromium/WebKit | 12 комбинаций palette/appearance/system, реальное settings.save/reload, system change без reload, fixed modes, theme-color/color-scheme, top/bottom/theme неизменны; четыре набора flags; фактическое восстановление старой защищённой копии нейтрально, без финансовых изменений |
| Основные экраны Chromium/WebKit | По 336 геометрий: 12 экранов × 7 размеров × 2 палитры × 2 темы. Проверяются реальный целевой экран безопасности, отсутствие горизонтального выхода/обрезания поверхности и скрытых записей |
| Контраст | 44 вычисленные пары на цветную светлую/тёмную × оба движка; отдельные 44×2 Chromium reduced-transparency. Каждая ≥4.5:1. Точные минимумы ниже в итоговой фиксации. Нейтральные токены не переназначались |
| Неизменность нейтральной | 20 PNG: 10 прежних экранов × 2 темы на 390×844; сравнение одного runtime с актуальным main. Settings и новое содержание FAQ исключены как функциональные добавления G1 |
| Сохранённые регрессии | C1/D1 editor/1–6 блоков/chooser/guards, B1/B1.1/B1.2/R30 деньги/планы/кредиты/возвраты, списки/performance, история, поиск, формы/сплиты, security/lifecycle/PIN/копии, обновление SW/CSP |

[Машинная сводка](../../Source/evidence/release-run.json) · [Консоль](../../Source/evidence/g1-release-console.log) · [Unit TAP](../../Source/evidence/patch-unit.log) · [Delivery SHA guards](../../Source/evidence/delivery-verification.json) · [Семь публичных файлов](../../Source/G1_PUBLIC_SHA256.json).

Новые browser-отчёты: `g1-after-all-chromium.json`, `g1-after-all-webkit.json`, `g1-theme-after-all-{engine}.json`, `g1-required-{engine}.json`; матрицы/контраст и [PNG](SCREENSHOTS.md) лежат рядом в evidence. Точные значения цветов/производных — [PALETTE](PALETTE.md).

## Изменения тестовых ожиданий

Required error имеет duration=0 вместо8000. Явное разрешение ошибки отделено от обычного сообщения. Helpers закрытия в combined/credit/unified-browser используют свайп для financial без ×; финансовые assertions не ослаблялись. Ожидаемый build для upgrade — g1-theme01. Формат целых рублей остаётся штатным без лишних .00. Тесты выявили и помогли исправить ложный dirty guard optional/checkbox settings и гонку быстрого tap.

Повтор старого credit smoke после адаптации закрытия дал 19/19 проверок; исходный отказ был перехватом клика финансовым сообщением, а не ошибкой денег. Аналогичное ожидание закрытия адаптировано в unified smoke; все 44 его проверки сохранены. Основные financial assertions сохранены. Фактическое восстановление копии создаёт safety-версию, поэтому последующая визуальная матрица получает отдельный одноразовый профиль: сравниваются одинаковые fixtures, база владельца не очищается. Финальное продолжение `node tools/resume-g1-release.mjs` допускается только при совпадении SHA-256 HTML, только двух ожидаемых harness-отказах (credit/unified) и успешных повторных отчётах. Исходная сводка сохраняется отдельно.

## Границы доказательства

45/52 исходных src-файлов побайтно совпадают с main; добавлены три UI-only файла. App проверяется точной нормализацией разрешённой обвязки G1; остальные финансовые/входные обработчики совпадают. Model/SCHEMA/crypto/store/PIN/backup/reset/session-policy и D1 editor/layout/launcher не менялись. Пользовательский профиль/база/ключи/копии не открывались и не сбрасывались: все browser fixtures в одноразовых контекстах, все финансовые суммы вымышлены.

Это автоматические проверки Chromium/WebKit Linux. Safari/PWA, нативная клавиатура, статусная строка и VoiceOver на iPhone ещё требуют [аппаратной приёмки](IPHONE_ACCEPTANCE.md). D1-замечания заметок не объявляются закрытыми. G1 не слит и не опубликован; A1/A2/A3 не начинались, источники ChatGPT автоматически не заменялись.
