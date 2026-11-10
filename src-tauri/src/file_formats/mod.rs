//! File formats module
//!
//! Handles all file I/O: loading and exporting 3D models in various formats.
//! Format is determined by file extension.

pub mod threemf;
pub mod glb;
pub mod obj;
pub mod stl;
pub mod export;

use anyhow::Result;
use std::path::Path;

/// Load a 3D model from a file (auto-detect format from extension)
pub async fn load(path: &str) -> Result<serde_json::Value> {
    let ext = Path::new(path)
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();

    match ext.as_str() {
        "3mf" => threemf::read(path).await,
        "glb" | "gltf" => glb::read(path).await,
        "obj" => obj::read(path).await,
        "stl" => stl::read(path).await,
        _ => Err(anyhow::anyhow!("Unsupported file format: .{}", ext)),
    }
}

/// Save the current model to a file
pub async fn save(path: &str) -> Result<()> {
    let ext = Path::new(path)
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();

    match ext.as_str() {
        "3mf" => threemf::write(path, "current").await,
        "glb" | "gltf" => glb::write(path, "current").await,
        "obj" => obj::write(path, "current").await,
        "stl" => stl::write(path, "current").await,
        _ => Err(anyhow::anyhow!("Unsupported export format: .{}", ext)),
    }
}
