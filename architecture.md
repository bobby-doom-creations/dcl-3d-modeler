# DCL 3D Modeler — Architecture Document

**Version:** 1.0
**Date:** 2026-11-09
**Stack:** Tauri v2 + Rust + React/TypeScript + Three.js

---

## 1. System Overview

DCL 3D Modeler is a cross-platform desktop application for creating, converting, and editing 3D models — with a focus on .3mf file support for 3D printing. The app follows a two-layer architecture: a **Rust backend** handles all mesh computation and file I/O, while a **React frontend** renders the 3D viewport and manages user interaction. Communication is via Tauri's IPC mechanism.

```
┌─────────────────────────────────────────────────────────────────┐
│                      Tauri App Shell                            │
│                                                                 │
│  ┌─────────────────────────────┐    ┌─────────────────────────┐ │
│  │    React Frontend            │    │    Rust Backend         │ │
│  │    Vite + React 19 + TS      │    │    Tauri Command Bus    │ │
│  │                              │    │                         │ │
│  │  ┌────────────────────────┐  │    │  ┌───────────────────┐  │ │
│  │  │ 3D Viewport            │  │    │  │ mesh_ops          │  │ │
│  │  │ (R3F + Drei)           │  │    │  │  - scale/rotate/  │  │ │
│  │  │                        │  │    │  │  - translate      │  │ │
│  │  │  OrbitControls         │  │◄───┤  │  - extrude        │  │ │
│  │  │  TransformControls     │  │    │  │  - boolean ops    │  │ │
│  │  │  Grid/Axes Helpers     │  │    │  │  - decimation     │  │ │
│  │  │  Selection/Raycasting  │  │    │  └───────────────────┘  │ │
│  │  └────────────────────────┘  │    │                         │ │
│  │                              │    │  ┌───────────────────┐  │ │
│  │  Tool Panel (left side)      │  │    │  file_formats     │  │ │
│  │  Properties Panel (right)    │  │    │  - threemf (.3mf) │  │ │
│  │  Layer/Scene Tree            │  │    │  - gltf (GLB)     │  │ │
│  │                              │  │    │  - wavefront_obj  │  │ │
│  │  GLB/.3MF viewer             │  │    │  - stl            │  │ │
│  │                              │  │    │  └───────────────────┘  │ │
│  │  ┌────────────────────────┐  │    │                         │ │
│  │  │ Top Menu Bar           │  │    │  ┌───────────────────┐  │ │
│  │  │ DCL logo + brand       │  │    │  │ image_to_3d       │  │ │
│  │  │ File / Edit / View     │  │    │  │  - image upload   │  │ │
│  │  └────────────────────────┘  │    │  │  - Python subproc │  │ │
│  │                              │    │  │    (MiDaS +       │  │ │
│  │                              │    │  │    trimesh)       │  │ │
│  │                              │    │  └───────────────────┘  │ │
│  └─────────────────────────────┘    │                         │ │
│                                      └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Project Structure

```
DCL_3D_MODELER/
├── src/                          # React frontend
│   ├── index.html
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── Canvas3D/
│   │   │   ├── Canvas3D.tsx       # Three.js canvas with scene graph
│   │   │   ├── OrbitControls.tsx  # Camera controls
│   │   │   ├── TransformControls.tsx # Gizmo for edits
│   │   │   └── GridHelpers.tsx    # Reference grid + axes
│   │   ├── ToolPanel/
│   │   │   ├── ToolPanel.tsx      # Left panel: tool list
│   │   │   ├── SelectionTool.tsx  # Select/move tool
│   │   │   ├── TransformTool.tsx  # Scale/rotate/translate
│   │   │   ├── ExtrudeTool.tsx    # Face extrude
│   │   │   └── BooleanTool.tsx    # Union/diff/intersect
│   │   ├── PropertiesPanel/
│   │   │   ├── PropertiesPanel.tsx # Right panel: mesh props
│   │   │   └── TransformControls.tsx # Numeric transform inputs
│   │   ├── SceneTree/
│   │   │   └── SceneTree.tsx      # Hierarchical scene/object list
│   │   ├── MenuBar/
│   │   │   └── MenuBar.tsx        # Top menu bar (File/Edit/View/Export)
│   │   └── Branding/
│   │       └── DCLLogo.tsx        # DCL logo component
│   ├── hooks/
│   │   ├── useMeshData.ts         # Tauri IPC hook for mesh operations
│   │   └── useFileIO.ts           # File open/save IPC
│   └── styles/
│       └── global.css             # DCL theme variables
├── src-tauri/                    # Rust backend
│   ├── Cargo.toml
│   ├── tauri.conf.json            # Tauri config (macOS + Windows targets)
│   ├── build.rs
│   ├── capabilities/
│   │   └── default.capability.json
│   ├── icons/
│   │   ├── 32x32.png
│   │   ├── 128x128.png
│   │   ├── 128x128@2x.png
│   │   ├── icon.ico (Windows)
│   │   └── icon.icns (macOS)
│   └── src/
│       ├── lib.rs                 # Tauri lib entry, command registry
│       ├── main.rs                # Tauri main entry
│       ├── mesh_ops/
│       │   mod.rs                 # Module: mesh manipulation
│       │   transforms.rs          # Scale, translate, rotate
│       │   extrude.rs             # Face extrusion
│       │   boolean.rs             # Union/diff/intersect (boolmesh)
│       │   decimate.rs            # QEM simplification
│       │   └── weld.rs            # Vertex welding
│       ├── file_formats/
│       │   mod.rs                 # Module: file I/O
│       │   threemf.rs             # .3mf read/write (threemf crate)
│       │   glb.rs                 # GLB load/export (gltf crate)
│       │   obj.rs                 # OBJ import (wavefront_obj)
│       │   stl.rs                 # STL import
│       │   └── export.rs          # Unified export handler
│       ├── image_to_3d/
│       │   mod.rs                 # Module: image-to-3D pipeline
│       │   depth_estimation.rs    # Spawn Python MiDaS subprocess
│       │   mesh_generation.rs     # Spawn Python trimesh subprocess
│       │   pipeline.rs            # Orchestrates the pipeline
│       │   └── python_bridge.rs   # Python subprocess management
│       └── util/
│           └── error.rs           # Error handling, user feedback
├── assets/                       # Static assets
│   ├── logo/
│   │   ├── dcl-logo.svg
│   │   └── dcl-logo-dark.png
│   └── samples/
│       └── default_model.glb      # Demo model on launch
├── package.json                  # Node dependencies
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 3. Data Flow

### 3.1 Image-to-3D Pipeline

```
User uploads image (PNG/JPG)
    │
    ▼
React: Drag-drop zone → show preview + "Convert" button
    │
    ▼
Tauri IPC: invoke('image_to_3d', { image_path: "/abs/path/file.png" })
    │
    ▼
Rust: image_to_3d::pipeline::run()
    │
    ├── Step 1: image_to_3d::python_bridge::spawn_background_removal(image_path)
    │       └── python -c "from rembg import remove; ..." → bg_removal.png
    │
    ├── Step 2: image_to_3d::depth_estimation::run_midas(bg_removal.png)
    │       └── python -c "from midas import predict_depth; ..." → depth_map.png
    │
    ├── Step 3: image_to_3d::mesh_generation::depth_to_mesh(depth_map.png)
    │       └── python -c "import trimesh; ..." → generated.obj
    │
    ▼
Rust: file_formats::obj::load("generated.obj") → MeshData struct
    │
    ▼
Tauri IPC: emit('model-loaded', mesh_data)
    │
    ▼
React: MeshData → R3F scene graph → display in viewport
```

### 3.2 Mesh Edit Flow

```
User selects mesh in viewport (raycasting click)
    │
    ▼
React: state.selection = mesh_id
    │
    └── PropertiesPanel shows: position, rotation, scale, vertex count, face count
    │
User adjusts transform (drag gizmo or type values)
    │
    ▼
React: invoke('mesh_transform', { id, transform: { scale, rotation, position } })
    │
    ▼
Rust: mesh_ops::transforms::apply(mesh_id, transform) → updated MeshData
    │
    ▼
Tauri IPC: emit('model-updated', updated_mesh_data)
    │
    ▼
React: Update scene graph → viewport refreshes
```

### 3.3 Export to .3MF

```
User clicks File → Export → .3mf
    │
    ▼
React: invoke('export_3mf', { filename: "model.3mf" })
    │
    ▼
Rust: file_formats::threemf::write(mesh_data, path)
    │
    ▼
threemf crate: serializes MeshData → .3mf ZIP archive
    │
    ▼
System dialog: save to user-chosen location
```

---

## 4. Technology Choices

### 4.1 Rust Backend Dependencies

| Crate | Purpose | Version |
|-------|---------|---------|
| `tauri` | App framework | v2 |
| `halfedge` | Mesh data structure + topology ops | 0.3 |
| `boolmesh` | Boolean CSG operations | 0.2 |
| `glam` | SIMD-accelerated math (Vec3, Mat4, Quat) | 0.32 |
| `threemf` | .3mf file read/write | 0.8 |
| `gltf` | GLB file loading | 1.1 |
| `wavefront_obj` | OBJ file loading | 0.13 |
| `image` | Image manipulation on Rust side | 0.25 |
| `serde` + `serde_json` | Serialization for IPC | 1.x |

### 4.2 Python Dependencies (image-to-3D pipeline)

| Package | Purpose | Notes |
|---------|---------|-------|
| `torch` | Neural network inference | MiDaS/DepthAnything models |
| `rembg` | Background removal | U2-Net model, fast |
| `trimesh` | Mesh generation from depth map | Decimation, watertight cleanup |
| `Pillow` | Image preprocessing | Crop, resize, format conversion |
| `numpy` | Array operations | Depth map processing |

### 4.3 Frontend Dependencies

| Package | Purpose |
|---------|---------|
| `react` (v19) | UI framework |
| `@react-three/fiber` | Declarative Three.js |
| `three` | 3D engine |
| `@react-three/drei` | Helpers (OrbitControls, TransformControls, Grid) |
| `@tauri-apps/api` | Tauri IPC (invoke, listen, emit) |
| `zustand` | State management |

---

## 5. API Design (Tauri Commands)

All commands are exposed via Tauri's `invoke()` from the frontend.

### 5.1 Mesh Operations

```typescript
// Transform a mesh
invoke('mesh_transform', {
  mesh_id: string,
  operation: 'scale' | 'translate' | 'rotate',
  value: number[]  // [x, y, z] or [rx, ry, rz]
}) → { success: boolean }

// Boolean operation between two meshes
invoke('mesh_boolean', {
  mesh_a: string,
  mesh_b: string,
  operation: 'union' | 'difference' | 'intersection'
}) → { mesh_id: string }

// Extrude a selected face
invoke('mesh_extrude', {
  mesh_id: string,
  face_index: number,
  depth: number
}) → { mesh_id: string }

// Decimate mesh (reduce polygon count)
invoke('mesh_decimate', {
  mesh_id: string,
  target_faces: number
}) → { mesh_id: string }
```

### 5.2 File Operations

```typescript
// Open a 3D model file
invoke('file_open', { path: string }) → { mesh_data: MeshData }

// Export to .3mf
invoke('export_3mf', {
  filename: string,
  format: '3mf' | 'glb' | 'obj'
}) → { success: boolean }

// Save current model (auto-detect format)
invoke('file_save', { path: string }) → { success: boolean }
```

### 5.3 Image-to-3D

```typescript
// Run the full image-to-3D pipeline
invoke('image_to_3d', { image_path: string }) → {
  success: boolean,
  mesh_id: string,
  stats: { vertices: number, faces: number, processing_time: string }
}
```

### 5.4 Data Types

```typescript
interface MeshData {
  id: string;
  name: string;
  vertices: [number, number, number][];
  faces: [number, number, number][];
  normals: [number, number, number][];
  materials: Material[];
  transform: {
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
  };
}

interface Material {
  name: string;
  color: [number, number, number];  // RGB 0-255
  roughness: number;
  metalness: number;
}
```

---

## 6. Frontend Component Tree

```
App
├── DCLLogo                          # Top-left: DCL branding
├── MenuBar                          # Top bar: File | Edit | View | Export
│   ├── FileMenu                     # New, Open, Save, Export...
│   ├── EditMenu                     # Undo, Redo, Cut, Copy, Paste
│   ├── ViewMenu                     # Wireframe, Solid, Hide Selected...
│   └── ExportMenu                   # Export as .3mf, .glb, .obj
├── ToolPanel (left, 60px)           # Vertical icon toolbar
│   ├── SelectionTool
│   ├── MoveTool
│   ├── ScaleTool
│   ├── RotateTool
│   ├── ExtrudeTool
│   ├── BooleanTool
│   └── ImportTool
├── SceneTree (left, expandable)     # Above ToolPanel
│   └── SceneNode[] (draggable, selectable)
├── Canvas3D (center, main)          # Three.js viewport
│   ├── Scene
│   │   ├── GridHelper
│   │   ├── AxesHelper
│   │   └── Mesh(es)                  # User models
│   ├── OrbitControls
│   ├── TransformControls (when selected)
│   └── Environment (lighting)
└── PropertiesPanel (right, 280px)   # Selected object properties
    ├── TransformSection             # Position, Rotation, Scale (numeric inputs)
    ├── MeshSection                  # Vertices, Faces, Edges count
    ├── MaterialSection              # Color picker, roughness, metalness
    └── ActionsSection               # Delete, Clone, Export Selected
```

---

## 7. Extension Points

The architecture is designed for future feature additions:

### Plugin Architecture
- **Backend plugins:** Rust modules follow a plugin interface pattern. New file formats, mesh operations, or processing pipelines can be added as new modules under `src-tauri/src/` without modifying existing code.
- **Frontend plugins:** ToolPanel and PropertiesPanel components are registered dynamically. New tools appear as new React components without modifying the main layout.

### Planned Extensions (V2+)
1. **Multi-view image reconstruction** — Add multiple input images, use depth alignment to create full 3D meshes
2. **Material editor** — Texture import, UV mapping, material library
3. **Print preview** — Layer-by-layer preview, support estimation, warping detection
4. **Collaborative editing** — WebSocket sync for multi-user sessions
5. **Custom geometry generation** — Parametric shapes, text-to-3D, SVG-to-3D extrusion
6. **Local ML pipeline** — Replace Python subprocess with Burn/ORT for on-device inference
7. **Plugin SDK** — Allow third-party Rust extensions

---

## 8. DCL Branding Implementation

### Colors
```css
:root {
  --bg-primary: #0d0d1a;          /* Main background */
  --bg-secondary: #1a1a2e;        /* Panels, sidebar */
  --bg-tertiary: #16213e;         /* Buttons, inputs */
  --text-primary: #e0e0ff;        /* Main text */
  --text-secondary: #8888aa;      /* Labels, hints */
  --accent-blue: #0088ff;         /* Primary action */
  --accent-green: #00cc66;        /* Success, primary */
  --accent-gradient: linear-gradient(135deg, #0088ff 0%, #00cc66 100%);
  --border-color: #2a2a4a;        /* Panel borders */
  --glow-blue: 0 0 8px rgba(0, 136, 255, 0.3);
  --glow-green: 0 0 8px rgba(0, 204, 102, 0.3);
}
```

### Logo Integration
- The DCL hexagonal logo appears in:
  1. **App window title bar** (top-left, small version)
  2. **Splash/start screen** (center, large version)
  3. **Export watermark** (optional, on 3mf metadata)
  4. **About dialog** (center)

---

## 9. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Python subprocess crashes during depth estimation | Image-to-3D fails silently | Error handling with user feedback, timeout, fallback to manual height map |
| MiDaS model size (200MB+) | Slow first run | Bundle quantized ONNX model or download to cache directory with progress bar |
| Large mesh performance in browser | Frame rate drops | Implement LOD, decimation before sending to frontend, use GLB binary format |
| threemf write support limitations | Can't write advanced materials | Start with simple meshes, add lib3mf-core later for extended features |
| Rust halfedge crate adoption | Less community support | Well-documented, test suite exists, alternative tri-mesh available |

---

## 10. Build Targets

| Platform | Build Method | Notes |
|----------|-------------|-------|
| macOS (Apple Silicon) | `cargo tauri build --target aarch64-apple-darwin` | Native, optimized for M-series |
| macOS (Intel) | `cargo tauri build --target x86_64-apple-darwin` | Universal binary possible |
| Windows (x64) | `cargo tauri build --target x86_64-pc-windows-msvc` | MSI installer via Tauri bundler |

**Not targeting:** Linux for v1 (can add later — Tauri supports it natively).
