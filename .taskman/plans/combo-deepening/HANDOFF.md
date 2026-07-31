# Deepening — Combo Creator

## Цель этапа
Нарастить MVP до полного видения дизайн-дока: **остальные объекты** (Arrow/Circle/Text/Rectangle/Highlight), **панель Properties**, **undo/redo**, **горячие клавиши**, **снаппинг/мультиселект/дублирование**, **YAML**, **панель Layers**, опционально **сглаживание интерполяции**. Ядро модели данных не меняется — те же keyframes.

## Что уже есть (из core-mvp)
- Поле, Player, Ball, drag→upsert ключей, Timeline, playback, экспорт GIF, JSON save/load.
- Чистый `interpolate(track, t)` (линейный) с тестами; store `useProjectStore` с actions; `ProjectSchema` с `schemaVersion` + миграции; offscreen-рендер для экспорта в `export/gifExporter.ts`.

## Ключевые принципы
- Новые объекты — тоже `extends BaseObjectData` (несут `track`), рендерятся через ту же модель `interpolate`. Новые типы попадают в `ObjectData` union и в offscreen-рендер экспорта (иначе их не будет в GIF).
- Undo/redo — поверх снапшотов проекта (zustand temporal/zundo или ручные стеки past/future). Любое action, меняющее `objects/settings`, толкает историю.
- Горячие клавиши не срабатывают при фокусе в `<input>` (properties/текст).

## Non-goals (по-прежнему)
- MP4, мульти-спорт.

## Соглашения
- Каждая задача: шаги + **verification gate** (команда/ручная проверка + ожидаемый результат + STOP). Новую чистую логику (easing/Catmull-Rom, YAML-миграции) покрывать unit-тестами.
- Согласованность экспорта: каждый новый объект должен рендериться одинаково и в канвасе, и в offscreen-рендере GIF (держи `drawObject`/`drawField` общими).

## Ожидаемый результат этапа
- `npm run lint && typecheck && test && build` зелёные; CI зелёный.
- Полный сценарий: создаются все типы объектов, редактируются в Properties, undo/redo и горячие клавиши работают, YAML- и JSON-round-trip идентичны, экспорт GIF содержит все объекты.