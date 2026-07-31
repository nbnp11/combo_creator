import { FIELD } from "../config/field";

export interface FieldRect {
  x: number;
  y: number;
  width: number;
  height: number;
  stroke: string;
  strokeWidth: number;
  fill?: string;
}

export interface FieldLine {
  points: number[];
  stroke: string;
  strokeWidth: number;
}

export interface FieldMarks {
  background: FieldRect;
  rects: FieldRect[];
  lines: FieldLine[];
}

/**
 * Декларативное описание регбийной разметки (упрощённой) в условных единицах поля FIELD.
 * Используется и в react-konva Field.tsx, и в offscreen-рендере экспорта GIF — единый источник разметки.
 */
export function getFieldMarks(): FieldMarks {
  const { width, height, background, lineColor } = FIELD;
  return {
    background: { x: 0, y: 0, width, height, fill: background, stroke: lineColor, strokeWidth: 3 },
    rects: [],
    lines: [
      // центральная (halfway) линия
      { points: [width / 2, 0, width / 2, height], stroke: lineColor, strokeWidth: 2 },
      // try-линии (упрощённо)
      { points: [width * 0.1, 0, width * 0.1, height], stroke: lineColor, strokeWidth: 2 },
      { points: [width * 0.9, 0, width * 0.9, height], stroke: lineColor, strokeWidth: 2 },
      // 22-метровые (упрощённо)
      { points: [width * 0.25, 0, width * 0.25, height], stroke: lineColor, strokeWidth: 1 },
      { points: [width * 0.75, 0, width * 0.75, height], stroke: lineColor, strokeWidth: 1 },
    ],
  };
}
