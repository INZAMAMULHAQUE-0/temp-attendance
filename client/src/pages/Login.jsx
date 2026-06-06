import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { Alert, Button, Input, Panel } from "../components/UI.jsx";

export default function Login() {
  const { user, login, forgotPassword } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "admin@logistos.com", password: "Employee@123" });
  const [resetForm, setResetForm] = useState({ username: "", newPassword: "" });
  const [showReset, setShowReset] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  if (user) return <Navigate to={user.forcePasswordChange ? "/change-password" : (user.role === "admin" ? "/admin" : "/employee")} />;

  async function submit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const next = await login(form.email, form.password);
      navigate(next.forcePasswordChange ? "/change-password" : (next.role === "admin" ? "/admin" : "/employee"));
    } catch (err) {
      setError(err.message);
    }
  }

  async function resetPassword(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      await forgotPassword(resetForm.username, resetForm.newPassword);
      setMessage("Password reset successfully. You can log in with the new password.");
      setForm({ email: resetForm.username, password: "" });
      setResetForm({ username: "", newPassword: "" });
      setShowReset(false);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-mist px-4 dark:bg-slate-950">
      <Panel className="w-full max-w-md">
        <h1 className="text-2xl font-bold">Remote Attendance</h1>
        <p className="mt-1 text-sm text-slate-500">Track work sessions, activities, leave, and remote productivity.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {error && <Alert>{error}</Alert>}
          {message && <Alert type="success">{message}</Alert>}
          <Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Email" />
          <Input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Password" />
          <Button className="w-full">Login</Button>
        </form>
        <button
          type="button"
          onClick={() => {
            setShowReset((current) => !current);
            setError("");
            setMessage("");
          }}
          className="mt-4 text-sm font-semibold text-teal hover:underline"
        >
          Forgot password?
        </button>
        {showReset && (
          <form onSubmit={resetPassword} className="mt-4 space-y-4 rounded-md border border-slate-200 p-4 dark:border-slate-800">
            <Input value={resetForm.username} onChange={(event) => setResetForm({ ...resetForm, username: event.target.value })} placeholder="Existing email or username" />
            <Input type="password" value={resetForm.newPassword} onChange={(event) => setResetForm({ ...resetForm, newPassword: event.target.value })} placeholder="New password" />
            <Button className="w-full" variant="secondary">Reset Password</Button>
          </form>
        )}
        <p className="mt-4 text-xs text-slate-500">Employee seed password: Employee@123</p>
      </Panel>
    </main>
  );
}
