# FinRate: ручной UI-only Pages release · 11.11.2026

Это публикационный пакет из PR #19 и #20 без использования Codex и без запуска кастомных GitHub Actions.
JavaScript, криптографическое ядро, модель финансовых операций и IndexedDB **не изменяются**.

Сборка страницы выполнена **эквивалентной вставкой CSS** в существующий проверенный inline bundle: было исходное `Source/src/style.css`, стало `Source/src/style.css` плюс два независимых UI-исправления. Содержимое `<script>` **побайтно не изменено**, CSP script hash, manifest, icons и PWA storage policy прежние. В Workbox `sw.js` изменён только revision записи `index.html` на git-blob SHA нового файла, чтобы офлайн-кэш обнаружил обновление; остальные записи не тронуты.

Изменённые файлы:
- `Source/src/style.css`
- `index.html` и `Source/dist/index.html` (CSS, встроенный в существующий HTML)
- `Source/FinRate.html` (CSS в standalone-экспорте)
- `sw.js` и `Source/dist/sw.js` (только precache revision)
- `.nojekyll` для прямой публикации файлов GitHub Pages без Jekyll
- два старых описания PR и новый unit-test D-092

Проверки **PASS**: совпадение исходного CSS и предсобранного CSS; формат обновления source→public; идентичность root/dist; отсутствие изменений JS и CSP; единичность и корректность Workbox revision; CSS bracket balance; source-level regression D-092.

**NOT RUN**: `npm run build`, `npm test`, `npm run check:release`, браузерный тест реального FinRate и аппаратный Safari/PWA. Эта ручная CSS-only поставка не заменяет воспроизводимый полноценный build. `Source/evidence/build.json` не перезаписывался и остаётся свидетельством предыдущей сборки; его нельзя считать результатом нового тестирования.

**D-092 нельзя считать решённым** до проверки системной верхней полосы на настоящем iPhone. Копии финансовой базы не получались/не сбрасывались. Удалять PWA для проверки запрещено. При проблеме откатывать только кодовые файлы из предыдущего `main`; это **не** возврат пользовательских данных.
