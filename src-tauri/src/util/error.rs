//! Error handling utilities
//!
/// Provides user-friendly error conversion for Tauri IPC commands.

use std::fmt;

/// User-facing error types for the DCL 3D Modeler
#[derive(Debug)]
pub enum AppError {
    /// Mesh operation failed (e.g., invalid face index)
    MeshError(String),
    /// File I/O error
    FileError(String),
    /// Python subprocess failed
    PythonError(String),
    /// Model download failed
    ModelDownloadError(String),
    /// General error
    Generic(String),
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AppError::MeshError(msg) => write!(f, "Mesh error: {}", msg),
            AppError::FileError(msg) => write!(f, "File error: {}", msg),
            AppError::PythonError(msg) => write!(f, "Python pipeline error: {}", msg),
            AppError::ModelDownloadError(msg) => write!(f, "Model download failed: {}", msg),
            AppError::Generic(msg) => write!(f, "{}", msg),
        }
    }
}

impl std::error::Error for AppError {}

impl From<anyhow::Error> for AppError {
    fn from(err: anyhow::Error) -> Self {
        AppError::Generic(err.to_string())
    }
}
