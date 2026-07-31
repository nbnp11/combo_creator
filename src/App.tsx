import Canvas from "./canvas/Canvas";
import LayersPanel from "./canvas/LayersPanel";
import Toolbar from "./canvas/Toolbar";
import { useHotkeys } from "./editor/hotkeys";
import PropertiesPanel from "./editor/PropertiesPanel";
import Timeline from "./timeline/Timeline";

export default function App() {
  useHotkeys();
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <Toolbar />
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <aside
          style={{
            width: 224,
            borderRight: "1px solid var(--border)",
            background: "var(--panel)",
            overflowY: "auto",
            flexShrink: 0,
          }}
        >
          <LayersPanel />
        </aside>
        <main className="pb-stage">
          <Canvas />
        </main>
        <aside
          style={{
            width: 268,
            borderLeft: "1px solid var(--border)",
            background: "var(--panel)",
            overflowY: "auto",
            flexShrink: 0,
          }}
        >
          <PropertiesPanel />
        </aside>
      </div>
      <Timeline />
    </div>
  );
}
