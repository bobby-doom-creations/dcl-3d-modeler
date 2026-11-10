# DCL 3D Modeler

**Doom Creations Lab — Cross-platform 3D Modeling Application**

## Overview

DCL 3D Modeler is a desktop application for creating, converting, and editing 3D models with a focus on .3mf file support for 3D printing.

### Features (V1)

- **Image-to-3D Conversion** — Upload a 2D image and generate a 3D model for printing
- **Build .3MF Files** — Create and export models in the modern .3mf format
- **Mesh Editing** — Scale, rotate, translate, extrude, boolean operations
- **Cross-Platform** — macOS and Windows support via Tauri

## Tech Stack

- **Frontend:** React 19 + TypeScript + Three.js + React Three Fiber + Drei
- **Backend:** Rust (Tauri v2) with halfedge, boolmesh, threemf, glam
- **ML Pipeline:** Python (MiDaS depth estimation + trimesh mesh generation)
- **App Framework:** Tauri v2 (macOS + Windows targets)

## Project Structure

```
DCL_3D_MODELER/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── hooks/              # React hooks for IPC
│   └── styles/             # DCL theme CSS variables
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── mesh_ops/       # Transform, extrude, boolean, decimate
│   │   ├── file_formats/   # .3mf, GLB, OBJ, STL read/write
│   │   └── image_to_3d/    # Python bridge, depth estimation, mesh gen
│   └── tauri.conf.json     # Tauri configuration
├── architecture.md         # Full architecture document
└── research.md             # Cypher's research report
```

## Getting Started

### Prerequisites

- Node.js v26+ (or any recent LTS)
- npm v11+
- Rust toolchain (cargo, rustc) — not installed yet
- Tauri CLI — not installed yet
- Python 3.9+ (for ML pipeline)

### Installation (TODO)

```bash
# 1. Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 2. Install Tauri CLI
cargo install tauri-cli --version "^2"

# 3. Install npm dependencies
npm install

# 4. Install Python ML dependencies
pip install torch rembg trimesh Pillow numpy

# 5. Start development
npm run tauri dev
```

### First Build (TODO)

```bash
npm run tauri build
```

This will create:
- `src-tauri/target/release/bundle/macos/` — macOS .app + .dmg
- `src-tauri/target/release/bundle/windows/` — Windows .msi

## Architecture

See [architecture.md](./architecture.md) for the complete architecture document.

## Research

See [research.md](./research.md) for technical research on:
- Image-to-3D approaches
- .3MF file format
- Rust mesh manipulation libraries
- Three.js frontend capabilities

## Status

**Phase: Scaffolding Complete**

The project structure is created with:
- ✅ Tauri configuration (macOS + Windows)
- ✅ React frontend layout (DCL branding applied)
- ✅ Rust backend module structure
- ✅ File format placeholders (.3mf, GLB, OBJ, STL)
- ✅ Image-to-3D pipeline skeleton
- ✅ Mesh operations scaffolding
- ❌ Dependencies not installed (need Rust/cargo first)
- ❌ ML pipeline not wired (need Python deps)
- ❌ Three.js canvas not implemented (placeholder only)

## Next Steps

1. **Install Rust** — required for Tauri build
2. **Install Tauri CLI** — via cargo
3. **Run `npm install`** — get frontend dependencies
4. **Implement Three.js canvas** — replace placeholder
5. **Wire up Tauri IPC** — connect frontend to Rust backend
6. **Implement mesh operations** — full halfedge + boolmesh logic
7. **Wire Python ML pipeline** — subprocess integration
8. **Build .3mf export** — threemf crate integration
