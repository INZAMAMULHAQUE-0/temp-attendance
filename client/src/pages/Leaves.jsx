import { useState } from "react";
import { api } from "../api/client.js";
import { Alert, Button, Empty, Input, Loading, Panel, Select, Textarea } from "../components/UI.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useAsync } from "../hooks/useAsync.js";

const types = ["Casual", "Sick", "Paid", "Work From Home", "Emergency"];

export default function Leaves() {
  const { user } = useAuth();
  const { data = [], loading, refresh } = useAsync(() => api("/api/leaves"), []);
  const [form, setForm] = useState({ type: "Casual", reason: "", fromDate: "", toDate: "" });
  const [message, setMessage] = useState("");

  async function apply(event) {
    event.preventDefault();
    try {
      await api("/api/leaves", { method: "POST", body: JSON.stringify(form) });
      setForm({ type: "Casual", reason: "", fromDate: "", toDate: "" });
      refresh();
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function decide(id, status) {
    await api(`/api/leaves/${id}/decision`, { method: "PATCH", body: JSON.stringify({ status }) });
    refresh();
  }

  if (loading) return <Loading />;
  return <div className="space-y-6">{message && <Alert>{message}</Alert>}<Panel><h2 className="text-xl font-bold">Leave Management</h2>{user.role === "employee" && <form onSubmit={apply} className="mt-4 grid gap-3 md:grid-cols-5"><Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{types.map((type) => <option key={type}>{type}</option>)}</Select><Input type="date" value={form.fromDate} onChange={(e) => setForm({ ...form, fromDate: e.target.value })} required /><Input type="date" value={form.toDate} onChange={(e) => setForm({ ...form, toDate: e.target.value })} required /><Textarea placeholder="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required /><Button>Apply</Button></form>}</Panel><Panel><div className="space-y-3">{!data.length ? <Empty text="No leave requests." /> : data.map((leave) => <div key={leave.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 p-3 text-sm dark:border-slate-800"><div><strong>{leave.type}</strong><p className="text-slate-500">{leave.fromDate} to {leave.toDate} · {leave.reason}</p></div><div className="flex items-center gap-2"><span className="rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800">{leave.status}</span>{user.role === "admin" && leave.status === "pending" && <><Button variant="secondary" onClick={() => decide(leave.id, "approved")}>Approve</Button><Button variant="danger" onClick={() => decide(leave.id, "rejected")}>Reject</Button></>}</div></div>)}</div></Panel></div>;
}
