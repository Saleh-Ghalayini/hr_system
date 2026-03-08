import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { request, getToken } from "../common/request";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getToken);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
        setToken(tok);
        setUser(data.data.user);
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

  const logout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    setToken(null);
    setUser(null);
    navigate("/login");
  };

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
  }, [token]);

  return { user, token, loading, login, logout };
};
