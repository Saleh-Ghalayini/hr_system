import { request } from "../../../common/request";

const toArray = (data) => Array.isArray(data) ? data : (data?.data ?? []);

export const dashboardService = {
  getLeaveRequests: async () => {
    const response = await request({
      method: "GET",
      path: "admin/leave/requests",
    });
    return toArray(response.data);
  },

  getCourses: async () => {
    const response = await request({
      method: "GET",
      path: "admin/courses",
    });
    return toArray(response.data);
  },

  getEnrollments: async () => {
    const response = await request({
      method: "GET",
      path: "admin/enrollments",
    });
    return toArray(response.data);
  },
};
