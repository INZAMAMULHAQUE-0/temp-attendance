import { ATTENDANCE_STATUS } from "../constants.js";
import { activitiesRepo, attendanceRepo, leavesRepo, usersRepo } from "../repositories/repository.js";
import { todayKey, minutesBetween } from "../utils/date.js";
import { ApiError } from "../utils/errors.js";

function computeTotals(record) {
  if (!record.checkIn || !record.checkOut) return { totalMinutes: 0, breakMinutes: 0, productiveMinutes: 0 };
  const totalMinutes = minutesBetween(record.checkIn, record.checkOut);
  const breakMinutes = (record.breaks || []).reduce((sum, item) => sum + minutesBetween(item.start, item.end), 0);
  return { totalMinutes, breakMinutes, productiveMinutes: Math.max(0, totalMinutes - breakMinutes) };
}

export async function getTodayAttendance(userId) {
  return (await attendanceRepo.all()).find((item) => item.userId === userId && item.date === todayKey()) || null;
}

export async function checkIn(user, body, req) {
  const existing = await getTodayAttendance(user.id);
  if (existing) throw new ApiError(409, "You have already checked in today");
  const record = await attendanceRepo.create({
    userId: user.id,
    date: todayKey(),
    checkIn: new Date().toISOString(),
    checkOut: null,
    breaks: [],
    todayPlan: body.todayPlan || "",
    browser: body.browser || req.headers["user-agent"] || "",
    sessionInfo: body.sessionInfo || req.ip,
    status: ATTENDANCE_STATUS.CHECKED_IN,
    totalMinutes: 0,
    breakMinutes: 0,
    productiveMinutes: 0
  });
  return record;
}

export async function startBreak(userId) {
  const record = await getTodayAttendance(userId);
  if (!record || record.checkOut) throw new ApiError(400, "Check in before starting a break");
  if (record.breaks?.some((item) => !item.end)) throw new ApiError(409, "A break is already active");
  return attendanceRepo.update(record.id, { breaks: [...(record.breaks || []), { start: new Date().toISOString(), end: null }] });
}

export async function endBreak(userId) {
  const record = await getTodayAttendance(userId);
  const breaks = record?.breaks || [];
  const index = breaks.findIndex((item) => !item.end);
  if (index === -1) throw new ApiError(400, "No active break found");
  breaks[index] = { ...breaks[index], end: new Date().toISOString() };
  return attendanceRepo.update(record.id, { breaks });
}

export async function checkOut(userId, notes = "") {
  const record = await getTodayAttendance(userId);
  if (!record || record.checkOut) throw new ApiError(400, "No active work session found");
  if (record.breaks?.some((item) => !item.end)) throw new ApiError(409, "End the active break before checkout");
  const next = { ...record, checkOut: new Date().toISOString(), status: ATTENDANCE_STATUS.CHECKED_OUT, notes };
  return attendanceRepo.update(record.id, { ...next, ...computeTotals(next) });
}

export async function attendanceHistory(user, query) {
  const all = await attendanceRepo.all();
  let filtered = all;
  if (user.role !== "admin") filtered = filtered.filter((item) => item.userId === user.id);
  else if (query.userId) filtered = filtered.filter((item) => item.userId === query.userId);

  if (query.date) filtered = filtered.filter((item) => item.date === query.date);
  if (query.fromDate) filtered = filtered.filter((item) => item.date >= query.fromDate);
  if (query.toDate) filtered = filtered.filter((item) => item.date <= query.toDate);
  
  return filtered;
}

export async function addActivity(user, body) {
  const record = await getTodayAttendance(user.id);
  if (!record || record.checkOut) throw new ApiError(400, "Activities can be added only during today's active session");
  const durationMinutes = body.durationMinutes || minutesBetween(`1970-01-01T${body.startTime}:00`, `1970-01-01T${body.endTime}:00`);
  return activitiesRepo.create({
    userId: user.id,
    attendanceId: record.id,
    date: record.date,
    title: body.title,
    type: body.type,
    description: body.description || "",
    startTime: body.startTime,
    endTime: body.endTime,
    durationMinutes,
    ticketReference: body.ticketReference || "",
    storyPoints: Number(body.storyPoints || 0),
    prLink: body.prLink || "",
    blocker: body.blocker || "",
    notes: body.notes || ""
  });
}

export async function updateActivity(user, id, body) {
  const activity = await activitiesRepo.findById(id);
  if (!activity) throw new ApiError(404, "Activity not found");
  const record = await attendanceRepo.findById(activity.attendanceId);
  if (user.role !== "admin" && (activity.userId !== user.id || record?.checkOut || activity.date !== todayKey())) {
    throw new ApiError(403, "You can edit only same-day activities before checkout");
  }
  return activitiesRepo.update(id, { ...body, storyPoints: Number(body.storyPoints || 0) });
}

export async function activitiesFor(user, query = {}) {
  const all = await activitiesRepo.all();
  let filtered = all;
  
  if (user.role !== "admin") filtered = filtered.filter((item) => item.userId === user.id);
  else if (query.userId) filtered = filtered.filter((item) => item.userId === query.userId);

  if (query.date) filtered = filtered.filter((item) => item.date === query.date);
  if (query.fromDate) filtered = filtered.filter((item) => item.date >= query.fromDate);
  if (query.toDate) filtered = filtered.filter((item) => item.date <= query.toDate);

  return filtered;
}

export async function applyLeave(user, body) {
  const existing = (await leavesRepo.all()).some((leave) =>
    leave.userId === user.id && leave.status !== "rejected" && body.fromDate <= leave.toDate && body.toDate >= leave.fromDate
  );
  if (existing) throw new ApiError(409, "Leave request overlaps with an existing request");
  return leavesRepo.create({
    userId: user.id,
    type: body.type,
    reason: body.reason,
    fromDate: body.fromDate,
    toDate: body.toDate,
    status: "pending"
  });
}

export async function decideLeave(adminId, leaveId, status) {
  if (!["approved", "rejected"].includes(status)) throw new ApiError(400, "Status must be approved or rejected");
  return leavesRepo.update(leaveId, { status, decidedBy: adminId, decidedAt: new Date().toISOString() });
}

export async function leavesFor(user) {
  const leaves = await leavesRepo.all();
  return user.role === "admin" ? leaves : leaves.filter((item) => item.userId === user.id);
}

export async function listEmployees() {
  return (await usersRepo.all()).filter((user) => user.role === "employee").map(({ passwordHash, ...user }) => user);
}
