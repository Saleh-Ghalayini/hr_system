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
import useUsers       from "../../hooks/useUsers";
import useLeaves      from "./hooks/useLeaves";
import useCourses     from "./hooks/useCourses";
import useEnrollments from "./hooks/useEnrollments";
import useAttendance  from "./hooks/useAttendance";
import usePayroll     from "./hooks/usePayroll";
import SummaryCards   from "./components/SummaryCards";
import AttendanceWidget from "./components/AttendanceWidget";
import Chart          from "./components/Charts/Chart";
import Loading        from "../../assets/loader/loading";
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

const Dashboard = () => {
  const [users,       usersLoading]       = useUsers();
  const [leaves,      leavesLoading]      = useLeaves();
  const [courses,     coursesLoading]     = useCourses();
  const [enrollments, enrollmentsLoading] = useEnrollments();
  const [attendanceToday, attendanceTrend, attendanceLoading] = useAttendance();
  const [payroll,     payrollLoading]     = usePayroll();

  const isLoading =
    usersLoading || leavesLoading || coursesLoading ||
    enrollmentsLoading || attendanceLoading || payrollLoading;

  const base = getChartOptions();

  if (isLoading) return <Loading />;

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
      <SummaryCards
        users={users}
        leaves={leaves}
        courses={courses}
        enrollments={enrollments}
        attendanceToday={attendanceToday}
        payroll={payroll}
      />

      {/* Row 1: Attendance widget + Leave doughnut */}
      <div className="dash-row dash-row--60-40">
        <div className="dash-widget">
          <AttendanceWidget
            attendanceToday={attendanceToday}
            totalEmployees={users?.length ?? 0}
          />
        </div>
        <div className="dash-chart-card">
          <h3 className="dash-chart-title">Leave Requests</h3>
          <div className="dash-chart-wrap">
            <Chart
              title=""
              data={prepareLeaveData(leaves)}
              options={getDoughnutOptions(base)}
              type="doughnut"
              bare
            />
          </div>
        </div>
      </div>

      {/* Row 2: Position doughnut + Enrollment bars */}
      <div className="dash-row dash-row--50-50">
        <div className="dash-chart-card">
          <h3 className="dash-chart-title">Position Distribution</h3>
          <div className="dash-chart-wrap">
            <Chart
              title=""
              data={preparePositionData(users)}
              options={getDoughnutOptions(base)}
              type="doughnut"
              bare
            />
          </div>
        </div>
        <div className="dash-chart-card">
          <h3 className="dash-chart-title">Enrollment Status</h3>
          <div className="dash-chart-wrap">
            <Chart
              title=""
              data={prepareEnrollmentData(enrollments)}
              options={getHBarOptions(base)}
              type="bar"
              bare
            />
          </div>
        </div>
      </div>

      {/* Row 3: Attendance trend (full width) */}
      <div className="dash-chart-card dash-chart-card--full">
        <h3 className="dash-chart-title">Weekly Attendance Trend</h3>
        <div className="dash-chart-wrap dash-chart-wrap--tall">
          <Chart
            title=""
            data={prepareAttendanceTrendData(attendanceTrend)}
            options={getTrendLineOptions(base)}
            type="line"
            bare
          />
        </div>
      </div>

      {/* Row 4: Course durations (full width) */}
      <div className="dash-chart-card dash-chart-card--full">
        <h3 className="dash-chart-title">Course Durations</h3>
        <div className="dash-chart-wrap">
          <Chart
            title=""
            data={prepareCourseData(courses)}
            options={getHBarOptions(base, "Hours")}
            type="bar"
            bare
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
