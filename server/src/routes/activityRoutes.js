import express from "express";
import { ACTIVITY_TYPES } from "../../../shared/constants.js";
import { requireAuth } from "../middleware/auth.js";
import { activitiesFor, addActivity, updateActivity } from "../services/attendanceService.js";
import { asyncHandler } from "../utils/errors.js";
import { ApiError } from "../utils/errors.js";
import { requireFields } from "../validators/common.js";

export const activityRoutes = express.Router();

activityRoutes.use(requireAuth);

activityRoutes.get("/", asyncHandler(async (req, res) => {
  res.json(await activitiesFor(req.user, req.query));
}));

activityRoutes.post("/", asyncHandler(async (req, res) => {
  requireFields(req.body, ["title", "type", "startTime", "endTime"]);
  if (!ACTIVITY_TYPES.includes(req.body.type)) throw new ApiError(400, "Invalid activity type");
  res.status(201).json(await addActivity(req.user, req.body));
}));

activityRoutes.put("/:id", asyncHandler(async (req, res) => {
  res.json(await updateActivity(req.user, req.params.id, req.body));
}));
