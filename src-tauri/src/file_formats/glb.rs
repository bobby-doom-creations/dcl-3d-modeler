//! GLB / glTF file handling
//!
//! Uses the `gltf` crate for reading GLB files.
/// GLB is the binary variant of glTF 2.0 — compact, single-file format.

use anyhow::Result;
use std::path::Path;
use serde_json::json;

/// Read a GLB/glTF file
pub async fn read(path: &str) -> Result<serde_json::Value> {
    // TODO: Implement gltf::Reader::from_slice for GLB
    // Parse binary buffer → extract meshes, materials, animations
    log::info!("Reading GLB: {}", path);

    let data = json!({
        "id": "glb_loaded_1",
        "name": Path::new(path).file_stem().unwrap_or_default().to_string_lossy(),
        "format": "glb",
        "vertices": [[0.0, 0.0, 0.0], [1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]],
        "faces": [[0, 1, 2], [0, 2, 3]],
        "materials": [],
        "animations": []
    });

    Ok(data)
}

/// Write mesh data to a GLB file
pub async fn write(path: &str, mesh_id: &str) -> Result<()> {
    // TODO: Implement gltf::Scene creation and binary serialization
    // 1. Create gltf::Document with mesh, buffers, accessors
    // 2. Serialize to binary GLB format
    log::info!("Writing GLB: {} (mesh: {})", path, mesh_id);
    Ok(())
}
