import Canvas from "./canvas/Canvas";
import LayersPanel from "./canvas/LayersPanel";
import Toolbar from "./canvas/Toolbar";
import { useHotkeys } from "./editor/hotkeys";
import PropertiesPanel from "./editor/PropertiesPanel";
import Timeline from "./timeline/Timeline";

export default function App() {
  useHotkeys();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "#1b1b1b",
        color: "#eee",
      }}
    >
      <div style={{ padding: 12, borderBottom: "1px solid #333" }}>
        <Toolbar />
      </div>
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <aside
          style={{
            width: 240,
            borderRight: "1px solid #333",
            overflow: "auto",
            background: "#222",
            flexShrink: 0,
          }}
        >
          <LayersPanel />
        </aside>
        <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
          <Canvas />
        </div>
        <aside
          style={{
            width: 280,
            borderLeft: "1px solid #333",
            overflow: "auto",
            background: "#222",
          }}
        >
          <PropertiesPanel />
        </aside>
      </div>
      <Timeline />
    </div>
  );
}
