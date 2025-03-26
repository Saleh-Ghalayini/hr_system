import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Register required components
ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({label,dataLabels, numircalData}) => {
  const data = {
    labels: dataLabels,
    datasets: [
      {
        label: label,
        data:numircalData,
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
          "rgba(143, 255, 102, 0.5)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
         "rgb(143, 255, 102)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={{ width: "400px", height: "400px" }}>
      <Pie data={data} />
    </div>
  );
};

export default PieChart;
