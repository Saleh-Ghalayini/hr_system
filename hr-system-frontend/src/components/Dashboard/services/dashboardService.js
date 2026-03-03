import { request } from "../../../common/request";

export const dashboardService = {
  getLeaveRequests: async () => {
    const response = await request({
      method: "GET",
      path: "admin/leave/requests",
    });
    return response.data;
  },

  getCourses: async () => {
    const response = await request({
      method: "GET",
      path: "admin/courses",
    });
    return response.data;
  },

  getEnrollments: async () => {
    const response = await request({
      method: "GET",
      path: "admin/enrollments",
    });
    return response.data;
  },
};
