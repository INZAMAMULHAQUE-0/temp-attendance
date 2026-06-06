import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Input, Panel } from "../components/UI.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";

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

  return <Panel className="mx-auto max-w-md"><h2 className="text-xl font-bold">Change password</h2><form onSubmit={submit} className="mt-4 space-y-3">{error && <Alert>{error}</Alert>}<Input type="password" placeholder="Current password" onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} /><Input type="password" placeholder="New password" onChange={(e) => setForm({ ...form, newPassword: e.target.value })} /><Button>Save password</Button></form></Panel>;
}
