/** Interactive PropertiesPanel.

When a mesh is selected it displays its transform values (position,
rotation, scale) and lets the user edit them through numeric inputs.
Changes are dispatched to the zustand store and pushed to the Tauri
backend via `meshTransform`.
*/
import { useState } from "react";
import { useMeshStore } from "../../hooks/useMeshStore";
import { meshTransform } from "../../hooks/useMeshData";

function NumericInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div style={styles.inputGroup}>
      <span style={styles.inputLabel}>{label}</span>
      <input
        type="number"
        step="0.1"
        value={value.toFixed(2)}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      />
    </div>
  );
}

function TransformSection() {
  const { selectedMeshId, meshes, updateMeshTransform, pushHistory } =
    useMeshStore();

  if (!selectedMeshId) {
    return (
      <div style={styles.empty}>
        <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center" }}>
          No mesh selected
        </p>
      </div>
    );
  }

  const mesh = meshes.get(selectedMeshId);
  if (!mesh) return null;

  const { transform } = mesh;

  return (
    <div>
      <NumericInput
        label="X"
        value={transform.position[0]}
        onChange={(v) => {
          const prev = transform.position.slice() as [number, number, number];
          updateMeshTransform(selectedMeshId, {
            position: [v, transform.position[1], transform.position[2]],
          });
          pushHistory({
            type: "transform",
            payload: {
              meshId: selectedMeshId,
              prevTransform: { position: prev },
              newTransform: { position: [v, transform.position[1], transform.position[2]] },
            },
            timestamp: Date.now(),
          });
        }}
      />
      <NumericInput
        label="Y"
        value={transform.position[1]}
        onChange={(v) => {
          const prev = transform.position.slice() as [number, number, number];
          updateMeshTransform(selectedMeshId, {
            position: [transform.position[0], v, transform.position[2]],
          });
          pushHistory({
            type: "transform",
            payload: {
              meshId: selectedMeshId,
              prevTransform: { position: prev },
              newTransform: { position: [transform.position[0], v, transform.position[2]] },
            },
            timestamp: Date.now(),
          });
        }}
      />
      <NumericInput
        label="Z"
        value={transform.position[2]}
        onChange={(v) => {
          const prev = transform.position.slice() as [number, number, number];
          updateMeshTransform(selectedMeshId, {
            position: [transform.position[0], transform.position[1], v],
          });
          pushHistory({
            type: "transform",
            payload: {
              meshId: selectedMeshId,
              prevTransform: { position: prev },
              newTransform: { position: [transform.position[0], transform.position[1], v] },
            },
            timestamp: Date.now(),
          });
        }}
      />
    </div>
  );
}

function RotationSection() {
  const { selectedMeshId, meshes, updateMeshTransform, pushHistory } =
    useMeshStore();

  if (!selectedMeshId) return null;
  const mesh = meshes.get(selectedMeshId);
  if (!mesh) return null;

  const { rotation } = mesh.transform;

  return (
    <div>
      <NumericInput
        label="X"
        value={rotation[0]}
        onChange={(v) => {
          updateMeshTransform(selectedMeshId, {
            rotation: [v, rotation[1], rotation[2]],
          });
        }}
      />
      <NumericInput
        label="Y"
        value={rotation[1]}
        onChange={(v) => {
          updateMeshTransform(selectedMeshId, {
            rotation: [rotation[0], v, rotation[2]],
          });
        }}
      />
      <NumericInput
        label="Z"
        value={rotation[2]}
        onChange={(v) => {
          updateMeshTransform(selectedMeshId, {
            rotation: [rotation[0], rotation[1], v],
          });
        }}
      />
    </div>
  );
}

function ScaleSection() {
  const { selectedMeshId, meshes, updateMeshTransform, pushHistory } =
    useMeshStore();

  if (!selectedMeshId) return null;
  const mesh = meshes.get(selectedMeshId);
  if (!mesh) return null;

  const { scale } = mesh.transform;

  return (
    <div>
      <NumericInput
        label="X"
        value={scale[0]}
        onChange={(v) => {
          updateMeshTransform(selectedMeshId, {
            scale: [v, scale[1], scale[2]],
          });
        }}
      />
      <NumericInput
        label="Y"
        value={scale[1]}
        onChange={(v) => {
          updateMeshTransform(selectedMeshId, {
            scale: [scale[0], v, scale[2]],
          });
        }}
      />
      <NumericInput
        label="Z"
        value={scale[2]}
        onChange={(v) => {
          updateMeshTransform(selectedMeshId, {
            scale: [scale[0], scale[1], v],
          });
        }}
      />
    </div>
  );
}

function MeshInfoSection() {
  const { selectedMeshId, meshes } = useMeshStore();

  if (!selectedMeshId) {
    return (
      <>
        <div style={styles.statRow}>
          <span style={styles.statLabel}>Vertices</span>
          <span style={styles.statValue}>—</span>
        </div>
        <div style={styles.statRow}>
          <span style={styles.statLabel}>Faces</span>
          <span style={styles.statValue}>—</span>
        </div>
        <div style={styles.statRow}>
          <span style={styles.statLabel}>Edges</span>
          <span style={styles.statValue}>—</span>
        </div>
      </>
    );
  }

  const mesh = meshes.get(selectedMeshId);
  if (!mesh) {
    return (
      <>
        <div style={styles.statRow}>
          <span style={styles.statLabel}>Vertices</span>
          <span style={styles.statValue}>—</span>
        </div>
        <div style={styles.statRow}>
          <span style={styles.statLabel}>Faces</span>
          <span style={styles.statValue}>—</span>
        </div>
        <div style={styles.statRow}>
          <span style={styles.statLabel}>Edges</span>
          <span style={styles.statValue}>—</span>
        </div>
      </>
    );
  }

  const vertexCount = mesh.vertices.length;
  const faceCount = mesh.faces.length;
  // Euler's formula: V - E + F = 2 (for a closed manifold), E ≈ 3F/2
  const edgeCount = Math.round((faceCount * 3) / 2);

  return (
    <>
      <div style={styles.statRow}>
        <span style={styles.statLabel}>Vertices</span>
        <span style={styles.statValue}>{vertexCount}</span>
      </div>
      <div style={styles.statRow}>
        <span style={styles.statLabel}>Faces</span>
        <span style={styles.statValue}>{faceCount}</span>
      </div>
      <div style={styles.statRow}>
        <span style={styles.statLabel}>Edges</span>
        <span style={styles.statValue}>{edgeCount}</span>
      </div>
    </>
  );
}

export default function PropertiesPanel() {
  const { selectedMeshId, meshes } = useMeshStore();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.headerText}>
          Properties
          {selectedMeshId && meshes.get(selectedMeshId) && (
            <span style={styles.meshName}>
              — {meshes.get(selectedMeshId)!.name}
            </span>
          )}
        </span>
      </div>

      <div style={styles.sections}>
        {/* Transform */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Position</h3>
          <div style={styles.sectionBody}>
            <TransformSection />
          </div>
        </div>

        {/* Rotation */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Rotation (deg)</h3>
          <div style={styles.sectionBody}>
            <RotationSection />
          </div>
        </div>

        {/* Scale */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Scale</h3>
          <div style={styles.sectionBody}>
            <ScaleSection />
          </div>
        </div>

        {/* Mesh Info */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Mesh</h3>
          <div style={styles.sectionBody}>
            <MeshInfoSection />
          </div>
        </div>

        {/* Actions */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Actions</h3>
          <div style={styles.actions}>
            <button
              style={styles.actionBtn}
              onClick={() => {
                if (selectedMeshId) {
                  useMeshStore.getState().removeMesh(selectedMeshId);
                }
              }}
            >
              Delete
            </button>
            <button
              style={styles.actionBtn}
              onClick={() => {
                if (selectedMeshId) {
                  const mesh = meshes.get(selectedMeshId);
                  if (mesh) {
                    const newId = mesh.id + "-copy";
                    useMeshStore.getState().addMesh({
                      ...mesh,
                      id: newId,
                      name: mesh.name + " Copy",
                      transform: {
                        ...mesh.transform,
                        position: [mesh.transform.position[0] + 1, 0, 0],
                      },
                    });
                    useMeshStore.getState().selectMesh(newId);
                  }
                }
              }}
            >
              Clone
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: 12,
  },
  header: {
    padding: "4px 0 12px",
    borderBottom: "1px solid var(--border-color)",
  },
  headerText: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "var(--text-secondary)",
  },
  meshName: {
    fontSize: 10,
    fontWeight: 400,
    textTransform: "none",
    letterSpacing: 0,
    color: "var(--accent-blue)",
    marginLeft: 6,
  },
  sections: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    marginTop: 12,
  },
  section: {
    borderBottom: "1px solid var(--border-color)",
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "var(--text-secondary)",
    marginBottom: 8,
  },
  sectionBody: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  statRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "2px 0",
  },
  statLabel: {
    fontSize: 11,
    color: "var(--text-secondary)",
  },
  statValue: {
    fontSize: 11,
    fontFamily: "monospace",
    color: "var(--accent-green)",
  },
  propRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  propLabel: {
    width: 60,
    fontSize: 11,
    color: "var(--text-secondary)",
    flexShrink: 0,
  },
  propInputs: {
    display: "flex",
    gap: 4,
    flex: 1,
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 1,
    flex: 1,
  },
  inputLabel: {
    fontSize: 9,
    color: "var(--text-muted)",
    fontWeight: 600,
  },
  actions: {
    display: "flex",
    gap: 6,
  },
  actionBtn: {
    flex: 1,
    padding: "4px 8px",
    fontSize: 11,
    borderRadius: 4,
    background: "var(--bg-tertiary)",
    border: "1px solid var(--border-color)",
    transition: "all 0.15s",
  },
  empty: {
    padding: 12,
    textAlign: "center",
  },
};
