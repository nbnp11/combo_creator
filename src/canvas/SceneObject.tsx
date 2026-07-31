import type Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import { useEffect, useRef } from "react";
import { Group } from "react-konva";
import { useProjectStore } from "../store/projectStore";
import { interpolate } from "../timeline/interpolator";
import type { ObjectData } from "../types";
import { drawObjectInto } from "./drawObject";

const SNAP_GRID = 20; // px, шаг сетки привязки

interface Props {
  obj: ObjectData;
}

/**
 * Рендер одного объекта сцены в текущий момент времени.
 * Позиция (x/y/rotation) берётся из интерполяции трека и задаётся на Konva.Group.
 * Сами фигуры рисуются императивно через общий drawObjectInto (тот же код, что в экспорте GIF),
 * чтобы редактор и экспорт всегда совпадали.
 *
 * Поддержка мультиселекта: Shift+клик добавляет объект к выделению.
 * Снаппинг: при включённой привязке позиция драга округляется до сетки.
 */
export default function SceneObject({ obj }: Props) {
  const currentTime = useProjectStore((s) => s.currentTime);
  const selectedIds = useProjectStore((s) => s.selectedIds);
  const select = useProjectStore((s) => s.select);
  const setKeyframe = useProjectStore((s) => s.setKeyframe);
  const snapEnabled = useProjectStore((s) => s.snapEnabled);
  const interpolation = useProjectStore((s) => s.settings.interpolation ?? "linear");
  const groupRef = useRef<Konva.Group>(null);

  const pos = interpolate(obj.track, currentTime, interpolation);
  const isSelected = selectedIds.includes(obj.id);

  // Перерисовка фигур при смене данных объекта или выделения.
  // Позиционные обновления (playback) сюда не попадают — они применяются к Group через props.
  useEffect(() => {
    const node = groupRef.current;
    if (!node) return;
    drawObjectInto(node, obj, isSelected);
  }, [obj, isSelected]);

  if (!obj.visible) return null;

  const snapVal = (v: number) => Math.round(v / SNAP_GRID) * SNAP_GRID;

  const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
    if (!snapEnabled) return;
    const node = e.target;
    node.x(snapVal(node.x()));
    node.y(snapVal(node.y()));
  };

  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
    let x = e.target.x();
    let y = e.target.y();
    if (snapEnabled) {
      x = snapVal(x);
      y = snapVal(y);
    }
    setKeyframe(obj.id, { time: currentTime, x, y, rotation: pos.rotation });
  };

  return (
    <Group
      ref={groupRef}
      x={pos.x}
      y={pos.y}
      rotation={pos.rotation}
      draggable
      onMouseDown={(e) => select(obj.id, e.evt.shiftKey)}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    />
  );
}
