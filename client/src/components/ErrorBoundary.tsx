import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary] Uncaught error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
          }}
        >
          <div style={{ fontSize: "4rem", fontWeight: 900, color: "#0d3b86", marginBottom: "1rem" }}>
            Oops
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111", marginBottom: "0.75rem" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#555", marginBottom: "2rem", maxWidth: "420px", lineHeight: 1.6 }}>
            An unexpected error occurred. Please try going back to the homepage.
          </p>
          <a
            href="/"
            style={{
              background: "#0d3b86",
              color: "#fff",
              fontWeight: 700,
              padding: "0.75rem 2rem",
              borderRadius: "9999px",
              textDecoration: "none",
            }}
          >
            Back to Home
          </a>
        </div>
      );
    }

    return this.props.children;
  }
}
