import { ApiError } from "../utils/errors.js";

export function requireFields(body, fields) {
  const missing = fields.filter((field) => body[field] === undefined || body[field] === "");
  if (missing.length) throw new ApiError(400, `Missing required field(s): ${missing.join(", ")}`);
}

export function assertDateRange(fromDate, toDate) {
  if (!fromDate || !toDate || fromDate > toDate) throw new ApiError(400, "Invalid date range");
}
