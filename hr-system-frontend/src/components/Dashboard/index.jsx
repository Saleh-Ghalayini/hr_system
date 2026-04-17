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

  // Extract stats and recent data from optimized API response
  const stats = summary?.stats ?? {};

  // For charts that need full data, we'll use the stats counts where needed
  const totalEmployees = stats?.total_users ?? 0;

  // Recent data for charts (limited to recent records)
  const recentLeaves = summary?.recent_leaves ?? [];
  const recentCourses = summary?.recent_courses ?? [];
  const recentEnrollments = summary?.recent_enrollments ?? [];
  const attendanceToday = summary?.attendance_today ?? [];
  const attendanceTrend = summary?.attendance_trend ?? [];

  // Prepare chart data from recent samples
  // For position doughnut, we need user positions - we'll approximate from total
  const positionData = {
    labels: ['Active Employees'],
    datasets: [{
      label: 'Employees',
      data: [stats?.active_employees ?? totalEmployees],
      backgroundColor: ['#142f5a'],
      borderColor: ['#142f5a'],
      borderWidth: 2,
    }],
  };

  // Leave status chart from recent leaves sample
  const leaveData = prepareLeaveData(recentLeaves);

  // Course duration chart from recent courses
  const courseData = prepareCourseData(recentCourses);

  // Enrollment status from recent enrollments
  const enrollmentData = prepareEnrollmentData(recentEnrollments);

  // Attendance trend uses aggregated data from API
  const trendData = prepareAttendanceTrendData(attendanceTrend);

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
          stats={stats}
          recentLeaves={recentLeaves}
          recentCourses={recentCourses}
          recentEnrollments={recentEnrollments}
          attendanceToday={attendanceToday}
        />
      )}

      {/* Row 1: Attendance widget + Leave doughnut */}
      <div className="dash-row dash-row--60-40">
        <div className="dash-widget">
          {loading
            ? <div className="dash-chart-card"><SectionSpinner /></div>
            : <AttendanceWidget attendanceToday={attendanceToday} totalEmployees={totalEmployees} />
          }
        </div>
        <div className="dash-chart-card">
          <h3 className="dash-chart-title">Leave Requests</h3>
          <div className="dash-chart-wrap">
            {loading ? <SectionSpinner /> : <Chart data={leaveData} options={getDoughnutOptions(base)} type="doughnut" bare />}
          </div>
        </div>
      </div>

      {/* Row 2: Position doughnut + Enrollment bars */}
      <div className="dash-row dash-row--50-50">
        <div className="dash-chart-card">
          <h3 className="dash-chart-title">Employee Overview</h3>
          <div className="dash-chart-wrap">
            {loading ? <SectionSpinner /> : (
              <Chart
                data={{
                  labels: ['Active', 'Inactive'],
                  datasets: [{
                    label: 'Employees',
                    data: [stats?.active_employees ?? 0, totalEmployees - (stats?.active_employees ?? 0)],
                    backgroundColor: ['#069855', '#d39c1d'],
                    borderColor: ['#069855', '#d39c1d'],
                    borderWidth: 2,
                  }],
                }}
                options={getDoughnutOptions(base)}
                type="doughnut"
                bare
              />
            )}
          </div>
        </div>
        <div className="dash-chart-card">
          <h3 className="dash-chart-title">Enrollment Status</h3>
          <div className="dash-chart-wrap">
            {loading ? <SectionSpinner /> : <Chart data={enrollmentData} options={getHBarOptions(base)} type="bar" bare />}
          </div>
        </div>
      </div>

      {/* Row 3: Attendance trend (full width) */}
      <div className="dash-chart-card dash-chart-card--full">
        <h3 className="dash-chart-title">Weekly Attendance Trend</h3>
        <div className="dash-chart-wrap dash-chart-wrap--tall">
          {loading ? <SectionSpinner /> : <Chart data={trendData} options={getTrendLineOptions(base)} type="line" bare />}
        </div>
      </div>

      {/* Row 4: Course durations (full width) */}
      <div className="dash-chart-card dash-chart-card--full">
        <h3 className="dash-chart-title">Course Durations</h3>
        <div className="dash-chart-wrap">
          {loading ? <SectionSpinner /> : <Chart data={courseData} options={getHBarOptions(base, "Hours")} type="bar" bare />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;