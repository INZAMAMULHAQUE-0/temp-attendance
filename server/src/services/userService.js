import bcrypt from "bcryptjs";
import { ROLES } from "../constants.js";
import { usersRepo } from "../repositories/repository.js";
import { ApiError } from "../utils/errors.js";

export async function listUsers() {
  return (await usersRepo.all()).map(({ passwordHash, ...safe }) => safe);
}

export async function createEmployee(body) {
  const users = await usersRepo.all();
  if (users.some((user) => user.email.toLowerCase() === body.email.toLowerCase())) throw new ApiError(409, "Email already exists");
  const passwordHash = await bcrypt.hash(body.password || "Employee@123", 10);
  const user = await usersRepo.create({
    name: body.name,
    email: body.email,
    role: body.role || ROLES.EMPLOYEE,
    title: body.title || "Employee",
    passwordHash,
    forcePasswordChange: true,
    active: true
  });
  const { passwordHash: _passwordHash, ...safe } = user;
  return safe;
}

export async function updateUser(id, body) {
  const user = await usersRepo.update(id, body);
  if (!user) throw new ApiError(404, "User not found");
  const { passwordHash, ...safe } = user;
  return safe;
}

export async function resetPassword(id, password = "Employee@123") {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await usersRepo.update(id, { passwordHash, forcePasswordChange: true });
  if (!user) throw new ApiError(404, "User not found");
  const { passwordHash: _passwordHash, ...safe } = user;
  return safe;
}
