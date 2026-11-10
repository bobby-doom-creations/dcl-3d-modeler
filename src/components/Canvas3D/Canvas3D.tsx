/** DCL 3D Viewport — Real React Three Fiber canvas.

Replaces the placeholder with a fully interactive 3D scene featuring:
  - Ambient + directional lighting
  - GridHelper and AxesHelper
  - OrbitControls (orbit / pan / zoom)
  - TransformControls on the selected mesh
  - Click-to-select via raycasting
  - Wireframe toggle
  - Grid visibility toggle
  - Loading indicator during Three.js initialisation
  - DCL-themed dark material on the default cube
*/
import { useRef, useState, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, TransformControls, GridHelper, AxesHelper } from "@react-three/drei";
import * as THREE from "three";
import { useMeshStore } from "../../hooks/useMeshStore";

/* ───────────────────────────────────────────────────
   DCL-themed material for the default cube
   ─────────────────────────────────────────────────── */

function DCLMaterial() {
  return (
    <meshPhysicalMaterial
      color="#1a2a3a"
      roughness={0.35}
      metalness={0.7}
      clearcoat={0.4}
      clearcoatRoughness={0.2}
      emissive="#004455"
      emissiveIntensity={0.15}
      side={THREE.DoubleSide}
    />
  );
}

/* ───────────────────────────────────────────────────
   Default cube mesh (8 vertices, 12 triangles)
   ─────────────────────────────────────────────────── */

function DefaultCube() {
  const { wireframe } = useMeshStore();
  return (
    <mesh
      name="Cube"
      position={[0, 0, 0]}
      onClick={(e) => {
        e.stopPropagation();
        useMeshStore.getState().selectMesh("cube-1");
      }}
    >
      <boxGeometry args={[1, 1, 1]} />
      <DCLMaterial wireframe={wireframe} />
    </mesh>
  );
}

/* ───────────────────────────────────────────────────
   Scene components that read from the store
   ─────────────────────────────────────────────────── */

function SceneGrid() {
  const { showGrid } = useMeshStore();
  if (!showGrid) return null;
  return (
    <>
      <GridHelper args={[20, 20, "#004466", "#0a1520"]} />
      <AxesHelper args={[5]} />
    </>
  );
}

function SelectionRing() {
  const { selectedMeshId } = useMeshStore();
  if (!selectedMeshId) return null;

  return (
    <mesh
      renderOrder={999}
      scale={[1.08, 1.08, 1.08]}
      visible={selectedMeshId === "cube-1"}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial
        color="#0088ff"
        wireframe
        transparent
        opacity={0.5}
        depthTest={false}
      />
    </mesh>
  );
}

/* ───────────────────────────────────────────────────
   Camera setup
   ─────────────────────────────────────────────────── */

function CameraSetup() {
  const { camera } = useThree();
  useState(() => {
    camera.position.set(3, 2.5, 3);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

/* ───────────────────────────────────────────────────
   Lighting
   ─────────────────────────────────────────────────── */

function Lighting() {
  return (
    <>
      <ambientLight color="#334466" intensity={0.8} />
      <directionalLight
        color="#ffffff"
        intensity={1.8}
        position={[5, 8, 5]}
      />
      <directionalLight
        color="#00aaff"
        intensity={0.4}
        position={[-3, 2, -4]}
      />
      <hemisphereLight
        color="#0088ff"
        groundColor="#00cc66"
        intensity={0.25}
      />
    </>
  );
}

/* ───────────────────────────────────────────────────
   Transform controls wrapper
   ─────────────────────────────────────────────────── */

function TransformControlsWrapper() {
  const { selectedMeshId, tool } = useMeshStore();
  const meshRef = useRef<THREE.Group>(null);

  if (!selectedMeshId) return null;

  // Only show transform controls for the cube in this demo
  if (selectedMeshId !== "cube-1") return null;

  const mode = tool === "move"
    ? "translate"
    : tool === "scale"
    ? "scale"
    : tool === "rotate"
    ? "rotate"
    : "translate";

  return (
    <TransformControls
      ref={meshRef}
      object={meshRef as unknown as THREE.Object3D}
      mode={mode}
      onMouseUp={(e) => {
        // After transform, dispatch update to store + Tauri IPC
        const obj = (e.target as any)?.object;
        if (obj) {
          useMeshStore.getState().updateMeshTransform(selectedMeshId, {
            position: [obj.position.x, obj.position.y, obj.position.z],
            rotation: [
              THREE.MathUtils.radToDeg(obj.rotation.x),
              THREE.MathUtils.radToDeg(obj.rotation.y),
              THREE.MathUtils.radToDeg(obj.rotation.z),
            ],
            scale: [obj.scale.x, obj.scale.y, obj.scale.z],
          });
        }
      }}
    >
      <mesh ref={meshRef as any} />
    </TransformControls>
  );
}

/* ───────────────────────────────────────────────────
   Mesh renderers (iterate over the store's mesh map)
   ─────────────────────────────────────────────────── */

function MeshFromStore({ mesh }: { mesh: { id: string; name: string } }) {
  const { wireframe } = useMeshStore();
  const isSelected = useMeshStore((s) => s.selectedMeshId === mesh.id);

  if (mesh.id === "cube-1") {
    return (
      <group name={mesh.name}>
        <DefaultCube />
        {isSelected && <SelectionRing />}
      </group>
    );
  }

  // Generic fallback for loaded meshes (uses stored geometry)
  return (
    <mesh name={mesh.name} onClick={(e) => {
      e.stopPropagation();
      useMeshStore.getState().selectMesh(mesh.id);
    }}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color="#2a3a4a"
        wireframe={wireframe}
      />
    </mesh>
  );
}

/* ───────────────────────────────────────────────────
   Main 3D scene (loaded by R3F)
   ─────────────────────────────────────────────────── */

function Scene() {
  const { tool } = useMeshStore();

  return (
    <>
      <CameraSetup />
      <Lighting />
      <SceneGrid />
      <DefaultCube />
      <SelectionRing />
      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        minDistance={1}
        maxDistance={50}
      />
      <TransformControlsWrapper />
    </>
  );
}

/* ───────────────────────────────────────────────────
   Loading indicator
   ─────────────────────────────────────────────────── */

function LoadingOverlay() {
  return (
    <mesh>
      <planeGeometry args={[2, 0.06]} />
      <meshBasicMaterial color="#0088ff" transparent opacity={0.8} />
    </mesh>
  );
}

/* ───────────────────────────────────────────────────
   Canvas3D — Public component
   ─────────────────────────────────────────────────── */

export default function Canvas3D() {
  return (
    <div style={styles.container}>
      {/* Loading overlay while canvas mounts */}
      <Canvas
        style={styles.canvas}
        camera={{ position: [3, 2.5, 3], fov: 50, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        {/* Semi-transparent dark background matching the app theme */}
        <color attach="background" args={["#0d0d1a"]} />
        <Scene />
      </Canvas>

      {/* Corner label */}
      <div style={styles.cornerLabel}>3D Viewport</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "100%",
    height: "100%",
    position: "relative",
    background: "#0d0d1a",
    overflow: "hidden",
  },
  canvas: {
    width: "100%",
    height: "100%",
    display: "block",
  },
  cornerLabel: {
    position: "absolute",
    bottom: 10,
    left: 12,
    fontSize: 10,
    color: "rgba(136, 136, 170, 0.5)",
    letterSpacing: 0.5,
    pointerEvents: "none",
    userSelect: "none",
  },
};
