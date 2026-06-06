import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
const jwtSecret = process.env.JWT_SECRET || "replace-this-secret-before-production";

if (isProduction && jwtSecret === "replace-this-secret-before-production") {
  throw new Error("JWT_SECRET must be set in production");
}

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is required");
}

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  mongoUri: process.env.MONGODB_URI,
  mongoDbName: process.env.MONGODB_DB_NAME || "logstios_attendance"
};
