//! DCL 3D Modeler — Main entry point
//!
//! Platform-specific startup code. On desktop, launches the Tauri app.

#![cfg_attr(not(test), windows_subsystem = "windows")]

fn main() {
    dcl_lib::run();
}
