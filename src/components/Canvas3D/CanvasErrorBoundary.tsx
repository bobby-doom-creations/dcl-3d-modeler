import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
  error: string;
}

export class CanvasErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Canvas ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "#0d0d1a",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#ff4444",
            fontFamily: "-apple-system, sans-serif",
            padding: 20,
          }}
        >
          <div style={{ fontSize: 16, marginBottom: 8, color: "#ff6666" }}>
            ⚠️ Canvas Error
          </div>
          <div style={{ fontSize: 12, color: "#888" }}>
            {this.state.error || "WebGL context failed to initialize"}
          </div>
          <div style={{ fontSize: 10, color: "#555", marginTop: 12 }}>
            This may indicate GPU/WebGL issues
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
