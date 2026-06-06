const API_BASE = import.meta.env.VITE_API_URL || "";

export async function api(path, options = {}) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();
  if (!response.ok) throw new Error(payload.message || "Request failed");
  return payload;
}

export function exportUrl(format, params = {}) {
  const query = new URLSearchParams(params).toString();
  return `/api/reports/export/${format}${query ? `?${query}` : ""}`;
}
