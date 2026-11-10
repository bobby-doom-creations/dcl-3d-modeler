//! DCL 3D Modeler — Rust backend entry point
//!
//! Tauri library module. Registers all IPC command handlers
//! and exposes mesh operations, file I/O, and image-to-3D pipelines.

mod mesh_ops;
mod file_formats;
mod image_to_3d;
mod util;

use tauri::{Emitter, Manager};
use tauri_plugin_dialog::DialogExt;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MeshData {
    pub id: String,
    pub name: String,
    pub vertices: Vec<[f64; 3]>,
    pub faces: Vec<[u32; 3]>,
    pub normals: Vec<[f64; 3]>,
    pub transform: Transform,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Transform {
    pub position: [f64; 3],
    pub rotation: [f64; 3],
    pub scale: [f64; 3],
}

impl Default for Transform {
    fn default() -> Self {
        Self {
            position: [0.0, 0.0, 0.0],
            rotation: [0.0, 0.0, 0.0],
            scale: [1.0, 1.0, 1.0],
        }
    }
}

// =============================================================================
// File Dialog Command
// =============================================================================

#[command]
async fn file_dialog_open(
  app: tauri::AppHandle,
  title: Option<String>,
) -> Result<String, String> {
  let title = title.unwrap_or_else(|| "Open 3D Model".to_string());

  let chosen = app
    .dialog()
    .file()
    .set_title(title)
    .add_filter("3D Models", &["3mf", "glb", "obj"])
    .blocking_pick_file()
    .and_then(|f| f.as_path().map(|p| p.to_string_lossy().to_string()))
    .ok_or("File dialog cancelled")?;

  Ok(chosen)
}

use tauri::command;

#[command]
async fn mesh_transform(
    app: tauri::AppHandle,
    mesh_id: String,
    operation: String,
    value: Vec<f64>,
) -> Result<(), String> {
    // Forward to mesh_ops module
    mesh_ops::transform(&mesh_id, &operation, &value)
        .map_err(|e| e.to_string())?;
    app.emit("model-updated", "transform-applied").map_err(|e| e.to_string())?;
    Ok(())
}

#[command]
async fn mesh_boolean(
    app: tauri::AppHandle,
    mesh_a_vertices: Vec<[f64; 3]>,
    mesh_a_faces: Vec<[u32; 3]>,
    mesh_b_vertices: Vec<[f64; 3]>,
    mesh_b_faces: Vec<[u32; 3]>,
    operation: String,
) -> Result<String, String> {
    let result_id = mesh_ops::boolean::apply(
        mesh_a_vertices,
        mesh_a_faces,
        mesh_b_vertices,
        mesh_b_faces,
        &operation,
    )
    .map_err(|e| e.to_string())?;
    app.emit("model-updated", "boolean-applied").map_err(|e| e.to_string())?;
    Ok(result_id)
}

#[command]
async fn mesh_extrude(
    app: tauri::AppHandle,
    mesh_id: String,
    face_index: u32,
    depth: f64,
) -> Result<String, String> {
    // OWASP: Validate face index bounds before processing
    if face_index > 1_000_000 {
        return Err("Face index exceeds safety limit (1M)".to_string());
    }
    let result_id = mesh_ops::extrude_face(&mesh_id, face_index, depth)
        .map_err(|e| e.to_string())?;
    app.emit("model-updated", "extrude-applied").map_err(|e| e.to_string())?;
    Ok(result_id)
}

#[command]
async fn mesh_decimate(
    app: tauri::AppHandle,
    mesh_id: String,
    target_faces: u32,
) -> Result<String, String> {
    // OWASP SEC-002: Cap decimation target to prevent abuse
    if target_faces > 10_000_000 {
        return Err("Decimation target exceeds safety limit (10M faces)".to_string());
    }
    let result_id = mesh_ops::decimate(&mesh_id, target_faces)
        .map_err(|e| e.to_string())?;
    app.emit("model-updated", "decimate-applied").map_err(|e| e.to_string())?;
    Ok(result_id)
}

#[command]
async fn file_open(path: String) -> Result<serde_json::Value, String> {
    // Detect format from extension and delegate to appropriate module
    file_formats::load(&path).await.map_err(|e| e.to_string())
}

#[command]
async fn export_3mf(
    path: String,
    mesh_id: String,
) -> Result<(), String> {
    file_formats::threemf::write(&path, &mesh_id)
        .await
        .map_err(|e| e.to_string())
}

#[command]
async fn file_save(path: String) -> Result<(), String> {
    file_formats::save(&path).await.map_err(|e| e.to_string())
}

#[command]
async fn image_to_3d(
    image_path: String,
) -> Result<serde_json::Value, String> {
    image_to_3d::pipeline::run(&image_path)
        .await
        .map_err(|e| e.to_string())
}

// =============================================================================
// Tauri Setup
// =============================================================================

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            file_dialog_open,
            mesh_transform,
            mesh_boolean,
            mesh_extrude,
            mesh_decimate,
            file_open,
            export_3mf,
            file_save,
            image_to_3d,
        ])
        .run(tauri::generate_context!())
        .expect("error while running DCL 3D Modeler");
}
