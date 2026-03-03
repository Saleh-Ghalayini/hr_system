// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "./Layout";
import Dashboard from "./components/Dashboard";
import Attendance from "./pages/Attendance";
import TrainingLayout from "./pages/Training/Layout";
import Payroll from "./pages/Payroll";
import Performance from "./pages/Performance";
import Onboarding from "./pages/Onboarding";
import Reports from "./pages/Reports";

import Login from "./pages/Auth/Login";

import Enrollments from "./pages/Training/Enrollments";
import CourseCatalog from "./pages/Training/CourseCatalog";

import JobInfo from "./pages/Profile/pages/JobInfo";
import BasicInfo from "./pages/Profile/pages/BasicInfo";
import Salary from "./pages/Profile/pages/Salary";
import Profile from "./pages/profile";
import EmpPerfo from "./pages/Performance/pages/EmpPerfo";
import EmpRate from "./pages/Performance/pages/EmpRate";

import Salaries from "./pages/Payroll/Salaries";

import InsuranceAndTax from "./pages/Payroll/InsurancesAndTax";
import LeaveRequests from "./pages/Attendance/LeaveRequests";

import AttendanceRecords from "./pages/Attendance/AttendanceRecords";

import AdminRate from "./pages/Performance/pages/AdminRate";
import AdminAverage from "./pages/Performance/pages/AdminAverage";
import NewHire from "./pages/Onboarding/NewHire";


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
              <Route path="documents" element={<h1>documents</h1>} />
              <Route path="checklist" element={<h1>checklist</h1>} />
            </Route>
            <Route path="performance/*" element={<Performance />}>
              <Route
                index
                element={<Navigate to="performance-reviews" replace />}
              />
              <Route path="performance-reviews" element={<EmpPerfo />} />

              <Route path="employee-ratings" element={<EmpRate />} />
              <Route path="rate-empolyee" element={<AdminRate />} />
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
                element={<h1>attendance-reports</h1>}
              />
            </Route>
            <Route path="reports/*" element={<Reports />}>
              <Route index element={<Navigate to="salary-reports" replace />} />
              <Route path="salary-reports" element={<h1>salary-reports</h1>} />
              <Route
                path="payment-history"
                element={<h1>payment-history</h1>}
              />
              <Route path="tax-settings" element={<h1>tax-settings</h1>} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
export default App;
