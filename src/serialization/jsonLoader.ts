import type { ProjectSchema } from "../types";
import { fromProjectSchema } from "./schema";

export { fromProjectSchema };

export async function loadProjectFile(file: File): Promise<ProjectSchema> {
  const text = await file.text();
  return fromProjectSchema(JSON.parse(text));
}
