import { request } from "../../../common/request";

const toArray = (data) => Array.isArray(data) ? data : (data?.data ?? []);

export const dashboardService = {
  getLeaveRequests: async () => {
    const response = await request({ method: "GET", path: "admin/leave/requests" });
    return toArray(response.data);
  },

  getCourses: async () => {
    const response = await request({ method: "GET", path: "admin/courses" });
    return toArray(response.data);
  },

  getEnrollments: async () => {
    const response = await request({ method: "GET", path: "admin/enrollments" });
    return toArray(response.data);
  },

  getAttendanceToday: async () => {
    const today = new Date().toISOString().split("T")[0];
    const response = await request({
      method: "GET",
      path: "admin/attendance/all",
      params: { start_date: today, end_date: today },
    });
    return toArray(response.data);
  },

  getAttendanceTrend: async () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 34); // last 5 weeks
    const response = await request({
      method: "GET",
      path: "admin/attendance/all",
      params: {
        start_date: start.toISOString().split("T")[0],
        end_date: end.toISOString().split("T")[0],
      },
    });
    return toArray(response.data);
  },

  getPayroll: async () => {
    const response = await request({ method: "GET", path: "admin/payroll" });
    return toArray(response.data);
  },
};
