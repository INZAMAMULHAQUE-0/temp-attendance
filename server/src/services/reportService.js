import { activitiesRepo, attendanceRepo, leavesRepo, settingsRepo, usersRepo } from "../repositories/repository.js";
import { toCsv } from "../utils/csv.js";
import { inRange, todayKey } from "../utils/date.js";

function dateMinus(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return todayKey(date);
}

function publicUsers(users) {
  return users.map(({ passwordHash, ...safe }) => safe);
}

async function getSettings() {
  const settings = await settingsRepo.findById("default");
  return {
    workdayStart: "10:00",
    lateAfterMinutes: 30,
    ...(settings || {})
  };
}

function isLate(record, settings) {
  const check = new Date(record.checkIn);
  const [hour, minute] = settings.workdayStart.split(":").map(Number);
  const start = new Date(record.checkIn);
  start.setHours(hour, minute + settings.lateAfterMinutes, 0, 0);
  return check > start;
}

export async function dashboard() {
  const [users, attendance, activities, leaves, settings] = await Promise.all([
    usersRepo.all(),
    attendanceRepo.all(),
    activitiesRepo.all(),
    leavesRepo.all(),
    getSettings()
  ]);
  const employees = users.filter((user) => user.role === "employee" && user.active);
  const today = todayKey();
  const todayAttendance = attendance.filter((item) => item.date === today);
  const presentIds = new Set(todayAttendance.map((item) => item.userId));
  const onLeaveIds = new Set(leaves.filter((item) => item.status === "approved" && inRange(today, item.fromDate, item.toDate)).map((item) => item.userId));
  const todayActivities = activities.filter((item) => item.date === today);

  return {
    cards: {
      presentToday: presentIds.size,
      absentToday: employees.filter((user) => !presentIds.has(user.id) && !onLeaveIds.has(user.id)).length,
      lateToday: todayAttendance.filter((record) => isLate(record, settings)).length,
      activeEmployees: todayAttendance.filter((item) => !item.checkOut).length,
      employeesOnLeave: onLeaveIds.size,
      totalHoursLoggedToday: Math.round(todayAttendance.reduce((sum, item) => sum + (item.productiveMinutes || 0), 0) / 60),
      storyPointsCompletedToday: todayActivities.reduce((sum, item) => sum + Number(item.storyPoints || 0), 0)
    },
    todayAttendance,
    employees: publicUsers(employees),
    leaves
  };
}

export async function analytics() {
  const [attendance, activities, users] = await Promise.all([attendanceRepo.all(), activitiesRepo.all(), usersRepo.all()]);
  const employees = users.filter((user) => user.role === "employee");
  const days = Array.from({ length: 7 }, (_, index) => dateMinus(6 - index));
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    return date.toISOString().slice(0, 7);
  });

  return {
    weeklyAttendance: days.map((date) => ({ date, present: new Set(attendance.filter((item) => item.date === date).map((item) => item.userId)).size })),
    monthlyAttendance: months.map((month) => ({ month, entries: attendance.filter((item) => item.date.startsWith(month)).length })),
    storyPointTrend: days.map((date) => ({ date, points: activities.filter((item) => item.date === date).reduce((sum, item) => sum + Number(item.storyPoints || 0), 0) })),
    activityDistribution: Object.entries(activities.reduce((map, item) => ({ ...map, [item.type]: (map[item.type] || 0) + 1 }), {})).map(([type, count]) => ({ type, count })),
    employeeProductivity: employees.map((employee) => ({
      name: employee.name,
      hours: Math.round(attendance.filter((item) => item.userId === employee.id).reduce((sum, item) => sum + (item.productiveMinutes || 0), 0) / 60),
      storyPoints: activities.filter((item) => item.userId === employee.id).reduce((sum, item) => sum + Number(item.storyPoints || 0), 0)
    }))
  };
}

export async function storyPointDetails(query = {}) {
  const [activities, users] = await Promise.all([activitiesRepo.all(), usersRepo.all()]);
  const employees = users.filter((user) => user.role === "employee");
  const from = query.from || dateMinus(30);
  const to = query.to || todayKey();
  const filteredActivities = activities.filter((activity) => inRange(activity.date, from, to));

  return employees.map((employee) => {
    const employeeActivities = filteredActivities
      .filter((activity) => activity.userId === employee.id)
      .sort((left, right) => right.date.localeCompare(left.date));
    const totalStoryPoints = employeeActivities.reduce((sum, activity) => sum + Number(activity.storyPoints || 0), 0);

    return {
      employee: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        title: employee.title
      },
      totalStoryPoints,
      activityCount: employeeActivities.length,
      activities: employeeActivities.map((activity) => ({
        id: activity.id,
        date: activity.date,
        title: activity.title,
        type: activity.type,
        ticketReference: activity.ticketReference || "",
        storyPoints: Number(activity.storyPoints || 0),
        prLink: activity.prLink || "",
        description: activity.description || ""
      }))
    };
  });
}

export async function reportRows(period = "daily", from = dateMinus(30), to = todayKey()) {
  const [attendance, activities, users] = await Promise.all([attendanceRepo.all(), activitiesRepo.all(), usersRepo.all()]);
  return attendance
    .filter((item) => inRange(item.date, from, to))
    .map((item) => {
      const user = users.find((candidate) => candidate.id === item.userId);
      const dayActivities = activities.filter((activity) => activity.attendanceId === item.id);
      return {
        period,
        date: item.date,
        employee: user?.name || item.userId,
        checkIn: item.checkIn,
        checkOut: item.checkOut || "",
        totalHours: Math.round((item.totalMinutes || 0) / 6) / 10,
        productiveHours: Math.round((item.productiveMinutes || 0) / 6) / 10,
        breaksMinutes: item.breakMinutes || 0,
        activities: dayActivities.length,
        meetings: dayActivities.filter((activity) => activity.type === "Meeting").length,
        bugsResolved: dayActivities.filter((activity) => activity.type === "Bug Fix").length,
        storyPoints: dayActivities.reduce((sum, activity) => sum + Number(activity.storyPoints || 0), 0)
      };
    });
}

export async function exportReport(format, query) {
  const rows = await reportRows(query.period, query.from, query.to);
  if (format === "xlsx") {
    const headers = rows.length ? Object.keys(rows[0]) : ["message"];
    const bodyRows = rows.length ? rows : [{ message: "No rows" }];
    const escape = (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Report">
    <Table>
      <Row>${headers.map((header) => `<Cell><Data ss:Type="String">${escape(header)}</Data></Cell>`).join("")}</Row>
      ${bodyRows.map((row) => `<Row>${headers.map((header) => `<Cell><Data ss:Type="String">${escape(row[header])}</Data></Cell>`).join("")}</Row>`).join("")}
    </Table>
  </Worksheet>
</Workbook>`;
    return { contentType: "application/vnd.ms-excel", body: xml };
  }
  return { contentType: "text/csv", body: toCsv(rows) };
}
