/** Zustand store for 3D model mesh state management.

Holds the full scene graph: meshes with transforms, selection, active tool,
and operation history for undo/redo.
*/
import { create } from "zustand";

export interface MeshData {
  id: string;
  name: string;
  vertices: [number, number, number][];
  faces: [number, number, number][];
  transform: {
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
  };
  visible: boolean;
  locked: boolean;
}

export type Tool =
  | "select"
  | "move"
  | "scale"
  | "rotate"
  | "extrude"
  | "boolean"
  | "import";

export interface Operation {
  type: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

interface MeshStore {
  /* ── Meshes ── */
  meshes: Map<string, MeshData>;

  /* ── Selection ── */
  selectedMeshId: string | null;

  /* ── Active tool ── */
  tool: Tool;
  setTool: (tool: Tool) => void;

  /* ── Scene tree ── */
  selectedSceneId: string | null;
  setSelectedSceneId: (id: string | null) => void;

  /* ── Display options ── */
  wireframe: boolean;
  showGrid: boolean;
  setWireframe: (v: boolean) => void;
  setShowGrid: (v: boolean) => void;

  /* ── Actions ── */
  addMesh: (mesh: MeshData) => void;
  removeMesh: (id: string) => void;
  updateMeshTransform: (
    id: string,
    transform: Pick<MeshData["transform"], "position" | "rotation" | "scale">
  ) => void;
  selectMesh: (id: string | null) => void;

  /* ── History (undo/redo) ── */
  history: Operation[];
  historyIndex: number;
  pushHistory: (op: Operation) => void;
  undo: () => void;
  redo: () => void;

  /* ── Project state ── */
  fileName: string;
  setFileName: (name: string) => void;
}

export const useMeshStore = create<MeshStore>((set, get) => ({
  /* ── Default scene: a simple cube ── */
  meshes: new Map<string, MeshData>([
    [
      "cube-1",
      {
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
          [0, 1, 2],
          [0, 2, 3], // front
          [1, 5, 6],
          [1, 6, 2], // right
          [5, 4, 7],
          [5, 7, 6], // back
          [4, 0, 3],
          [4, 3, 7], // left
          [4, 5, 1],
          [4, 1, 0], // bottom
          [3, 2, 6],
          [3, 6, 7], // top
        ] as [number, number, number][],
        transform: {
          position: [0, 0, 0] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
          scale: [1, 1, 1] as [number, number, number],
        },
        visible: true,
        locked: false,
      },
    ],
  ]),

  selectedMeshId: null,
  selectedSceneId: null,
  tool: "select",
  wireframe: false,
  showGrid: true,
  fileName: "Untitled",

  history: [],
  historyIndex: -1,

  /* ── Actions ── */
  setTool: (tool) => set(() => ({ tool })),

  setSelectedSceneId: (id) =>
    set(() => ({ selectedSceneId: id })),

  setWireframe: (wireframe) => set(() => ({ wireframe })),
  setShowGrid: (showGrid) => set(() => ({ showGrid })),

  addMesh: (mesh) =>
    set((state) => {
      const next = new Map(state.meshes);
      next.set(mesh.id, mesh);
      return { meshes: next };
    }),

  removeMesh: (id) =>
    set((state) => {
      const next = new Map(state.meshes);
      next.delete(id);
      return {
        meshes: next,
        selectedMeshId: state.selectedMeshId === id ? null : state.selectedMeshId,
      };
    }),

  updateMeshTransform: (id, transform) =>
    set((state) => {
      const mesh = state.meshes.get(id);
      if (!mesh) return state;
      const next = new Map(state.meshes);
      next.set(id, {
        ...mesh,
        transform: { ...mesh.transform, ...transform },
      });
      return { meshes: next };
    }),

  selectMesh: (id) => set(() => ({ selectedMeshId: id })),

  pushHistory: (op) =>
    set((state) => ({
      history: [...state.history.slice(0, state.historyIndex + 1), op],
      historyIndex: state.historyIndex + 1,
    })),

  undo: () =>
    set((state) => {
      if (state.historyIndex < 0) return state;
      const idx = state.historyIndex;
      const op = state.history[idx];

      // Reverse simple transform ops
      if (op.type === "transform") {
        const mesh = state.meshes.get(op.payload.meshId as string);
        if (mesh) {
          const next = new Map(state.meshes);
          next.set(op.payload.meshId as string, {
            ...mesh,
            transform: { ...(op.payload.prevTransform as object) },
          });
          return { meshes: next, historyIndex: idx - 1 };
        }
      }
      return { historyIndex: idx - 1 };
    }),

  redo: () =>
    set((state) => {
      if (state.historyIndex >= state.history.length - 1) return state;
      const idx = state.historyIndex + 1;
      const op = state.history[idx];
      if (op.type === "transform") {
        const mesh = state.meshes.get(op.payload.meshId as string);
        if (mesh) {
          const next = new Map(state.meshes);
          next.set(op.payload.meshId as string, {
            ...mesh,
            transform: { ...(op.payload.newTransform as object) },
          });
          return { meshes: next, historyIndex: idx };
        }
      }
      return { historyIndex: idx };
    }),

  setFileName: (fileName) => set(() => ({ fileName })),
}));
