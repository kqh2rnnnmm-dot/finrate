# FinRate PATCH C1: результаты проверок

Pull Request: https://github.com/kqh2rnnnmm-dot/finrate/pull/1 — открыт, не слит.

Сборка `c1-ui01`, пакет `0.3.4-c1`. База `16253c181eae43512c7159d28ad31f610ec033d6` (main); 7/7 исходных публичных файлов побайтно совпали с архивом B1.2.1. Исходный код отсутствовал в GitHub и импортирован в Source/ отдельным коммитом. Ветка `codex/c1-unified-ui-ux`.

## Итог

- `npm ci`: PASS, зафиксированные зависимости; новых runtime-зависимостей нет.
- `npm run check:release` + адресные повторы и `node tools/resume-c1-release.mjs`: **31/31 PASS**; сборка, 277 модульных тестов, браузерные сценарии и проверка поставки.
- C1 browser: **13/13 групп PASS**, ошибок runtime нет. Chromium, 320/375/390/428/1280 CSS px, light/dark. B1.2.1 дополнительно 320/375/402/430/736, обе темы.
- Финансовые функции, схема, шифрование, хранилище, PIN, reset и service-worker исходник: побайтно прежние. SHA-256 baseline защищает все исходные модули вне явного списка C1. Проверены финансовые итоги после правки note и неизменность ciphertext при чтении всех видов операций.
- CSP, offline, семь публичных файлов, отсутствие внешних runtime-сервисов: PASS.
- Публичный HTML SHA-256: `9f82e146b5c7098e689a0257c94e0696df24935ba5d661d53649863eb2948c7d`.
- Реальный iPhone/Safari/PWA/VoiceOver: **SKIP, требуется приёмка владельца**, не объявлены выполненными.
- main не изменён, публикация и миграция/очистка пользовательской базы не выполнялись. В security/reset тестах используются только изолированные синтетические контексты localhost.

Предварительный рабочий прогон содержал таймауты разблокировки combined/control; он не используется как выпускное доказательство. Сохранены c1-initial-release-run.json, c1-initial-control-browser.json и c1-initial-combined-browser.log. Отдельный повтор combined прошёл 23 проверки. После фиксации сборки основной прогон выявил два устаревших ожидания тестов: прямой редактор вместо просмотра заметки и старый build ID B1.2.1 в обновлении. Исправлены только сценарии; все исходные проверки текста, CRLF, лимита, прокрутки, ciphertext и offline сохранены. Их адресные повторы прошли. Resume C1 по существующему в проекте паттерну проверяет тот же SHA-256 публичного HTML, объединяет успешные этапы и выполняет оставшиеся performance/verify. Итог — release-run.json, 31/31 PASS; это агрегированный выпускной набор, а не заявление о чистом проходе первой команды. Предыдущий результат сохранён как c1-before-resume-release-run.json. Причина предварительных таймаутов достоверно не установлена.

## Выпускные этапы

| Этап | Результат | Секунды |
|---|---|---:|
| release-build | PASS | 0.52 |
| patch-unit | PASS | 17.69 |
| c1-browser | PASS | 10.14 |
| b12-browser | PASS | 17.35 |
| b1-period-sync-browser | PASS | 7.7 |
| b1-browser | PASS | 7.47 |
| b11-browser | PASS | 23.36 |
| r30-browser | PASS | 8.79 |
| edge-lifecycle-browser | PASS | 18.69 |
| credit-browser | PASS | 13.97 |
| notice-motion-browser | PASS | 12.31 |
| entryfix-browser | PASS | 18.0 |
| combined-browser | PASS | 32.19 |
| security-lifecycle-browser | PASS | 5.46 |
| history-browser | PASS | 17.23 |
| compact-scroll-browser | PASS | 10.87 |
| feedback-browser | PASS | 15.38 |
| security-browser | PASS | 44.81 |
| modality-browser | PASS | 8.8 |
| home-browser | PASS | 20.96 |
| layout-browser | PASS | 18.57 |
| revision-browser | PASS | 35.75 |
| shell-browser | PASS | 36.98 |
| control-browser | PASS | 39.01 |
| patch-navigation | PASS | 10.79 |
| patch-lists | PASS | 15.24 |
| patch-forms | PASS | 7.17 |
| unified-browser | PASS | 0.0 |
| patch-upgrade | PASS | 0.0 |
| patch-list-performance | PASS | 7.31 |
| verify-delivery | PASS | 0.06 |

## Модули и артефакты

C1 production: `field-editor.mjs`, `focus.mjs`, `ui.mjs`, `management.mjs`, `activity-ui.mjs`, `planning-ui.mjs`, `surfaces.mjs`, `navigation.mjs`, `style.css`, `help.mjs`, `app.mjs` (только build ID). Инструменты: package/lock version, build/release/verify-delivery; новый C1 baseline и browser test. Полный diff отделён от первоначального импорта B1.2.1 коммитами.

[Карта компонентов и всех существующих полей](C1_UI_INVENTORY.md). [Приёмка на iPhone](C1_IPHONE_ACCEPTANCE.md).

Скриншоты в Source/evidence: c1-home.png, c1-operation.png, c1-account.png, c1-note-light.png, c1-note-dark.png, c1-editor.png; b121-*.png показывают планы/категории. Логи и JSON каждого этапа в той же папке. Источник доказательств: release-run.json и c1-browser.json. Публичные файлы корня побайтно равны Source/dist.

Статус: **C1 разработан и протестирован автоматически, ожидает приёмки на устройстве**. Не «полностью принят». Следующие D1/G1/A1/A2/A3 не реализованы.

## Источники проекта ChatGPT

Подготовлены обновлённые версии существующих источников, без автоматической подмены активного проекта: `00_START_HERE.md`, `02_DECISIONS.md`, `03_CHECKPOINT.md`, `04_SOURCES.md`, `09_UX_SPEC_v0.1.md`, `12_UI_BEHAVIOR_CONTRACT_v0.1.md`, `13_MODULE_MAP.md`, `14_PATCH_ROADMAP_AFTER_B1_2026-10-23.md`, `FAQ_B1.md` в Documents/. Исторические разделы сохранены. Новый код доступен непосредственно в Source/ этой ветки; старый ZIP B1.2.1 не обозначается актуальным C1. Дополнительные отчёты не требуют новых слотов из лимита 25. Пользователю не требуется загружать сборку в GitHub вручную.
