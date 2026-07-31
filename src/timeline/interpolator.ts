import type { Keyframe } from "../types";

export type InterpolationMode = "linear" | "catmullrom" | "ease";

export interface Vec2 {
  x: number;
  y: number;
  rotation: number;
}

const ZERO: Vec2 = { x: 0, y: 0, rotation: 0 };

function lerp(a: number, b: number, k: number): number {
  return a + (b - a) * k;
}

/** Uniform Catmull-Rom: значение скаляра в параметре u∈[0,1] между точками p1 и p2
 *  по 4 опорным точкам p0..p3. Проходит точно через p1 (u=0) и p2 (u=1). */
function catmull(p0: number, p1: number, p2: number, p3: number, u: number): number {
  const u2 = u * u;
  const u3 = u2 * u;
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * u +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * u2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * u3)
  );
}

/** Smoothstep-easing параметра сегмента — плавный разгон/торможение на концах. */
function ease(k: number): number {
  return k * k * (3 - 2 * k);
}

/**
 * Позиция на треке в момент t (секунды).
 *  - linear (по умолчанию): линейная интерполяция x/y/rotation, clamping на концах.
 *  - ease: linear + smoothstep по параметру сегмента (смягчает рывки на стыках).
 *  - catmullrom: сплайн Catmull-Rom для x/y (проходит точно через все ключи),
 *    края зажаты фантомными дубликатами крайних ключей; rotation — линейно.
 * Трек сортируется внутри (несортированный вход допускается).
 */
export function interpolate(
  track: Keyframe[],
  t: number,
  mode: InterpolationMode = "linear",
): Vec2 {
  if (track.length === 0) return { ...ZERO };
  const s = track.length === 1 ? track : [...track].sort((a, b) => a.time - b.time);
  const first = s[0];
  const last = s[s.length - 1];

  if (t <= first.time) return { x: first.x, y: first.y, rotation: first.rotation ?? 0 };
  if (t >= last.time) return { x: last.x, y: last.y, rotation: last.rotation ?? 0 };

  let i = 0;
  for (; i < s.length - 1; i++) {
    if (t >= s[i].time && t <= s[i + 1].time) break;
  }
  const a = s[i];
  const b = s[i + 1];
  const span = b.time - a.time || 1; // защита от деления на 0 (два ключа в одной точке)
  const k = (t - a.time) / span;
  const rotA = a.rotation ?? 0;
  const rotB = b.rotation ?? 0;

  if (mode === "ease") {
    const ke = ease(k);
    return { x: lerp(a.x, b.x, ke), y: lerp(a.y, b.y, ke), rotation: lerp(rotA, rotB, ke) };
  }

  if (mode === "catmullrom") {
    // Фантомные точки на краях — дублируем крайние ключи.
    const p0 = s[i - 1] ?? a;
    const p3 = s[i + 2] ?? b;
    return {
      x: catmull(p0.x, a.x, b.x, p3.x, k),
      y: catmull(p0.y, a.y, b.y, p3.y, k),
      rotation: lerp(rotA, rotB, k), // rotation интерполируем линейно
    };
  }

  // linear
  return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), rotation: lerp(rotA, rotB, k) };
}
