# UI-редизайн — PlaybookBuilder

Утверждённый прототип: `.taskman/plans/combo-ui-redesign/prototypes/playbookbuilder-manrope/v001.html` (и v002 палитра). Переносим визуальный язык в кодовую базу (сейчас весь UI — inline-стили, без CSS).

## Дизайн-язык (из прототипа)
**Минимум, плоский текстовый UI, без SVG-иконок.** Группировка тулбара плоскими группами с тонкими разделителями и микро-подписями. Палитра цветов вместо ввода хекса.

### Токены (CSS-переменные в `:root`, `src/index.css`)
```
--bg:#0f1115; --panel:#16191f; --panel-2:#1b1f27; --panel-3:#222732;
--border:#262b34; --border-soft:#1f242c;
--text:#e8eaee; --text-dim:#8b929e; --text-faint:#5b626d;
--accent:#2fd17a; --accent-deep:#10b573; --accent-ink:#062417;
--danger:#ef4f4f;
--ui:"Manrope",sans-serif; --mono:"Azeret Mono",monospace;
```
Inline-стили компонентов используют `var(--…)`.

### Шрифты
- UI/всё: **Manrope** (400/500/600/700/800).
- Моно (только таймкод `00:02.4`): **Azeret Mono** (500/600).
- Подписи групп/сайдбаров — Manrope 600 uppercase + letter-spacing.
- Подключение: `<link>` (preconnect + css2) в `index.html`; `@import` не нужен.

### Палитра цветов (8, константа `COLORS`)
`["#1e88e5","#e53935","#ffffff","#1a1a1a","#fdd835","#fb8c00","#8e24aa","#00acc1"]`
(синий, красный, белый, чёрный, жёлтый, оранжевый, фиолетовый, бирюзовый — контрастны на зелёном поле). Выбранный свотч — двойное кольцо (`box-shadow` через `--panel`+`--accent`).

## Структура работы
1. **`src/index.css`** — `:root` токены, базовый reset (body bg/font), импорт в `main.tsx`. Шрифты + `<title>PlaybookBuilder</title>` в `index.html`.
2. **`src/ui/`** — переиспользуемые компоненты (inline-стили на токенах):
   - `Button({variant:"default"|"danger"|"active", …})` — плоский текст, hover `--panel-3`.
   - `ButtonGroup({label, children})` — подпись + кнопки; разделитель между группами (`border-left:1px solid var(--border-soft)`).
   - `Field({label, children})`, `TextInput`, `NumberInput`, `Select` — стилизованные `.ctrl` (bg `--panel-2`, border, focus-кольцо акцентом).
   - `Palette({value, onChange})` — 8 свотчей.
   - `Dropdown({label, items:[{label,onClick}], caret})` — кнопка + caret, открывает меню (JSON/YAML), закрытие по клику на бэкдроп.
   - `COLORS` — экспорт константы палитры.
3. **Toolbar** (`src/canvas/Toolbar.tsx`) — бренд `Playbook·Builder` + группы:
   - История: Отменить/Вернуть (disabled из `useHistory`).
   - Добавить: Игрок/Мяч/Стрелка/Круг/Текст/Прямоуг/Зона (фабрики addObject).
   - Правка: Дублировать, Удалить (danger), Сетка (active toggle).
   - Файл: Сохранить ▾ (JSON/YAML), Открыть ▾ (JSON/YAML) — через Dropdown.
   - CTA: Экспорт GIF (справа, accent, `margin-left:auto`).
   - Сохранить всю существующую логику (export progress, file inputs, clear() после load).
4. **LayersPanel** (`src/canvas/LayersPanel.tsx`) — side-head «Слои»; строка: имя (клик=выделение, shift=мультиселект) + мелкие ↑/↓ (z-order) + × (удалить) + чекбокс видимости (`accent-color`). Выделение — `box-shadow inset 3px accent`. Без SVG.
5. **PropertiesPanel** (`src/editor/PropertiesPanel.tsx`) — side-head «Свойства · <kind>»; поля через Field/Input/Select; **все цветовые поля → Palette** (color/stroke/fill). Сцена при пустом/множественном выделении (fps/size/duration/interpolation). Сохранить все поля по kind + rotation.
6. **Timeline** (`src/timeline/Timeline.tsx`) — рестайлинг под токены: play-кнопка accent «Воспроизвести/Пауза», таймкод моно (`--mono`, `tabular-nums`), плейхед/маркеры акцентом, строки/линейка на панельных цветах. Логику не трогать.
7. **App** (`src/App.tsx`) — topbar (бренд+тулбар одной строкой, h≈50) / body (Layers 224 | Canvas-Stage | Properties 268) / Timeline. Stage: тёмный radial-фон, канвас по центру.
8. **Дефолтные цвета → палитра** (hex, без rgba): `createPlayer` color `#1e88e5`; `TEAM_COLORS` blue `#1e88e5`/red `#e53935`; `createCircle` fill `#fdd835`; `createRectangle` fill `#1a1a1a`; `createHighlight` color `#fdd835`. (Тесты используют свои хардкод-цвета — не затронуты.)

## Non-goals
- Не переименовывать package.json/repo (пользователь сделает сам). Бренд в UI и `<title>` — PlaybookBuilder.
- Канвас остаётся фиксированного размера 1050×750 (координатная система); «поле во весьstage» — эстетика прототипа, в коде канвас центрируется в тёмной stage-области.

## Ожидаемый результат
- `npm run lint && typecheck && test && build` зелёные; существующие 23 теста не сломаны.
- Визуально совпадает с утверждённым прототипом; все функции работают (undo/redo, add, duplicate, delete, snap, save/open JSON+YAML, export GIF, layers z-order/visibility, properties palette, hotkeys).