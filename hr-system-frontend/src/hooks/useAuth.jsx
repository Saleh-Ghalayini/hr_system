import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // console.log("useAuth initialization:", { token, loading });

  const login = async (email, password) => {
    // console.log("Login attempt started");
    try {
      const { data } = await axios.post(
        "http://127.0.0.1:8000/api/v1/guest/login",
        { email, password }
      );

      // console.log("Login response:", data);

      if (data.success) {
        // console.log("Login successful, setting token");
        localStorage.setItem("token", data.data.token);
        setToken(data.data.token);
        setUser(data.data.user);
        navigate("/dashboard");
      }
      return data;
    } catch (error) {
      // console.error("Login error:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Network error",
      };
    }
  };

  const logout = () => {
    // console.log("Logging out");
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    navigate("/login");
  };

  useEffect(() => {
  
    const verifyAuth = async () => {
      console.log("Starting auth verification");
      try {
        const { data } = await axios.get(
          "http://127.0.0.1:8000/api/v1/validate-token",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // console.log("Auth verification response:", data);

        if (data.success) {
          // console.log("Auth verification successful, user:", data.data);
          setUser(data.data);
        } else {
          // console.log("Auth verification failed, logging out");
          logout();
        }
      } catch (error) {
        console.error(
          "Auth verification error:",
          error.response?.data || error.message
        );
        logout();
      } finally {
        console.log("Auth verification completed");
        setLoading(false);
      }
    };
    if (token) {
      verifyAuth();
    } else {
      // console.log("No token found, skipping verification");
      setLoading(false);
    }
  }, [token]);
  

  // console.log("useAuth state update:", { user, token, loading });
  return { user, token, loading, login, logout };
};
