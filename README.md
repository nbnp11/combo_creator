# Combo Creator

Веб-редактор регбийных комбинаций: создание, анимация ключевых кадрами, экспорт в GIF.

## Стек
React + TypeScript + Vite · Konva.js · gif.js · zustand · Biome · Vitest · GitHub Actions.

## Скрипты
- `npm run dev` — запуск dev-сервера
- `npm run build` — продакшн-сборка
- `npm run typecheck` — проверка типов
- `npm run lint` / `npm run format` — Biome
- `npm run test` — Vitest

## Модель данных
Только ключевые кадры (keyframes) + линейная интерполяция. Пас/удар = перемещение объекта «мяч». MP4 и мульти-спорт — non-goals.
