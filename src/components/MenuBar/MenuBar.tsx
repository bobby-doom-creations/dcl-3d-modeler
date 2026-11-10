/** Interactive MenuBar.

File menu:
  - New:   clears the scene (creates a fresh default cube)
  - Open:  opens the file dialog, imports the selected file
  - Save:  opens the save dialog and calls the Tauri save command
  - Export > .3mf / .glb / .obj:
    opens a save dialog and exports via Tauri backend

Edit menu:
  - Undo (Ctrl+Z)
  - Redo (Ctrl+Shift+Z)

View menu:
  - Toggle Wireframe
  - Toggle Grid
*/
import { useMeshStore } from "../../hooks/useMeshStore";
import {
  openFileDialog,
  saveFileDialog,
  fileOpen,
  fileSave,
  export3MF,
} from "../../hooks/useMeshData";

/* ───────────────────────────────────────────────────
   Sub-menu button (dropdown style)
   ─────────────────────────────────────────────────── */

function DropMenu({ label, items }: { label: string; items: { label: string; action: () => void }[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={styles.menuWrapper}>
      <button
        style={{
          ...styles.menuItem,
          ...(!open ? styles.menuItemHover : {}),
        }}
        onClick={() => setOpen(!open)}
      >
        {label}
      </button>
      {open && (
        <>
          <div
            style={styles.menuOverlay}
            onClick={() => setOpen(false)}
          />
          <div style={styles.menuDropdown}>
            {items.map((item, i) => (
              <button
                key={i}
                style={styles.menuDropdownItem}
                onClick={() => {
                  item.action();
                  setOpen(false);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

import { useState } from "react";

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    alignItems: "center",
    height: "100%",
    flex: 1,
    gap: 2,
    position: "relative",
  },
  menuItem: {
    padding: "4px 10px",
    fontSize: 12,
    borderRadius: 4,
    transition: "background 0.15s",
  },
  menuItemHover: {
    background: "var(--bg-tertiary)",
  },
  spacer: {
    flex: 1,
  },
  brandLabel: {
    fontSize: 11,
    color: "var(--text-secondary)",
    fontWeight: 600,
    letterSpacing: 0.5,
  },
  menuWrapper: {
    position: "relative",
  },
  menuOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  menuDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    minWidth: 180,
    background: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: 6,
    boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
    zIndex: 999,
    padding: "4px 0",
    display: "flex",
    flexDirection: "column",
    gap: 1,
  },
  menuDropdownItem: {
    padding: "6px 14px",
    fontSize: 12,
    textAlign: "left",
    borderRadius: 4,
    color: "var(--text-primary)",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    transition: "background 0.1s",
  },
};

/* ───────────────────────────────────────────────────
   MenuBar — Public component
   ─────────────────────────────────────────────────── */

export default function MenuBar() {
  const {
    meshes,
    selectedMeshId,
    addMesh,
    setFileName,
    setWireframe,
    setShowGrid,
    pushHistory,
    undo,
    redo,
  } = useMeshStore();

  /* ── File menu actions ── */

  const handleNew = () => {
    meshes.clear();
    addMesh({
      id: "cube-1",
      name: "Cube",
      vertices: [
        [-1, -1, 1],
        [1, -1, 1],
        [1, 1, 1],
        [-1, 1, 1],
        [-1, -1, -1],
        [1, -1, -1],
        [1, 1, -1],
        [-1, 1, -1],
      ] as [number, number, number][],
      faces: [
        [0, 1, 2], [0, 2, 3],
        [1, 5, 6], [1, 6, 2],
        [5, 4, 7], [5, 7, 6],
        [4, 0, 3], [4, 3, 7],
        [4, 5, 1], [4, 1, 0],
        [3, 2, 6], [3, 6, 7],
      ] as [number, number, number][],
      transform: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      },
      visible: true,
      locked: false,
    });
    pushHistory({ type: "new", payload: {}, timestamp: Date.now() });
    setFileName("Untitled");
  };

  const handleOpen = async () => {
    const result = await openFileDialog();
    if (result.ok) {
      const fileResult = await fileOpen(result.data);
      if (fileResult.ok) {
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
        pushHistory({ type: "open", payload: { path: result.data }, timestamp: Date.now() });
        setFileName(result.data.split("/").pop() || "Untitled");
      }
    }
  };

  const handleSave = async () => {
    const result = await saveFileDialog();
    if (result.ok) {
      await fileSave(result.data);
      setFileName(result.data.split("/").pop() || "Untitled");
    }
  };

  const handleExport = async (format: string) => {
    if (!selectedMeshId) return;
    const result = await saveFileDialog(`Export ${format.toUpperCase()}`);
    if (result.ok) {
      const exportPath = result.data.endsWith(".3mf") ? result.data : result.data + ".3mf";
      await export3MF(exportPath, selectedMeshId);
    }
  };

  /* ── Edit menu actions ── */

  const handleUndo = () => undo();
  const handleRedo = () => redo();

  /* ── View menu actions ── */

  const toggleWireframe = () => setWireframe(!useMeshStore.getState().wireframe);
  const toggleGrid = () => setShowGrid(!useMeshStore.getState().showGrid);

  return (
    <nav style={styles.container}>
      {/* ── File ── */}
      <DropMenu
        label="File"
        items={[
          { label: "New", action: handleNew },
          { label: "Open...", action: handleOpen },
          { label: "Save", action: handleSave },
          { label: "─", action: () => {} },
          { label: "Export .3mf", action: () => handleExport("3mf") },
          { label: "Export .glb", action: () => handleExport("glb") },
          { label: "Export .obj", action: () => handleExport("obj") },
        ]}
      />

      {/* ── Edit ── */}
      <DropMenu
        label="Edit"
        items={[
          { label: "Undo\tCtrl+Z", action: handleUndo },
          { label: "Redo\tCtrl+Shift+Z", action: handleRedo },
        ]}
      />

      {/* ── View ── */}
      <DropMenu
        label="View"
        items={[
          { label: "Wireframe", action: toggleWireframe },
          { label: "Grid", action: toggleGrid },
        ]}
      />

      {/* ── Spacer + Brand ── */}
      <div style={styles.spacer} />
      <button style={styles.brandLabel}>DCL 3D Modeler v0.1.0</button>
    </nav>
  );
}
