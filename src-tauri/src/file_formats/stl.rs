//! STL file loading
//!
//! Supports both ASCII and binary STL formats.
/// STL is the simplest 3D format — just vertices and normals per triangle.

use anyhow::{Context, Result};
use std::path::Path;
use serde_json::json;

/// Read an STL file (binary or ASCII auto-detection)
pub async fn read(path: &str) -> Result<serde_json::Value> {
    // TODO: Implement STL parsing
    // Binary STL: 80-byte header + 50 bytes per triangle (normal + 3 vertices)
    // ASCII STL: "solid", "facet normal", "outer loop", "vertex" lines
    log::info!("Reading STL: {}", path);

    let data = json!({
        "id": "stl_loaded_1",
        "name": Path::new(path).file_stem().unwrap_or_default().to_string_lossy(),
        "format": "stl",
        "vertices": [],
        "faces": [],
        "triangle_count": 0
    });

    Ok(data)
}

/// Write mesh data to an STL file (binary format)
pub async fn write(path: &str, mesh_id: &str) -> Result<()> {
    // TODO: Write binary STL
    // 1. 80-byte header
    // 2. u32 triangle count
    // 3. For each triangle: normal (3 f32) + 3 vertices (3 f32 each)
    log::info!("Writing STL: {} (mesh: {})", path, mesh_id);
    Ok(())
}
