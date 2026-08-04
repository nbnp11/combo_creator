import { stringify } from "yaml";
import type { ObjectData, ProjectSettings } from "../types";
import { toProjectSchema } from "./schema";

/** Сериализация проекта в YAML-строку (та же схема, что для JSON). */
export function projectToYaml(settings: ProjectSettings, objects: ObjectData[]): string {
  return stringify(toProjectSchema(settings, objects));
}

export function downloadProjectYaml(settings: ProjectSettings, objects: ObjectData[]): void {
  const text = projectToYaml(settings, objects);
  const blob = new Blob([text], { type: "text/yaml" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "playbook.yaml";
  a.click();
  URL.revokeObjectURL(a.href);
}
