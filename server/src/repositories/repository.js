import { v4 as uuid } from "uuid";
import { getDb } from "./mongoStore.js";

export function createRepository(name) {
  return {
    async all() {
      return (await getDb()).collection(name).find({}, { projection: { _id: 0 } }).toArray();
    },
    async saveAll(items) {
      const db = await getDb();
      await db.collection(name).deleteMany({});
      if (!items.length) return;
      await db.collection(name).insertMany(items.map((item) => ({ ...item })), { ordered: false });
    },
    async findById(id) {
      return (await getDb()).collection(name).findOne({ id }, { projection: { _id: 0 } });
    },
    async create(data) {
      const now = new Date().toISOString();
      const item = { id: uuid(), createdAt: now, updatedAt: now, ...data };
      await (await getDb()).collection(name).insertOne(item);
      delete item._id;
      return item;
    },
    async update(id, patch) {
      const result = await (await getDb()).collection(name).findOneAndUpdate(
        { id },
        { $set: { ...patch, updatedAt: new Date().toISOString() } },
        { returnDocument: "after", projection: { _id: 0 } }
      );
      return result || null;
    },
    async remove(id) {
      const result = await (await getDb()).collection(name).deleteOne({ id });
      return result.deletedCount > 0;
    }
  };
}

export const usersRepo = createRepository("users");
export const attendanceRepo = createRepository("attendance");
export const activitiesRepo = createRepository("activities");
export const leavesRepo = createRepository("leaves");
export const reportsRepo = createRepository("reports");
export const settingsRepo = createRepository("settings");
