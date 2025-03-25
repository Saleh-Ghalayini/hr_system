export const getStatusClass = (status) => {
  const green = ["Present", "Active", "Completed", "enrolled", "Approved", "approved"];
  const yellow = ["Pending", "in_progress", "Rejected", "pending", "in_progress", "Not Started", "Late"];
  return green.includes(status)
    ? "status-green"
    : yellow.includes(status)
    ? "status-yellow"
    : "status-red";
};
