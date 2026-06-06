import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./layouts/AppShell.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";
import EmployeeDashboard from "./pages/EmployeeDashboard.jsx";
import Employees from "./pages/Employees.jsx";
import History from "./pages/History.jsx";
import Leaves from "./pages/Leaves.jsx";
import Login from "./pages/Login.jsx";
import Reports from "./pages/Reports.jsx";
import { useAuth } from "./contexts/AuthContext.jsx";
import { Loading } from "./components/UI.jsx";

function RequireAuth({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center"><Loading /></div>;
  if (!user) return <Navigate to="/login" />;
  if (user.forcePasswordChange && location.pathname !== "/change-password") return <Navigate to="/change-password" />;
  if (role && user.role !== role) return <Navigate to={user.role === "admin" ? "/admin" : "/employee"} />;
  return children;
}

export default function App() {
  const [dark, setDark] = useState(localStorage.getItem("theme") === "dark");
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RequireAuth><AppShell dark={dark} setDark={setDark} /></RequireAuth>}>
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/admin" element={<RequireAuth role="admin"><AdminDashboard /></RequireAuth>} />
        <Route path="/admin/employees" element={<RequireAuth role="admin"><Employees /></RequireAuth>} />
        <Route path="/admin/reports" element={<RequireAuth role="admin"><Reports /></RequireAuth>} />
        <Route path="/employee" element={<RequireAuth role="employee"><EmployeeDashboard /></RequireAuth>} />
        <Route path="/employee/history" element={<RequireAuth role="employee"><History /></RequireAuth>} />
        <Route path="/leaves" element={<Leaves />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
