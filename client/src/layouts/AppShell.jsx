import { CalendarClock, ClipboardList, LayoutDashboard, LogOut, Moon, Sun, Users } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { Button } from "../components/UI.jsx";

const links = {
  admin: [
    ["Dashboard", "/admin", LayoutDashboard],
    ["Employees", "/admin/employees", Users],
    ["Reports", "/admin/reports", ClipboardList],
    ["Leaves", "/leaves", CalendarClock]
  ],
  employee: [
    ["My Day", "/employee", LayoutDashboard],
    ["History", "/employee/history", ClipboardList],
    ["Leaves", "/leaves", CalendarClock]
  ]
};

export default function AppShell({ dark, setDark }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = links[user.role] || links.employee;

  return (
    <div className="min-h-screen bg-mist text-ink dark:bg-slate-950 dark:text-slate-100">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white px-4 py-5 dark:border-slate-800 dark:bg-slate-900 lg:block">
        <h1 className="text-xl font-bold">Logstios Attendance</h1>
        <p className="mt-1 text-sm text-slate-500">{user.title}</p>
        <nav className="mt-8 space-y-1">
          {navItems.map(([label, to, Icon]) => (
            <NavLink key={to} to={to} end className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold ${isActive ? "bg-teal text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`}>
              <Icon className="size-4" /> {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">Signed in as</p>
              <p className="font-semibold">{user.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setDark(!dark)} title="Toggle theme">{dark ? <Sun className="size-4" /> : <Moon className="size-4" />}</Button>
              <Button variant="secondary" onClick={() => { logout(); navigate("/login"); }}><LogOut className="size-4" /> Logout</Button>
            </div>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto lg:hidden">
            {navItems.map(([label, to]) => <NavLink key={to} to={to} className="whitespace-nowrap rounded-md bg-slate-100 px-3 py-2 text-sm dark:bg-slate-800">{label}</NavLink>)}
          </nav>
        </header>
        <div className="mx-auto max-w-7xl px-4 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
