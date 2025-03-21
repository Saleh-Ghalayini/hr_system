import { createContext, useContext } from "react";
import { useAuth } from "../hooks/useAuth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const auth = useAuth();
//   console.log("AuthProvider rendering with:", auth);
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);
//   console.log("useAuthContext accessed:", context);
  return context;
};
