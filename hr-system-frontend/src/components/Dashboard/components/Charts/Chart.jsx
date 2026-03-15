import React from 'react';
import { Pie, Bar, Doughnut, Line, Radar } from 'react-chartjs-2';

const chartComponents = {
  pie:      Pie,
  bar:      Bar,
  doughnut: Doughnut,
  line:     Line,
  radar:    Radar,
};

const Chart = ({ data, options, type = 'bar', bare = false }) => {
  const ChartComponent = chartComponents[type] ?? Bar;

  // bare=true: just the chart canvas, no wrapper (parent controls sizing)
  if (bare) {
    return <ChartComponent data={data} options={options} />;
  }

  // Legacy: full card wrapper (kept for any external usage)
  return (
    <div className="chart-container">
      <div className="chart-wrapper">
        <ChartComponent data={data} options={options} />
      </div>
    </div>
  );
};

export default Chart;
