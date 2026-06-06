import { MongoClient } from "mongodb";
import { env } from "../config/env.js";

let client;
let db;

export async function getDb() {
  if (db) return db;

  client = new MongoClient(env.mongoUri, {
    maxPoolSize: 20,
    retryReads: true,
    retryWrites: true
  });

  await client.connect();
  db = client.db(env.mongoDbName);
  await ensureIndexes(db);
  return db;
}

async function ensureIndexes(database) {
  await Promise.all([
    database.collection("users").createIndex({ email: 1 }, { unique: true }),
    database.collection("attendance").createIndex({ userId: 1, date: 1 }),
    database.collection("activities").createIndex({ userId: 1, date: 1 }),
    database.collection("activities").createIndex({ attendanceId: 1 }),
    database.collection("leaves").createIndex({ userId: 1, fromDate: 1, toDate: 1 }),
    database.collection("settings").createIndex({ id: 1 }, { unique: true })
  ]);
}

export async function closeMongo() {
  if (!client) return;
  await client.close();
  client = undefined;
  db = undefined;
}
