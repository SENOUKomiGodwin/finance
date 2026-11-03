const FinancialData = require('../models/FinancialData');
const http = require('http');

// Helper function to call Python analytics service
const callAnalyticsService = (endpoint, data) => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3001, // Python analytics service port
      path: endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
};

exports.getKPIs = async (req, res) => {
  try {
    const data = await FinancialData.findByUserId(req.user.id);
    
    if (data.length === 0) {
      return res.json({
        revenue: 0,
        expenses: 0,
        grossProfit: 0,
        netProfit: 0,
        profitMargin: 0,
        growthRate: 0
      });
    }

    // Calculate KPIs from all datasets
    let totalRevenue = 0;
    let totalExpenses = 0;
    let recordCount = 0;

    data.forEach(dataset => {
      const records = dataset.data;
      records.forEach(record => {
        if (record.type === 'revenue' || record.category === 'revenue') {
          totalRevenue += parseFloat(record.amount) || 0;
        } else if (record.type === 'expense' || record.category === 'expense') {
          totalExpenses += parseFloat(record.amount) || 0;
        }
        recordCount++;
      });
    });

    const grossProfit = totalRevenue - totalExpenses;
    const netProfit = grossProfit; // Simplified - would include taxes, etc.
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const growthRate = 0; // Would calculate from historical data

    res.json({
      revenue: totalRevenue,
      expenses: totalExpenses,
      grossProfit,
      netProfit,
      profitMargin: profitMargin.toFixed(2),
      growthRate: growthRate.toFixed(2),
      recordCount
    });
  } catch (error) {
    console.error('KPI calculation error:', error);
    res.status(500).json({ message: 'Server error calculating KPIs' });
  }
};

exports.getChartData = async (req, res) => {
  try {
    const { type } = req.query; // revenue, expenses, profit
    const data = await FinancialData.findByUserId(req.user.id);

    const chartData = {
      labels: [],
      datasets: []
    };

    data.forEach(dataset => {
      const records = dataset.data;
      records.forEach(record => {
        const date = record.date || record.timestamp;
        const amount = parseFloat(record.amount) || 0;
        const category = record.type || record.category || 'other';

        if (!chartData.labels.includes(date)) {
          chartData.labels.push(date);
        }
      });
    });

    // Sort labels by date
    chartData.labels.sort();

    res.json(chartData);
  } catch (error) {
    console.error('Chart data error:', error);
    res.status(500).json({ message: 'Server error fetching chart data' });
  }
};

exports.detectAnomalies = async (req, res) => {
  try {
    const { data_id } = req.params;
    const data = await FinancialData.findById(data_id);

    if (!data) {
      return res.status(404).json({ message: 'Data not found' });
    }

    if (data.user_id !== req.user.id && req.user.role !== 'administrator') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Call Python analytics service for anomaly detection
    try {
      const anomalies = await callAnalyticsService('/api/anomalies', {
        data: data.data
      });
      res.json(anomalies);
    } catch (error) {
      // Fallback: simple statistical anomaly detection
      const amounts = data.data.map(r => parseFloat(r.amount) || 0);
      const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const stdDev = Math.sqrt(amounts.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / amounts.length);
      
      const anomalies = data.data.filter(record => {
        const amount = parseFloat(record.amount) || 0;
        return Math.abs(amount - mean) > 2 * stdDev;
      });

      res.json({
        anomalies,
        statistics: {
          mean: mean.toFixed(2),
          stdDev: stdDev.toFixed(2),
          threshold: (2 * stdDev).toFixed(2)
        }
      });
    }
  } catch (error) {
    console.error('Anomaly detection error:', error);
    res.status(500).json({ message: 'Server error detecting anomalies' });
  }
};

exports.getForecast = async (req, res) => {
  try {
    const { data_id } = req.params;
    const { periods = 12 } = req.query;
    const data = await FinancialData.findById(data_id);

    if (!data) {
      return res.status(404).json({ message: 'Data not found' });
    }

    if (data.user_id !== req.user.id && req.user.role !== 'administrator') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Call Python analytics service for forecasting
    try {
      const forecast = await callAnalyticsService('/api/forecast', {
        data: data.data,
        periods: parseInt(periods)
      });
      res.json(forecast);
    } catch (error) {
      // Fallback: simple linear extrapolation
      const amounts = data.data
        .filter(r => r.type === 'revenue' || r.category === 'revenue')
        .map(r => parseFloat(r.amount) || 0);

      if (amounts.length < 2) {
        return res.status(400).json({ message: 'Insufficient data for forecasting' });
      }

      const lastValue = amounts[amounts.length - 1];
      const prevValue = amounts[amounts.length - 2];
      const growthRate = (lastValue - prevValue) / prevValue;

      const forecastData = [];
      for (let i = 1; i <= parseInt(periods); i++) {
        forecastData.push({
          period: i,
          predicted: (lastValue * Math.pow(1 + growthRate, i)).toFixed(2)
        });
      }

      res.json({
        forecast: forecastData,
        method: 'linear_extrapolation',
        growthRate: growthRate.toFixed(2)
      });
    }
  } catch (error) {
    console.error('Forecast error:', error);
    res.status(500).json({ message: 'Server error generating forecast' });
  }
};
