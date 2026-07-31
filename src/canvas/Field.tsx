import { Line, Rect } from "react-konva";
import { getFieldMarks } from "./fieldMarks";

/** Поле регби (упрощённая разметка). Источник разметки — getFieldMarks().
 *  Все фигуры non-listening: клик по пустому полю доходит до Stage → снятие выделения. */
export default function Field() {
  const marks = getFieldMarks();
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
