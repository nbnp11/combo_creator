import Canvas from "./canvas/Canvas";
import Toolbar from "./canvas/Toolbar";
import Timeline from "./timeline/Timeline";

export default function App() {
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
      <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
        <Canvas />
      </div>
      <Timeline />
    </div>
  );
}
