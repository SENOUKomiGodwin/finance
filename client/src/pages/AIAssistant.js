import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Bot, User, Loader2 } from 'lucide-react';

const AIAssistant = () => {
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchDatasets();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchDatasets = async () => {
    try {
      const response = await axios.get('/api/data');
      setDatasets(response.data);
    } catch (error) {
      console.error('Error fetching datasets:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || !selectedDataset) return;

    const userMessage = { role: 'user', content: query };
    setMessages([...messages, userMessage]);
    setQuery('');
    setLoading(true);

    try {
      // Call AI service (this would connect to the FastAPI backend)
      const response = await axios.post('http://localhost:8000/api/query', {
        query: userMessage.content,
        dataset_id: selectedDataset
      });

      const aiMessage = { 
        role: 'assistant', 
        content: response.data.answer || response.data.message 
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error querying AI:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your query. Please ensure the AI service is running.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">AI Financial Assistant</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Dataset to Query
          </label>
          <select
            value={selectedDataset}
            onChange={(e) => setSelectedDataset(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Choose a dataset...</option>
            {datasets.map((dataset) => (
              <option key={dataset.id} value={dataset.id}>
                {dataset.file_name} ({dataset.metadata.record_count} records)
              </option>
            ))}
          </select>
        </div>

        {/* Chat Interface */}
        <div className="border rounded-lg h-96 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Bot className="mx-auto mb-2 text-gray-400" size={48} />
                <p>Select a dataset and ask me about your financial data.</p>
                <p className="text-sm mt-2">Example questions:</p>
                <ul className="text-sm mt-1 space-y-1">
                  <li>"What is the total revenue?"</li>
                  <li>"Show me expenses by category"</li>
                  <li>"What were the highest revenue months?"</li>
                  <li>"Compare revenue between regions"</li>
                </ul>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Bot size={16} className="text-white" />
                    </div>
                  </div>
                )}
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                      <User size={16} className="text-white" />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Bot size={16} className="text-white" />
                  </div>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <Loader2 className="animate-spin text-gray-500" size={20} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about your financial data..."
                disabled={!selectedDataset || loading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
              <button
                type="submit"
                disabled={!query.trim() || !selectedDataset || loading}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">About AI Assistant</h2>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <strong>Zero Hallucinations:</strong> The AI assistant is designed to query only your actual dataset,
            ensuring accurate responses without making up information.
          </p>
          <p>
            <strong>Supported Queries:</strong> Ask questions about totals, averages, comparisons, trends,
            and specific data points in your uploaded financial data.
          </p>
          <p>
            <strong>Data Privacy:</strong> Your data is processed securely and never shared with third parties.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
