// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Suspense, lazy } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "./Layout";
import ErrorBoundary from "./components/ErrorBoundary";

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

// Lazy loaded — leaf pages
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

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
        <Suspense fallback={<div className="loading-spinner" />}>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

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
              <Route path="insandtax" element={<InsuranceAndTax />} />
            </Route>
            <Route path="onboarding/*" element={<Onboarding />}>
              <Route index element={<Navigate to="new-hires" replace />} />
              <Route path="new-hires" element={<NewHire />} />
              <Route path="documents" element={<Documents />} />
              <Route path="checklist" element={<Checklist />} />
            </Route>
            <Route path="performance/*" element={<Performance />}>
              <Route
                index
                element={<Navigate to="performance-reviews" replace />}
              />
              <Route path="performance-reviews" element={<EmpPerfo />} />
              <Route path="employee-ratings" element={<EmpRate />} />
              <Route path="rate-employee" element={<AdminRate />} />
              <Route path="average-rate" element={<AdminAverage />} />
            </Route>
            <Route path="attendance/*" element={<Attendance />}>
              <Route
                index
                element={<Navigate to="attendance-records" replace />}
              />
              <Route
                path="attendance-records"
                element={<AttendanceRecords />}
              />
              <Route path="leave-requests" element={<LeaveRequests />} />
              <Route
                path="attendance-reports"
                element={<AttendanceReports />}
              />
            </Route>
            <Route path="reports/*" element={<Reports />}>
              <Route index element={<Navigate to="salary-reports" replace />} />
              <Route path="salary-reports" element={<SalaryReports />} />
              <Route path="payment-history" element={<PaymentHistory />} />
              <Route path="tax-settings" element={<TaxSettings />} />
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
