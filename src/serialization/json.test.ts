import { describe, expect, it } from "vitest";
import { SCHEMA_VERSION } from "../store/projectStore";
import type { BallData, PlayerData } from "../types";
import { fromProjectSchema } from "./jsonLoader";
import { toProjectSchema } from "./jsonSaver";

function sampleObjects(): (PlayerData | BallData)[] {
  const player: PlayerData = {
    id: "p-1",
    kind: "player",
    visible: true,
    zIndex: 1,
    number: 10,
    team: "blue",
    color: "#1565c0",
    radius: 18,
    track: [
      { time: 0, x: 100, y: 100, rotation: 0 },
      { time: 3, x: 400, y: 250, rotation: 90 },
    ],
  };
  const ball: BallData = {
    id: "b-1",
    kind: "ball",
    visible: true,
    zIndex: 2,
    radius: 10,
    color: "#ffffff",
    track: [{ time: 0, x: 100, y: 100, rotation: 0 }],
  };
  return [player, ball];
}

describe("serialization round-trip", () => {
  it("toProjectSchema → stringify → parse → fromProjectSchema сохраняет данные", () => {
    const settings = { fps: 24 as const, size: 1080 as const, durationSec: 10 };
    const original = toProjectSchema(settings, sampleObjects());

    const restored = fromProjectSchema(JSON.parse(JSON.stringify(original)));

    expect(restored.schemaVersion).toBe(SCHEMA_VERSION);
    expect(restored.field).toBe("rugby");
    expect(restored.settings).toEqual(settings);
    expect(restored.objects).toEqual(original.objects);
    // трек и zIndex сохранены
    const p = restored.objects.find((o) => o.id === "p-1");
    expect(p?.track).toHaveLength(2);
    expect(p?.zIndex).toBe(1);
  });

  it("бросает на пустом объекте / отсутствии schemaVersion", () => {
    expect(() => fromProjectSchema({})).toThrow();
    expect(() => fromProjectSchema(null)).toThrow();
    expect(() => fromProjectSchema("string")).toThrow();
  });

  it("бросает на версии из будущего", () => {
    const future = { schemaVersion: SCHEMA_VERSION + 5, field: "rugby", settings: {}, objects: [] };
    expect(() => fromProjectSchema(future)).toThrow(/новее поддерживаемой/);
  });

  it("бросает, если objects не массив", () => {
    const bad = { schemaVersion: 1, field: "rugby", settings: {}, objects: "nope" };
    expect(() => fromProjectSchema(bad)).toThrow(/objects/);
  });
});
