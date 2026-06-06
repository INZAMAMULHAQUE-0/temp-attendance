import express from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { dashboard } from "../services/reportService.js";
import { asyncHandler } from "../utils/errors.js";

export const dashboardRoutes = express.Router();

dashboardRoutes.get("/", requireAuth, requireRole("admin"), asyncHandler(async (_req, res) => {
  res.json(await dashboard());
}));
