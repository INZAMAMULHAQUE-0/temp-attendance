import { Download } from "lucide-react";
import { useState } from "react";
import { api } from "../api/client.js";
import { Button, Empty, Loading, Panel, Select } from "../components/UI.jsx";
import { useAsync } from "../hooks/useAsync.js";

export default function Reports() {
  const [period, setPeriod] = useState("daily");
  const { data = [], loading, refresh } = useAsync(() => api(`/api/reports?period=${period}`), [period]);
  async function download(format) {
    const response = await fetch(`/api/reports/export/${format}?period=${period}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance-report.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  }
  if (loading) return <Loading />;
  return <Panel><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold">Reports & Exports</h2><p className="text-sm text-slate-500">Daily, weekly, and monthly attendance and productivity summaries.</p></div><div className="flex gap-2"><Select value={period} onChange={(e) => { setPeriod(e.target.value); refresh(); }}><option>daily</option><option>weekly</option><option>monthly</option></Select><Button variant="secondary" onClick={() => download("csv")}><Download className="size-4" /> CSV</Button><Button variant="secondary" onClick={() => download("xlsx")}><Download className="size-4" /> Excel</Button></div></div><div className="mt-5 overflow-x-auto">{!data.length ? <Empty text="No report rows for this range." /> : <table className="w-full text-left text-sm"><thead><tr className="text-slate-500"><th>Date</th><th>Employee</th><th>Productive</th><th>Meetings</th><th>Bugs</th><th>Story Points</th></tr></thead><tbody>{data.map((row, index) => <tr key={`${row.date}-${row.employee}-${index}`} className="border-t border-slate-100 dark:border-slate-800"><td className="py-3">{row.date}</td><td>{row.employee}</td><td>{row.productiveHours}h</td><td>{row.meetings}</td><td>{row.bugsResolved}</td><td>{row.storyPoints}</td></tr>)}</tbody></table>}</div></Panel>;
}
