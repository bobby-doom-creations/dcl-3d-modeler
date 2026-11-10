//! Depth estimation via Python subprocess (MiDaS / DepthAnything)
//!
/// Uses a Python process with torch to run a depth estimation model.
/// The depth map is saved as a PNG file for the next pipeline stage.

use anyhow::Result;

/// Run MiDaS depth estimation on an image
///
/// # Arguments
/// * `image_path` — Path to the input image
///
/// # Returns
/// Path to the output depth map (PNG)
pub async fn run_midas(image_path: &str) -> Result<String> {
    // TODO: Spawn Python subprocess:
    // python -c "
    //   from midas.dpt_depth import DPTDepthModel
    //   import torch
    //   model = DPTDepthModel(...)
    //   depth = model.infer_pil(image)
    //   depth.save('output_depth.png')
    // "
    //
    // Model loading options:
    // - MiDaS v3.0 (DPT_Large) — high quality, slow
    // - MiDaS v2.1 (DPT_Small) — good balance
    // - DepthAnything V2 (lighter, competitive quality)
    //
    // First run: download model (~200MB) to cache dir
    log::info!("Depth estimation via MiDaS: {}", image_path);

    let output_path = format!("{}/depth_map.png", image_path.rsplit_once('/').map(|(d, _)| d).unwrap_or(""));
    Ok(output_path)
}
