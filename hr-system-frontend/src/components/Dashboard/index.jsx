import React, { useState, useEffect } from 'react';
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
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Grid, Paper, Typography, Box, Container, CircularProgress } from '@mui/material';
import axios from 'axios';
import './style.css';

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
  LineElement
);

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, leavesRes, coursesRes, enrollmentsRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/v1/admin/getallusers', getAuthHeaders()),
          axios.get('http://127.0.0.1:8000/api/v1/user/leave-requests', getAuthHeaders()),
          axios.get('http://127.0.0.1:8000/api/v1/admin/courses', getAuthHeaders()),
          axios.get('http://127.0.0.1:8000/api/v1/admin/enrollments', getAuthHeaders())
        ]);

        setUsers(usersRes.data);
        setLeaves(leavesRes.data.data);
        setCourses(coursesRes.data);
        setEnrollments(enrollmentsRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            family: 'Lato',
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          family: 'Lato',
          size: 14,
          weight: 700
        },
        bodyFont: {
          family: 'Lato',
          size: 13
        }
      }
    }
  };

  // Position Distribution Chart Data
  const positionData = {
    labels: [...new Set(users.map(user => user.position))],
    datasets: [{
      label: 'Employees by Position',
      data: [...new Set(users.map(user => user.position))].map(position =>
        users.filter(user => user.position === position).length
      ),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)',
      ],
      borderColor: [
        'rgba(59, 130, 246, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(239, 68, 68, 1)',
        'rgba(139, 92, 246, 1)',
      ],
      borderWidth: 1,
    }],
  };

  // Leave Status Distribution Chart Data
  const leaveData = {
    labels: ['Approved', 'Pending', 'Rejected'],
    datasets: [{
      label: 'Leave Requests by Status',
      data: [
        leaves.filter(leave => leave.status === 'approved').length,
        leaves.filter(leave => leave.status === 'pending').length,
        leaves.filter(leave => leave.status === 'rejected').length,
      ],
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
      ],
      borderColor: [
        'rgba(16, 185, 129, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(239, 68, 68, 1)',
      ],
      borderWidth: 1,
    }],
  };

  // Course Duration Chart Data
  const courseData = {
    labels: courses.map(course => course.course_name),
    datasets: [{
      label: 'Course Duration (Hours)',
      data: courses.map(course => course.duration_hours),
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1,
      borderRadius: 6,
    }],
  };

  // Enrollment Status Chart Data
  const enrollmentData = {
    labels: ['Enrolled', 'In Progress', 'Completed'],
    datasets: [{
      label: 'Enrollment Status',
      data: [
        enrollments.filter(enroll => enroll.status === 'enrolled').length,
        enrollments.filter(enroll => enroll.status === 'in_progress').length,
        enrollments.filter(enroll => enroll.status === 'completed').length,
      ],
      backgroundColor: [
        'rgba(245, 158, 11, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
      ],
      borderColor: [
        'rgba(245, 158, 11, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(16, 185, 129, 1)',
      ],
      borderWidth: 1,
    }],
  };

  if (loading) {
    return (
      <Box className="loading">
        <CircularProgress size={40} />
        <Typography variant="body1" style={{ marginTop: 16 }}>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" className="dashboard-container">
      <Typography variant="h4" component="h1" gutterBottom>
        HR Dashboard Overview
      </Typography>
      
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="summary-card">
            <Typography variant="h6">Total Employees</Typography>
            <Typography variant="h3">{users.length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="summary-card">
            <Typography variant="h6">Active Leaves</Typography>
            <Typography variant="h3">{leaves.filter(leave => leave.status === 'approved').length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="summary-card">
            <Typography variant="h6">Total Courses</Typography>
            <Typography variant="h3">{courses.length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="summary-card">
            <Typography variant="h6">Active Enrollments</Typography>
            <Typography variant="h3">{enrollments.filter(e => e.status === 'in_progress').length}</Typography>
          </Paper>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={6}>
          <Paper className="chart-container">
            <Typography variant="h6">Employee Position Distribution</Typography>
            <div className="chart-wrapper">
              <Pie data={positionData} options={chartOptions} />
            </div>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper className="chart-container">
            <Typography variant="h6">Leave Request Status</Typography>
            <div className="chart-wrapper">
              <Pie data={leaveData} options={chartOptions} />
            </div>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper className="chart-container">
            <Typography variant="h6">Course Duration Overview</Typography>
            <div className="chart-wrapper">
              <Bar 
                data={courseData} 
                options={{
                  ...chartOptions,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Duration (Hours)',
                        font: {
                          family: 'Lato',
                          size: 12,
                          weight: 600
                        }
                      },
                      ticks: {
                        font: {
                          family: 'Lato',
                          size: 11
                        }
                      }
                    },
                    x: {
                      ticks: {
                        font: {
                          family: 'Lato',
                          size: 11
                        }
                      }
                    }
                  }
                }} 
              />
            </div>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper className="chart-container">
            <Typography variant="h6">Enrollment Status Distribution</Typography>
            <div className="chart-wrapper">
              <Pie data={enrollmentData} options={chartOptions} />
            </div>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
