import { useRef } from "react";
import { Canvas } from "@react-three/fiber";

export default function Canvas3D() {
  const canvasRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={canvasRef} style={styles.container}>
      {/* Placeholder: Three.js Canvas will be populated by Tank */}
      <div style={styles.placeholder}>
        <p style={styles.title}>3D Viewport</p>
        <p style={styles.subtitle}>
          Three.js + React Three Fiber canvas
        </p>
        <p style={styles.instructions}>
          Drag to orbit · Scroll to zoom · Click mesh to select
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "100%",
    height: "100%",
    position: "relative",
    background: "var(--bg-primary)",
  },
  placeholder: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 600,
    color: "var(--text-secondary)",
    background: "var(--accent-gradient)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    fontSize: 12,
    color: "var(--text-muted)",
  },
  instructions: {
    fontSize: 11,
    color: "var(--text-muted)",
    marginTop: 16,
    padding: "6px 14px",
    background: "var(--bg-tertiary)",
    borderRadius: 20,
    border: "1px solid var(--border-color)",
  },
};
