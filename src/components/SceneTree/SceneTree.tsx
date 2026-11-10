/** Interactive SceneTree.

Shows the actual scene hierarchy from the Zustand store.  Clicking a
node selects the corresponding mesh in the viewport and highlights the
selected entry in the tree.
*/
import { useMeshStore } from "../../hooks/useMeshStore";

function NodeIcon({ type }: { type: string }) {
  const colorMap: Record<string, string> = {
    camera: "var(--accent-green)",
    light: "#ffcc00",
    mesh: "var(--accent-blue)",
  };
  return (
    <span
      style={{
        ...styles.nodeIcon,
        color: colorMap[type] ?? "var(--text-muted)",
      }}
    >
      {type === "mesh" ? "◆" : type === "camera" ? "◎" : "✦"}
    </span>
  );
}

function SceneNodeItem({ id, name, type }: { id: string; name: string; type: string }) {
  const { selectedMeshId, selectMesh, setSelectedSceneId, selectedSceneId } =
    useMeshStore();

  const isSelected = selectedMeshId === id || selectedSceneId === id;

  return (
    <div
      style={{
        ...styles.node,
        ...(isSelected ? styles.nodeSelected : {}),
      }}
      onClick={() => {
        selectMesh(id);
        setSelectedSceneId(id);
      }}
    >
      <NodeIcon type={type} />
      <span style={styles.nodeName}>{name}</span>
    </div>
  );
}

export default function SceneTree() {
  const { meshes, selectedMeshId, selectMesh, setSelectedSceneId, showGrid, setShowGrid, wireframe, setWireframe } =
    useMeshStore();
  const [expanded, setExpanded] = useState(true);

  const meshEntries = Array.from(meshes.values());

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.headerText}>Scene</span>
        <button
          style={styles.toggleBtn}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "▲" : "▼"}
        </button>
      </div>

      {/* Display toggles */}
      <div style={styles.toggles}>
        <label style={styles.toggleLabel}>
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => setShowGrid(e.target.checked)}
          />
          <span>Grid</span>
        </label>
        <label style={styles.toggleLabel}>
          <input
            type="checkbox"
            checked={wireframe}
            onChange={(e) => setWireframe(e.target.checked)}
          />
          <span>Wireframe</span>
        </label>
      </div>

      {expanded && (
        <div style={styles.tree}>
          {/* Camera entry (non-selectable) */}
          <div style={styles.node} onClick={() => {
            /* Reset camera to default view */
            const { gl } = (document.querySelector("canvas") as HTMLCanvasElement)?.getContext("webgl2") ||
                           (document.querySelector("canvas") as HTMLCanvasElement)?.getContext("webgl");
          }}>
            <NodeIcon type="camera" />
            <span style={styles.nodeName}>Camera</span>
          </div>

          {/* Lights entry */}
          <div style={styles.node}>
            <NodeIcon type="light" />
            <span style={styles.nodeName}>Light</span>
          </div>

          {/* Mesh entries */}
          {meshEntries.map((mesh) => (
            <SceneNodeItem
              key={mesh.id}
              id={mesh.id}
              name={mesh.name}
              type="mesh"
            />
          ))}
        </div>
      )}
    </div>
  );
}

import { useState } from "react";

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
  toggles: {
    display: "flex",
    gap: 8,
    padding: "6px 8px",
    borderBottom: "1px solid var(--border-color)",
  },
  toggleLabel: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontSize: 10,
    color: "var(--text-secondary)",
    cursor: "pointer",
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
    width: 14,
    textAlign: "center",
  },
  nodeName: {
    fontSize: 12,
    color: "var(--text-primary)",
  },
};
