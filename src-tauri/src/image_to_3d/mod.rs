//! Image-to-3D pipeline module
//!
//! Orchestrates the image-to-3D conversion process:
/// 1. Background removal (rembg)
/// 2. Depth estimation (MiDaS or DepthAnything)
/// 3. Height-map to mesh conversion (trimesh)
/// 4. Mesh cleanup (decimation, watertight)
///
/// All ML steps are handled via Python subprocess. The Rust backend
/// manages process lifecycle and handles mesh data after import.

pub mod pipeline;
pub mod depth_estimation;
pub mod mesh_generation;
pub mod python_bridge;
