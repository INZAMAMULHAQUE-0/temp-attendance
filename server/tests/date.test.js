import test from "node:test";
import assert from "node:assert/strict";
import { minutesBetween, todayKey } from "../src/utils/date.js";

test("minutesBetween returns whole positive minutes", () => {
  assert.equal(minutesBetween("2026-06-01T09:00:00.000Z", "2026-06-01T10:30:00.000Z"), 90);
});

test("todayKey formats a date as yyyy-mm-dd", () => {
  assert.equal(todayKey(new Date("2026-06-01T12:00:00.000Z")), "2026-06-01");
});
