// ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";

const ProtectedRoute = () => {
  const { token, loading } = useAuthContext();
  console.log("ProtectedRoute check:", { token, loading });

  if (loading) {
    console.log("Auth verification in progress");
    return <>loading...</>;
  }

  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
