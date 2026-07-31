import { useProjectStore } from "../store/projectStore";
import { KIND_ICON, objectLabel } from "./objectMeta";

const iconBtn: React.CSSProperties = {
  padding: "0 4px",
  background: "transparent",
  border: "1px solid #555",
  color: "#ccc",
  borderRadius: 3,
  cursor: "pointer",
  fontSize: 11,
  lineHeight: "16px",
  flexShrink: 0,
};

/**
 * Панель слоёв: список объектов слева от канваса.
 * Синхронизация выделения с канвасом/таймлайном через общий selectedIds.
 * Управление: видимость, z-order (вверх/вниз), удаление, выбор (Shift — мультиселект).
 * Слои отсортированы по убыванию zIndex: верхний в списке = рисуется поверх.
 */
export default function LayersPanel() {
  const objects = useProjectStore((s) => s.objects);
  const selectedIds = useProjectStore((s) => s.selectedIds);
  const select = useProjectStore((s) => s.select);
  const updateObject = useProjectStore((s) => s.updateObject);
  const removeObject = useProjectStore((s) => s.removeObject);
  const reorderObject = useProjectStore((s) => s.reorderObject);

  const sorted = [...objects].sort((a, b) => b.zIndex - a.zIndex);

  return (
    <div style={{ height: "100%", overflow: "auto" }}>
      <h3
        style={{
          margin: 0,
          padding: "10px 12px",
          fontSize: 13,
          color: "#aaa",
          textTransform: "uppercase",
          letterSpacing: 0.5,
          borderBottom: "1px solid #333",
        }}
      >
        Слои
      </h3>
      {sorted.length === 0 && (
        <p style={{ padding: 12, fontSize: 12, color: "#777" }}>Нет объектов.</p>
      )}
      {sorted.map((obj) => {
        const selected = selectedIds.includes(obj.id);
        return (
          <div
            key={obj.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 8px",
              background: selected ? "rgba(255,235,59,0.12)" : "transparent",
              borderBottom: "1px solid #333",
              opacity: obj.visible ? 1 : 0.5,
            }}
          >
            <button
              type="button"
              onClick={(e) => select(obj.id, e.shiftKey)}
              title="Выделить (Shift — добавить к выделению)"
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: 6,
                minWidth: 0,
                background: "transparent",
                border: "none",
                color: "#eee",
                cursor: "pointer",
                fontSize: 13,
                textAlign: "left",
                fontWeight: selected ? 600 : 400,
              }}
            >
              <span style={{ width: 16, textAlign: "center", color: "#ffb74d", flexShrink: 0 }}>
                {KIND_ICON[obj.kind]}
              </span>
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {objectLabel(obj)}
              </span>
            </button>
            <button
              type="button"
              title={obj.visible ? "Скрыть" : "Показать"}
              onClick={(e) => {
                e.stopPropagation();
                updateObject(obj.id, { visible: !obj.visible });
              }}
              style={iconBtn}
            >
              {obj.visible ? "👁" : "🚫"}
            </button>
            <button
              type="button"
              title="Поднять слой (поверх)"
              onClick={(e) => {
                e.stopPropagation();
                reorderObject(obj.id, "up");
              }}
              style={iconBtn}
            >
              ↑
            </button>
            <button
              type="button"
              title="Опустить слой"
              onClick={(e) => {
                e.stopPropagation();
                reorderObject(obj.id, "down");
              }}
              style={iconBtn}
            >
              ↓
            </button>
            <button
              type="button"
              title="Удалить объект"
              onClick={(e) => {
                e.stopPropagation();
                removeObject(obj.id);
              }}
              style={{ ...iconBtn, borderColor: "#c62828", color: "#ef9a9a" }}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
