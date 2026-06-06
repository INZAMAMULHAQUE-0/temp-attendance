import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { usersRepo } from "../repositories/repository.js";
import { ApiError } from "../utils/errors.js";

function publicUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

export function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, { expiresIn: "12h" });
}

export async function login(email, password) {
  const users = await usersRepo.all();
  const user = users.find((item) => item.email.toLowerCase() === String(email).toLowerCase() && item.active);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new ApiError(401, "Invalid email or password");
  }
  return { token: signToken(user), user: publicUser(user) };
}

export async function changePassword(userId, currentPassword, newPassword) {
  if (!newPassword || newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
    throw new ApiError(400, "Password must be at least 8 characters and include an uppercase letter and a number");
  }
  const user = await usersRepo.findById(userId);
  if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
    throw new ApiError(401, "Current password is incorrect");
  }
  const passwordHash = await bcrypt.hash(newPassword, 10);
  return publicUser(await usersRepo.update(userId, { passwordHash, forcePasswordChange: false }));
}

export async function forgotPassword(username, newPassword) {
  if (!newPassword || newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
    throw new ApiError(400, "Password must be at least 8 characters and include an uppercase letter and a number");
  }

  const normalizedUsername = String(username || "").trim().toLowerCase();
  const users = await usersRepo.all();
  const user = users.find((item) =>
    item.active &&
    (
      item.email.toLowerCase() === normalizedUsername ||
      item.name.toLowerCase() === normalizedUsername
    )
  );

  if (!user) {
    throw new ApiError(404, "No active account found for this username");
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  return publicUser(await usersRepo.update(user.id, { passwordHash, forcePasswordChange: false }));
}

export async function currentUser(userId) {
  const user = await usersRepo.findById(userId);
  if (!user || !user.active) throw new ApiError(401, "Session user not found");
  return publicUser(user);
}
