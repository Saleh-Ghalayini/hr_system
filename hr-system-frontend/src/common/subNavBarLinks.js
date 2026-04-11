export const SUBNAV_CONFIG = {
  "/training": [
    { text: "Enrollments", link: "enrollments", roles: ["admin", "manager"] },
    { text: "Course Catalog", link: "catalog", roles: ["admin", "manager"] },
  ],
  "/payroll": [
    { text: "Salaries", link: "salaries", roles: ["admin", "manager"] },
    { text: "Payroll Details", link: "payroll-details", roles: ["admin", "manager"] },
    { text: "Insurance & Tax", link: "insandtax", roles: ["admin", "manager"] },
  ],
  "/onboarding": [
    { text: "New Hires", link: "new-hires", roles: ["admin"] },
    { text: "Documents", link: "documents" },
    { text: "Checklist", link: "checklist" },
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
  "/reports": [
    { text: "Salary Reports", link: "salary-reports" },
    { text: "Payment History", link: "payment-history" },
    { text: "Tax Settings", link: "tax-settings" },
  ],
  "/profile": [
    { text: "Basic Info", link: "basicinfo" },
    { text: "Job Details", link: "jobdetails" },
    { text: "Salary", link: "salary" },
  ],
};
