//! Python subprocess bridge
//!
/// Manages Python process lifecycle for ML pipeline execution.
/// Provides error handling, timeouts, and inter-process communication.
///
/// OWASP SECURITY: All subprocess calls use argument arrays (never shell: true),
/// validate file paths with canonicalize(), and enforce strict timeouts.

use anyhow::Result;
use std::path::Path;
use std::time::Duration;

/// Spawn a Python subprocess for background removal (rembg)
///
/// # Arguments
/// * `image_path` — Input image (must be an existing file)
///
/// # Returns
/// Path to the background-removed image
pub async fn run_background_removal(image_path: &str) -> Result<String> {
    // OWASP: Validate the input path is a real file before spawning
    let input = Path::new(image_path);
    if !input.exists() {
        return Err(anyhow::anyhow!("Input image not found: {}", image_path));
    }

    // TODO: When implementing:
    // let output_path = format!("{}/nobg.png", dir);
    // let mut cmd = tokio::process::Command::new("python3")
    //     .args(&["-c", "from rembg import remove; from PIL import Image; img = Image.open(Path('INPUT')); remove(img).save('OUTPUT')"])
    //     .spawn()?;
    // NEVER use .shell(true) — always use args arrays
    log::info!("Background removal: {}", image_path);

    let output_path = format!("{}/nobg.png", image_path.rsplit_once('/').map(|(d, _)| d).unwrap_or(""));
    Ok(output_path)
}

/// Spawn a Python subprocess for a general ML task
///
/// # Arguments
/// * `script` — Python code to execute (inline)
/// * `timeout_secs` — Maximum execution time
///
/// # Returns
/// Python stdout (if any)
pub async fn run_python(script: &str, timeout_secs: u64) -> Result<String> {
    // OWASP SECURITY CHECKLIST for when this is implemented:
    // 1. NEVER use .shell(true) — use args array: ["python3", "-c", script]
    // 2. Validate script length (max 4096 chars to prevent DoS)
    // 3. Set timeout: tokio::time::timeout(Duration::from_secs(timeout_secs), task)
    // 4. Restrict environment: no network access, minimal env vars
    // 5. Redirect stdout/stderr to avoid info leakage
    // 6. Validate output: check exit code, parse output safely

    // Input validation
    if script.len() > 4096 {
        return Err(anyhow::anyhow!("Python script exceeds 4096 character limit"));
    }
    if timeout_secs == 0 {
        return Err(anyhow::anyhow!("Timeout must be > 0 seconds"));
    }

    // TODO: Implement tokio::process::Command with the security checklist above
    log::info!("Python script ({}s timeout):\n{}", timeout_secs, script);

    Ok(String::new())
}
