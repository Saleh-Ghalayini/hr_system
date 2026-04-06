// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Suspense, lazy } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "./Layout";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";

// Eagerly loaded (always needed)
import Login from "./pages/Auth/Login";
import Dashboard from "./components/Dashboard";

// Lazy loaded — layout wrappers
const Attendance = lazy(() => import("./pages/Attendance"));
const TrainingLayout = lazy(() => import("./pages/Training/Layout"));
const Payroll = lazy(() => import("./pages/Payroll"));
const Performance = lazy(() => import("./pages/Performance"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Reports = lazy(() => import("./pages/Reports"));
const Profile = lazy(() => import("./pages/profile"));

// Lazy loaded — leaf pages (existing)
const Enrollments = lazy(() => import("./pages/Training/Enrollments"));
const CourseCatalog = lazy(() => import("./pages/Training/CourseCatalog"));
const JobInfo = lazy(() => import("./pages/Profile/pages/JobInfo"));
const BasicInfo = lazy(() => import("./pages/Profile/pages/BasicInfo"));
const Salary = lazy(() => import("./pages/Profile/pages/Salary"));
const EmpPerfo = lazy(() => import("./pages/Performance/pages/EmpPerfo"));
const EmpRate = lazy(() => import("./pages/Performance/pages/EmpRate"));
const AdminRate = lazy(() => import("./pages/Performance/pages/AdminRate"));
const AdminAverage = lazy(() => import("./pages/Performance/pages/AdminAverage"));
const Salaries = lazy(() => import("./pages/Payroll/Salaries"));
const InsuranceAndTax = lazy(() => import("./pages/Payroll/InsurancesAndTax"));
const LeaveRequests = lazy(() => import("./pages/Attendance/LeaveRequests"));
const AttendanceRecords = lazy(() => import("./pages/Attendance/AttendanceRecords"));
const AttendanceReports = lazy(() => import("./pages/Attendance/AttendanceReports"));
const NewHire = lazy(() => import("./pages/Onboarding/NewHire"));
const Documents = lazy(() => import("./pages/Onboarding/Documents"));
const Checklist = lazy(() => import("./pages/Onboarding/Checklist"));
const SalaryReports = lazy(() => import("./pages/Reports/SalaryReports"));
const PaymentHistory = lazy(() => import("./pages/Reports/PaymentHistory"));
const TaxSettings = lazy(() => import("./pages/Reports/TaxSettings"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Lazy loaded — NEW pages
const Messages = lazy(() => import("./pages/Messages"));
const Announcements = lazy(() => import("./pages/Announcements"));
const Holidays = lazy(() => import("./pages/Holidays"));
const EmployeeDirectory = lazy(() => import("./pages/Directory"));
const MyLeave = lazy(() => import("./pages/Attendance/MyLeave"));
const SickLeaveReport = lazy(() => import("./pages/Attendance/SickLeaveReport"));
const AttendanceSettings = lazy(() => import("./pages/Attendance/AttendanceSettings"));
const PayrollDetails = lazy(() => import("./pages/Payroll/PayrollDetails"));

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
        <Suspense fallback={<div className="loading-spinner" />}>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route
              path="dashboard"
              element={(
                <RoleRoute allowedRoles={["admin"]}>
                  <Dashboard />
                </RoleRoute>
              )}
            />

            {/* Training Section */}
            <Route path="training/*" element={<TrainingLayout />}>
              <Route index element={<Navigate to="enrollments" replace />} />
              <Route path="enrollments" element={<Enrollments />} />
              <Route path="catalog" element={<CourseCatalog />} />
            </Route>

            {/* Profile section */}
            <Route path="profile/*" element={<Profile />}>
              <Route index element={<Navigate to="basicinfo" replace />} />
              <Route path="basicinfo" element={<BasicInfo />} />
              <Route path="jobdetails" element={<JobInfo />} />
              <Route path="salary" element={<Salary />} />
            </Route>

            {/* Payroll Section */}
            <Route path="payroll/*" element={<Payroll />}>
              <Route index element={<Navigate to="salaries" replace />} />
              <Route path="salaries" element={<Salaries />} />
              <Route path="payroll-details" element={<PayrollDetails />} />
              <Route path="insandtax" element={<InsuranceAndTax />} />
            </Route>

            {/* Onboarding */}
            <Route path="onboarding/*" element={<Onboarding />}>
              <Route index element={<Navigate to="new-hires" replace />} />
              <Route path="new-hires" element={<NewHire />} />
              <Route path="documents" element={<Documents />} />
              <Route path="checklist" element={<Checklist />} />
            </Route>

            {/* Performance */}
            <Route path="performance/*" element={<Performance />}>
              <Route index element={<Navigate to="performance-reviews" replace />} />
              <Route path="performance-reviews" element={<EmpPerfo />} />
              <Route path="employee-ratings" element={<EmpRate />} />
              <Route path="rate-employee" element={<AdminRate />} />
              <Route path="average-rate" element={<AdminAverage />} />
            </Route>

            {/* Attendance */}
            <Route path="attendance/*" element={<Attendance />}>
              <Route index element={<Navigate to="attendance-records" replace />} />
              <Route path="attendance-records" element={<AttendanceRecords />} />
              <Route path="leave-requests" element={<LeaveRequests />} />
              <Route path="my-leave" element={<MyLeave />} />
              <Route
                path="sick-leave-report"
                element={(
                  <RoleRoute allowedRoles={["admin"]}>
                    <SickLeaveReport />
                  </RoleRoute>
                )}
              />
              <Route
                path="attendance-reports"
                element={(
                  <RoleRoute allowedRoles={["admin"]}>
                    <AttendanceReports />
                  </RoleRoute>
                )}
              />
              <Route
                path="settings"
                element={(
                  <RoleRoute allowedRoles={["admin"]}>
                    <AttendanceSettings />
                  </RoleRoute>
                )}
              />
            </Route>

            {/* Reports */}
            <Route path="reports/*" element={<Reports />}>
              <Route index element={<Navigate to="salary-reports" replace />} />
              <Route path="salary-reports" element={<SalaryReports />} />
              <Route path="payment-history" element={<PaymentHistory />} />
              <Route path="tax-settings" element={<TaxSettings />} />
            </Route>

            {/* NEW standalone pages */}
            <Route path="messages" element={<Messages />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="holidays" element={<Holidays />} />
            <Route path="directory" element={<EmployeeDirectory />} />
          </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
        </ErrorBoundary>
        <ToastContainer position="bottom-right" autoClose={3000} />
      </AuthProvider>
    </BrowserRouter>
  );
}
export default App;
