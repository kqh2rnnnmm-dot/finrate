# PATCH A3 · пароль, PIN и защита доступа

Pull Request: [https://github.com/kqh2rnnnmm-dot/finrate/pull/8](https://github.com/kqh2rnnnmm-dot/finrate/pull/8) — открыт для приёмки, без merge/deploy.

[Утверждённое задание](TASK.md) · [матрица](ACCEPTANCE_MATRIX.md) · [аудит и дефекты](AUDIT.md) · [тесты](TEST_REPORT.md) · [Face/Touch ID: NEEDS-DEVICE](BIOMETRY_FEASIBILITY.md) · [снимки](SCREENSHOTS.md) · [iPhone](IPHONE_ACCEPTANCE.md) · [остатки](OPEN_ITEMS.md).

Основа — main `7abfe0e` после A2. Ветка `codex/a3-security-access`, `a3-access01` / `0.3.9-a3`. Существующая защита сохранена; исправлены секретные формы/фон, mode switch, текущий одинаковый пароль и доступ в соседней вкладке. Системные подсказки AutoFill добавлены без собственного хранилища паролей; реальный iPhone ещё требует проверки. Биометрический вход не включён.

Нет merge/deploy/очистки рабочей базы/новой криптографической архитектуры. При будущем merge владелец отдельно разрешает действие и сохраняет предыдущий main резервной веткой. A2 принят без аппаратной проверки; незакрытые G1/заметки не объявлены исправленными в A3.
