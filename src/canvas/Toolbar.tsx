import { useRef, useState } from "react";
import { downloadBlob, exportGif } from "../export/gifExporter";
import { loadProjectFile } from "../serialization/jsonLoader";
import { downloadProjectJson } from "../serialization/jsonSaver";
import { createBall, createPlayer, useProjectStore } from "../store/projectStore";

export default function Toolbar() {
  const objects = useProjectStore((s) => s.objects);
  const selectedId = useProjectStore((s) => s.selectedId);
  const addObject = useProjectStore((s) => s.addObject);
  const removeObject = useProjectStore((s) => s.removeObject);
  const settings = useProjectStore((s) => s.settings);
  const loadProject = useProjectStore((s) => s.loadProject);
  const fileInput = useRef<HTMLInputElement>(null);
  const [exportState, setExportState] = useState<{ busy: boolean; progress: number }>({
    busy: false,
    progress: 0,
  });

  const nextPlayerNumber = () => {
    const nums = objects
      .filter((o) => o.kind === "player")
      .map((o) => (o.kind === "player" ? o.number : 0));
    return nums.length === 0 ? 1 : Math.max(...nums) + 1;
  };

  const addPlayer = () => addObject(createPlayer(nextPlayerNumber(), 300, 360, "blue"));
  const addBall = () => addObject(createBall(300, 360));
  const removeSelected = () => {
    if (selectedId) removeObject(selectedId);
  };

  const handleExport = async () => {
    if (exportState.busy) return;
    setExportState({ busy: true, progress: 0 });
    try {
      const blob = await exportGif(objects, settings, (p) =>
        setExportState({ busy: true, progress: p }),
      );
      downloadBlob(blob, "combo.gif");
    } catch (err) {
      console.error("GIF export failed", err);
    } finally {
      setExportState({ busy: false, progress: 0 });
    }
  };

  const handleSaveJson = () => downloadProjectJson(settings, objects);

  const handleOpenJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const project = await loadProjectFile(file);
      loadProject({ settings: project.settings, objects: project.objects });
    } catch (err) {
      console.error("JSON load failed", err);
      window.alert(err instanceof Error ? err.message : "Не удалось открыть файл");
    } finally {
      e.target.value = "";
    }
  };

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <button type="button" onClick={addPlayer}>
        + Игрок
      </button>
      <button type="button" onClick={addBall}>
        + Мяч
      </button>
      <button type="button" onClick={removeSelected} disabled={!selectedId}>
        Удалить
      </button>
      <button type="button" onClick={handleExport} disabled={exportState.busy}>
        {exportState.busy ? `Экспорт… ${Math.round(exportState.progress * 100)}%` : "Экспорт GIF"}
      </button>
      <button type="button" onClick={handleSaveJson}>
        Сохранить JSON
      </button>
      <button type="button" onClick={() => fileInput.current?.click()}>
        Открыть JSON
      </button>
      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        style={{ display: "none" }}
        onChange={handleOpenJson}
      />
    </div>
  );
}
