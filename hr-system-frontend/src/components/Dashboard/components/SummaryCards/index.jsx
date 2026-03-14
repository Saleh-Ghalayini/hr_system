import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import '../../style.css';

const SummaryCards = ({ users, leaves, courses, enrollments }) => {
  const activeEnrollmentsCount = Array.isArray(enrollments) 
    ? enrollments.filter(e => e?.status === 'active' || e?.status === 'enrolled').length 
    : 0;

  return (
    <Grid container>
      <Grid item xs={12} sm={6} md={3}>
        <Paper className="dashboard-card">
          <Typography variant="h6">Total Employees</Typography>
          <Typography variant="h3">{users?.length || 0}</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Paper className="dashboard-card">
          <Typography variant="h6">Active Leaves</Typography>
          <Typography variant="h3">{leaves?.filter(leave => leave?.status === 'approved').length || 0}</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Paper className="dashboard-card">
          <Typography variant="h6">Total Courses</Typography>
          <Typography variant="h3">{Array.isArray(courses) ? courses.length : 0}</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Paper className="dashboard-card">
          <Typography variant="h6">Active Enrollments</Typography>
          <Typography variant="h3">{activeEnrollmentsCount}</Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default SummaryCards; 