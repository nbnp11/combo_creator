import type { InterpolationMode } from "../timeline/interpolator";

export type ObjectKind =
  | "player"
  | "ball"
  | "arrow"
  | "circle"
  | "text"
  | "rectangle"
  | "highlight";

export interface Keyframe {
  time: number; // секунды
  x: number;
  y: number;
  rotation?: number; // градусы
}

export interface BaseObjectData {
  id: string;
  kind: ObjectKind;
  visible: boolean;
  zIndex: number;
  track: Keyframe[]; // ключевые кадры этого объекта, отсортированы по time
}

export interface PlayerData extends BaseObjectData {
  kind: "player";
  number: number;
  team: "blue" | "red";
  color: string;
  radius: number;
}

export interface BallData extends BaseObjectData {
  kind: "ball";
  radius: number;
  color: string;
}

export interface ArrowData extends BaseObjectData {
  kind: "arrow";
  points: [number, number]; // конец стрелки относительно позиции объекта (локальные координаты группы)
  stroke: string;
  strokeWidth: number;
}

export interface CircleData extends BaseObjectData {
  kind: "circle";
  radius: number;
  stroke: string;
  fill: string;
}

export interface TextData extends BaseObjectData {
  kind: "text";
  text: string;
  fontSize: number;
  fill: string;
}

export interface RectangleData extends BaseObjectData {
  kind: "rectangle";
  width: number;
  height: number;
  stroke: string;
  fill: string;
}

export interface HighlightData extends BaseObjectData {
  kind: "highlight";
  width: number;
  height: number;
  color: string;
  opacity: number;
}

export type ObjectData =
  | PlayerData
  | BallData
  | ArrowData
  | CircleData
  | TextData
  | RectangleData
  | HighlightData;

export type ProjectSettings = {
  fps: 15 | 24 | 30;
  size: 720 | 1080 | 1440;
  durationSec: number;
  /** Режим интерполяции треков (глобально). Отсутствует в старых файлах — трактуется как linear. */
  interpolation?: InterpolationMode;
};

export type ProjectSchema = {
  schemaVersion: number;
  field: "rugby";
  settings: ProjectSettings;
  objects: ObjectData[]; // каждый объект со своим треком ключей
};
