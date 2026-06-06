import express from "express";
import { changePassword, currentUser, forgotPassword, login } from "../services/authService.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/errors.js";
import { requireFields } from "../validators/common.js";

export const authRoutes = express.Router();

authRoutes.post("/login", asyncHandler(async (req, res) => {
  requireFields(req.body, ["email", "password"]);
  res.json(await login(req.body.email, req.body.password));
}));

authRoutes.post("/forgot-password", asyncHandler(async (req, res) => {
  requireFields(req.body, ["username", "newPassword"]);
  res.json(await forgotPassword(req.body.username, req.body.newPassword));
}));

authRoutes.post("/reset-password", asyncHandler(async (req, res) => {
  requireFields(req.body, ["username", "newPassword"]);
  res.json(await forgotPassword(req.body.username, req.body.newPassword));
}));

authRoutes.get("/me", requireAuth, asyncHandler(async (req, res) => {
  res.json(await currentUser(req.user.id));
}));

authRoutes.post("/change-password", requireAuth, asyncHandler(async (req, res) => {
  requireFields(req.body, ["currentPassword", "newPassword"]);
  res.json(await changePassword(req.user.id, req.body.currentPassword, req.body.newPassword));
}));
