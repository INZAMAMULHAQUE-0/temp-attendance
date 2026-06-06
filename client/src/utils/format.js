export function hm(iso) {
  return iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-";
}

export function hours(minutes = 0) {
  return `${Math.round(minutes / 6) / 10}h`;
}
