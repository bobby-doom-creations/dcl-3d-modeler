//! OBJ (Wavefront) file loading
//!
//! Uses the `wavefront_obj` crate (via tri-mesh dependency).
/// OBJ is a simple text format — good for intermediate import from other tools.

use anyhow::Result;
use std::path::Path;
use serde_json::json;

/// Read an OBJ file
pub async fn read(path: &str) -> Result<serde_json::Value> {
    // TODO: Implement wavefront_obj::obj_file
    // Parse text file:
    // - "v x y z" lines → vertices
    // - "f v1 v2 v3" lines → faces (triangles)
    // - "vn x y z" lines → normals
    // - "mtllib" + "usemtl" → materials
    log::info!("Reading OBJ: {}", path);

    let data = json!({
        "id": "obj_loaded_1",
        "name": Path::new(path).file_stem().unwrap_or_default().to_string_lossy(),
        "format": "obj",
        "vertices": [[0.0, 0.0, 0.0], [1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]],
        "faces": [[0, 1, 2], [0, 2, 3]],
        "materials": []
    });

    Ok(data)
}

/// Write mesh data to an OBJ file
pub async fn write(path: &str, mesh_id: &str) -> Result<()> {
    // TODO: Write OBJ text format
    // 1. Write "v x y z" for each vertex
    // 2. Write "vn x y z" for each normal
    // 3. Write "f v1 v2 v3" for each face
    log::info!("Writing OBJ: {} (mesh: {})", path, mesh_id);
    Ok(())
}
