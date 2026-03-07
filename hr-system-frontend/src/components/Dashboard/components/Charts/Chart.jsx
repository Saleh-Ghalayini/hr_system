import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import { Pie, Bar, Doughnut, Line, Radar } from 'react-chartjs-2';

const chartComponents = {
  pie:      Pie,
  bar:      Bar,
  doughnut: Doughnut,
  line:     Line,
  radar:    Radar,
};

const Chart = ({
  title,
  data,
  options,
  type = 'bar',
  height = '300px',
}) => {
  const ChartComponent = chartComponents[type] ?? Bar;

  return (

    <Grid item xs={12} md={6} xl={6} >
      <Paper className="chart-container">
        <Typography variant="h6">{title}</Typography>
        <div className="chart-wrapper" style={{ height}}>
          <ChartComponent data={data} options={options} />
        </div>
      </Paper>
    </Grid>
  );
};

export default Chart; 