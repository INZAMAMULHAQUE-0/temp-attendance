import express from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { analytics, exportReport, reportRows, storyPointDetails } from "../services/reportService.js";
import { asyncHandler } from "../utils/errors.js";

export const reportRoutes = express.Router();

reportRoutes.use(requireAuth, requireRole("admin"));

reportRoutes.get("/", asyncHandler(async (req, res) => {
  res.json(await reportRows(req.query.period, req.query.from, req.query.to));
}));

reportRoutes.get("/analytics", asyncHandler(async (_req, res) => {
  res.json(await analytics());
}));

reportRoutes.get("/story-points", asyncHandler(async (req, res) => {
  res.json(await storyPointDetails(req.query));
}));

reportRoutes.get("/export/:format", asyncHandler(async (req, res) => {
  const output = await exportReport(req.params.format, req.query);
  res.setHeader("Content-Type", output.contentType);
  res.setHeader("Content-Disposition", `attachment; filename=attendance-report.${req.params.format}`);
  res.send(output.body);
}));
