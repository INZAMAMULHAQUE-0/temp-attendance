import { api } from "../api/client.js";
import { Empty, Loading, Panel } from "../components/UI.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { hm, hours } from "../utils/format.js";

export default function History() {
  const { data = [], loading } = useAsync(() => api("/api/attendance"), []);
  if (loading) return <Loading />;
  return <Panel><h2 className="text-xl font-bold">Attendance History</h2><div className="mt-4 overflow-x-auto">{!data.length ? <Empty text="No attendance records yet." /> : <table className="w-full text-left text-sm"><thead><tr className="text-slate-500"><th>Date</th><th>Check in</th><th>Check out</th><th>Productive</th><th>Break</th></tr></thead><tbody>{data.map((row) => <tr key={row.id} className="border-t border-slate-100 dark:border-slate-800"><td className="py-3">{row.date}</td><td>{hm(row.checkIn)}</td><td>{hm(row.checkOut)}</td><td>{hours(row.productiveMinutes)}</td><td>{hours(row.breakMinutes)}</td></tr>)}</tbody></table>}</div></Panel>;
}
