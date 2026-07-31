import { SCHEMA_VERSION } from "../store/projectStore";
import type { ObjectData, ProjectSchema, ProjectSettings } from "../types";

export function toProjectSchema(settings: ProjectSettings, objects: ObjectData[]): ProjectSchema {
  return { schemaVersion: SCHEMA_VERSION, field: "rugby", settings, objects };
}

export function downloadProjectJson(settings: ProjectSettings, objects: ObjectData[]): void {
  const data = toProjectSchema(settings, objects);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "combo.json";
  a.click();
  URL.revokeObjectURL(a.href);
}
