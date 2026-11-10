import { useState } from "react";
import MenuBar from "./components/MenuBar/MenuBar";
import ToolPanel from "./components/ToolPanel/ToolPanel";
import Canvas3D from "./components/Canvas3D/Canvas3D";
import PropertiesPanel from "./components/PropertiesPanel/PropertiesPanel";
import SceneTree from "./components/SceneTree/SceneTree";
import { DCLLogo } from "./components/Branding/DCLLogo";

export default function AppLayout() {
  const [selectedTool, setSelectedTool] = useState<string>("select");
  const [sceneExpanded, setSceneExpanded] = useState(true);

  return (
    <div style={styles.container}>
      {/* ── Top Menu Bar ── */}
      <header style={styles.header}>
        <DCLLogo size="small" />
        <MenuBar />
      </header>

      {/* ── Main Content ── */}
      <div style={styles.main}>
        {/* ── Left Sidebar ── */}
        <aside style={styles.sidebar}>
          {sceneExpanded && <SceneTree />}
          <ToolPanel
            activeTool={selectedTool}
            onSelectTool={setSelectedTool}
          />
        </aside>

        {/* ── 3D Viewport (center) ── */}
        <main style={styles.viewport}>
          <Canvas3D />
        </main>

        {/* ── Right Properties Panel ── */}
        <aside style={styles.properties}>
          <PropertiesPanel />
        </aside>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    background: "var(--bg-primary)",
    color: "var(--text-primary)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    height: 40,
    padding: "0 12px",
    background: "var(--bg-secondary)",
    borderBottom: "1px solid var(--border-color)",
    gap: 12,
    flexShrink: 0,
  },
  main: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
  },
  sidebar: {
    display: "flex",
    flexDirection: "column",
    width: 260,
    background: "var(--bg-secondary)",
    borderRight: "1px solid var(--border-color)",
    overflowY: "auto",
    flexShrink: 0,
  },
  viewport: {
    flex: 1,
    position: "relative",
    background: "var(--bg-primary)",
    overflow: "hidden",
  },
  properties: {
    width: 280,
    background: "var(--bg-secondary)",
    borderLeft: "1px solid var(--border-color)",
    overflowY: "auto",
    flexShrink: 0,
  },
};
