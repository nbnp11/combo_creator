import type { ReactNode } from "react";
import { useProjectStore } from "../store/projectStore";
import { interpolate } from "../timeline/interpolator";
import type { PlayerData } from "../types";

const TEAM_COLORS: Record<PlayerData["team"], string> = {
  blue: "#1565c0",
  red: "#c62828",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "4px 6px",
  background: "#1b1b1b",
  color: "#eee",
  border: "1px solid #555",
  borderRadius: 3,
  fontSize: 13,
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#aaa",
  marginBottom: 2,
  display: "block",
};

/** Мини-обёртка поля с подписью. */
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <span style={labelStyle}>{label}</span>
      {children}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  step?: number;
}) {
  return (
    <Field label={label}>
      <input
        type="number"
        min={min}
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        style={inputStyle}
      />
    </Field>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Field label={label}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      />
    </Field>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Field label={label}>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: 3,
            background: value,
            border: "1px solid #555",
            flexShrink: 0,
          }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={inputStyle}
        />
      </div>
    </Field>
  );
}

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) {
  return (
    <Field label={label}>
      <select value={value} onChange={(e) => onChange(e.target.value as T)} style={inputStyle}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </Field>
  );
}

/** Полная панель свойств: общие поля + поля по типу объекта; при пустом выделении — настройки сцены. */
export default function PropertiesPanel() {
  const selectedIds = useProjectStore((s) => s.selectedIds);
  const objects = useProjectStore((s) => s.objects);
  const currentTime = useProjectStore((s) => s.currentTime);
  const updateObject = useProjectStore((s) => s.updateObject);
  const setKeyframe = useProjectStore((s) => s.setKeyframe);
  const settings = useProjectStore((s) => s.settings);
  const updateSettings = useProjectStore((s) => s.updateSettings);
  const interpolation = settings.interpolation ?? "linear";

  // Свойства объекта показываем только при ровно одном выделенном; иначе — настройки сцены.
  const obj = selectedIds.length === 1 ? objects.find((o) => o.id === selectedIds[0]) : undefined;

  if (!obj) {
    return (
      <div style={{ padding: 12 }}>
        <h3 style={{ marginTop: 0, fontSize: 14, color: "#ccc" }}>Сцена</h3>
        <SelectField
          label="FPS"
          value={String(settings.fps) as "15" | "24" | "30"}
          options={["15", "24", "30"]}
          onChange={(v) => updateSettings({ fps: Number(v) as 15 | 24 | 30 })}
        />
        <SelectField
          label="Размер GIF (по ширине)"
          value={String(settings.size) as "720" | "1080" | "1440"}
          options={["720", "1080", "1440"]}
          onChange={(v) => updateSettings({ size: Number(v) as 720 | 1080 | 1440 })}
        />
        <NumberField
          label="Длительность (сек)"
          value={settings.durationSec}
          min={1}
          step={1}
          onChange={(v) => updateSettings({ durationSec: Math.max(1, v) })}
        />
        <SelectField
          label="Интерполяция"
          value={interpolation}
          options={["linear", "ease", "catmullrom"] as const}
          onChange={(v) => updateSettings({ interpolation: v })}
        />
        {selectedIds.length > 1 ? (
          <p style={{ fontSize: 12, color: "#ffb74d" }}>
            Выбрано объектов: {selectedIds.length}. Свойства доступны при одном выделении. Групповые
            действия — удаление/дублирование — в тулбаре.
          </p>
        ) : (
          <p style={{ fontSize: 12, color: "#777" }}>
            Выделите объект на канвасе или в таймлайне, чтобы редактировать его свойства.
          </p>
        )}
      </div>
    );
  }

  const up = (patch: Parameters<typeof updateObject>[1]) => updateObject(obj.id, patch);
  const pos = interpolate(obj.track, currentTime, interpolation);

  // rotation правит rotation ключа в текущий момент времени (модель та же, что у drag→key).
  const setRotation = (deg: number) =>
    setKeyframe(obj.id, { time: currentTime, x: pos.x, y: pos.y, rotation: deg });

  return (
    <div style={{ padding: 12 }}>
      <h3 style={{ marginTop: 0, fontSize: 14, color: "#ccc", textTransform: "capitalize" }}>
        {obj.kind}
      </h3>

      {/* Общие поля */}
      <Field label="Видимость">
        <input
          type="checkbox"
          checked={obj.visible}
          onChange={(e) => up({ visible: e.target.checked })}
        />
      </Field>
      <NumberField label="Z-index" value={obj.zIndex} onChange={(v) => up({ zIndex: v })} />
      <NumberField
        label="Поворот (°) в текущем кадре"
        value={Math.round(pos.rotation)}
        onChange={setRotation}
      />

      <hr style={{ border: "none", borderTop: "1px solid #3a3a3a", margin: "8px 0" }} />

      {/* Поля по типу */}
      {obj.kind === "player" && (
        <>
          <NumberField
            label="Номер"
            value={obj.number}
            min={0}
            onChange={(v) => up({ number: v })}
          />
          <SelectField
            label="Команда"
            value={obj.team}
            options={["blue", "red"] as const}
            onChange={(team) => up({ team, color: TEAM_COLORS[team] })}
          />
          <ColorField label="Цвет" value={obj.color} onChange={(v) => up({ color: v })} />
          <NumberField
            label="Радиус"
            value={obj.radius}
            min={1}
            onChange={(v) => up({ radius: v })}
          />
        </>
      )}

      {obj.kind === "ball" && (
        <>
          <ColorField label="Цвет" value={obj.color} onChange={(v) => up({ color: v })} />
          <NumberField
            label="Радиус"
            value={obj.radius}
            min={1}
            onChange={(v) => up({ radius: v })}
          />
        </>
      )}

      {obj.kind === "arrow" && (
        <>
          <ColorField label="Цвет линии" value={obj.stroke} onChange={(v) => up({ stroke: v })} />
          <NumberField
            label="Толщина"
            value={obj.strokeWidth}
            min={1}
            onChange={(v) => up({ strokeWidth: v })}
          />
          <NumberField
            label="Конец X (отн.)"
            value={obj.points[0]}
            onChange={(v) => up({ points: [v, obj.points[1]] })}
          />
          <NumberField
            label="Конец Y (отн.)"
            value={obj.points[1]}
            onChange={(v) => up({ points: [obj.points[0], v] })}
          />
        </>
      )}

      {obj.kind === "circle" && (
        <>
          <NumberField
            label="Радиус"
            value={obj.radius}
            min={1}
            onChange={(v) => up({ radius: v })}
          />
          <ColorField label="Обводка" value={obj.stroke} onChange={(v) => up({ stroke: v })} />
          <ColorField label="Заливка" value={obj.fill} onChange={(v) => up({ fill: v })} />
        </>
      )}

      {obj.kind === "text" && (
        <>
          <TextField label="Текст" value={obj.text} onChange={(v) => up({ text: v })} />
          <NumberField
            label="Размер шрифта"
            value={obj.fontSize}
            min={6}
            onChange={(v) => up({ fontSize: v })}
          />
          <ColorField label="Цвет" value={obj.fill} onChange={(v) => up({ fill: v })} />
        </>
      )}

      {obj.kind === "rectangle" && (
        <>
          <NumberField
            label="Ширина"
            value={obj.width}
            min={1}
            onChange={(v) => up({ width: v })}
          />
          <NumberField
            label="Высота"
            value={obj.height}
            min={1}
            onChange={(v) => up({ height: v })}
          />
          <ColorField label="Обводка" value={obj.stroke} onChange={(v) => up({ stroke: v })} />
          <ColorField label="Заливка" value={obj.fill} onChange={(v) => up({ fill: v })} />
        </>
      )}

      {obj.kind === "highlight" && (
        <>
          <NumberField
            label="Ширина"
            value={obj.width}
            min={1}
            onChange={(v) => up({ width: v })}
          />
          <NumberField
            label="Высота"
            value={obj.height}
            min={1}
            onChange={(v) => up({ height: v })}
          />
          <ColorField label="Цвет" value={obj.color} onChange={(v) => up({ color: v })} />
          <NumberField
            label="Прозрачность (0–1)"
            value={obj.opacity}
            min={0}
            step={0.05}
            onChange={(v) => up({ opacity: Math.max(0, Math.min(1, v)) })}
          />
        </>
      )}
    </div>
  );
}
