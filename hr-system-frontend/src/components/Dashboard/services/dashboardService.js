import { request } from "../../../common/request";

const toArray = (data) => Array.isArray(data) ? data : (data?.data ?? []);

const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

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
    const today = formatDate(new Date());
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
        start_date: formatDate(start),
        end_date: formatDate(end),
      },
    });
    return toArray(response.data);
  },

  getPayroll: async () => {
    const response = await request({ method: "GET", path: "admin/payroll" });
    return toArray(response.data);
  },
};
