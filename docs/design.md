
# Цели проекта

Вход:

- создание комбинации с нуля;
- открытие JSON/YAML файла.

Выход:

- GIF;
- MP4;
- PNG кадр;
- JSON/YAML.

---

# Стек

```
React
TypeScript
Vite

Konva.js
или PixiJS

gif.js
или ffmpeg.wasm

zustand
```

Почему Konva:

- drag&drop
- Canvas
- масштабирование
- линии
- стрелки
- анимации

Практически всё уже есть.

---

# Архитектура

```
src/

canvas/
    Field.ts
    Player.ts
    Ball.ts
    Arrow.ts

timeline/
    Timeline.ts
    Interpolator.ts

editor/
    Selection.ts
    Drag.ts
    Snap.ts

export/
    GifExporter.ts
    Mp4Exporter.ts

serialization/
    JsonLoader.ts
    JsonSaver.ts
```

---

# Модель данных

```
Project

Players
Objects
Timeline
Settings
```

```
Project

players
events
frames
```

---

## Игрок

```
Player

id
number
team

color

radius
```

---

## Кадр

```
Frame

time

players[]

objects[]
```

---

## Позиция

```
PlayerState

id

x
y

rotation

hasBall
```

---

# Анимация

Самое важное.

НЕ хранить положение игроков каждые 20 мс.

Хранить только ключевые кадры.

```
0 сек

9

↓

2 сек

9

↓

5 сек

9
```

Между ними делать линейную интерполяцию.

Это резко уменьшает размер файлов.

---

# Timeline

Наподобие Premiere.

```
-------------------------------------------------

0      1      2      3      4

Players
Ball
Text
Arrows

-------------------------------------------------
```

---

# Объекты

Все элементы наследуются от BaseObject.

```
BaseObject

id

type

visible

zIndex
```

Потом

```
Player

Ball

Arrow

Circle

Text

Rectangle

Highlight
```

Поэтому можно рисовать вообще всё.

---

# События

Вместо хранения кадров можно хранить действия.

Например

```
Move

Pass

Kick

Wait

Rotate

Show

Hide

Highlight
```

Получается

```
timeline:

- move:
    player: 9
    to: [50, 20]
    duration: 2

- move:
    player: 10
    to: [70, 35]
    duration: 2

- pass:
    from: 9
    to: 10
    duration: 0.4
```

Такой файл легко читать человеку.

---

# Формат проекта

```
project.json

field

players

timeline

settings
```

Пример

```
{
  "field":"rugby",

  "players":[
    {
      "id":9,
      "team":"blue"
    }
  ],

  "timeline":[

    {
      "type":"move",
      "player":9,
      "to":[200,100],
      "duration":2
    },

    {
      "type":"pass",
      "from":9,
      "to":10
    }

  ]
}
```

---

# Интерфейс

Я бы сделал максимально похожим на Figma.

```
──────────────────────────────

Toolbar

──────────────────────────────

Layers | Canvas | Properties

──────────────────────────────

Timeline

──────────────────────────────
```

### Canvas

Поле.

### Layers

```
Players

Ball

Arrows

Texts
```

### Properties

```
Color

Radius

Duration

Speed

Rotation
```

---

# Горячие клавиши

```
Space
Play

← →
Следующий кадр

Ctrl+D
Дублировать

Delete

Ctrl+S

Ctrl+Z
```

---

# Экспорт

При экспорте:

```
Canvas

↓

каждый кадр

↓

PNG

↓

GIF encoder
```

Пользователь выбирает

```
FPS

15

24

30
```

Размер

```
720

1080

1440
```

---

# MVP (1–2 недели)

- поле;
- игроки;
- drag&drop;
- timeline;
- ключевые кадры;
- play;
- экспорт GIF;
- сохранение JSON.

Уже на этом этапе получится создавать большинство регбийных комбинаций.