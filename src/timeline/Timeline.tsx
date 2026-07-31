import { useLayoutEffect, useRef, useState } from "react";
import { useProjectStore } from "../store/projectStore";
import type { ObjectData } from "../types";
import { interpolate } from "./interpolator";
import { usePlayback } from "./usePlayback";

const LABEL_WIDTH = 120; // px, левая колонка с именем объекта
const ROW_HEIGHT = 32; // px
const RULER_HEIGHT = 24; // px

function objectLabel(o: ObjectData): string {
  if (o.kind === "player") return `Игрок #${o.number}`;
  if (o.kind === "ball") return "Мяч";
  return "Объект";
}

export default function Timeline() {
  const objects = useProjectStore((s) => s.objects);
  const selectedId = useProjectStore((s) => s.selectedId);
  const currentTime = useProjectStore((s) => s.currentTime);
  const duration = useProjectStore((s) => s.settings.durationSec);
  const setCurrentTime = useProjectStore((s) => s.setCurrentTime);
  const select = useProjectStore((s) => s.select);
  const setKeyframe = useProjectStore((s) => s.setKeyframe);
  const moveKeyframe = useProjectStore((s) => s.moveKeyframe);
  const removeKeyframe = useProjectStore((s) => s.removeKeyframe);
  const { isPlaying, toggle } = usePlayback();

  const trackRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState(800);

  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const update = () => setTrackWidth(el.clientWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const usableWidth = Math.max(trackWidth - LABEL_WIDTH, 1);
  const pxPerSec = usableWidth / duration;
  const secToX = (t: number) => pxPerSec * t;

  const tFromClientX = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const x = (clientX - rect.left - LABEL_WIDTH) / pxPerSec;
    return Math.max(0, Math.min(duration, x));
  };

  // --- Playhead drag ---
  const startPlayheadDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    const onMove = (ev: MouseEvent) => setCurrentTime(tFromClientX(ev.clientX));
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    setCurrentTime(tFromClientX(e.clientX));
  };

  // --- Marker drag (меняет time ключевого кадра) ---
  const startMarkerDrag = (e: React.MouseEvent, objId: string, startTime: number) => {
    e.preventDefault();
    e.stopPropagation();
    let current = startTime;
    const onMove = (ev: MouseEvent) => {
      const rounded = Math.round(tFromClientX(ev.clientX) * 100) / 100;
      if (Math.abs(rounded - current) > 1e-6) {
        moveKeyframe(objId, current, rounded);
        current = rounded;
      }
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const handleTrackClick = (e: React.MouseEvent) => {
    setCurrentTime(tFromClientX(e.clientX));
  };

  const handleTrackDoubleClick = (e: React.MouseEvent, obj: ObjectData) => {
    e.stopPropagation();
    if (selectedId !== obj.id) select(obj.id);
    const pos = interpolate(obj.track, currentTime);
    setKeyframe(obj.id, { time: currentTime, x: pos.x, y: pos.y, rotation: pos.rotation });
  };

  const ticks = [];
  for (let s = 0; s <= duration; s++) ticks.push(s);

  return (
    <div
      ref={trackRef}
      style={{
        width: "100%",
        background: "#222",
        color: "#eee",
        userSelect: "none",
        borderTop: "1px solid #444",
      }}
    >
      {/* Линейка */}
      <div style={{ display: "flex", height: RULER_HEIGHT, position: "relative" }}>
        <div
          style={{
            width: LABEL_WIDTH,
            borderRight: "1px solid #444",
            padding: "4px 8px",
            fontSize: 12,
            color: "#aaa",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <button
            type="button"
            onClick={toggle}
            style={{
              padding: "2px 8px",
              fontSize: 12,
              cursor: "pointer",
              background: isPlaying ? "#ff5252" : "#2e7d32",
              color: "#fff",
              border: "none",
              borderRadius: 3,
            }}
          >
            {isPlaying ? "❚❚ Пауза" : "► Play"}
          </button>
          <span>{currentTime.toFixed(1)}s</span>
        </div>
        {/* biome-ignore lint/a11y/noStaticElementInteractions: интерактивная область перетаскивания плейхеда */}
        <div style={{ position: "relative", flex: 1 }} onMouseDown={startPlayheadDrag}>
          {ticks.map((s) => (
            <div
              key={s}
              style={{
                position: "absolute",
                left: secToX(s),
                top: 0,
                bottom: 0,
                borderLeft: "1px solid #555",
                fontSize: 11,
                color: "#bbb",
                paddingLeft: 3,
              }}
            >
              {s}
            </div>
          ))}
        </div>
      </div>

      {/* Дорожки объектов */}
      <div style={{ position: "relative" }}>
        {/* Плейхед */}
        <div
          style={{
            position: "absolute",
            left: LABEL_WIDTH + secToX(currentTime),
            top: 0,
            bottom: 0,
            width: 2,
            background: "#ff5252",
            pointerEvents: "none",
            zIndex: 5,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -RULER_HEIGHT,
              left: -5,
              width: 12,
              height: 12,
              background: "#ff5252",
              borderRadius: "50%",
            }}
          />
        </div>

        {objects.map((obj) => {
          const selected = selectedId === obj.id;
          return (
            <div
              key={obj.id}
              style={{
                display: "flex",
                height: ROW_HEIGHT,
                borderBottom: "1px solid #333",
                background: selected ? "rgba(255,235,59,0.08)" : "transparent",
              }}
            >
              <button
                type="button"
                onClick={() => select(obj.id)}
                style={{
                  width: LABEL_WIDTH,
                  borderRight: "1px solid #444",
                  padding: "0 8px",
                  display: "flex",
                  alignItems: "center",
                  fontSize: 12,
                  fontWeight: selected ? 600 : 400,
                  background: "transparent",
                  border: "none",
                  borderBottom: "none",
                  color: "#eee",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                {objectLabel(obj)}
              </button>
              {/* biome-ignore lint/a11y/noStaticElementInteractions: дорожка — кастомная интерактивная область таймлайна */}
              <div
                style={{ position: "relative", flex: 1, cursor: "pointer" }}
                onMouseDown={handleTrackClick}
                onDoubleClick={(e) => handleTrackDoubleClick(e, obj)}
              >
                {obj.track.map((kf) => (
                  <Marker
                    key={kf.time}
                    left={secToX(kf.time)}
                    selected={selected}
                    onMouseDown={(e) => {
                      startMarkerDrag(e, obj.id, kf.time);
                      setCurrentTime(kf.time);
                    }}
                    onDelete={() => removeKeyframe(obj.id, kf.time)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Marker({
  left,
  selected,
  onMouseDown,
  onDelete,
}: {
  left: number;
  selected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onDelete: () => void;
}) {
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: маркер ключевого кадра — перетаскиваемый кастомный виджет
    <div
      style={{
        position: "absolute",
        left: left - 7,
        top: "50%",
        marginTop: -7,
        width: 14,
        height: 14,
        background: selected ? "#ffeb3b" : "#90caf9",
        border: "1px solid #333",
        borderRadius: 3,
        cursor: "ew-resize",
      }}
      onMouseDown={onMouseDown}
      title="перетащите — сдвинуть по времени; кнопка × — удалить"
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          top: -10,
          right: -8,
          width: 14,
          height: 14,
          fontSize: 9,
          lineHeight: "14px",
          padding: 0,
          border: "none",
          background: "#c62828",
          color: "#fff",
          borderRadius: "50%",
          cursor: "pointer",
        }}
        aria-label="удалить ключ"
      >
        ×
      </button>
    </div>
  );
}
