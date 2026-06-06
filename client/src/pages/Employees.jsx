import { KeyRound, Plus } from "lucide-react";
import { useState } from "react";
import { api } from "../api/client.js";
import { Alert, Button, Empty, Input, Loading, Panel } from "../components/UI.jsx";
import { useAsync } from "../hooks/useAsync.js";

export default function Employees() {
  const { data = [], loading, refresh } = useAsync(() => api("/api/users"), []);
  const [form, setForm] = useState({ name: "", email: "", title: "" });
  const [message, setMessage] = useState("");

  async function add(event) {
    event.preventDefault();
    setMessage("");
    try {
      await api("/api/users", { method: "POST", body: JSON.stringify(form) });
      setForm({ name: "", email: "", title: "" });
      refresh();
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function reset(id) {
    await api(`/api/users/${id}/reset-password`, { method: "POST", body: JSON.stringify({ password: "Employee@123" }) });
    setMessage("Password reset to Employee@123");
  }

  if (loading) return <Loading />;
  return <div className="space-y-6"><Panel><h2 className="text-xl font-bold">Manage Employees</h2>{message && <div className="mt-3"><Alert type={message.includes("reset") ? "success" : "error"}>{message}</Alert></div>}<form onSubmit={add} className="mt-4 grid gap-3 md:grid-cols-4"><Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /><Input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /><Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /><Button><Plus className="size-4" /> Add</Button></form></Panel><Panel><div className="overflow-x-auto">{!data.length ? <Empty text="No employees found." /> : <table className="w-full text-left text-sm"><thead><tr className="text-slate-500"><th>Name</th><th>Email</th><th>Role</th><th>Active</th><th></th></tr></thead><tbody>{data.map((user) => <tr key={user.id} className="border-t border-slate-100 dark:border-slate-800"><td className="py-3 font-semibold">{user.name}</td><td>{user.email}</td><td>{user.role}</td><td>{user.active ? "Yes" : "No"}</td><td className="text-right"><Button variant="secondary" onClick={() => reset(user.id)}><KeyRound className="size-4" /> Reset</Button></td></tr>)}</tbody></table>}</div></Panel></div>;
}
