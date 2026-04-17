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
import { useAuthContext } from "./context/AuthContext";

// Eagerly loaded (always needed)
import Login from "./pages/Auth/Login";
import Dashboard from "./components/Dashboard";

// Lazy loaded — layout wrappers
const Attendance = lazy(() => import("./pages/Attendance"));
const TrainingLayout = lazy(() => import("./pages/Training/Layout"));
const Payroll = lazy(() => import("./pages/Payroll"));
const Performance = lazy(() => import("./pages/Performance"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Profile = lazy(() => import("./pages/profile"));

// Lazy loaded — leaf pages (existing)
const Enrollments = lazy(() => import("./pages/Training/Enrollments"));
const CourseCatalog = lazy(() => import("./pages/Training/CourseCatalog"));
const MyLearning = lazy(() => import("./pages/Training/MyLearning"));
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
const NotFound = lazy(() => import("./pages/NotFound"));

// Lazy loaded — NEW pages
const Announcements = lazy(() => import("./pages/Announcements"));
const Holidays = lazy(() => import("./pages/Holidays"));
const EmployeeDirectory = lazy(() => import("./pages/Directory"));
const MyLeave = lazy(() => import("./pages/Attendance/MyLeave"));
const SickLeaveReport = lazy(() => import("./pages/Attendance/SickLeaveReport"));
const AttendanceSettings = lazy(() => import("./pages/Attendance/AttendanceSettings"));
const PayrollDetails = lazy(() => import("./pages/Payroll/PayrollDetails"));

function TrainingIndexRedirect() {
  const { user, loading } = useAuthContext();

  if (loading) {
    return <div className="loading-spinner" />;
  }

  const defaultPath = user?.role === "admin" ? "enrollments" : "my-learning";
  return <Navigate to={defaultPath} replace />;
}

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
              <Route index element={<TrainingIndexRedirect />} />
              <Route path="my-learning" element={<MyLearning />} />
              <Route path="enrollments" element={
                <RoleRoute allowedRoles={["admin"]}>
                  <Enrollments />
                </RoleRoute>
              } />
              <Route path="catalog" element={
                <RoleRoute allowedRoles={["admin"]}>
                  <CourseCatalog />
                </RoleRoute>
              } />
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
              <Route path="salaries" element={
                <RoleRoute allowedRoles={["admin", "manager"]}>
                  <Salaries />
                </RoleRoute>
              } />
              <Route path="payroll-details" element={
                <RoleRoute allowedRoles={["admin", "manager"]}>
                  <PayrollDetails />
                </RoleRoute>
              } />
              <Route path="insandtax" element={
                <RoleRoute allowedRoles={["admin", "manager"]}>
                  <InsuranceAndTax />
                </RoleRoute>
              } />
            </Route>

            {/* Onboarding */}
            <Route path="onboarding/*" element={<Onboarding />}>
              <Route path="new-hires" element={
                <RoleRoute allowedRoles={["admin"]}>
                  <NewHire />
                </RoleRoute>
              } />
              <Route path="documents" element={<Documents />} />
              <Route path="checklist" element={<Checklist />} />
            </Route>

            {/* Performance */}
            <Route path="performance/*" element={<Performance />}>
              <Route index element={<Navigate to="performance-reviews" replace />} />
              <Route path="performance-reviews" element={<EmpPerfo />} />
              <Route path="employee-ratings" element={<EmpRate />} />
              <Route path="rate-employee" element={
                <RoleRoute allowedRoles={["admin", "manager"]}>
                  <AdminRate />
                </RoleRoute>
              } />
              <Route path="average-rate" element={
                <RoleRoute allowedRoles={["admin", "manager"]}>
                  <AdminAverage />
                </RoleRoute>
              } />
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

            {/* NEW standalone pages */}
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
