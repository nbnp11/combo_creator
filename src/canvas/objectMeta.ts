import type { ObjectData, ObjectKind } from "../types";

/** Подпись объекта в UI (таймлайн, панель слоёв). Единый источник человекочитаемых имён. */
export function objectLabel(o: ObjectData): string {
  switch (o.kind) {
    case "player":
      return `Игрок #${o.number}`;
    case "ball":
      return "Мяч";
    case "arrow":
      return "Стрелка";
    case "circle":
      return "Круг";
    case "text":
      return `Текст: ${o.text || "—"}`;
    case "rectangle":
      return "Прямоугольник";
    case "highlight":
      return "Подсветка";
  }
}

/** Короткая эмодзи-иконка для панели слоёв. */
export const KIND_ICON: Record<ObjectKind, string> = {
  player: "●",
  ball: "○",
  arrow: "→",
  circle: "◯",
  text: "T",
  rectangle: "▭",
  highlight: "░",
};
