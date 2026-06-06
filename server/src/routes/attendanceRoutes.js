import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { attendanceHistory, checkIn, checkOut, endBreak, getTodayAttendance, startBreak } from "../services/attendanceService.js";
import { asyncHandler } from "../utils/errors.js";

export const attendanceRoutes = express.Router();

attendanceRoutes.use(requireAuth);

attendanceRoutes.get("/today", asyncHandler(async (req, res) => {
  res.json(await getTodayAttendance(req.user.id));
}));

attendanceRoutes.get("/", asyncHandler(async (req, res) => {
  res.json(await attendanceHistory(req.user, req.query));
}));

attendanceRoutes.post("/check-in", asyncHandler(async (req, res) => {
  res.status(201).json(await checkIn(req.user, req.body, req));
}));

attendanceRoutes.post("/start-break", asyncHandler(async (req, res) => {
  res.json(await startBreak(req.user.id));
}));

attendanceRoutes.post("/end-break", asyncHandler(async (req, res) => {
  res.json(await endBreak(req.user.id));
}));

attendanceRoutes.post("/check-out", asyncHandler(async (req, res) => {
  res.json(await checkOut(req.user.id, req.body.notes));
}));
