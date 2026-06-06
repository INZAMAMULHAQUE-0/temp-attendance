import express from "express";
import { LEAVE_TYPES } from "../../../shared/constants.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { applyLeave, decideLeave, leavesFor } from "../services/attendanceService.js";
import { asyncHandler, ApiError } from "../utils/errors.js";
import { assertDateRange, requireFields } from "../validators/common.js";

export const leaveRoutes = express.Router();

leaveRoutes.use(requireAuth);

leaveRoutes.get("/", asyncHandler(async (req, res) => {
  res.json(await leavesFor(req.user));
}));

leaveRoutes.post("/", asyncHandler(async (req, res) => {
  requireFields(req.body, ["type", "reason", "fromDate", "toDate"]);
  if (!LEAVE_TYPES.includes(req.body.type)) throw new ApiError(400, "Invalid leave type");
  assertDateRange(req.body.fromDate, req.body.toDate);
  res.status(201).json(await applyLeave(req.user, req.body));
}));

leaveRoutes.patch("/:id/decision", requireRole("admin"), asyncHandler(async (req, res) => {
  res.json(await decideLeave(req.user.id, req.params.id, req.body.status));
}));
