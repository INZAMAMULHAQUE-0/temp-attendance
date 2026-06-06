import { Plus, Timer, Coffee, Square } from "lucide-react";
import { useState } from "react";
import { api } from "../api/client.js";
import { Alert, Button, Empty, Input, Loading, Panel, Select, Stat, Textarea } from "../components/UI.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { hm, hours } from "../utils/format.js";

const types = ["Meeting", "Development", "Bug Fix", "Customer Support", "Testing", "Documentation", "Code Review", "Research", "Training", "Other"];

export default function EmployeeDashboard() {
  const { data, loading, error, refresh } = useAsync(async () => {
    const [today, activities] = await Promise.all([api("/api/attendance/today"), api("/api/activities")]);
    return { today, activities: activities.filter((item) => item.date === new Date().toISOString().slice(0, 10)) };
  }, []);
  const [plan, setPlan] = useState("");
  const [activity, setActivity] = useState({ title: "", type: "Development", startTime: "10:00", endTime: "11:00", storyPoints: 0 });
  const [message, setMessage] = useState("");

  async function action(path, body = {}) {
    setMessage("");
    try {
      await api(path, { method: "POST", body: JSON.stringify(body) });
      await refresh();
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function addActivity(event) {
    event.preventDefault();
    await action("/api/activities", activity);
    setActivity({ ...activity, title: "", storyPoints: 0 });
  }

  if (loading) return <Loading />;

  const today = data.today;
  const points = data.activities.reduce((sum, item) => sum + Number(item.storyPoints || 0), 0);

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold">My Day</h2><p className="text-sm text-slate-500">Check in, log work, manage breaks, and close the day with a summary.</p></div>
      {error && <Alert>{error}</Alert>}
      {message && <Alert>{message}</Alert>}
      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Status" value={today?.status?.replace("_", " ") || "Not started"} />
        <Stat label="Check-in" value={hm(today?.checkIn)} />
        <Stat label="Breaks" value={hours(today?.breakMinutes)} />
        <Stat label="Story Points" value={points} />
      </div>
      <Panel>
        <div className="flex flex-wrap items-end gap-3">
          {!today && <><div className="min-w-64 flex-1"><label className="text-sm font-semibold">Today's plan</label><Textarea value={plan} onChange={(e) => setPlan(e.target.value)} /></div><Button onClick={() => action("/api/attendance/check-in", { todayPlan: plan, browser: navigator.userAgent })}><Timer className="size-4" /> Start Work</Button></>}
          {today && !today.checkOut && <><Button variant="secondary" onClick={() => action("/api/attendance/start-break")}><Coffee className="size-4" /> Start Break</Button><Button variant="secondary" onClick={() => action("/api/attendance/end-break")}>End Break</Button><Button variant="danger" onClick={() => action("/api/attendance/check-out")}><Square className="size-4" /> End Work</Button></>}
          {today?.checkOut && <Alert type="success">Workday closed at {hm(today.checkOut)}</Alert>}
        </div>
      </Panel>
      {today && !today.checkOut && (
        <Panel>
          <h3 className="font-bold">Add Activity</h3>
          <form onSubmit={addActivity} className="mt-4 grid gap-3 md:grid-cols-6">
            <Input placeholder="Title" value={activity.title} onChange={(e) => setActivity({ ...activity, title: e.target.value })} required />
            <Select value={activity.type} onChange={(e) => setActivity({ ...activity, type: e.target.value })}>{types.map((type) => <option key={type}>{type}</option>)}</Select>
            <Input type="time" value={activity.startTime} onChange={(e) => setActivity({ ...activity, startTime: e.target.value })} />
            <Input type="time" value={activity.endTime} onChange={(e) => setActivity({ ...activity, endTime: e.target.value })} />
            <Input type="number" min="0" placeholder="Points" value={activity.storyPoints} onChange={(e) => setActivity({ ...activity, storyPoints: e.target.value })} />
            <Button><Plus className="size-4" /> Add</Button>
            <Input className="md:col-span-2" placeholder="Jira ticket" onChange={(e) => setActivity({ ...activity, ticketReference: e.target.value })} />
            <Input className="md:col-span-2" placeholder="GitHub PR link" onChange={(e) => setActivity({ ...activity, prLink: e.target.value })} />
            <Input className="md:col-span-2" placeholder="Blocker or note" onChange={(e) => setActivity({ ...activity, blocker: e.target.value })} />
          </form>
        </Panel>
      )}
      <Panel>
        <h3 className="font-bold">Today's Activities</h3>
        <div className="mt-4 space-y-3">
          {!data.activities.length && <Empty text="No activities logged yet." />}
          {data.activities.map((item) => <div key={item.id} className="rounded-md border border-slate-200 p-3 text-sm dark:border-slate-800"><div className="flex justify-between gap-3"><strong>{item.title}</strong><span>{item.type}</span></div><p className="mt-1 text-slate-500">{item.ticketReference} {item.prLink}</p></div>)}
        </div>
      </Panel>
    </div>
  );
}
