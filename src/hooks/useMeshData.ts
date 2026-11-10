/** Tauri IPC hook for mesh operations and file I/O.

Wraps all `@tauri-apps/api` invoke calls with a consistent error
handling layer.  Every public method returns `{ ok: true, data }` or
`{ ok: false, error }`.

File dialogs are delegated to the Rust backend via
`invoke("file_dialog_open")` which uses the Tauri native dialog.
*/
import { invoke } from "@tauri-apps/api/core";

// ──────────────────────────────────────────────────
// Types matching the Rust structs
// ──────────────────────────────────────────────────

export interface TransformInput {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

export interface MeshTransformPayload {
  mesh_id: string;
  operation: string;
  value: number[];
}

export interface MeshBooleanPayload {
  mesh_a: string;
  mesh_b: string;
  operation: "union" | "subtract" | "intersect";
}

export interface MeshExtrudePayload {
  mesh_id: string;
  face_index: number;
  depth: number;
}

export interface MeshDecimatePayload {
  mesh_id: string;
  target_faces: number;
}

export interface FileLoadResult {
  meshes: Array<{
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
  }>;
}

export type IPCResult<T> = { ok: true; data: T } | { ok: false; error: string };

// ──────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────

async function invokeSafe<T>(command: string, args: Record<string, unknown>): Promise<IPCResult<T>> {
  try {
    const data = await invoke<T>(command, args);
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

// ──────────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────────

/** Open a native file dialog (via Rust backend). */
export async function openFileDialog(
  title = "Open 3D Model"
): Promise<IPCResult<string>> {
  const result = await invokeSafe<string>("file_dialog_open", { title });
  return result;
}

/** Save to a native file dialog and return the selected path. */
export async function saveFileDialog(
  title = "Save 3D Model"
): Promise<IPCResult<string>> {
  // Tauri v2: save dialogs are done through the same file() API
  // We invoke it with a special title and the Rust side handles save mode
  const result = await invokeSafe<string>("file_dialog_open", { title });
  return result;
}

/** Apply a transform operation to a mesh via the Rust backend. */
export async function meshTransform(
  meshId: string,
  operation: string,
  value: number[]
): Promise<IPCResult<void>> {
  const payload: MeshTransformPayload = { mesh_id: meshId, operation, value };
  const result = await invokeSafe<void>("mesh_transform", payload);
  return result;
}

/** Boolean operation between two meshes. */
export async function meshBoolean(
  meshA: string,
  meshB: string,
  operation: "union" | "subtract" | "intersect"
): Promise<IPCResult<string>> {
  const payload: MeshBooleanPayload = { mesh_a: meshA, mesh_b: meshB, operation };
  const result = await invokeSafe<string>("mesh_boolean", payload);
  return result;
}

/** Extrude a face of a mesh. */
export async function meshExtrude(
  meshId: string,
  faceIndex: number,
  depth: number
): Promise<IPCResult<string>> {
  const payload: MeshExtrudePayload = { mesh_id: meshId, face_index: faceIndex, depth };
  const result = await invokeSafe<string>("mesh_extrude", payload);
  return result;
}

/** Decimate (reduce) a mesh. */
export async function meshDecimate(
  meshId: string,
  targetFaces: number
): Promise<IPCResult<string>> {
  const payload: MeshDecimatePayload = { mesh_id: meshId, target_faces: targetFaces };
  const result = await invokeSafe<string>("mesh_decimate", payload);
  return result;
}

/** Open a file and return parsed mesh data. */
export async function fileOpen(path: string): Promise<IPCResult<FileLoadResult>> {
  const result = await invokeSafe<FileLoadResult>("file_open", { path });
  return result;
}

/** Save the current model to a file. */
export async function fileSave(path: string): Promise<IPCResult<void>> {
  const result = await invokeSafe<void>("file_save", { path });
  return result;
}

/** Export the selected mesh to 3MF. */
export async function export3MF(path: string, meshId: string): Promise<IPCResult<void>> {
  const result = await invokeSafe<void>("export_3mf", { path, mesh_id: meshId });
  return result;
}
