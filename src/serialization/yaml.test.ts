import { describe, expect, it } from "vitest";
import { parse, stringify } from "yaml";
import type {
  ArrowData,
  BallData,
  CircleData,
  HighlightData,
  ObjectData,
  PlayerData,
  RectangleData,
  TextData,
} from "../types";
import { fromProjectSchema } from "./jsonLoader";
import { toProjectSchema } from "./jsonSaver";
import { SCHEMA_VERSION } from "./schema";
import { loadProjectYamlFile } from "./yamlLoader";
import { projectToYaml } from "./yamlSaver";

/** Помощник: settings+objects → YAML-текст → распарсенный объект (для fromProjectSchema). */
function roundTrip(
  settings: {
    fps: 15 | 24 | 30;
    size: 720 | 1080 | 1440;
    durationSec: number;
  },
  objects: ObjectData[],
) {
  return fromProjectSchema(parse(projectToYaml(settings, objects)));
}

function sampleObjects(): ObjectData[] {
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
  const arrow: ArrowData = {
    id: "a-1",
    kind: "arrow",
    visible: true,
    zIndex: 3,
    points: [80, 0],
    stroke: "#ffffff",
    strokeWidth: 5,
    track: [{ time: 0, x: 300, y: 360, rotation: 0 }],
  };
  const circle: CircleData = {
    id: "c-1",
    kind: "circle",
    visible: true,
    zIndex: 1,
    radius: 40,
    stroke: "#ffeb3b",
    fill: "rgba(255,235,59,0.15)",
    track: [{ time: 0, x: 300, y: 360, rotation: 0 }],
  };
  const text: TextData = {
    id: "t-1",
    kind: "text",
    visible: true,
    zIndex: 4,
    text: "Текст",
    fontSize: 28,
    fill: "#ffffff",
    track: [{ time: 0, x: 300, y: 360, rotation: 0 }],
  };
  const rectangle: RectangleData = {
    id: "r-1",
    kind: "rectangle",
    visible: true,
    zIndex: 1,
    width: 120,
    height: 80,
    stroke: "#ffffff",
    fill: "rgba(255,255,255,0.1)",
    track: [{ time: 0, x: 300, y: 360, rotation: 0 }],
  };
  const highlight: HighlightData = {
    id: "h-1",
    kind: "highlight",
    visible: true,
    zIndex: 0,
    width: 160,
    height: 120,
    color: "#ffeb3b",
    opacity: 0.25,
    track: [{ time: 0, x: 300, y: 360, rotation: 0 }],
  };
  return [player, ball, arrow, circle, text, rectangle, highlight];
}

describe("YAML serialization round-trip", () => {
  it("toProjectSchema → stringify → parse → fromProjectSchema сохраняет все типы объектов", () => {
    const settings = { fps: 24 as const, size: 1080 as const, durationSec: 10 };
    const objects = sampleObjects();
    const original = toProjectSchema(settings, objects);

    const restored = roundTrip(settings, objects);

    expect(restored.schemaVersion).toBe(SCHEMA_VERSION);
    expect(restored.field).toBe("rugby");
    expect(restored.settings).toEqual(settings);
    expect(restored.objects).toEqual(original.objects);
    // все 7 типов на месте
    const kinds = restored.objects.map((o) => o.kind).sort();
    expect(kinds).toEqual(
      ["arrow", "ball", "circle", "highlight", "player", "rectangle", "text"].sort(),
    );
    // трек игрока и zIndex сохранены
    const p = restored.objects.find((o) => o.id === "p-1");
    expect(p?.track).toHaveLength(2);
    expect(p?.zIndex).toBe(1);
    // дискриминантное поле сохранено
    const arrow = restored.objects.find((o) => o.id === "a-1");
    expect(arrow?.kind).toBe("arrow");
  });

  it("YAML ↔ JSON дают идентичный результат (через общую fromProjectSchema)", () => {
    const settings = { fps: 30 as const, size: 720 as const, durationSec: 5 };
    const objects = sampleObjects();

    const viaJson = fromProjectSchema(
      JSON.parse(JSON.stringify(toProjectSchema(settings, objects))),
    );
    const viaYaml = roundTrip(settings, objects);

    expect(viaYaml).toEqual(viaJson);
  });

  it("сохраняет литералы (team: blue остаётся строкой, opacity числом)", () => {
    const restored = roundTrip({ fps: 15, size: 1440, durationSec: 8 }, sampleObjects());
    const p = restored.objects.find((o) => o.id === "p-1");
    expect(p?.kind).toBe("player");
    if (p?.kind === "player") expect(p.team).toBe("blue");
    const h = restored.objects.find((o) => o.id === "h-1");
    if (h?.kind === "highlight") expect(h.opacity).toBeCloseTo(0.25);
    expect(restored.settings.fps).toBe(15);
    expect(restored.settings.size).toBe(1440);
  });

  it("loadProjectYamlFile читает файл (имитация File)", async () => {
    const settings = { fps: 24 as const, size: 1080 as const, durationSec: 10 };
    const yamlText = projectToYaml(settings, sampleObjects());
    const file = new File([yamlText], "combo.yaml", { type: "text/yaml" });
    const restored = await loadProjectYamlFile(file);
    expect(restored.objects).toHaveLength(7);
  });

  it("бросает на версии из будущего / невалидном", () => {
    expect(() => roundTrip({ fps: 24, size: 1080, durationSec: 10 }, [])).not.toThrow();
    const futureYaml = stringify({
      schemaVersion: SCHEMA_VERSION + 5,
      field: "rugby",
      settings: {},
      objects: [],
    });
    expect(() => fromProjectSchema(parse(futureYaml))).toThrow(/новее поддерживаемой/);
    expect(() => fromProjectSchema("just a string")).toThrow();
  });
});
