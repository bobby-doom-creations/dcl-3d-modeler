# Image-to-3D & .3MF Handling — Technical Research Report

**Date:** 2026-11-09
**Project:** DCL 3D Modeler (Tauri + Rust + React)

---

## Executive Summary

| Area | V1 Approach | V2 Approach |
|------|------------|-------------|
| Image-to-3D | External Python microservice (MiDaS depth + trimesh mesh extraction) OR cloud API | Local PyTorch + Burn for depth estimation; InstantMesh/Zero123++ for full reconstruction |
| .3MF read/write | `threemf` crate (43K downloads, actively maintained) | `lib3mf-core` or `threemf2` for advanced extensions |
| Mesh manipulation | `halfedge` crate (topology ops, subdivision, extrude) + `boolmesh` for CSG | `manifold-csg` bindings for advanced boolean operations |
| Frontend | Three.js + React Three Fiber + Drei (all mature, production-ready) | Same, with @react-three/postprocessing, react-three-rapier |

---

## 1. Image-to-3D Conversion

### 1.1 The Pipeline Problem

Converting a single 2D image to a 3D mesh is **not solvable with pure Rust alone**. This is a machine learning problem at its core — you need a neural network to infer depth and geometry from a single RGB image. There is no deterministic algorithm that can reliably go from "one photo" to "watertight 3D mesh" without learned priors.

### 1.2 Open-Source Approaches (Ranked by Practicality)

#### A. Depth-Estimation → Height-Map Extrusion (V1 — Practical)
This is the most achievable approach for v1.

1. **Depth estimation**: Run MiDaS (or DepthAnything V2) to produce a depth map from the input image
2. **Height-map meshing**: Use the depth map as a heightfield to extrude a grid mesh (simple: create a plane, displace vertices by depth values)
3. **Mesh cleanup**: Use trimesh or Open3D in Python to decimate, smooth, and make watertight

**Python libraries needed:**
- `torch` + `threedee-midas` / `depth-anything` for depth estimation
- `trimesh` for mesh generation, export, and cleanup
- `Open3D` for optional point cloud processing and mesh refinement

**Rust role:** Handle all mesh editing after import (transform, boolean ops, extrude, export to .3mf/GLB). The depth estimation step is the ML bottleneck and Python has no good Rust alternative.

#### B. Neural Radiance Fields (NeRF) / Gaussian Splatting (V2 — Ambitious)
- **Instant3D / InstantMesh** (TencentARC): Feed-forward 3D mesh generation from single image using triplane reconstruction. Requires CUDA GPU, large models (hundreds of MB).
- **Zero123++**: Generates multiple views from one image, then reconstructs. Also GPU-dependent.
- These are **not feasible for local v1** without a dedicated GPU.

#### C. Cloud API (V1 — Alternative)
- **Tripo3D API**, **Meshy API**, or **Kaedim** offer image-to-3D via REST API
- Pros: No local GPU needed, high quality
- Cons: Ongoing cost, network dependency, data privacy concerns
- Implementation: Rust service sends image to API, receives GLB/OBJ back

### 1.3 Can This Be Done in Pure Rust?

**No.** There are no Rust libraries for:
- MiDaS / DepthAnything depth estimation models
- NeRF / Instant3D / Zero123++ reconstruction models
- PyTorch model inference

Rust deep learning options exist but they are early-stage:
- **Burn**: Tensor library with PyTorch model import. No official MiDaS support yet.
- **tch-rs** (Torch Rust): Bindings to LibTorch. Can run PyTorch models but requires deploying `.pt` files.
- **ORT** (ONNX Runtime Rust bindings): If models are exported to ONNX format, this works. MiDaS can be exported to ONNX.

**Recommendation for V1:** Use a Python subprocess or microservice for the ML pipeline. The Rust backend can spawn a Python process, pass image paths, receive mesh files (OBJ/GLB), then do all mesh editing in Rust. This is a common pattern in Tauri apps (think of how many apps delegate AI/ML to a Python layer).

### 1.4 Recommended V1 Architecture

```
User uploads image (PNG/JPG)
    │
    ▼
Tauri Rust backend
    │───► Spawns Python subprocess: `python depth_to_mesh.py input.png`
    │       ├─ MiDaS depth estimation (torch)
    │       ├─ Height-map mesh generation (trimesh)
    │       ├─ Mesh decimation & watertight cleanup (trimesh/Open3D)
    │       └─ Writes output.obj / output.glb
    │
    ▼
Rust loads mesh file (obj/gltf)
    │───► Mesh editing operations:
    │       ├─ Scale / Translate / Rotate (halfedge or glam transforms)
    │       ├─ Extrude (halfedge extrude_face)
    │       ├─ Boolean operations (boolmesh)
    │       └─ Decimation (halfedge QEM simplification)
    │
    ▼
Export to .3mf (threemf) or GLB (gltf)
```

---

## 2. .3MF File Format

### 2.1 What is .3MF?

3MF (3D Manufacturing Format) is a modern replacement for STL. It's:
- A **ZIP archive** following Open Packaging Conventions (OPC)
- Contains **XML** describing meshes, materials, colors, and build instructions
- Supports **multiple objects**, **textures**, **materials**, **color**
- Current spec version: **1.3.0** (core), extended by official extensions

### 2.2 Minimal .3MF File Structure

A minimal .3mf file is a ZIP containing:

```
model.3mf (ZIP archive)
├── [Content_Types].xml          — MIME type declarations
├── _rels/.rels                   — Package relationships
├── 3D/3dmodel.model             — Main XML with mesh data
└── Metadata/thumbnail.png       — Optional thumbnail
```

The core XML (`3D/3dmodel.model`) looks like:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter"
       xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">
  <resources>
    <object id="1" type="model">
      <mesh>
        <vertices>
          <vertex x="0" y="0" z="0"/>
          <vertex x="10" y="0" z="0"/>
          <vertex x="0" y="10" z="0"/>
          <vertex x="0" y="10" z="10"/>
          <!-- ... -->
        </vertices>
        <triangles>
          <triangle v1="0" v2="1" v3="2"/>
          <triangle v1="2" v2="1" v3="3"/>
          <!-- ... -->
        </triangles>
      </mesh>
    </object>
  </resources>
  <build>
    <item objectid="1"/>
  </build>
</model>
```

A cube needs 8 vertices and 12 triangles. The format is straightforward — just a list of vertex coordinates and triangle index triplets.

### 2.3 Rust Libraries for .3MF

| Crate | Downloads | Status | Write Support | Notes |
|-------|-----------|--------|---------------|-------|
| **threemf** | 43K+ | Active (Oct 2026) | ✅ Yes | Most mature. By Hannes Hübner. Read + Write. |
| **lib3mf** | 2.5K | New (Feb 2026) | ✅ Yes | Pure Rust, no-unsafe-code. Newer but actively developed. |
| **threemf2** | 460 | Very new (Nov 2025) | ✅ Yes | Eager + lazy loading. Supports all extensions. |
| **lib3mf-core** | 1.2K | Active (Mar 2026) | ✅ Yes | Production-ready, streaming parser, 4-level validation. |

**Recommendation: `threemf` v0.8** for V1. It's the most downloaded, has the longest track record, and supports both reading and writing .3mf files. It's simple to use:

```rust
use threemf::package::Package;

// Write
let mut package = Package::new();
// add meshes, materials, etc.
package.write_to_file("output.3mf")?;

// Read
let package = Package::from_file("input.3mf")?;
```

---

## 3. Mesh Manipulation Libraries in Rust

### 3.1 Half-Edge Data Structure Libraries

| Crate | Downloads | Key Features |
|-------|-----------|-------------|
| **halfedge** | Active | Half-edge traversal, topology ops (split/flip/collapse/extrude/poke), Loop/Catmull-Clark subdivision, QEM decimation, Tutte/LSCM parameterization, geodesics, deformation, boolean operations, welding, smoothing. Supports f32 and f64. SOA storage for cache locality. |
| **tri-mesh** | 1.8K | Half-edge mesh, edge split/flip/collapse, transforms (rotate mesh), measures (area, vertex position), edge/face intersection, merge/split meshes. Simpler but mature. Uses cgmath. |

### 3.2 Boolean Operations (CSG)

| Crate | Type | Status |
|-------|------|--------|
| **boolmesh** | Pure Rust (Manifold-inspired) | Very fast, 8s for Menger Sponge depth-4. Supports UV/color/normals through boolean ops. Requires manifold input meshes. |
| **manifold-csg** | FFI bindings to C++ manifold3d | Full CSG + 2D cross-sections + extrusion + SDF + OBJ I/O. More powerful but requires manifold3d C++ library. |

### 3.3 Geometry / Math

| Crate | Purpose |
|-------|---------|
| **glam** | SIMD-accelerated math (Vec3, Mat4, Quat). Standard in Rust 3D graphics. |
| **cgmath** | Classic linear algebra for computer graphics. Used by tri-mesh. |
| **nalgebra** | General-purpose linear algebra. Larger dependency tree but very capable. |

### 3.4 What Operations Can We Do in Rust (V1)?

| Operation | Feasibility | Library |
|-----------|-------------|---------|
| Scale | ✅ Trivial | glam (Mat4 transform) |
| Translate | ✅ Trivial | glam (Mat4 transform) |
| Rotate | ✅ Trivial | glam (Mat4 transform) |
| Extrude face | ✅ Supported | halfedge (extrude_face) |
| Edge collapse | ✅ Supported | halfedge (collapse) |
| Edge flip/split | ✅ Supported | halfedge |
| Mesh decimation | ✅ Supported | halfedge (QEM simplification) |
| Subdivision | ✅ Supported | halfedge (Loop, Catmull-Clark) |
| Laplacian smoothing | ✅ Supported | halfedge (cotan Laplacian) |
| Boolean union/diff/intersect | ✅ Supported | boolmesh (pure Rust) |
| Vertex welding | ✅ Supported | halfedge (weld) |
| Normal computation | ✅ Supported | halfedge |
| Mesh intersection tests | ✅ Supported | halfedge |

**Verdict:** Rust has excellent mesh manipulation libraries for v1. The `halfedge` crate covers 90% of what a 3D modeling app needs, and `boolmesh` handles boolean operations with a clean API.

### 3.5 File I/O for Meshes

| Format | Read | Write | Crate |
|--------|------|-------|-------|
| OBJ | ✅ | ✅ | `obj-rs`, `wavefront_obj` (tri-mesh dep) |
| STL | ✅ | ✅ | `stl` crate |
| GLB/glTF | Partial | Partial | `gltf`, `gltf-json`, `avila-gltf` |
| .3MF | ✅ | ✅ | `threemf` |
| PLY | Partial | - | `ply-rs` |

---

## 4. Three.js + React Three Fiber Frontend

### 4.1 Core Stack

| Component | Package | Purpose |
|-----------|---------|---------|
| **React Three Fiber** | `@react-three/fiber` | Declarative Three.js renderer. `<mesh>` = `THREE.Mesh`, `<boxGeometry>` = `BoxGeometry`, etc. The component tree IS the scene graph. |
| **Three.js** | `three` | The underlying 3D engine. R3F is a thin declarative layer over it. |
| **Drei** | `@react-three/drei` | Essential helper components |

### 4.2 Key Drei Components We Need

| Component | Use Case |
|-----------|----------|
| `<OrbitControls>` | Pan, zoom, rotate the model |
| `<TransformControls>` | Move/scale/rotate selected mesh with gizmo |
| `<Environment>` | HDRI lighting in one line |
| `<Grid>` | Reference ground plane |
| `<Text>` | Labels and annotations |
| `<Html>` | Overlay DOM content in 3D scene |
| `<Float>` | Subtle floating animation |
| `<Stats>` | Performance monitoring (dev) |
| `<CameraControls>` | Alternative to OrbitControls |
| `<Shadows>` | Real-time shadows |
| `<Stage>` | Auto-lighting for product visualization |

### 4.3 Additional Ecosystem Packages

| Package | Purpose |
|---------|---------|
| `@react-three/drei` | Core helpers (OrbitControls, Environment, Grid, Text, Html, etc.) |
| `@react-three/postprocessing` | Declarative post-processing (bloom, DOF, tone mapping) |
| `@react-three/rapier` | Physics engine (if we add simulation features) |
| `@react-three/fiber` | The renderer itself |
| `three` | Three.js core (v0.168+ recommended) |
| `leva` | Debug panel for 3D scene parameters |

### 4.4 Capabilities for Our App

- **Model loading**: `<useLoader(GLTFLoader, '/path/to/model.glb')>` — loads GLB files from Rust backend
- **Mesh editing sync**: React state drives mesh transforms → Three.js updates automatically
- **Raycasting**: Click-to-select meshes with `pointerdown` events on `<mesh>`
- **Multi-selection**: Ctrl+click selection with shared React state
- **Component hierarchy**: Scene graph mapped to React component tree
- **Real-time preview**: Changes to mesh data in Rust sent via Tauri IPC → UI updates
- **Orbit + Transform controls**: Standard for 3D modeling apps
- **Grid + axes helpers**: Standard reference visualization

### 4.5 What Three.js Can't Do (Needs Rust Backend)

- Boolean operations
- Mesh topology changes (subdivision, decimation)
- File format conversion (.3mf, OBJ, GLB)
- Geometric computations (curvature, geodesics)

These MUST be done in the Rust backend and synced to the frontend as updated mesh data.

---

## 5. Recommendations Summary

### V1 (MVP) — Buildable Today

| Component | Technology | Justification |
|-----------|-----------|---------------|
| Image-to-3D pipeline | **Python subprocess** (MiDaS + trimesh) | ML requires PyTorch; Rust has no production equivalent. Subprocess is simple in Tauri. |
| Mesh data structure | **halfedge** crate | Best all-around Rust mesh library. Topology ops, subdivision, decimation, parameterization. |
| Boolean ops | **boolmesh** crate | Pure Rust, no C++ deps, fast (SIMD via glam). |
| .3MF I/O | **threemf** crate | Most mature Rust 3MF library (43K downloads). Read + Write. |
| Math transforms | **glam** crate | Standard for Rust 3D. SIMD-accelerated. |
| OBJ/GLB I/O | **gltf** + **wavefront_obj** crates | Load mesh output from Python, export to .3mf |
| Frontend | **React Three Fiber + Drei** | Mature, declarative, perfect for Tauri apps. |
| Image preprocessing | **Python Pillow + scikit-image** | Crop, resize, background removal (rembg) before depth estimation. |

### V2 (Future Enhancements)

| Component | Technology | Condition |
|-----------|-----------|-----------|
| Local depth estimation | **Burn** or **tch-rs** + ONNX export | When Burn gains official model support, or we export MiDaS to ONNX |
| Full 3D reconstruction | **InstantMesh** / **Zero123++** Python service | User has CUDA GPU; we provide a setup wizard |
| Cloud image-to-3D | Tripo3D / Meshy API | If users want no-local-GPU option |
| Advanced boolean ops | **manifold-csg** | When we need 2D cross-sections, SDF, or Minkowski sums |
| Real-time preview of edits | WebSocket from Rust | When mesh editing needs sub-second latency feedback |

### What NOT to Build in Rust (For Now)

- **Neural network inference** — Use Python/PyTorch or ONNX Runtime via Rust bindings (ORT crate). Don't try to train or run neural nets with Burn yet — not mature enough for production image-to-3D.
- **Mesh generation from depth** — Use trimesh/Open3D in Python. The height-map-to-mesh pipeline has many edge cases that Python libraries handle well.
- **Background removal** — Use `rembg` (Python, U2-Net model). Simple to call as a subprocess step.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Tauri App                            │
│  ┌─────────────────────┐    ┌────────────────────────┐ │
│  │   React Frontend     │    │   Rust Backend         │ │
│  │  (Vite + R3F + Drei) │    │   (Tauri command bus)  │ │
│  │                      │    │                        │ │
│  │  <Canvas> + meshes   │◄───┤  IPC: mesh data,       │ │
│  │  OrbitControls       │    │  file bytes, commands  │ │
│  │  TransformControls   │    │                        │ │
│  │  State-driven edits  │    │  ┌──────────────────┐  │ │
│  │                      │    │  │ Mesh Operations   │  │ │
│  │  GLB/.3MF viewer     │    │  │ (halfedge +      │  │ │
│  │                      │    │  │  boolmesh + glam) │  │ │
│  └─────────────────────┘    │  └──────────────────┘  │ │
│                              │                        │ │
│                              │  ┌──────────────────┐  │ │
│                              │  │ File I/O          │  │ │
│                              │  │ (threemf, gltf,   │  │ │
│                              │  │  wavefront_obj)   │  │ │
│                              │  └──────────────────┘  │ │
│                              │                        │ │
│                              │  ┌──────────────────┐  │ │
│                              │  │ Python Subprocess │  │ │
│                              │  │ (depth → mesh)    │  │ │
│                              │  │ MiDaS + trimesh   │  │ │
│                              │  │ + rembg           │  │ │
│                              │  └──────────────────┘  │ │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Python subprocess crashes during depth estimation | Image-to-3D fails silently | Wrap in error handling with user feedback. Add timeout. Provide fallback (manual height map slider). |
| MiDaS model download on first run | Slow initial startup | Bundle a quantized ONNX model with the app, or download to user's cache directory. |
| threemf write support is basic | Can't write materials/colors | Start with simple meshes. Add `lib3mf-core` later for advanced features. |
| halfedge crate is not super popular | Less community support | Code is well-documented on docs.rs. Test suite exists. Alternative: tri-mesh. |
| Large mesh performance in browser | Frame rate drops | Implement LOD, decimation before sending to frontend, use GLB binary format (compact). |

---

## 7. Dependencies Summary (Cargo.toml)

```toml
[dependencies]
# Mesh manipulation
halfedge = "0.3"
boolmesh = "0.2"
glam = "0.32"

# File I/O
threemf = "0.8"       # .3mf read/write
gltf = "1.1"          # GLB load
wavefront_obj = "0.13" # OBJ load
avila-gltf = "0.1"    # GLB export (or use gltf crate)

# Tauri
tauri = "2"

# Serialization
serde = "1"
serde_json = "1"

# Image processing (Rust side)
image = "0.25"

[dev-dependencies]
# For testing mesh operations
```

## 8. Dependencies Summary (Python)

```bash
# Core pipeline
torch>=2.0
threedee-midas OR depth-anything-pytorch
trimesh>=4.0
Open3D>=0.19

# Image preprocessing
Pillow>=10.0
rembg              # Background removal
scikit-image>=0.22
numpy>=1.24
```
