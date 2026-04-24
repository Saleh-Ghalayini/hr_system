export const SUBNAV_CONFIG = {
  "/training": [
    { text: "My Learning", link: "my-learning" },
    { text: "Enrollments", link: "enrollments", roles: ["admin"] },
    { text: "Course Catalog", link: "catalog", roles: ["admin"] },
  ],
  "/payroll": [
    { text: "Salaries", link: "salaries", roles: ["admin", "manager"] },
    { text: "Payroll Details", link: "payroll-details", roles: ["admin", "manager"] },
    { text: "Insurance & Tax", link: "insandtax", roles: ["admin", "manager"] },
  ],
  "/onboarding": [
    { text: "Management", link: "management", roles: ["admin"] },
    { text: "New Hires", link: "new-hires", roles: ["admin"] },
    { text: "My Onboarding", link: "my", roles: ["user", "manager"] },
    { text: "Documents", link: "documents", roles: ["user", "manager"] },
    { text: "Checklist", link: "checklist", roles: ["user", "manager"] },
  ],
  "/performance": [
    { text: "Performance Reviews", link: "performance-reviews" },
    { text: "Employee Ratings", link: "employee-ratings" },
    { text: "Rate Employee", link: "rate-employee", roles: ["admin", "manager"] },
    { text: "Average Rating", link: "average-rate", roles: ["admin", "manager"] },
  ],
  "/attendance": [
    { text: "Attendance Records", link: "attendance-records" },
    { text: "Leave Requests", link: "leave-requests" },
    { text: "My Leave", link: "my-leave" },
    { text: "Sick Leave Report", link: "sick-leave-report", roles: ["admin"] },
    { text: "Attendance Reports", link: "attendance-reports", roles: ["admin"] },
    { text: "Settings", link: "settings", roles: ["admin"] },
  ],
  "/profile": [
    { text: "Basic Info", link: "basicinfo" },
    { text: "Job Details", link: "jobdetails" },
    { text: "Salary", link: "salary" },
  ],
};
