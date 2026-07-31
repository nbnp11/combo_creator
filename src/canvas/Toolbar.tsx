import { useRef, useState } from "react";
import { downloadBlob, exportGif } from "../export/gifExporter";
import { loadProjectFile } from "../serialization/jsonLoader";
import { downloadProjectJson } from "../serialization/jsonSaver";
import { loadProjectYamlFile } from "../serialization/yamlLoader";
import { downloadProjectYaml } from "../serialization/yamlSaver";
import {
  createArrow,
  createBall,
  createCircle,
  createHighlight,
  createPlayer,
  createRectangle,
  createText,
  useHistory,
  useProjectStore,
} from "../store/projectStore";

export default function Toolbar() {
  const objects = useProjectStore((s) => s.objects);
  const selectedIds = useProjectStore((s) => s.selectedIds);
  const addObject = useProjectStore((s) => s.addObject);
  const removeSelected = useProjectStore((s) => s.removeSelected);
  const duplicateSelected = useProjectStore((s) => s.duplicateSelected);
  const snapEnabled = useProjectStore((s) => s.snapEnabled);
  const toggleSnap = useProjectStore((s) => s.toggleSnap);
  const settings = useProjectStore((s) => s.settings);
  const loadProject = useProjectStore((s) => s.loadProject);
  const { undo, redo, canUndo, canRedo, clear } = useHistory();
  const fileInput = useRef<HTMLInputElement>(null);
  const yamlInput = useRef<HTMLInputElement>(null);
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
  const addArrow = () => addObject(createArrow(300, 360));
  const addCircle = () => addObject(createCircle(300, 360));
  const addText = () => addObject(createText(300, 360));
  const addRectangle = () => addObject(createRectangle(300, 360));
  const addHighlight = () => addObject(createHighlight(300, 360));
  const hasSelection = selectedIds.length > 0;

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
  const handleSaveYaml = () => downloadProjectYaml(settings, objects);

  const handleOpenJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const project = await loadProjectFile(file);
      loadProject({ settings: project.settings, objects: project.objects });
      clear(); // загруженный проект — новая точка отсчёта, историю чистим
    } catch (err) {
      console.error("JSON load failed", err);
      window.alert(err instanceof Error ? err.message : "Не удалось открыть файл");
    } finally {
      e.target.value = "";
    }
  };

  const handleOpenYaml = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const project = await loadProjectYamlFile(file);
      loadProject({ settings: project.settings, objects: project.objects });
      clear();
    } catch (err) {
      console.error("YAML load failed", err);
      window.alert(err instanceof Error ? err.message : "Не удалось открыть файл");
    } finally {
      e.target.value = "";
    }
  };

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <button type="button" onClick={() => undo()} disabled={!canUndo} title="Отменить (Ctrl+Z)">
        ↶ Отменить
      </button>
      <button
        type="button"
        onClick={() => redo()}
        disabled={!canRedo}
        title="Вернуть (Ctrl+Shift+Z)"
      >
        ↷ Вернуть
      </button>
      <span style={{ width: 1, alignSelf: "stretch", background: "#444", margin: "0 4px" }} />
      <button type="button" onClick={addPlayer}>
        + Игрок
      </button>
      <button type="button" onClick={addBall}>
        + Мяч
      </button>
      <button type="button" onClick={addArrow}>
        + Стрелка
      </button>
      <button type="button" onClick={addCircle}>
        + Круг
      </button>
      <button type="button" onClick={addText}>
        + Текст
      </button>
      <button type="button" onClick={addRectangle}>
        + Прямоуг
      </button>
      <button type="button" onClick={addHighlight}>
        + Подсветка
      </button>
      <button
        type="button"
        onClick={removeSelected}
        disabled={!hasSelection}
        title="Удалить выделенное (Delete)"
      >
        Удалить
      </button>
      <button
        type="button"
        onClick={duplicateSelected}
        disabled={!hasSelection}
        title="Дублировать (Ctrl+D)"
      >
        Дублировать
      </button>
      <button
        type="button"
        onClick={toggleSnap}
        style={{ opacity: snapEnabled ? 1 : 0.5 }}
        title="Привязка к сетке при перетаскивании"
      >
        {snapEnabled ? "▦ Сетка вкл" : "▦ Сетка выкл"}
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
      <button type="button" onClick={handleSaveYaml}>
        Сохранить YAML
      </button>
      <button type="button" onClick={() => yamlInput.current?.click()}>
        Открыть YAML
      </button>
      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        style={{ display: "none" }}
        onChange={handleOpenJson}
      />
      <input
        ref={yamlInput}
        type="file"
        accept="text/yaml,.yaml,.yml"
        style={{ display: "none" }}
        onChange={handleOpenYaml}
      />
    </div>
  );
}
