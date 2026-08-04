import { Circle, Line, Rect } from "react-konva";
import { FIELD } from "../config/field";
import { useProjectStore } from "../store/projectStore";
import { getFieldMarks } from "./fieldMarks";

/** Поле регби: разметка (getFieldMarks) + опциональная сетка-квадраты с узлами привязки.
 *  Все фигуры non-listening: клик по пустому полю доходит до Stage → снятие выделения. */
export default function Field() {
  const marks = getFieldMarks();
  const snapEnabled = useProjectStore((s) => s.snapEnabled);
  const { width, height, gridStep } = FIELD;

  // Линии сетки и точки-узлы (пересечения) — рисуются только при вкл. привязке.
  const vLines: number[] = [];
  const hLines: number[] = [];
  const dots: { x: number; y: number }[] = [];
  if (snapEnabled) {
    for (let x = gridStep; x < width; x += gridStep) vLines.push(x);
    for (let y = gridStep; y < height; y += gridStep) hLines.push(y);
    for (let x = 0; x <= width; x += gridStep) {
      for (let y = 0; y <= height; y += gridStep) dots.push({ x, y });
    }
  }

  return (
    <>
      <Rect
        x={marks.background.x}
        y={marks.background.y}
        width={marks.background.width}
        height={marks.background.height}
        fill={marks.background.fill}
        stroke={marks.background.stroke}
        strokeWidth={marks.background.strokeWidth}
        listening={false}
      />

      {/* Сетка-квадраты (фоновая, поверх заливки, под разметкой) */}
      {snapEnabled && (
        <>
          {vLines.map((x) => (
            <Line
              key={`gv-${x}`}
              points={[x, 0, x, height]}
              stroke="rgba(255,255,255,0.16)"
              strokeWidth={1}
              listening={false}
            />
          ))}
          {hLines.map((y) => (
            <Line
              key={`gh-${y}`}
              points={[0, y, width, y]}
              stroke="rgba(255,255,255,0.16)"
              strokeWidth={1}
              listening={false}
            />
          ))}
          {dots.map((d) => (
            <Circle
              key={`gd-${d.x}-${d.y}`}
              x={d.x}
              y={d.y}
              radius={1.6}
              fill="rgba(255,255,255,0.6)"
              listening={false}
            />
          ))}
        </>
      )}

      {/* Регбийная разметка (ярче сетки) */}
      {marks.rects.map((r) => (
        <Rect
          key={`rect-${r.x}-${r.y}`}
          x={r.x}
          y={r.y}
          width={r.width}
          height={r.height}
          stroke={r.stroke}
          strokeWidth={r.strokeWidth}
          listening={false}
        />
      ))}
      {marks.lines.map((l) => (
        <Line
          key={`line-${l.points.join("-")}`}
          points={l.points}
          stroke={l.stroke}
          strokeWidth={l.strokeWidth}
          listening={false}
        />
      ))}
    </>
  );
}
