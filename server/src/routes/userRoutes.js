import express from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { createEmployee, listUsers, resetPassword, updateUser } from "../services/userService.js";
import { asyncHandler } from "../utils/errors.js";
import { requireFields } from "../validators/common.js";

export const userRoutes = express.Router();

userRoutes.use(requireAuth, requireRole("admin"));

userRoutes.get("/", asyncHandler(async (_req, res) => {
  res.json(await listUsers());
}));

userRoutes.post("/", asyncHandler(async (req, res) => {
  requireFields(req.body, ["name", "email"]);
  res.status(201).json(await createEmployee(req.body));
}));

userRoutes.patch("/:id", asyncHandler(async (req, res) => {
  res.json(await updateUser(req.params.id, req.body));
}));

userRoutes.post("/:id/reset-password", asyncHandler(async (req, res) => {
  res.json(await resetPassword(req.params.id, req.body.password));
}));
