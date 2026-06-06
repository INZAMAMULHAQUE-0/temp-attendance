import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Panel, Alert, Input, Button } from "../components/UI.jsx";

export default function EmployeeReport() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterDate, setFilterDate] = useState("");

  async function fetchEmployeeData() {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      };

      let attUrl = `/api/attendance?userId=${id}`;
      let actUrl = `/api/activities?userId=${id}`;
      
      if (filterDate) {
        attUrl += `&date=${filterDate}`;
        actUrl += `&date=${filterDate}`;
      }

      // Fetch all necessary details concurrently using the provided backend query params
      const [usersRes, attRes, actRes] = await Promise.all([
        fetch("/api/users", { headers }),
        fetch(attUrl, { headers }),
        fetch(actUrl, { headers })
      ]);

      if (!usersRes.ok || !attRes.ok || !actRes.ok) {
        throw new Error("Failed to fetch employee details.");
      }

      const users = await usersRes.json();
      let att = await attRes.json();
      let act = await actRes.json();

      // Enforce the filter on the client side to guarantee accurate data rendering
      if (filterDate) {
        att = att.filter((a) => a.date === filterDate);
        act = act.filter((a) => a.date === filterDate);
      }

      setEmployee(users.find((u) => u.id === id) || null);
      setAttendance(att);
      setActivities(act);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEmployeeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading employee details...</div>;
  if (error) return <Alert className="m-4">{error}</Alert>;
  if (!employee) return <Alert className="m-4">Employee not found.</Alert>;

  const totalStoryPoints = activities.reduce((sum, act) => sum + Number(act.storyPoints || 0), 0);
  const totalProductiveMinutes = attendance.reduce((sum, att) => sum + Number(att.productiveMinutes || 0), 0);
  const totalHours = Math.round((totalProductiveMinutes / 60) * 10) / 10;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/reports" className="text-sm font-semibold text-teal hover:underline">
          &larr; Back to Reports
        </Link>
        <div>
          <h2 className="text-2xl font-bold">{employee.name}</h2>
          <p className="text-sm text-slate-500">{employee.email} &bull; {employee.title || "Employee"}</p>
        </div>
      </div>

      <Panel>
        <form onSubmit={(e) => { e.preventDefault(); fetchEmployeeData(); }} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Date</label>
            <Input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
          </div>
          <Button type="submit">Apply Filter</Button>
        </form>
      </Panel>

      <div className="grid gap-4 md:grid-cols-3">
        <Panel>
          <h3 className="text-sm text-slate-500">Total Hours</h3>
          <p className="text-3xl font-bold text-ink dark:text-white mt-2">{totalHours}h</p>
        </Panel>
        <Panel>
          <h3 className="text-sm text-slate-500">Total Story Points</h3>
          <p className="text-3xl font-bold text-ink dark:text-white mt-2">{totalStoryPoints}</p>
        </Panel>
        <Panel>
          <h3 className="text-sm text-slate-500">Logged Activities</h3>
          <p className="text-3xl font-bold text-ink dark:text-white mt-2">{activities.length}</p>
        </Panel>
      </div>

      <Panel>
        <h3 className="font-bold mb-4">Detailed Activity Log</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-500">
                <th className="pb-2">Date</th>
                <th className="pb-2">Type</th>
                <th className="pb-2">Title</th>
                <th className="pb-2">Story Points</th>
                <th className="pb-2">Jira Ticket</th>
                <th className="pb-2">PR Link</th>
                <th className="pb-2">Notes</th>
                <th className="pb-2">Blocker</th>
              </tr>
            </thead>
            <tbody>
              {activities.length > 0 ? activities.map((act) => (
                <tr key={act.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="py-3">{act.date}</td>
                  <td className="py-3">{act.type}</td>
                  <td className="py-3">{act.title}</td>
                  <td className="py-3 font-semibold">{act.storyPoints || 0}</td>
                  <td className="py-3">{act.ticketReference || "-"}</td>
                  <td className="py-3">
                    {act.prLink ? (
                      <a href={act.prLink} target="_blank" rel="noreferrer" className="text-teal hover:underline dark:text-teal">Link</a>
                    ) : "-"}
                  </td>
                  <td className="py-3">{act.notes || "-"}</td>
                  <td className="py-3 text-coral">{act.blocker || "-"}</td>
                </tr>
              )) : (
                <tr><td colSpan="8" className="py-4 text-center text-slate-500">No activities logged yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}