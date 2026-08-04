import type Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import { useEffect, useRef, useState } from "react";
import { Group } from "react-konva";
import { FIELD } from "../config/field";
import { useProjectStore } from "../store/projectStore";
import type { BallData, ObjectData } from "../types";
import { type DrawFlags, drawObjectInto } from "./drawObject";
import { carrierAt, nearestPlayer, PASS_REACH, resolvePosition } from "./resolvePosition";

const SNAP_STEP = FIELD.gridStep / 2; // привязка к узлу или центру квадрата

interface Props {
  obj: ObjectData;
}

/**
 * Рендер одного объекта сцены в текущий момент времени.
 * Позиция (x/y/rotation) берётся из resolvePosition (для мяча-«липучки» — производная
 * от владельца) и задаётся на Konva.Group. Фигуры рисуются через общий drawObjectInto.
 *
 * Поведение драга:
 *  - игрок/прочие: перемещение → setKeyframe (мяч-владелец едет сам, т.к. его позиция производная);
 *  - мяч: перетаскивание = попытка передачи. На драге подсвечивается ближайший игрок-приёмник
 *    (синее кольцо). На drop: попадание в игрока (≤PASS_REACH) → setBallCarrier (передача/подбор),
 *    промах привязанного мяча → возврат к владельцу, промах свободного мяча → движение по своему треку.
 *
 * Drag-guard: пока идёт драг (local dragging), x/y/rotation не прокидываются пропсами —
 * позиция управляется Konva, иначе react-konva сбрасывал бы её при ре-рендере (напр. при смене receiverId).
 */
export default function SceneObject({ obj }: Props) {
  const objects = useProjectStore((s) => s.objects);
  const currentTime = useProjectStore((s) => s.currentTime);
  const selectedIds = useProjectStore((s) => s.selectedIds);
  const select = useProjectStore((s) => s.select);
  const setKeyframe = useProjectStore((s) => s.setKeyframe);
  const snapEnabled = useProjectStore((s) => s.snapEnabled);
  const interpolation = useProjectStore((s) => s.settings.interpolation ?? "linear");
  const step = useProjectStore((s) => s.settings.stepSec ?? 1);
  const setBallCarrier = useProjectStore((s) => s.setBallCarrier);
  const setReceiver = useProjectStore((s) => s.setReceiver);
  const receiverId = useProjectStore((s) => s.receiverId);
  const groupRef = useRef<Konva.Group>(null);
  const [dragging, setDragging] = useState(false);

  const pos = resolvePosition(objects, obj, currentTime, interpolation, step);
  const isSelected = selectedIds.includes(obj.id);

  const ball = objects.find((o): o is BallData => o.kind === "ball");
  const isCarrier =
    obj.kind === "player" && ball != null && carrierAt(ball, currentTime) === obj.id;
  const isReceiver = obj.kind === "player" && receiverId === obj.id;

  // Перерисовка фигур при смене данных объекта, выделения или индикаторов владельца/приёмника.
  useEffect(() => {
    const node = groupRef.current;
    if (!node) return;
    const flags: DrawFlags | undefined =
      obj.kind === "player" ? { carrier: isCarrier, receiver: isReceiver } : undefined;
    drawObjectInto(node, obj, isSelected, flags);
  }, [obj, isSelected, isCarrier, isReceiver]);

  if (!obj.visible) return null;

  const snapVal = (v: number) => Math.round(v / SNAP_STEP) * SNAP_STEP;

  const handleDragStart = () => setDragging(true);

  const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
    if (obj.kind === "ball") {
      const near = nearestPlayer(
        objects,
        currentTime,
        interpolation,
        step,
        e.target.x(),
        e.target.y(),
        PASS_REACH,
      );
      setReceiver(near?.id ?? null);
      return;
    }
    if (!snapEnabled) return;
    const node = e.target;
    node.x(snapVal(node.x()));
    node.y(snapVal(node.y()));
  };

  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
    setDragging(false);
    setReceiver(null);
    const x = e.target.x();
    const y = e.target.y();

    if (obj.kind === "ball") {
      const near = nearestPlayer(objects, currentTime, interpolation, step, x, y, PASS_REACH);
      const ballObj = objects.find((o): o is BallData => o.kind === "ball");
      const wasAttached = !!(ballObj && carrierAt(ballObj, currentTime));
      if (near) {
        setBallCarrier(near.id); // передача / подбор
      } else if (!wasAttached) {
        // свободный мяч — двигаем по своему треку
        setKeyframe(obj.id, { time: currentTime, x, y, rotation: pos.rotation });
      }
      // привязанный мяч + промах → ничего (вернётся к владельцу через resolvePosition)
      return;
    }

    let nx = x;
    let ny = y;
    if (snapEnabled) {
      nx = snapVal(nx);
      ny = snapVal(ny);
    }
    setKeyframe(obj.id, { time: currentTime, x: nx, y: ny, rotation: pos.rotation });
  };

  return (
    <Group
      ref={groupRef}
      {...(dragging ? {} : { x: pos.x, y: pos.y, rotation: pos.rotation })}
      draggable
      onMouseDown={(e) => select(obj.id, e.evt.shiftKey)}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    />
  );
}
