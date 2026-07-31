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

// arrow/circle/text/rectangle/highlight добавляются на этапе deepening.
export type ObjectData = PlayerData | BallData;

export interface ProjectSettings {
  fps: 15 | 24 | 30;
  size: 720 | 1080 | 1440;
  durationSec: number;
}

export interface ProjectSchema {
  schemaVersion: number;
  field: "rugby";
  settings: ProjectSettings;
  objects: ObjectData[]; // каждый объект со своим треком ключей
}
