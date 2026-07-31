import type { Keyframe } from "../types";

export interface Vec2 {
  x: number;
  y: number;
  rotation: number;
}

const ZERO: Vec2 = { x: 0, y: 0, rotation: 0 };

/**
 * Позиция на треке в момент t (секунды).
 * Линейная интерполяция, clamping на концах. Трек сортируется внутри (несортированный вход допускается).
 */
export function interpolate(track: Keyframe[], t: number): Vec2 {
  if (track.length === 0) return { ...ZERO };
  const s = track.length === 1 ? track : [...track].sort((a, b) => a.time - b.time);
  const first = s[0];
  const last = s[s.length - 1];

  if (t <= first.time) return { x: first.x, y: first.y, rotation: first.rotation ?? 0 };
  if (t >= last.time) return { x: last.x, y: last.y, rotation: last.rotation ?? 0 };

  for (let i = 0; i < s.length - 1; i++) {
    const a = s[i];
    const b = s[i + 1];
    if (t >= a.time && t <= b.time) {
      const span = b.time - a.time || 1; // защита от деления на 0 (два ключа в одной точке)
      const k = (t - a.time) / span;
      return {
        x: a.x + (b.x - a.x) * k,
        y: a.y + (b.y - a.y) * k,
        rotation: (a.rotation ?? 0) + ((b.rotation ?? 0) - (a.rotation ?? 0)) * k,
      };
    }
  }

  return { x: last.x, y: last.y, rotation: last.rotation ?? 0 };
}
