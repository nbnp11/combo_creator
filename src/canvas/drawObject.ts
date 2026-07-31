import Konva from "konva";
import type { ObjectData } from "../types";

const SEL_STROKE = "#ffeb3b";

/**
 * Императивная отрисовка фигур одного объекта в Konva.Group.
 * Единый источник рендера: используется и в редакторе (SceneObject), и в offscreen-экспорте GIF.
 * Координаты фигур — ЛОКАЛЬНЫЕ относительно группы (позиция объекта задаётся на самом Group).
 * Существующие children группы предварительно удаляются.
 *
 * @param selected подсветка выделения (в экспорте всегда false).
 */
export function drawObjectInto(group: Konva.Group, obj: ObjectData, selected: boolean): void {
  group.destroyChildren();

  switch (obj.kind) {
    case "player": {
      const { radius } = obj;
      group.add(
        new Konva.Circle({
          radius,
          fill: obj.color,
          stroke: selected ? SEL_STROKE : "#ffffff",
          strokeWidth: selected ? 4 : 2,
        }),
        new Konva.Text({
          text: String(obj.number),
          fontSize: radius,
          fontStyle: "bold",
          fill: "#ffffff",
          align: "center",
          verticalAlign: "middle",
          width: radius * 2,
          height: radius * 2,
          x: -radius,
          y: -radius,
          listening: false,
        }),
      );
      break;
    }
    case "ball": {
      group.add(
        new Konva.Circle({
          radius: obj.radius,
          fill: obj.color,
          stroke: selected ? SEL_STROKE : "#333333",
          strokeWidth: selected ? 3 : 1,
        }),
      );
      break;
    }
    case "arrow": {
      group.add(
        new Konva.Arrow({
          points: [0, 0, obj.points[0], obj.points[1]],
          stroke: obj.stroke,
          fill: obj.stroke,
          strokeWidth: obj.strokeWidth,
          pointerLength: 14,
          pointerWidth: 14,
          hitStrokeWidth: Math.max(obj.strokeWidth, 12),
        }),
      );
      break;
    }
    case "circle": {
      group.add(
        new Konva.Circle({
          radius: obj.radius,
          stroke: obj.stroke,
          fill: obj.fill,
          strokeWidth: 2,
        }),
      );
      break;
    }
    case "text": {
      // грубая оценка ширины для центрирования
      const approxWidth = Math.max(obj.fontSize * obj.text.length * 0.6, obj.fontSize);
      group.add(
        new Konva.Text({
          text: obj.text,
          fontSize: obj.fontSize,
          fontStyle: "bold",
          fill: obj.fill,
          align: "center",
          verticalAlign: "middle",
          width: approxWidth,
          height: obj.fontSize * 1.3,
          x: -approxWidth / 2,
          y: (-obj.fontSize * 1.3) / 2,
          listening: false,
        }),
      );
      break;
    }
    case "rectangle": {
      group.add(
        new Konva.Rect({
          width: obj.width,
          height: obj.height,
          x: -obj.width / 2,
          y: -obj.height / 2,
          stroke: obj.stroke,
          fill: obj.fill,
          strokeWidth: 2,
        }),
      );
      break;
    }
    case "highlight": {
      group.add(
        new Konva.Rect({
          width: obj.width,
          height: obj.height,
          x: -obj.width / 2,
          y: -obj.height / 2,
          fill: obj.color,
          opacity: obj.opacity,
          strokeWidth: 0,
        }),
      );
      break;
    }
  }
}
