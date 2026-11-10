/** DCL 3D Viewport — minimal for Tauri testing. */
import { useState, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useMeshStore } from "../../hooks/useMeshStore";

function Scene() {
  const { camera, gl } = useThree();
  const showGrid = useMeshStore((s) => s.showGrid);

  useEffect(() => {
    camera.position.set(4, 4, 4);
    camera.lookAt(0, 0, 0);
    if (gl) {
      gl.setClearColor("#0d0d1a");
      console.log("[Canvas] WebGL initialized, clear color set to #0d0d1a");
    }
  }, [camera, gl]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      {showGrid && <gridHelper args={[20, 20, "#0088ff", "#1a1a2e"]} />}
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#0088ff" metalness={0.3} roughness={0.6} />
      </mesh>
    </>
  );
}

export default function Canvas3D() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#0d0d1a",
        position: "relative",
      }}
    >
      <Canvas
        style={{ width: "100%", height: "100%" }}
        camera={{ position: [4, 4, 4], fov: 60 }}
      >
        <Scene />
        <OrbitControls />
      </Canvas>
    </div>
  );
}
