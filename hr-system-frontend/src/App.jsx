// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./Layout";
import Dashboard from "./components/Dashboard";
import Attendance from "./pages/Attendance";
import Onboarding from "./pages/Onboarding";
import Training from "./pages/Training";
import Performance from "./pages/Performance";
import Payroll from "./pages/Payroll";
import Reports from "./pages/Reports";
import Login from "./pages/Auth/Login";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* <Route element={<ProtectedRoute />}> */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="onboarding" element={<Onboarding />} />
            <Route path="training" element={<Training />} />
            <Route path="performance" element={<Performance />} />
            <Route path="payroll" element={<Payroll />} />
            <Route path="reports" element={<Reports />} />
          </Route>
          {/* </Route> */}
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
