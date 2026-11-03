import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, FileText, FileSpreadsheet, FileJson } from 'lucide-react';

const Reports = () => {
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('excel');
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const generateReport = async (e) => {
    e.preventDefault();
    if (!selectedDataset) return;

    setGenerating(true);

    try {
      const response = await axios.get(
        `/api/reports/generate?format=${selectedFormat}&data_id=${selectedDataset}`,
        {
          responseType: 'blob'
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const extension = selectedFormat === 'excel' ? 'xlsx' : selectedFormat === 'pdf' ? 'pdf' : 'csv';
      link.setAttribute('download', `financial-report.${extension}`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading reports...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Reports</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Generate Report</h2>

        {datasets.length === 0 ? (
          <p className="text-gray-500">No datasets available. Upload data first.</p>
        ) : (
          <form onSubmit={generateReport} className="space-y-6">
            {/* Dataset Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Dataset
              </label>
              <select
                value={selectedDataset}
                onChange={(e) => setSelectedDataset(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Choose a dataset...</option>
                {datasets.map((dataset) => (
                  <option key={dataset.id} value={dataset.id}>
                    {dataset.file_name} ({dataset.metadata.record_count} records)
                  </option>
                ))}
              </select>
            </div>

            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Format
              </label>
              <div className="grid grid-cols-3 gap-4">
                <label
                  className={`flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedFormat === 'excel'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="format"
                    value="excel"
                    checked={selectedFormat === 'excel'}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="sr-only"
                  />
                  <FileSpreadsheet className="text-green-500 mb-2" size={32} />
                  <span className="text-sm font-medium">Excel</span>
                </label>

                <label
                  className={`flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedFormat === 'pdf'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="format"
                    value="pdf"
                    checked={selectedFormat === 'pdf'}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="sr-only"
                  />
                  <FileText className="text-red-500 mb-2" size={32} />
                  <span className="text-sm font-medium">PDF</span>
                </label>

                <label
                  className={`flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedFormat === 'csv'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="format"
                    value="csv"
                    checked={selectedFormat === 'csv'}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="sr-only"
                  />
                  <FileJson className="text-blue-500 mb-2" size={32} />
                  <span className="text-sm font-medium">CSV</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={!selectedDataset || generating}
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Download size={20} />
              <span>{generating ? 'Generating...' : 'Generate Report'}</span>
            </button>
          </form>
        )}
      </div>

      {/* Report Info */}
      <div className="bg-blue-50 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Report Formats</h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <FileSpreadsheet className="text-green-500 mt-1" />
            <div>
              <h3 className="font-medium text-gray-700">Excel (.xlsx)</h3>
              <p className="text-sm text-gray-600">
                Full dataset with formatted tables, ideal for further analysis in Excel.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <FileText className="text-red-500 mt-1" />
            <div>
              <h3 className="font-medium text-gray-700">PDF (.pdf)</h3>
              <p className="text-sm text-gray-600">
                Professional report with summary statistics and data table.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <FileJson className="text-blue-500 mt-1" />
            <div>
              <h3 className="font-medium text-gray-700">CSV (.csv)</h3>
              <p className="text-sm text-gray-600">
                Comma-separated values, compatible with most data analysis tools.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
