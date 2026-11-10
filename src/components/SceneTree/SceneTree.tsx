import { useState } from "react";

const nodes = [
  { id: "2", name: "Camera", type: "camera" },
  { id: "3", name: "Light", type: "light" },
];

export default function SceneTree() {
  const [selectedId, setSelectedId] = useState<string>("1");

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.headerText}>Scene</span>
        <button style={styles.toggleBtn}>▲</button>
      </div>
      <div style={styles.tree}>
        {nodes.map((node) => (
          <div
            key={node.id}
            style={{
              ...styles.node,
              ...(selectedId === node.id ? styles.nodeSelected : {}),
            }}
            onClick={() => setSelectedId(node.id)}
          >
            <span style={styles.nodeIcon}>
              {node.type === "mesh" ? "◆" : node.type === "camera" ? "◎" : "✦"}
            </span>
            <span style={styles.nodeName}>{node.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    flex: 1,
    overflowY: "auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 8px 4px",
    borderBottom: "1px solid var(--border-color)",
  },
  headerText: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "var(--text-secondary)",
  },
  toggleBtn: {
    fontSize: 10,
    color: "var(--text-muted)",
    padding: "0 4px",
  },
  tree: {
    padding: 4,
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  node: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 8px",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 12,
    transition: "all 0.1s",
  },
  nodeSelected: {
    background: "var(--bg-tertiary)",
    border: "1px solid var(--accent-blue)",
  },
  nodeIcon: {
    fontSize: 10,
    color: "var(--text-muted)",
    width: 14,
    textAlign: "center",
  },
  nodeName: {
    fontSize: 12,
    color: "var(--text-primary)",
  },
};
