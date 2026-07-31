# Foundation — Combo Creator

## Цель этапа
Поднять собираемый, линтуемый, тестируемый проект (React + TS + Vite) с CI, зависимостями и типизированным скелетом — фундамент для core-mvp.

## Контекст (из дизайн-дока + грилла)
- Greenfield-репо: рабочая директория `/Users/podsechka/work/combo_creator` уже содержит `.git`, `.gitignore` (`!docs`), `docs/design.md`. **Кода/package.json нет.**
- Зафиксировано: рендерер **Konva.js** (+`react-konva`), экспортёр **gif.js**, state **zustand**, база **Biome + Vitest + GitHub Actions**.
- Модель данных — **только keyframes** (линейная интерполяция); **мяч входит в MVP**. Подробная модель — в core-mvp, здесь только базовые типы.

## Non-goals
- MP4-экспорт и ffmpeg.wasm.
- Мульти-спорт (поле регби-only).

## Соглашения по задачам
- Каждая задача содержит конкретные шаги и **verification gate** (команда + ожидаемый результат + STOP-условия). Исполнитель с нулевым контекстом выполняет по порядку, прогоняет gate, при провале — STOP и разбирается (не «зелёнить» вручную).
- Указанные версии пакетов — последние стабильные на момент исполнения; если `npm i` ставит мажор новее и что-то ломается — зафиксируй рабочую версию в `package.json`.
- Команды выполняются из корня репо.

## Ожидаемый результат этапа
- `npm run build`, `npm run typecheck`, `npm run test`, `npm run lint` — все зелёные локально.
- CI-конфиг `.github/workflows/ci.yml` валиден и прогоняет lint/typecheck/test/build.
- Скелет папок `src/{canvas,timeline,editor,export,serialization,store,config,types}` и базовые типы (`src/types/index.ts`) компилируются.