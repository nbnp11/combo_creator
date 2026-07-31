import type { ObjectData, ProjectSettings } from "../types";
import { toProjectSchema } from "./schema";

export { toProjectSchema };

export function downloadProjectJson(settings: ProjectSettings, objects: ObjectData[]): void {
  const data = toProjectSchema(settings, objects);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "combo.json";
  a.click();
  URL.revokeObjectURL(a.href);
}
