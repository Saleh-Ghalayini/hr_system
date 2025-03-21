import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Dashboard from "./components/Dashboard";
import Attendance from "./pages/Attendance";
import Onboarding from "./pages/Onboarding";
import Training from "./pages/Training";
import Performance from "./pages/Performance";
import Payroll from "./pages/Payroll";
import Reports from "./pages/Reports";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="onboarding" element={<Onboarding />} />
          <Route path="training" element={<Training />} />
          <Route path="performance" element={<Performance />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="payroll" element={<Payroll />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
export default App;
