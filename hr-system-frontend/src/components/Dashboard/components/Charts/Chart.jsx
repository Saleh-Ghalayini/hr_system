import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import { Pie, Bar } from 'react-chartjs-2';

const Chart = ({ 
  title, 
  data, 
  options, 
  type = 'pie', // Default to pie chart
  height = '300px', // Default height
}) => {
  const ChartComponent = type === 'pie' ? Pie : Bar;

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