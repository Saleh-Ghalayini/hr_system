export const getStatusClass = (status) => {
  const normalized = String(status ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  const green = ["present", "active", "completed", "enrolled", "approved", "on_time"];
  const yellow = ["pending", "in_progress", "not_started"];
  const orange = ["late"];
  const red = ["rejected", "absent", "cancelled", "failed", "terminated"];

  return green.includes(normalized)
    ? "status-green"
    : yellow.includes(normalized)
    ? "status-yellow"
    : orange.includes(normalized)
    ? "status-orange"
    : red.includes(normalized)
    ? "status-red"
    : "status-gray"; // fallback
};
