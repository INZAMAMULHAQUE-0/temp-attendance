export function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function toHours(ms) {
  return Math.round((ms / 36_000) ) / 100;
}

export function minutesBetween(start, end) {
  if (!start || !end) return 0;
  return Math.max(0, Math.round((new Date(end) - new Date(start)) / 60_000));
}

export function isSameDate(a, b = new Date()) {
  return todayKey(new Date(a)) === todayKey(new Date(b));
}

export function inRange(dateKey, from, to) {
  return dateKey >= from && dateKey <= to;
}
