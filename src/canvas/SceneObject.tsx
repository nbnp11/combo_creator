import type { KonvaEventObject } from "konva/lib/Node";
import { Circle, Group, Text } from "react-konva";
import { useProjectStore } from "../store/projectStore";
import { interpolate } from "../timeline/interpolator";
import type { BallData, ObjectData, PlayerData } from "../types";

interface Props {
  obj: ObjectData;
}

/** Рендер одного объекта сцены в текущий момент времени (по интерполяции его трека). */
export default function SceneObject({ obj }: Props) {
  const currentTime = useProjectStore((s) => s.currentTime);
  const selectedId = useProjectStore((s) => s.selectedId);
  const select = useProjectStore((s) => s.select);
  const setKeyframe = useProjectStore((s) => s.setKeyframe);

  const pos = interpolate(obj.track, currentTime);
  const isSelected = selectedId === obj.id;

  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
    setKeyframe(obj.id, {
      time: currentTime,
      x: e.target.x(),
      y: e.target.y(),
      rotation: pos.rotation,
    });
  };

  if (!obj.visible) return null;

  return (
    <Group
      x={pos.x}
      y={pos.y}
      rotation={pos.rotation}
      draggable
      onMouseDown={() => select(obj.id)}
      onDragEnd={handleDragEnd}
    >
      {obj.kind === "player" && <PlayerShape data={obj} selected={isSelected} />}
      {obj.kind === "ball" && <BallShape data={obj} selected={isSelected} />}
    </Group>
  );
}

function PlayerShape({ data, selected }: { data: PlayerData; selected: boolean }) {
  const { radius } = data;
  return (
    <>
      <Circle
        radius={radius}
        fill={data.color}
        stroke={selected ? "#ffeb3b" : "#ffffff"}
        strokeWidth={selected ? 4 : 2}
      />
      <Text
        text={String(data.number)}
        fontSize={radius}
        fontStyle="bold"
        fill="#ffffff"
        align="center"
        verticalAlign="middle"
        width={radius * 2}
        height={radius * 2}
        x={-radius}
        y={-radius}
        listening={false}
      />
    </>
  );
}

function BallShape({ data, selected }: { data: BallData; selected: boolean }) {
  return (
    <Circle
      radius={data.radius}
      fill={data.color}
      stroke={selected ? "#ffeb3b" : "#333333"}
      strokeWidth={selected ? 3 : 1}
    />
  );
}
