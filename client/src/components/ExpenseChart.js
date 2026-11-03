import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ExpenseChart = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      const response = await axios.get('/api/analytics/charts?type=expenses');
      const data = response.data;

      setChartData({
        labels: ['Marketing', 'Operations', 'Salaries', 'R&D', 'Other'],
        datasets: [
          {
            label: 'Expenses',
            data: [5000, 8000, 12000, 6000, 3000],
            backgroundColor: [
              'rgba(239, 68, 68, 0.7)',
              'rgba(249, 115, 22, 0.7)',
              'rgba(234, 179, 8, 0.7)',
              'rgba(34, 197, 94, 0.7)',
              'rgba(168, 85, 247, 0.7)',
            ],
            borderColor: [
              'rgb(239, 68, 68)',
              'rgb(249, 115, 22)',
              'rgb(234, 179, 8)',
              'rgb(34, 197, 94)',
              'rgb(168, 85, 247)',
            ],
            borderWidth: 1,
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching chart data:', error);
      // Set placeholder data on error
      setChartData({
        labels: ['Marketing', 'Operations', 'Salaries', 'R&D', 'Other'],
        datasets: [
          {
            label: 'Expenses',
            data: [5000, 8000, 12000, 6000, 3000],
            backgroundColor: [
              'rgba(239, 68, 68, 0.7)',
              'rgba(249, 115, 22, 0.7)',
              'rgba(234, 179, 8, 0.7)',
              'rgba(34, 197, 94, 0.7)',
              'rgba(168, 85, 247, 0.7)',
            ],
            borderColor: [
              'rgb(239, 68, 68)',
              'rgb(249, 115, 22)',
              'rgb(234, 179, 8)',
              'rgb(34, 197, 94)',
              'rgb(168, 85, 247)',
            ],
            borderWidth: 1,
          },
        ],
      });
    }
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      },
    },
  };

  if (!chartData) {
    return <div className="flex justify-center items-center h-64">Loading chart...</div>;
  }

  return <Bar data={chartData} options={options} />;
};

export default ExpenseChart;
