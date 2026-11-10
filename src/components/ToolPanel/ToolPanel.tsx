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
  return (
    <div style={styles.container}>
      <div style={styles.tools}>
        {tools.map((t) => (
          <button
            key={t.id}
            style={{
              ...styles.toolBtn,
              ...(activeTool === t.id ? styles.toolBtnActive : {}),
            }}
            title={t.label}
            onClick={() => onSelectTool(t.id)}
          >
            {t.icon}
          </button>
        ))}
      </div>
      <div style={styles.bottom}>
        {/* Future: tool settings, undo/redo */}
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
};
