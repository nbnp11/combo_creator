import { create } from "zustand";
import type { BallData, Keyframe, ObjectData, PlayerData, ProjectSettings } from "../types";

export const SCHEMA_VERSION = 1;

/** Патч для объекта: объединение частичных видов по типам (без kind — дискриминант не меняем). */
export type ObjectPatch = Partial<Omit<PlayerData, "kind">> | Partial<Omit<BallData, "kind">>;

const DEFAULT_SETTINGS: ProjectSettings = { fps: 24, size: 1080, durationSec: 10 };

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function withSortedTrack<T extends ObjectData>(obj: T): T {
  return { ...obj, track: [...obj.track].sort((a, b) => a.time - b.time) };
}

/** Фабрики для новых объектов (используются в тулбаре и дефолтном проекте). */
export function createPlayer(
  n: number,
  x: number,
  y: number,
  team: PlayerData["team"] = "blue",
): PlayerData {
  return {
    id: uid("p"),
    kind: "player",
    visible: true,
    zIndex: 1,
    number: n,
    team,
    color: team === "blue" ? "#1565c0" : "#c62828",
    radius: 18,
    track: [{ time: 0, x, y, rotation: 0 }],
  };
}

export function createBall(x: number, y: number): BallData {
  return {
    id: uid("b"),
    kind: "ball",
    visible: true,
    zIndex: 2,
    radius: 10,
    color: "#ffffff",
    track: [{ time: 0, x, y, rotation: 0 }],
  };
}

interface ProjectState {
  settings: ProjectSettings;
  objects: ObjectData[];
  selectedId: string | null;
  currentTime: number;
  isPlaying: boolean;
  addObject: (obj: ObjectData) => void;
  removeObject: (id: string) => void;
  updateObject: (id: string, patch: ObjectPatch) => void;
  setKeyframe: (id: string, kf: Keyframe) => void;
  moveKeyframe: (id: string, oldTime: number, newTime: number) => void;
  removeKeyframe: (id: string, time: number) => void;
  select: (id: string | null) => void;
  setCurrentTime: (t: number) => void;
  setPlaying: (p: boolean) => void;
  updateSettings: (patch: Partial<ProjectSettings>) => void;
  loadProject: (p: { settings: ProjectSettings; objects: ObjectData[] }) => void;
}

function patchObject<T extends ObjectData>(obj: T, patch: ObjectPatch): T {
  // kind не входит в ObjectPatch, поэтому просто объединяем; T сохраняет дискриминант.
  return { ...obj, ...(patch as Partial<T>) } as T;
}

export const useProjectStore = create<ProjectState>((set) => ({
  settings: DEFAULT_SETTINGS,
  objects: createDefaultProject(),
  selectedId: null,
  currentTime: 0,
  isPlaying: false,

  addObject: (obj) => set((s) => ({ objects: [...s.objects, withSortedTrack(obj)] })),

  removeObject: (id) =>
    set((s) => ({
      objects: s.objects.filter((o) => o.id !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
    })),

  updateObject: (id, patch) =>
    set((s) => ({ objects: s.objects.map((o) => (o.id === id ? patchObject(o, patch) : o)) })),

  setKeyframe: (id, kf) =>
    set((s) => ({
      objects: s.objects.map((o) => {
        if (o.id !== id) return o;
        const rest = o.track.filter((k) => Math.abs(k.time - kf.time) > 1e-6);
        return { ...o, track: [...rest, kf].sort((a, b) => a.time - b.time) };
      }),
    })),

  moveKeyframe: (id, oldTime, newTime) =>
    set((s) => ({
      objects: s.objects.map((o) => {
        if (o.id !== id) return o;
        const moved = o.track.map((k) =>
          Math.abs(k.time - oldTime) <= 1e-6 ? { ...k, time: newTime } : k,
        );
        return { ...o, track: moved.sort((a, b) => a.time - b.time) };
      }),
    })),

  removeKeyframe: (id, time) =>
    set((s) => ({
      objects: s.objects.map((o) =>
        o.id === id ? { ...o, track: o.track.filter((k) => Math.abs(k.time - time) > 1e-6) } : o,
      ),
    })),

  select: (id) => set({ selectedId: id }),
  setCurrentTime: (t) => set({ currentTime: t }),
  setPlaying: (p) => set({ isPlaying: p }),
  updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
  loadProject: (p) =>
    set({
      settings: p.settings,
      objects: p.objects.map(withSortedTrack),
      selectedId: null,
      currentTime: 0,
      isPlaying: false,
    }),
}));

export function createDefaultProject(): ObjectData[] {
  return [
    createPlayer(10, 120, 200, "blue"),
    createPlayer(9, 200, 300, "blue"),
    createBall(100, 100),
  ];
}
