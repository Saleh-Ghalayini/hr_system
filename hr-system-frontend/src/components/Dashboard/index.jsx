import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import "./style.css";
import useDashboardSummary from "./hooks/useDashboardSummary";
import SummaryCards        from "./components/SummaryCards";
import AttendanceWidget    from "./components/AttendanceWidget";
import Chart               from "./components/Charts/Chart";
import {
  preparePositionData,
  prepareLeaveData,
  prepareCourseData,
  prepareEnrollmentData,
  prepareAttendanceTrendData,
  getChartOptions,
  getDoughnutOptions,
  getHBarOptions,
  getTrendLineOptions,
} from "./utils/chartData";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const SectionSpinner = () => (
  <div className="dash-section-spinner">
    <div className="loading-spinner" />
  </div>
);

const Dashboard = () => {
  const [summary, loading] = useDashboardSummary();

  const base = getChartOptions();

  const users          = summary?.users          ?? [];
  const leaves         = summary?.leaves         ?? [];
  const courses        = summary?.courses        ?? [];
  const enrollments    = summary?.enrollments    ?? [];
  const attendanceToday = summary?.attendance_today ?? [];
  const attendanceTrend = summary?.attendance_trend ?? [];
  const payroll        = summary?.payroll        ?? [];

  return (
    <div className="dash-page">
      {/* Header */}
      <div className="dash-header">
        <h1 className="dash-title">HR Dashboard</h1>
        <p className="dash-subtitle">
          {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="kpi-skeleton-row">
          {[...Array(5)].map((_, i) => <div key={i} className="kpi-skeleton" />)}
        </div>
      ) : (
        <SummaryCards
          users={users}
          leaves={leaves}
          courses={courses}
          enrollments={enrollments}
          attendanceToday={attendanceToday}
          payroll={payroll}
        />
      )}

      {/* Row 1: Attendance widget + Leave doughnut */}
      <div className="dash-row dash-row--60-40">
        <div className="dash-widget">
          {loading
            ? <div className="dash-chart-card"><SectionSpinner /></div>
            : <AttendanceWidget attendanceToday={attendanceToday} totalEmployees={users.length} />
          }
        </div>
        <div className="dash-chart-card">
          <h3 className="dash-chart-title">Leave Requests</h3>
          <div className="dash-chart-wrap">
            {loading ? <SectionSpinner /> : <Chart data={prepareLeaveData(leaves)} options={getDoughnutOptions(base)} type="doughnut" bare />}
          </div>
        </div>
      </div>

      {/* Row 2: Position doughnut + Enrollment bars */}
      <div className="dash-row dash-row--50-50">
        <div className="dash-chart-card">
          <h3 className="dash-chart-title">Position Distribution</h3>
          <div className="dash-chart-wrap">
            {loading ? <SectionSpinner /> : <Chart data={preparePositionData(users)} options={getDoughnutOptions(base)} type="doughnut" bare />}
          </div>
        </div>
        <div className="dash-chart-card">
          <h3 className="dash-chart-title">Enrollment Status</h3>
          <div className="dash-chart-wrap">
            {loading ? <SectionSpinner /> : <Chart data={prepareEnrollmentData(enrollments)} options={getHBarOptions(base)} type="bar" bare />}
          </div>
        </div>
      </div>

      {/* Row 3: Attendance trend (full width) */}
      <div className="dash-chart-card dash-chart-card--full">
        <h3 className="dash-chart-title">Weekly Attendance Trend</h3>
        <div className="dash-chart-wrap dash-chart-wrap--tall">
          {loading ? <SectionSpinner /> : <Chart data={prepareAttendanceTrendData(attendanceTrend)} options={getTrendLineOptions(base)} type="line" bare />}
        </div>
      </div>

      {/* Row 4: Course durations (full width) */}
      <div className="dash-chart-card dash-chart-card--full">
        <h3 className="dash-chart-title">Course Durations</h3>
        <div className="dash-chart-wrap">
          {loading ? <SectionSpinner /> : <Chart data={prepareCourseData(courses)} options={getHBarOptions(base, "Hours")} type="bar" bare />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
