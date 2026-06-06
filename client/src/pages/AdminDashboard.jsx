import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../api/client.js";
import { Alert, Empty, Loading, Panel, Stat } from "../components/UI.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { hm } from "../utils/format.js";

export default function AdminDashboard() {
  const { data, error, loading } = useAsync(async () => {
    const [dashboard, analytics] = await Promise.all([
      api("/api/dashboard"),
      api("/api/reports/analytics")
    ]);

    let storyPoints = [];
    try {
      storyPoints = await api("/api/reports/story-points");
    } catch (err) {
      console.warn("Story point details unavailable", err);
    }

    return { dashboard, analytics, storyPoints };
  }, []);
  if (loading) return <Loading />;
  if (error || !data) return <Alert>{error || "Unable to load admin dashboard."}</Alert>;
  const cards = data.dashboard.cards;
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">Admin Dashboard</h2><p className="text-sm text-slate-500">Live attendance, team capacity, and productivity signals.</p></div>
      <div className="grid gap-4 md:grid-cols-4"><Stat label="Present Today" value={cards.presentToday} /><Stat label="Absent Today" value={cards.absentToday} /><Stat label="Late Today" value={cards.lateToday} /><Stat label="Active Employees" value={cards.activeEmployees} /><Stat label="On Leave" value={cards.employeesOnLeave} /><Stat label="Hours Today" value={cards.totalHoursLoggedToday} /><Stat label="Story Points" value={cards.storyPointsCompletedToday} /></div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Chart title="Weekly Attendance"><BarChart data={data.analytics.weeklyAttendance}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Bar dataKey="present" fill="#0f766e" /></BarChart></Chart>
        <Chart title="Story Point Trend"><AreaChart data={data.analytics.storyPointTrend}><XAxis dataKey="date" /><YAxis /><Tooltip /><Area dataKey="points" fill="#e85d4f" stroke="#e85d4f" /></AreaChart></Chart>
        <Chart title="Employee Productivity"><BarChart data={data.analytics.employeeProductivity}><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend /><Bar dataKey="hours" fill="#2563eb" /><Bar dataKey="storyPoints" fill="#0f766e" /></BarChart></Chart>
        <Chart title="Activity Distribution"><PieChart><Tooltip /><Pie data={data.analytics.activityDistribution} dataKey="count" nameKey="type" fill="#0f766e" /></PieChart></Chart>
      </div>
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-bold">Employee Story Point Details</h3>
          <span className="text-sm text-slate-500 dark:text-slate-400">Last 30 days</span>
        </div>
        <div className="mt-4 overflow-x-auto">
          {!data.storyPoints.length ? <Empty text="No story point details available." /> : (
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead>
                <tr className="text-slate-500">
                  <th className="pb-2">Employee</th>
                  <th className="pb-2">Title</th>
                  <th className="pb-2">Total Story Points</th>
                  <th className="pb-2">Activities</th>
                  <th className="pb-2">Recent Story Point Work</th>
                </tr>
              </thead>
              <tbody>
                {data.storyPoints.map((row) => (
                  <tr key={row.employee.id} className="border-t border-slate-100 align-top dark:border-slate-800">
                    <td className="py-3">
                      <p className="font-semibold text-ink dark:text-white">{row.employee.name}</p>
                      <p className="text-xs text-slate-500">{row.employee.email}</p>
                    </td>
                    <td className="py-3">{row.employee.title}</td>
                    <td className="py-3 font-semibold">{row.totalStoryPoints}</td>
                    <td className="py-3">{row.activityCount}</td>
                    <td className="py-3">
                      <div className="space-y-2">
                        {row.activities.slice(0, 4).map((activity) => (
                          <div key={activity.id} className="rounded-md border border-slate-100 p-2 dark:border-slate-800">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-medium">{activity.title}</span>
                              <span className="rounded bg-teal/10 px-2 py-0.5 text-xs font-semibold text-teal">{activity.storyPoints} pts</span>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                              {activity.date} {activity.ticketReference ? `- ${activity.ticketReference}` : ""} - {activity.type}
                            </p>
                          </div>
                        ))}
                        {!row.activities.length ? <span className="text-xs text-slate-500">No story point activity.</span> : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Panel>
      <Panel><h3 className="font-bold">Today's Attendance</h3><div className="mt-4 overflow-x-auto">{!data.dashboard.todayAttendance.length ? <Empty text="No one has checked in yet." /> : <table className="w-full text-left text-sm"><thead><tr className="text-slate-500"><th>Employee</th><th>Check in</th><th>Status</th></tr></thead><tbody>{data.dashboard.todayAttendance.map((row) => <tr key={row.id} className="border-t border-slate-100 dark:border-slate-800"><td className="py-3">{data.dashboard.employees.find((emp) => emp.id === row.userId)?.name}</td><td>{hm(row.checkIn)}</td><td>{row.status}</td></tr>)}</tbody></table>}</div></Panel>
    </div>
  );
}

function Chart({ title, children }) {
  return <Panel><h3 className="mb-4 font-bold">{title}</h3><div className="h-72"><ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer></div></Panel>;
}
