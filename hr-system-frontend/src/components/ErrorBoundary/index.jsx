import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          padding: "40px",
          textAlign: "center",
        }}>
          <div style={{
            fontSize: "3rem",
            marginBottom: "16px",
          }}>
            ⚠
          </div>
          <h2 style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: "1.4rem",
            color: "#142f5a",
            marginBottom: "8px",
          }}>
            Something went wrong
          </h2>
          <p style={{
            fontFamily: "'Lato', sans-serif",
            color: "#6b7280",
            marginBottom: "24px",
            maxWidth: "400px",
          }}>
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={this.handleReset}
            style={{
              padding: "10px 24px",
              background: "#142f5a",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontFamily: "'Poppins', sans-serif",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
