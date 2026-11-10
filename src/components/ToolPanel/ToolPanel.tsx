/** ToolPanel — Interactive tool selection and import.

The active tool is managed by the Zustand store and affects the
TransformControls mode in the viewport.  The Import tool opens a file
dialog (via Tauri IPC) to load .3mf / .glb / .obj files.
*/
import { useMeshStore } from "../../hooks/useMeshStore";
import { openFileDialog, fileOpen } from "../../hooks/useMeshData";

interface ToolPanelProps {
  activeTool: string;
  onSelectTool: (tool: string) => void;
}

const tools = [
  { id: "select", icon: "◇", label: "Select" },
  { id: "move", icon: "✥", label: "Move" },
  { id: "scale", icon: "⤢", label: "Scale" },
  { id: "rotate", icon: "↻", label: "Rotate" },
  { id: "extrude", icon: "▤", label: "Extrude" },
  { id: "boolean", icon: "⊕", label: "Boolean" },
  { id: "import", icon: "⬇", label: "Import" },
];

export default function ToolPanel({ activeTool, onSelectTool }: ToolPanelProps) {
  const { setTool, addMesh, pushHistory, selectedMeshId, meshes } = useMeshStore();

  const handleToolSelect = (toolId: string) => {
    onSelectTool(toolId);
    setTool(toolId as any);
  };

  const handleImport = async () => {
    const result = await openFileDialog("Import 3D Model");
    if (result.ok) {
      const fileResult = await fileOpen(result.data);
      if (fileResult.ok) {
        // Import meshes from the file
        for (const m of fileResult.data.meshes) {
          addMesh({
            id: m.id,
            name: m.name,
            vertices: m.vertices,
            faces: m.faces,
            transform: m.transform,
            visible: true,
            locked: false,
          });
        }
        pushHistory({
          type: "import",
          payload: { path: result.data, meshCount: fileResult.data.meshes.length },
          timestamp: Date.now(),
        });
      } else {
        console.error("Failed to load file:", fileResult.error);
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.toolsHeader}>
        <span style={styles.toolsLabel}>Tools</span>
      </div>
      <div style={styles.tools}>
        {tools.map((t) => (
          <button
            key={t.id}
            style={{
              ...styles.toolBtn,
              ...(activeTool === t.id ? styles.toolBtnActive : {}),
            }}
            title={t.label}
            onClick={
              t.id === "import"
                ? handleImport
                : () => handleToolSelect(t.id)
            }
          >
            {t.icon}
          </button>
        ))}
      </div>
      <div style={styles.bottom}>
        {/* Undo / Redo */}
        <div style={styles.historyBtns}>
          <button
            style={styles.historyBtn}
            disabled={useMeshStore.getState().historyIndex < 0}
            onClick={() => useMeshStore.getState().undo()}
            title="Undo (Ctrl+Z)"
          >
            ← Undo
          </button>
          <button
            style={styles.historyBtn}
            disabled={useMeshStore.getState().historyIndex >= useMeshStore.getState().history.length - 1}
            onClick={() => useMeshStore.getState().redo()}
            title="Redo (Ctrl+Shift+Z)"
          >
            Redo →
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: 8,
    gap: 8,
  },
  toolsHeader: {
    padding: "0 0 4px",
    borderBottom: "1px solid var(--border-color)",
  },
  toolsLabel: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "var(--text-secondary)",
  },
  tools: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  toolBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 44,
    height: 44,
    fontSize: 18,
    borderRadius: 6,
    transition: "all 0.15s",
    color: "var(--text-secondary)",
  },
  toolBtnActive: {
    background: "var(--bg-tertiary)",
    color: "var(--accent-blue)",
    boxShadow: "var(--glow-blue)",
    border: "1px solid var(--accent-blue)",
  },
  bottom: {
    marginTop: "auto",
    padding: "8px 0 0",
    borderTop: "1px solid var(--border-color)",
  },
  historyBtns: {
    display: "flex",
    gap: 4,
  },
  historyBtn: {
    flex: 1,
    padding: "4px 8px",
    fontSize: 10,
    borderRadius: 4,
    background: "var(--bg-tertiary)",
    border: "1px solid var(--border-color)",
    color: "var(--text-secondary)",
    cursor: "pointer",
  },
};
