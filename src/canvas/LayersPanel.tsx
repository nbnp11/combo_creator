import { useProjectStore } from "../store/projectStore";
import { ActionButton, SideHead } from "../ui";
import { objectLabel } from "./objectMeta";

/**
 * Панель слоёв: список объектов слева от канваса.
 * Синхронизация выделения с канвасом/таймлайном через общий selectedIds.
 * Строка: имя (выбор, Shift — мультиселект), ↑/↓ (z-order), × (удалить), чекбокс видимости.
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
    <>
      <SideHead>Слои</SideHead>
      {sorted.length === 0 && (
        <p style={{ padding: 12, fontSize: 12, color: "var(--text-faint)", margin: 0 }}>
          Нет объектов.
        </p>
      )}
      {sorted.map((obj) => {
        const selected = selectedIds.includes(obj.id);
        return (
          <div key={obj.id} className="pb-layer" data-sel={selected} data-off={!obj.visible}>
            <button
              type="button"
              className="pb-layer-name"
              onClick={(e) => select(obj.id, e.shiftKey)}
              title="Выделить (Shift — добавить к выделению)"
              style={{ fontWeight: selected ? 600 : 400 }}
            >
              {objectLabel(obj)}
            </button>
            <ActionButton title="Поднять слой (поверх)" onClick={() => reorderObject(obj.id, "up")}>
              ↑
            </ActionButton>
            <ActionButton title="Опустить слой" onClick={() => reorderObject(obj.id, "down")}>
              ↓
            </ActionButton>
            <ActionButton variant="del" title="Удалить объект" onClick={() => removeObject(obj.id)}>
              ×
            </ActionButton>
            <input
              type="checkbox"
              checked={obj.visible}
              onChange={(e) => updateObject(obj.id, { visible: e.target.checked })}
              title={obj.visible ? "Скрыть" : "Показать"}
            />
          </div>
        );
      })}
    </>
  );
}
