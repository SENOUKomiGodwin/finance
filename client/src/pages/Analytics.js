import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, TrendingUp, Calendar } from 'lucide-react';

const Analytics = () => {
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [anomalies, setAnomalies] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [forecastPeriods, setForecastPeriods] = useState(12);

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      const response = await axios.get('/api/data');
      setDatasets(response.data);
    } catch (error) {
      console.error('Error fetching datasets:', error);
    } finally {
      setLoading(false);
    }
  };

  const detectAnomalies = async () => {
    if (!selectedDataset) return;
    
    try {
      const response = await axios.get(`/api/analytics/anomalies/${selectedDataset}`);
      setAnomalies(response.data);
    } catch (error) {
      console.error('Error detecting anomalies:', error);
    }
  };

  const generateForecast = async () => {
    if (!selectedDataset) return;
    
    try {
      const response = await axios.get(
        `/api/analytics/forecast/${selectedDataset}?periods=${forecastPeriods}`
      );
      setForecast(response.data);
    } catch (error) {
      console.error('Error generating forecast:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Analytics</h1>

      {/* Dataset Selection */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Dataset</h2>
        {datasets.length === 0 ? (
          <p className="text-gray-500">No datasets available. Upload data first.</p>
        ) : (
          <select
            value={selectedDataset || ''}
            onChange={(e) => setSelectedDataset(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a dataset...</option>
            {datasets.map((dataset) => (
              <option key={dataset.id} value={dataset.id}>
                {dataset.file_name} ({dataset.metadata.record_count} records)
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedDataset && (
        <>
          {/* Anomaly Detection */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Anomaly Detection</h2>
              <button
                onClick={detectAnomalies}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Detect Anomalies
              </button>
            </div>

            {anomalies ? (
              <div className="space-y-4">
                {anomalies.statistics && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-700 mb-2">Statistics</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Mean</p>
                        <p className="font-medium">${anomalies.statistics.mean}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Std Dev</p>
                        <p className="font-medium">${anomalies.statistics.stdDev}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Threshold</p>
                        <p className="font-medium">${anomalies.statistics.threshold}</p>
                      </div>
                    </div>
                  </div>
                )}

                {anomalies.anomalies && anomalies.anomalies.length > 0 ? (
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-700">
                      {anomalies.anomalies.length} Anomalies Detected
                    </h3>
                    {anomalies.anomalies.slice(0, 10).map((anomaly, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <AlertTriangle className="text-red-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">
                            {anomaly.date || anomaly.description || 'Unknown date'}
                          </p>
                          <p className="text-xs text-gray-500">
                            Amount: ${parseFloat(anomaly.amount).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {anomalies.anomalies.length > 10 && (
                      <p className="text-sm text-gray-500">
                        ...and {anomalies.anomalies.length - 10} more anomalies
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-green-600">No anomalies detected in the dataset.</p>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Click "Detect Anomalies" to analyze the dataset.</p>
            )}
          </div>

          {/* Revenue Forecasting */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Revenue Forecast</h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">Periods:</label>
                  <input
                    type="number"
                    min="1"
                    max="36"
                    value={forecastPeriods}
                    onChange={(e) => setForecastPeriods(parseInt(e.target.value))}
                    className="w-20 px-2 py-1 border border-gray-300 rounded-lg"
                  />
                </div>
                <button
                  onClick={generateForecast}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Generate Forecast
                </button>
              </div>
            </div>

            {forecast ? (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-2">Forecast Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Method</p>
                      <p className="font-medium capitalize">{forecast.method}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Growth Rate</p>
                      <p className="font-medium">{forecast.growthRate}%</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-gray-700">Predicted Values</h3>
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left">Period</th>
                          <th className="px-4 py-2 text-left">Predicted</th>
                        </tr>
                      </thead>
                      <tbody>
                        {forecast.forecast.map((item, index) => (
                          <tr key={index} className="border-b">
                            <td className="px-4 py-2">{item.period}</td>
                            <td className="px-4 py-2 font-medium">${item.predicted}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Click "Generate Forecast" to predict future revenue.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
