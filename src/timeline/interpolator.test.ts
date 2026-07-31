import { describe, expect, it } from "vitest";
import type { Keyframe } from "../types";
import { interpolate } from "./interpolator";

const kf = (time: number, x: number, y: number, rotation = 0): Keyframe => ({
  time,
  x,
  y,
  rotation,
});

describe("interpolate", () => {
  it("возвращает {0,0,0} для пустого трека", () => {
    expect(interpolate([], 5)).toEqual({ x: 0, y: 0, rotation: 0 });
  });

  it("всегда возвращает позицию единственного ключа", () => {
    const track = [kf(2, 50, 70, 10)];
    expect(interpolate(track, 0)).toEqual({ x: 50, y: 70, rotation: 10 });
    expect(interpolate(track, 2)).toEqual({ x: 50, y: 70, rotation: 10 });
    expect(interpolate(track, 100)).toEqual({ x: 50, y: 70, rotation: 10 });
  });

  it("clamping до первого ключа при t < first.time", () => {
    const track = [kf(3, 0, 0), kf(6, 90, 90)];
    expect(interpolate(track, 0)).toEqual({ x: 0, y: 0, rotation: 0 });
    expect(interpolate(track, 2.9)).toEqual({ x: 0, y: 0, rotation: 0 });
  });

  it("clamping к последнему ключу при t > last.time", () => {
    const track = [kf(3, 0, 0), kf(6, 90, 90)];
    expect(interpolate(track, 10)).toEqual({ x: 90, y: 90, rotation: 0 });
  });

  it("точно попадает в ключ", () => {
    const track = [kf(0, 0, 0), kf(2, 40, 40), kf(4, 80, 80)];
    expect(interpolate(track, 2)).toEqual({ x: 40, y: 40, rotation: 0 });
    expect(interpolate(track, 4)).toEqual({ x: 80, y: 80, rotation: 0 });
  });

  it("линейно интерполирует x/y/rotation в середине между двумя ключами", () => {
    const track = [kf(0, 0, 0, 0), kf(10, 100, 200, 90)];
    const mid = interpolate(track, 5);
    expect(mid.x).toBe(50);
    expect(mid.y).toBe(100);
    expect(mid.rotation).toBe(45);
  });

  it("интерполирует rotation по дефолту 0, если ключ не задаёт его", () => {
    const track = [kf(0, 0, 0), kf(2, 20, 20, 40)];
    // первый ключ без rotation → 0, второй 40; на t=1 → 20
    expect(interpolate(track, 1).rotation).toBe(20);
  });

  it("обрабатывает несортированный вход как отсортированный", () => {
    const sorted = [kf(0, 0, 0), kf(10, 100, 100)];
    const reversed = [kf(10, 100, 100), kf(0, 0, 0)];
    expect(interpolate(reversed, 5)).toEqual(interpolate(sorted, 5));
  });

  it("не мутирует входной массив", () => {
    const track = [kf(2, 10, 10), kf(0, 0, 0)];
    const snapshot = track.map((k) => ({ ...k }));
    interpolate(track, 1);
    expect(track).toEqual(snapshot);
  });
});
