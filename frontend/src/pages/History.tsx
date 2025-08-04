import React, { useEffect, useState } from 'react';
import { Search, Download, Calendar, DollarSign, Eye, EyeOff, Trash2, Filter, RefreshCw, FileText, TrendingUp, ShoppingBag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  description?: string;
}

interface Receipt {
  id: string;
  merchant: string;
  date: string;
  total: number;
  items: ReceiptItem[];
  created_at?: string;
}

interface Summary {
  total: number;
  count: number;
}

interface Filter {
  merchant: string;
  date: string;
}

export default function History() {
  const { token } = useAuth();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary>({ total: 0, count: 0 });
  const [filter, setFilter] = useState<Filter>({ merchant: "", date: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState<'date' | 'merchant' | 'total'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch receipts from backend
  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      setError("");
      
      if (!token) {
        setError("Authentication required. Please log in.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/receipts`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch receipts');
      }

      const data = await response.json();
      setReceipts(data);
      setSummary({
        total: data.reduce((acc: number, r: Receipt) => acc + r.total, 0),
        count: data.length,
      });
    } catch (err) {
      console.error("Failed to fetch receipts", err);
      setError("Failed to load receipts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this receipt?");
    if (!confirmDelete) return;

    if (!token) {
      alert("Authentication required. Please log in.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/receipts/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete receipt');
      }

      const deletedReceipt = receipts.find((r) => r.id === id);
      setReceipts((prev) => prev.filter((r) => r.id !== id));
      setSummary((prev) => ({
        count: prev.count - 1,
        total: prev.total - (deletedReceipt?.total || 0),
      }));
    } catch (err) {
      console.error("Failed to delete receipt", err);
      alert("Something went wrong while deleting.");
    }
  };

  const exportToCSV = () => {
    const filteredReceipts = getFilteredReceipts();
    if (filteredReceipts.length === 0) {
      alert("No receipts to export");
      return;
    }

    const csvContent = [
      ['Merchant', 'Date', 'Total', 'Items Count', 'Items Detail'].join(','),
      ...filteredReceipts.map(receipt => [
        receipt.merchant,
        receipt.date,
        receipt.total.toFixed(2),
        receipt.items.length,
        receipt.items.map(item => `${item.quantity}x ${item.name} (₱${item.price})`).join('; ')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getFilteredReceipts = () => {
    return receipts
      .filter((r) => {
        const matchMerchant = r.merchant
          .toLowerCase()
          .includes(filter.merchant.toLowerCase());
        const matchDate = filter.date === "" || r.date === filter.date;
        return matchMerchant && matchDate;
      })
      .sort((a, b) => {
        let aValue, bValue;
        switch (sortBy) {
          case 'merchant':
            aValue = a.merchant.toLowerCase();
            bValue = b.merchant.toLowerCase();
            break;
          case 'total':
            aValue = a.total;
            bValue = b.total;
            break;
          case 'date':
          default:
            aValue = new Date(a.date).getTime();
            bValue = new Date(b.date).getTime();
            break;
        }
        
        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
  };

  const clearFilters = () => {
    setFilter({ merchant: "", date: "" });
  };

  const filteredReceipts = getFilteredReceipts();
  const filteredSummary = {
    count: filteredReceipts.length,
    total: filteredReceipts.reduce((acc, r) => acc + r.total, 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading receipts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-600" />
                Receipt History
              </h1>
              <p className="text-gray-600">View and manage all your analyzed receipts</p>
            </div>
            <button
              onClick={fetchReceipts}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Receipts</p>
                <p className="text-2xl font-bold text-gray-900">{summary.count}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">₱{summary.total.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average per Receipt</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₱{summary.count > 0 ? (summary.total / summary.count).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by merchant"
                  value={filter.merchant}
                  onChange={(e) => setFilter((f) => ({ ...f, merchant: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={filter.date}
                  onChange={(e) => setFilter((f) => ({ ...f, date: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field as 'date' | 'merchant' | 'total');
                  setSortOrder(order as 'asc' | 'desc');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date-desc">Date (Newest)</option>
                <option value="date-asc">Date (Oldest)</option>
                <option value="merchant-asc">Merchant (A-Z)</option>
                <option value="merchant-desc">Merchant (Z-A)</option>
                <option value="total-desc">Amount (High-Low)</option>
                <option value="total-asc">Amount (Low-High)</option>
              </select>
              
              <button
                onClick={clearFilters}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Filter className="h-4 w-4" />
                <span>Clear</span>
              </button>
              
              <button
                onClick={exportToCSV}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
          
          {/* Filter Summary */}
          {(filter.merchant || filter.date) && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Showing {filteredSummary.count} of {summary.count} receipts 
                (₱{filteredSummary.total.toFixed(2)} total)
              </p>
            </div>
          )}
        </div>

        {/* Receipt Cards */}
        {filteredReceipts.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {receipts.length === 0 ? "No receipts found" : "No matching receipts"}
            </h3>
            <p className="text-gray-600 mb-4">
              {receipts.length === 0 
                ? "Start by uploading your first receipt to see it here."
                : "Try adjusting your search filters to find what you're looking for."
              }
            </p>
            {(filter.merchant || filter.date) && (
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredReceipts.map((receipt) => (
              <div key={receipt.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{receipt.merchant}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{receipt.date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-semibold text-green-600">₱{receipt.total.toFixed(2)}</span>
                      </div>
                      <div className="text-xs text-gray-400">ID: {receipt.id}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleExpand(receipt.id)}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {expandedId === receipt.id ? (
                        <>
                          <EyeOff className="h-4 w-4" />
                          <span>Hide</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleDelete(receipt.id)}
                      className="flex items-center space-x-1 text-red-600 hover:text-red-800 font-medium"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Items:</span>
                      <span className="ml-1 font-medium">{receipt.items.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <span className="ml-1 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Processed
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Avg per item:</span>
                      <span className="ml-1 font-medium">
                        ₱{receipt.items.length > 0 ? (receipt.total / receipt.items.length).toFixed(2) : '0.00'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expanded Items View */}
                {expandedId === receipt.id && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Items Detail</h4>
                    <div className="space-y-2">
                      {receipt.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                              {item.quantity}x
                            </span>
                            <span className="text-gray-900">{item.name}</span>
                          </div>
                          <span className="font-medium text-gray-900">₱{item.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}