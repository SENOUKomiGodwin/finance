import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';
import RevenueChart from '../components/RevenueChart';
import ExpenseChart from '../components/ExpenseChart';
import KPICard from '../components/KPICard';

const Dashboard = () => {
  const [kpiData, setKpiData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKPIs();
  }, []);

  const fetchKPIs = async () => {
    try {
      const response = await axios.get('/api/analytics/kpi');
      setKpiData(response.data);
    } catch (error) {
      console.error('Error fetching KPIs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICard
          title="Total Revenue"
          value={`$${kpiData?.revenue?.toLocaleString() || 0}`}
          icon={<DollarSign className="text-green-500" />}
          trend={kpiData?.growthRate > 0 ? 'positive' : 'negative'}
        />
        <KPICard
          title="Total Expenses"
          value={`$${kpiData?.expenses?.toLocaleString() || 0}`}
          icon={<TrendingDown className="text-red-500" />}
          trend="negative"
        />
        <KPICard
          title="Gross Profit"
          value={`$${kpiData?.grossProfit?.toLocaleString() || 0}`}
          icon={<TrendingUp className="text-blue-500" />}
          trend={kpiData?.grossProfit > 0 ? 'positive' : 'negative'}
        />
        <KPICard
          title="Net Profit"
          value={`$${kpiData?.netProfit?.toLocaleString() || 0}`}
          icon={<PieChart className="text-purple-500" />}
          trend={kpiData?.netProfit > 0 ? 'positive' : 'negative'}
        />
        <KPICard
          title="Profit Margin"
          value={`${kpiData?.profitMargin || 0}%`}
          icon={<TrendingUp className="text-indigo-500" />}
          trend={kpiData?.profitMargin > 0 ? 'positive' : 'negative'}
        />
        <KPICard
          title="Growth Rate"
          value={`${kpiData?.growthRate || 0}%`}
          icon={<TrendingUp className="text-teal-500" />}
          trend={kpiData?.growthRate > 0 ? 'positive' : 'negative'}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Revenue Trend</h2>
          <RevenueChart />
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Expense Breakdown</h2>
          <ExpenseChart />
        </div>
      </div>

      {kpiData?.recordCount === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
          <p>No data uploaded yet. Upload your financial data to see analytics.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
