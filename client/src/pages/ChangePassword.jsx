import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { Alert, Button, Input, Panel } from "../components/UI.jsx";

export default function ChangePassword() {
  const { changePassword, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "" });
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    try {
      await changePassword(form.currentPassword, form.newPassword);
      navigate(user.role === "admin" ? "/admin" : "/employee");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Panel className="mx-auto max-w-md mt-10">
      <h2 className="text-xl font-bold">Change password</h2>
      
      {/* Display explanation message if they are forced to change the password */}
      {user?.forcePasswordChange && (
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          You are required to change your password during your first login before you can continue.
        </p>
      )}

      <form onSubmit={submit} className="mt-4 space-y-3">
        {error && <Alert>{error}</Alert>}
        
        <Input 
          type="password" 
          placeholder="Current password" 
          value={form.currentPassword}
          onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} 
          required
        />
        <Input 
          type="password" 
          placeholder="New password" 
          value={form.newPassword}
          onChange={(e) => setForm({ ...form, newPassword: e.target.value })} 
          required
        />
        
        <Button className="w-full">Save password</Button>
      </form>
    </Panel>
  );
}
