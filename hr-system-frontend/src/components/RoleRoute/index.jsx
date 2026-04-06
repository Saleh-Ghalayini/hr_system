import { Navigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";

const RoleRoute = ({ allowedRoles = [], redirectTo = "/profile/basicinfo", children }) => {
  const { token, user, loading } = useAuthContext();

  if (loading) {
    return <div className="loading-spinner" />;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default RoleRoute;