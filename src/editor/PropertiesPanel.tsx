import { useProjectStore } from "../store/projectStore";
import type { PlayerData } from "../types";

const TEAM_COLORS: Record<PlayerData["team"], string> = {
  blue: "#1565c0",
  red: "#c62828",
};

const TEAM_LABELS: Record<PlayerData["team"], string> = {
  blue: "Синяя",
  red: "Красная",
};

/** Мини-панель свойств выделенного игрока: номер + команда (цвет). */
export default function PropertiesPanel() {
  const selectedId = useProjectStore((s) => s.selectedId);
  const objects = useProjectStore((s) => s.objects);
  const updateObject = useProjectStore((s) => s.updateObject);

  const obj = objects.find((o) => o.id === selectedId);
  if (obj?.kind !== "player") return null;
  const player = obj;

  const setTeam = (team: PlayerData["team"]) =>
    updateObject(player.id, { team, color: TEAM_COLORS[team] });

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "center",
        padding: "6px 10px",
        background: "#262626",
        border: "1px solid #444",
        borderRadius: 6,
      }}
    >
      <span style={{ fontSize: 13, color: "#aaa" }}>Игрок</span>
      <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
        №
        <input
          type="number"
          min={0}
          value={player.number}
          onChange={(e) => updateObject(player.id, { number: Number(e.target.value) || 0 })}
          style={{
            width: 54,
            padding: "2px 4px",
            background: "#1b1b1b",
            color: "#eee",
            border: "1px solid #555",
            borderRadius: 3,
          }}
        />
      </label>
      <span style={{ fontSize: 13, color: "#aaa" }}>Команда:</span>
      {(Object.keys(TEAM_COLORS) as PlayerData["team"][]).map((team) => {
        const active = player.team === team;
        return (
          <button
            key={team}
            type="button"
            onClick={() => setTeam(team)}
            style={{
              padding: "3px 10px",
              cursor: "pointer",
              background: active ? TEAM_COLORS[team] : "transparent",
              color: active ? "#fff" : "#ccc",
              border: `1px solid ${TEAM_COLORS[team]}`,
              borderRadius: 3,
              fontWeight: active ? 600 : 400,
            }}
          >
            {TEAM_LABELS[team]}
          </button>
        );
      })}
    </div>
  );
}
