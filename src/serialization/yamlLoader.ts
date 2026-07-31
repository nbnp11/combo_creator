import { parse } from "yaml";
import type { ProjectSchema } from "../types";
import { fromProjectSchema } from "./schema";

export async function loadProjectYamlFile(file: File): Promise<ProjectSchema> {
  const text = await file.text();
  return fromProjectSchema(parse(text));
}
