import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Register required components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MyChart = ({label,labelsData,numericalData,className}) => {
  const data = {
    labels: labelsData,
    datasets: [
      {
        label: label,
        data: numericalData,
        backgroundColor: [
            "rgba(25, 128, 175, 0.85)",
            "rgba(37, 195, 66, 0.9)",
            "rgba(208, 205, 35, 0.79)",

        ],
      },
    ],
  };

  const options = {
    responsive: true,
    indexAxis: "y",
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
    },
  };

  return <Bar data={data} options={options} className={className} />;
};

export default MyChart;
