import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { request, getToken, resetUnauthorizedState } from "../common/request";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getToken);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    resetUnauthorizedState();
    setToken(null);
    setUser(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  const login = async (email, password, rememberMe = false) => {
    try {
      const data = await request({
        method: "POST",
        path: "guest/login",
        data: { email, password },
      });

      if (data.success) {
        const tok = data.data.token;
        if (rememberMe) {
          localStorage.setItem("token", tok);
          sessionStorage.removeItem("token");
        } else {
          sessionStorage.setItem("token", tok);
          localStorage.removeItem("token");
        }
        resetUnauthorizedState();
        setToken(tok);
        setUser(data.data.user ?? data.data);
        navigate("/dashboard");
      }
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Network error",
      };
    }
  };

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [logout]);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const data = await request({
          method: "GET",
          path: "validate-token",
        });

        if (data.success) {
          setUser(data.data);
        } else {
          logout();
        }
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyAuth();
    } else {
      setLoading(false);
    }
  }, [token, logout]);

  return { user, token, loading, login, logout };
};
