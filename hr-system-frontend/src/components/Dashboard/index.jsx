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
  RadialLinearScale,
} from "chart.js";
import {
  Grid,
  Typography,
  Box,
  Container,
  CircularProgress,
} from "@mui/material";
import "./style.css";
import useUsers from "../../hooks/useUsers";
import useLeaves from "./hooks/useLeaves";
import useCourses from "./hooks/useCourses";
import useEnrollments from "./hooks/useEnrollments";
import SummaryCards from "./components/SummaryCards";
import Chart from "./components/Charts/Chart";
import {
  preparePositionData,
  prepareLeaveData,
  prepareCourseData,
  prepareEnrollmentData,
  getChartOptions,
  getDoughnutOptions,
  getStackedBarOptions,
  getLineChartOptions,
  getRadarChartOptions,
} from "./utils/chartData";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale
);

const Dashboard = () => {
  const [users, usersLoading, usersError] = useUsers();
  const [leaves, leavesLoading, leavesError] = useLeaves();
  const [courses, coursesLoading, coursesError] = useCourses();
  const [enrollments, enrollmentsLoading, enrollmentsError] = useEnrollments();

  const isLoading =
    usersLoading || leavesLoading || coursesLoading || enrollmentsLoading;
  const hasError =
    usersError || leavesError || coursesError || enrollmentsError;

  const chartOptions = getChartOptions();

  if (isLoading) {
    return (
      <Box className="loading">
        <CircularProgress size={40} />
        <Typography variant="body1" style={{ marginTop: 16, marginLeft: 16 }}>
          Loading dashboard...
        </Typography>
      </Box>
    );
  }

  if (hasError) {
    return (
      <Box className="loading">
        <Typography variant="h6" color="error" style={{ marginBottom: 16 }}>
          Error loading dashboard data
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Please try refreshing the page
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" className="dashboard-container">
      <Typography variant="h4" component="h1" gutterBottom>
        HR Dashboard Overview
      </Typography>
      <SummaryCards
        users={users}
        leaves={leaves}
        courses={courses}
        enrollments={enrollments}
      />

      <Grid container spacing={4}>
        <Chart
          title="Employee Position Distribution"
          data={preparePositionData(users)}
          options={getDoughnutOptions(chartOptions)}
          type="doughnut"
        />

        <Chart
          title="Leave Request Status"
          data={prepareLeaveData(leaves)}
          options={getStackedBarOptions(chartOptions)}
          type="bar"
        />

        <Chart
          title="Course Duration Overview"
          data={prepareCourseData(courses)}
          options={getLineChartOptions(chartOptions)}
          type="line"
        />

        <Chart
          title="Enrollment Status Distribution"
          data={prepareEnrollmentData(enrollments)}
          options={getRadarChartOptions(chartOptions)}
          type="radar"
        />
      </Grid>
    </Container>
  );
};

export default Dashboard;
