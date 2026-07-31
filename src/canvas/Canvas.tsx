import type { KonvaEventObject } from "konva/lib/Node";
import { Layer, Stage } from "react-konva";
import { FIELD } from "../config/field";
import { useProjectStore } from "../store/projectStore";
import Field from "./Field";
import SceneObject from "./SceneObject";

export default function Canvas() {
  const objects = useProjectStore((s) => s.objects);
  const select = useProjectStore((s) => s.select);

  // Клик по пустому месту (таргет — сам Stage, т.к. фигуры поля non-listening) снимает выделение.
  const handleStageMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) select(null);
  };

  return (
    <Stage width={FIELD.width} height={FIELD.height} onMouseDown={handleStageMouseDown}>
      <Layer>
        <Field />
        {[...objects]
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((o) => (
            <SceneObject key={o.id} obj={o} />
          ))}
      </Layer>
    </Stage>
  );
}
