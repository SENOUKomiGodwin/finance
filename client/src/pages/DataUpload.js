import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';

const DataUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = ['csv', 'xlsx', 'xls', 'json'];
      const fileExt = selectedFile.name.split('.').pop().toLowerCase();
      
      if (!validTypes.includes(fileExt)) {
        setMessage({
          type: 'error',
          text: 'Invalid file type. Please upload CSV, Excel, or JSON files.'
        });
        setFile(null);
        return;
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        setMessage({
          type: 'error',
          text: 'File size exceeds 10MB limit.'
        });
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setMessage({ type: '', text: '' });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/data/upload', formData, {
        withCredentials: true
      });

      setMessage({
        type: 'success',
        text: `File uploaded successfully! ${response.data.data.metadata.record_count} records processed.`
      });
      setUploadedFiles([...uploadedFiles, response.data.data]);
      setFile(null);
      
      // Reset file input
      document.getElementById('file-input').value = '';
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Upload failed. Please try again.'
      });
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Upload Financial Data</h1>

      {/* Upload Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleUpload} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select File (CSV, Excel, or JSON)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-input"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-input"
                      type="file"
                      className="sr-only"
                      accept=".csv,.xlsx,.xls,.json"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  CSV, Excel up to 10MB
                </p>
              </div>
            </div>
          </div>

          {file && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="text-red-500 hover:text-red-700"
              >
                <X size={20} />
              </button>
            </div>
          )}

          {message.text && (
            <div
              className={`flex items-center space-x-2 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800'
                  : 'bg-red-50 text-red-800'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              <p>{message.text}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={!file || uploading}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>
        </form>
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Uploaded Files</h2>
          <div className="space-y-3">
            {uploadedFiles.map((fileData) => (
              <div
                key={fileData.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{fileData.file_name}</p>
                    <p className="text-xs text-gray-500">
                      {fileData.metadata.record_count} records • {new Date(fileData.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                  {fileData.file_type.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Format Guide */}
      <div className="bg-blue-50 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Data Format Guide</h2>
        <div className="space-y-4 text-sm text-gray-700">
          <div>
            <h3 className="font-medium mb-2">Required Fields:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li><code>date</code> - Date of the transaction (YYYY-MM-DD)</li>
              <li><code>amount</code> - Transaction amount (numeric)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Optional Fields:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li><code>type</code> - Transaction type (revenue/expense)</li>
              <li><code>category</code> - Category for grouping</li>
              <li><code>description</code> - Transaction description</li>
              <li><code>region</code> - Geographic region</li>
              <li><code>department</code> - Department name</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataUpload;
