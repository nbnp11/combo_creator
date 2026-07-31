# Core MVP — Combo Creator

## Цель этапа
Рабочее MVP: **поле → игроки/мяч → drag&drop → timeline+ключевые кадры → play → экспорт GIF → сохранение/загрузка JSON**. После этапа пользователь может создать базовую комбинацию (в т.ч. пас/удар через перемещение мяча), проиграть и выгрузить GIF.

## Что уже есть (из foundation)
- Vite/React/TS + Biome + Vitest + GitHub Actions; скрипты `dev/build/typecheck/test/lint`.
- Зависимости: `konva`, `react-konva`, `zustand`, `gif.js` (+ шим типов).
- Скелет: `src/{canvas,timeline,editor,export,serialization,store,config}`.
- Типы в `src/types/index.ts`: `Keyframe`, `BaseObjectData`, `PlayerData`, `BallData`, `ObjectData`, `ProjectSettings`, `ProjectSchema`. Каждый объект несёт свой `track: Keyframe[]`.

## Ключевые принципы (keyframes-only)
- Время — секунды (`currentTime`, `durationSec`). Позиция объекта в момент `t` = **линейная интерполяция** по его `track` (чистая функция `interpolate`, с unit-тестами).
- **Пас/удар = ключевые кадры объекта «мяч»** (никаких событий/резолвера).
- Перетаскивание объекта на канвасе в момент `t` → upsert ключевого кадра `{time: t, x, y}` в его трек.
- Сериализация `ProjectSchema` с `schemaVersion` + хук миграции (готовность к будущим версиям).

## Non-goals (в этом этапе)
- MP4, мульти-спорт, undo/redo, горячие клавиши, YAML, объекты кроме Player/Ball, снаппинг/мультиселект — всё это в `combo-deepening`.

## Соглашения
- Каждая задача: шаги + **verification gate** (команда/ручная проверка + ожидаемый результат + STOP-условия).
- Чистую логику покрывать unit-тестами (Vitest): `interpolate` (граничные/clamping/несортированный), сериализация (round-trip + миграция версии).
- UI-задачи: gate = `npm run build` зелёный + описанный ручной сценарий в dev-сервере.

## Ожидаемый результат этапа
- `npm run build && npm run test` зелёные.
- Сценарий QA (в t-010) проходится вручную в `npm run dev`: создать игроков+мяч, переместить их в разные моменты времени (ключевые кадры), проиграть анимацию, экспортировать GIF, сохранить/открыть JSON.