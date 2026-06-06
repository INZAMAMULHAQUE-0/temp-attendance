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
  const [showDocs, setShowDocs] = useState(false);

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
    <main className="relative grid min-h-screen place-items-center bg-mist px-4 dark:bg-slate-950">
      <Button
        variant="secondary"
        className="absolute right-4 top-4"
        onClick={() => setShowDocs(true)}
      >
        first time?
      </Button>

      {showDocs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <Panel className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto">
            <button onClick={() => setShowDocs(false)} className="absolute right-4 top-4 text-slate-500 hover:text-ink dark:hover:text-white">
              ✕
            </button>
            <h2 className="mb-4 text-2xl font-bold border-b border-slate-200 pb-4 dark:border-slate-800">Documentation</h2>
            <div className="space-y-6 text-sm text-slate-600 dark:text-slate-300">
              <div>
                <h3 className="text-lg font-bold text-ink dark:text-white">Employee Attendance Management System – User Guide</h3>
                <p className="mt-1">The Employee Attendance Management System helps organizations manage employee attendance, work logs, leave requests, productivity tracking, and administrative operations through a centralized platform.</p>
              </div>

              <div>
                <h4 className="font-semibold text-base text-ink dark:text-white">Phase 1: System Initialization (Admin First Login)</h4>
                <p className="mb-2">Since the system is initialized with a default administrator account, the Admin must log in first to configure the workspace.</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Step 1: Open the Application:</strong> Navigate to <a href="https://temp-attendance.vercel.app/login" className="text-teal hover:underline" target="_blank" rel="noreferrer">https://temp-attendance.vercel.app/login</a></li>
                  <li><strong>Step 2: Login Using Default Credentials:</strong> Email: <code>admin@logistos.com</code> | Password: <code>Employee@123</code> (updated to <code>Test@123</code>)</li>
                  <li><strong>Step 3: Change Password:</strong> The system requires a password change during the first login. Enter current password, set a new one, and click Save.</li>
                  <li><strong>Step 4: Access Admin Dashboard:</strong> View present/absent employees, total working hours, story points, activities, and leave stats.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-base text-ink dark:text-white">Phase 2: Admin Creates an Employee</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Step 1: Navigate to Employees:</strong> From the sidebar menu, click Employees.</li>
                  <li><strong>Step 2: Add Employee Details:</strong> Fill in Name, Email, and Title (e.g., Frontend Developer).</li>
                  <li><strong>Step 3: Submit:</strong> Click Add. The employee account is created successfully and assigned the default password <code>Employee@123</code>.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-base text-ink dark:text-white">Phase 3: Employee Onboarding (First Login)</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Step 1: Login:</strong> Enter registered employee email and the default password <code>Employee@123</code>.</li>
                  <li><strong>Step 2: Mandatory Password Reset:</strong> You will be prompted to change your password during your first login before you can continue.</li>
                  <li><strong>Step 3: Access Employee Dashboard:</strong> You will be redirected to the My Day Dashboard to begin tracking work activities.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-base text-ink dark:text-white">Phase 4: Employee Daily Operations</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Clocking In (Start Work):</strong> Enter today's work plan and click <strong>Start Work</strong>. Records check-in time and begins productivity tracking.</li>
                  <li><strong>Taking Breaks:</strong> Click <strong>Start Break</strong> when stepping away, and <strong>End Break</strong> upon returning. Automatically deducts break time from productive work hours.</li>
                  <li>
                    <strong>Logging Activities:</strong> Record work performed throughout the day. Fill in Title, Type (Development, Meeting, etc.), Start/End Times, and Story Points. You can also update Jira Ticket References, GitHub PR Links, Blockers, and Notes.
                  </li>
                  <li><strong>Clocking Out (End Work):</strong> Click <strong>End Work</strong> at the end of the day. Finalizes working hours, calculates productive hours, and closes the session.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-base text-ink dark:text-white">Phase 5: Leave Management</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Employee Requests Leave:</strong> Open Leaves module, select Leave Type, From/To Dates, and Reason. Click Apply. Request appears as Pending.</li>
                  <li><strong>Admin Approves or Rejects Leave:</strong> Open Leaves from the Admin Dashboard, review requests, and choose Approve or Reject.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-base text-ink dark:text-white">Password Reset Process</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Employee Self-Service Reset:</strong> Click "Forgot password?" on the login page and follow instructions.</li>
                  <li><strong>Admin-Initiated Reset:</strong> Admins can reset employee passwords from Manage Employees. The password reverts to <code>Employee@123</code>, requiring the employee to set a new one on next login.</li>
                </ul>
              </div>
            </div>
          </Panel>
        </div>
      )}

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
