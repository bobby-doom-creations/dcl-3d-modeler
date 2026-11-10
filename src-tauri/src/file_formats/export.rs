//! Unified export handler
//!
/// Delegates to the appropriate format module based on file extension.

use anyhow::Result;

/// Export mesh data to a file in the format determined by extension
pub async fn export(path: &str, mesh_id: &str) -> Result<()> {
    let ext = std::path::Path::new(path)
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();

    match ext.as_str() {
        "3mf" => crate::file_formats::threemf::write(path, mesh_id).await,
        "glb" | "gltf" => crate::file_formats::glb::write(path, mesh_id).await,
        "obj" => crate::file_formats::obj::write(path, mesh_id).await,
        "stl" => crate::file_formats::stl::write(path, mesh_id).await,
        _ => Err(anyhow::anyhow!("Unsupported export format: .{}", ext)),
    }
}
