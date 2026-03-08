import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

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
        fontFamily: "'Poppins', sans-serif",
        fontSize: "5rem",
        fontWeight: 800,
        color: "#142f5a",
        lineHeight: 1,
        marginBottom: "8px",
      }}>
        404
      </div>
      <h2 style={{
        fontFamily: "'Poppins', sans-serif",
        fontSize: "1.3rem",
        color: "#374151",
        marginBottom: "8px",
      }}>
        Page Not Found
      </h2>
      <p style={{
        fontFamily: "'Lato', sans-serif",
        color: "#6b7280",
        marginBottom: "24px",
      }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <button
        onClick={() => navigate("/dashboard")}
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
        Go to Dashboard
      </button>
    </div>
  );
};

export default NotFound;
