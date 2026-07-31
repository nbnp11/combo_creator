import GIF from "gif.js";
import workerUrl from "gif.js/dist/gif.worker.js?url";
import Konva from "konva";
import { drawObjectInto } from "../canvas/drawObject";
import { getFieldMarks } from "../canvas/fieldMarks";
import { FIELD } from "../config/field";
import type { InterpolationMode } from "../timeline/interpolator";
import { interpolate } from "../timeline/interpolator";
import type { ObjectData, ProjectSettings } from "../types";

/** Императивная отрисовка поля регби на Konva-слой (общая для offscreen-экспорта). */
function addFieldToLayer(layer: Konva.Layer): void {
  const marks = getFieldMarks();
  layer.add(
    new Konva.Rect({
      x: 0,
      y: 0,
      width: FIELD.width,
      height: FIELD.height,
      fill: FIELD.background,
      listening: false,
    }),
  );
  for (const l of marks.lines) {
    layer.add(
      new Konva.Line({
        points: l.points,
        stroke: l.stroke,
        strokeWidth: l.strokeWidth,
        listening: false,
      }),
    );
  }
}

/** Императивная отрисовка одного объекта в момент t через общий drawObjectInto. */
function addObjectToLayer(
  layer: Konva.Layer,
  obj: ObjectData,
  t: number,
  mode: InterpolationMode,
): void {
  if (!obj.visible) return;
  const p = interpolate(obj.track, t, mode);
  const group = new Konva.Group({ x: p.x, y: p.y, rotation: p.rotation, listening: false });
  drawObjectInto(group, obj, false); // selected=false: в экспорте подсветки нет
  layer.add(group);
}

/**
 * Детерминированный offscreen-рендер всей анимации в GIF.
 * Поле вписывается в settings.size по ширине; кадров = durationSec*fps.
 */
export async function exportGif(
  objects: ObjectData[],
  settings: ProjectSettings,
  onProgress?: (p: number) => void,
): Promise<Blob> {
  const scale = settings.size / FIELD.width;
  const W = FIELD.width * scale;
  const H = FIELD.height * scale;
  const totalFrames = Math.max(1, Math.round(settings.durationSec * settings.fps));
  const delay = Math.round(1000 / settings.fps);

  const gif = new GIF({ workers: 2, quality: 10, workerScript: workerUrl, width: W, height: H });

  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-99999px";
  document.body.appendChild(container);

  const stage = new Konva.Stage({ width: FIELD.width, height: FIELD.height, container });
  const layer = new Konva.Layer();
  stage.add(layer);

  const sorted = [...objects].sort((a, b) => a.zIndex - b.zIndex);
  const mode = settings.interpolation ?? "linear";

  try {
    for (let i = 0; i < totalFrames; i++) {
      const t = i / settings.fps;
      layer.destroyChildren();
      addFieldToLayer(layer);
      for (const obj of sorted) addObjectToLayer(layer, obj, t, mode);
      layer.draw();
      const canvas = stage.toCanvas({ pixelRatio: scale });
      gif.addFrame(canvas, { delay, copy: true });
      onProgress?.((i + 1) / totalFrames);
    }
  } finally {
    stage.destroy();
    container.remove();
  }

  return new Promise<Blob>((resolve) => {
    gif.on("finished", (blob: Blob) => resolve(blob));
    gif.render();
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
