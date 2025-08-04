import React from 'react';
import { useState } from 'react';
import { Upload, FileText, BarChart3, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export default function Home() {
  const { token } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [extractedData, setExtractedData] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setError("");
    setExtractedData(null);
  };

  const handleExtract = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    if (!token) {
      setError("Authentication required. Please log in.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_BASE_URL}/extract`, {
        method: "POST",
        body: formData,
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to extract data');
      }

      const data = await response.json();
      setExtractedData(data);
    } catch (err) {
      console.error(err);
      setError("Failed to extract data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-indigo-500 to-sky-400 bg-clip-text text-transparent mb-6">
              ScanlyAI
              <span className="text-2xl md:text-3xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent block">
                Extract. Analyze. Organize.
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Transform your receipts into organized data with intelligent analysis. 
              Upload, extract, and manage your expense data effortlessly.
            </p>
          </div>

          {/* Upload Section */}
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 mb-16">
            <div className="text-center mb-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Choose an image or PDF
              </h2>
              <p className="text-gray-600">
                Upload your receipt to get started with automatic analysis
              </p>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors duration-300">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="mt-2 text-sm text-gray-500">
                {file ? `Selected: ${file.name}` : "Supports images and PDF files"}
              </p>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button 
              onClick={handleExtract}
              disabled={loading || !file}
              className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? "Extracting..." : "Extract Data"}
            </button>
          </div>

          {/* Extracted Data Display */}
          {extractedData && (
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 mb-16">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Extracted Receipt Data</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Merchant Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Merchant: <span className="font-medium text-gray-900">{extractedData.merchant || 'N/A'}</span></p>
                    <p className="text-sm text-gray-600">Date: <span className="font-medium text-gray-900">{extractedData.date || 'N/A'}</span></p>
                    <p className="text-sm text-gray-600">Total: <span className="font-medium text-gray-900">${extractedData.total || '0.00'}</span></p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Summary</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Items: <span className="font-medium text-gray-900">{extractedData.items?.length || 0}</span></p>
                    <p className="text-sm text-gray-600">Status: <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Processed</span></p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              {extractedData.items && extractedData.items.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Items</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {extractedData.items.map((item: any, index: number) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.description || item.name || `Item ${index + 1}`}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity || 1}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.price || '0.00'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Export Button */}
              <div className="mt-6 flex justify-end">
                <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Export to CSV
                </button>
              </div>
            </div>
          )}

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Smart Extraction
              </h3>
              <p className="text-gray-600">
                Automatically extract merchant, items, quantities, and prices from your receipts
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Data Analysis
              </h3>
              <p className="text-gray-600">
                Organize and analyze your spending patterns with detailed insights
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                History Tracking
              </h3>
              <p className="text-gray-600">
                Access your complete receipt history and export data when needed
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}