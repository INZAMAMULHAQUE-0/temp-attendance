import { settingsRepo, usersRepo } from "../repositories/repository.js";

const defaultSettings = {
  id: "default",
  companyName: "Logstios Software",
  timezone: "Asia/Kolkata",
  workdayStart: "10:00",
  expectedDailyHours: 8,
  lateAfterMinutes: 30
};

export async function seedIfNeeded() {
  const users = await usersRepo.all();
  if (users.length) {
    const settings = await settingsRepo.all();
    if (!settings.length) {
      await settingsRepo.saveAll([defaultSettings]);
    }
    return;
  }

  await settingsRepo.saveAll([defaultSettings]);
}
