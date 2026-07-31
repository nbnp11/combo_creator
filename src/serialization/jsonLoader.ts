import { SCHEMA_VERSION } from "../store/projectStore";
import type { ProjectSchema } from "../types";

/**
 * Карта миграций по версии схемы. Ключ v → функция, превращающая данные версии v в данные версии v+1.
 * Сейчас версия 1 — миграций нет. Добавлять сюда по мере роста schemaVersion.
 */
const migrations: Record<number, (d: unknown) => unknown> = {
  // пример: [1]: (d) => ({ ...d, schemaVersion: 2, ... })
};

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

/** Валидация + миграция входных данных до текущей версии схемы. Бросает на невалидном/будущем. */
export function fromProjectSchema(raw: unknown): ProjectSchema {
  if (!isObject(raw)) throw new Error("Невалидный JSON проекта: ожидается объект");

  let data: unknown = raw;
  const versionRaw = (raw as { schemaVersion?: unknown }).schemaVersion;
  const version = Number(versionRaw);
  if (!Number.isFinite(version) || version <= 0) {
    throw new Error("Нет schemaVersion или она некорректна");
  }

  for (let v = version; v < SCHEMA_VERSION; v++) {
    const m = migrations[v];
    if (m) data = m(data);
  }

  const finalized = isObject(data) ? (data as { schemaVersion?: unknown }) : null;
  if (finalized && Number(finalized.schemaVersion) > SCHEMA_VERSION) {
    throw new Error(
      `Файл версии ${finalized.schemaVersion} новее поддерживаемой ${SCHEMA_VERSION}`,
    );
  }

  const obj = data as ProjectSchema;
  if (!Array.isArray(obj.objects)) throw new Error("Поле objects должно быть массивом");
  if (!isObject(obj.settings)) throw new Error("Поле settings должно быть объектом");
  return obj;
}

export async function loadProjectFile(file: File): Promise<ProjectSchema> {
  const text = await file.text();
  return fromProjectSchema(JSON.parse(text));
}
