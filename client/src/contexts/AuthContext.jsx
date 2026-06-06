import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("token")));

  useEffect(() => {
    if (!localStorage.getItem("token")) return;
    api("/api/auth/me").then(setUser).catch(() => localStorage.removeItem("token")).finally(() => setLoading(false));
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    async login(email, password) {
      const result = await api("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
      localStorage.setItem("token", result.token);
      setUser(result.user);
      return result.user;
    },
    async changePassword(currentPassword, newPassword) {
      const next = await api("/api/auth/change-password", { method: "POST", body: JSON.stringify({ currentPassword, newPassword }) });
      setUser(next);
    },
    async forgotPassword(username, newPassword) {
      return api("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ username, newPassword }) });
    },
    logout() {
      localStorage.removeItem("token");
      setUser(null);
    }
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
