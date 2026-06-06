import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { closeMongo } from "./repositories/mongoStore.js";
import { seedIfNeeded } from "./services/seedService.js";

await seedIfNeeded();

const server = createApp().listen(env.port, () => {
  console.log(`Attendance API listening on http://localhost:${env.port}`);
});

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down API.`);
  server.close(async () => {
    await closeMongo();
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
