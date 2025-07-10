"use client";
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Upload, FileText, TrendingUp, Eye, Trash2, AlertCircle, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext'; 
import { useRouter } from 'next/navigation';

// Types
interface Parameter {
  id: string;
  name: string;
  value: string;
  unit?: string;
  normalRange?: string;
  status: 'NORMAL' | 'ABNORMAL' | 'BORDERLINE' | 'CRITICAL';
  category?: string;
  riskLevel: 'LOW' | 'BORDERLINE' | 'HIGH' | 'CRITICAL';
  flagged: boolean;
}

interface Report {
  id: string;
  userId: string;
  reportDate: string;
  originalFileName: string;
  fileType: string;
  fileUrl: string;
  processingStatus: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  labName?: string;
  parameters: Parameter[];
}

interface TrendDataPoint {
  date: string;
  reportId: string;
  parameters: Record<string, {
    value: number;
    status: string;
    riskLevel: string;
  }>;
}

interface Insights {
  summary: string;
  recommendations: string[];
  risk_assessment: string;
  critical_parameters: string[];
}

interface MedicalReading {
  date: string;
  value: number;
  status: string;
  normalRange: string;
}

// Main data structure interface
interface MedicalTrendData {
  [key: string]: MedicalReading[];
}
// Mock trend data for demonstration
const mockTrendData:  MedicalTrendData = {
  'Hemoglobin': [
    { date: '2024-01-15', value: 12.5, status: 'NORMAL', normalRange: '12-16 g/dL' },
    { date: '2024-02-20', value: 11.8, status: 'BORDERLINE', normalRange: '12-16 g/dL' },
    { date: '2024-03-18', value: 13.2, status: 'NORMAL', normalRange: '12-16 g/dL' },
    { date: '2024-04-22', value: 12.9, status: 'NORMAL', normalRange: '12-16 g/dL' },
    { date: '2024-05-15', value: 11.2, status: 'LOW', normalRange: '12-16 g/dL' },
    { date: '2024-06-10', value: 13.8, status: 'NORMAL', normalRange: '12-16 g/dL' },
  ],
  'Cholesterol': [
    { date: '2024-01-15', value: 220, status: 'HIGH', normalRange: '<200 mg/dL' },
    { date: '2024-02-20', value: 210, status: 'BORDERLINE', normalRange: '<200 mg/dL' },
    { date: '2024-03-18', value: 195, status: 'NORMAL', normalRange: '<200 mg/dL' },
    { date: '2024-04-22', value: 185, status: 'NORMAL', normalRange: '<200 mg/dL' },
    { date: '2024-05-15', value: 190, status: 'NORMAL', normalRange: '<200 mg/dL' },
    { date: '2024-06-10', value: 175, status: 'NORMAL', normalRange: '<200 mg/dL' },
  ],
  'Blood Sugar': [
    { date: '2024-01-15', value: 110, status: 'NORMAL', normalRange: '70-140 mg/dL' },
    { date: '2024-02-20', value: 145, status: 'HIGH', normalRange: '70-140 mg/dL' },
    { date: '2024-03-18', value: 125, status: 'NORMAL', normalRange: '70-140 mg/dL' },
    { date: '2024-04-22', value: 135, status: 'NORMAL', normalRange: '70-140 mg/dL' },
    { date: '2024-05-15', value: 155, status: 'HIGH', normalRange: '70-140 mg/dL' },
    { date: '2024-06-10', value: 120, status: 'NORMAL', normalRange: '70-140 mg/dL' },
  ],
  'White Blood Cells': [
    { date: '2024-01-15', value: 7.2, status: 'NORMAL', normalRange: '4-11 K/μL' },
    { date: '2024-02-20', value: 8.5, status: 'NORMAL', normalRange: '4-11 K/μL' },
    { date: '2024-03-18', value: 6.8, status: 'NORMAL', normalRange: '4-11 K/μL' },
    { date: '2024-04-22', value: 9.1, status: 'NORMAL', normalRange: '4-11 K/μL' },
    { date: '2024-05-15', value: 12.3, status: 'HIGH', normalRange: '4-11 K/μL' },
    { date: '2024-06-10', value: 7.9, status: 'NORMAL', normalRange: '4-11 K/μL' },
  ],
  'Creatinine': [
    { date: '2024-01-15', value: 1.1, status: 'NORMAL', normalRange: '0.6-1.2 mg/dL' },
    { date: '2024-02-20', value: 1.3, status: 'HIGH', normalRange: '0.6-1.2 mg/dL' },
    { date: '2024-03-18', value: 1.0, status: 'NORMAL', normalRange: '0.6-1.2 mg/dL' },
    { date: '2024-04-22', value: 0.9, status: 'NORMAL', normalRange: '0.6-1.2 mg/dL' },
    { date: '2024-05-15', value: 1.4, status: 'HIGH', normalRange: '0.6-1.2 mg/dL' },
    { date: '2024-06-10', value: 1.0, status: 'NORMAL', normalRange: '0.6-1.2 mg/dL' },
  ]
};

const MedicalReportsDashboard = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [selectedParameter, setSelectedParameter] = useState<string>('');
  const [availableParameters, setAvailableParameters] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'reports' | 'trends' | 'insights'>('reports');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // API base URL - adjust as needed
  const API_BASE = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Fetch user reports
  const fetchReports = async () => {
     if (!user?.id) return;
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/v1/reports/user/${user.id}`);
      const data = await response.json();
      setReports(data);
      
      // Extract unique parameters for trend analysis
      const params = new Set<string>();
      data.forEach((report: Report) => {
        report.parameters?.forEach((param: Parameter) => {
          params.add(param.name);
        });
      });
      setAvailableParameters(Array.from(params));
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch trend data - using mock data for trends
  const fetchTrendData = async (parameter?: string) => {
     if (!user?.id) return;
    try {
      setLoading(true);
      // For trends tab, use mock data
      if (activeTab === 'trends') {
        // Set available parameters to mock data keys
        setAvailableParameters(Object.keys(mockTrendData));
        return;
      }
      
      // For other tabs, use real API
      const url = parameter 
        ? `${API_BASE}/api/v1/reports/user/${user.id}/trends?parameter=${parameter}`
        : `${API_BASE}/api/v1/reports/user/${user.id}/trends`;
      const response = await fetch(url);
      const data = await response.json();
      setTrendData(data);
    } catch (error) {
      console.error('Error fetching trend data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate insights
  const generateInsights = async (reportId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/v1/reports/${reportId}/insights`);
      const data = await response.json();
      setInsights(data);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setLoading(false);
    }
  };

  // Upload report
  const uploadReport = async (file: File) => {
    if (!user?.id) return;
    try {
      setUploading(true);
      
      // Convert file to base64
      const fileBuffer = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(file);
      });

      const response = await fetch(`${API_BASE}/api/v1/reports/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          fileBuffer,
          originalFileName: file.name,
          fileType: file.type.includes('pdf') ? 'pdf' : 'image'
        }),
      });

      const result = await response.json();
      if (result.success) {
        await fetchReports();
        alert(`Report uploaded successfully! Found ${result.parametersCount} parameters.`);
      } else {
        alert('Upload failed: ' + result.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Delete report
  const deleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/v1/reports/${reportId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchReports();
        if (selectedReport?.id === reportId) {
          setSelectedReport(null);
          setInsights(null);
        }
        alert('Report deleted successfully');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete report');
    }
  };

  // Get status icon and color
  const getStatusDisplay = (status: string, riskLevel: string) => {
    switch (riskLevel) {
      case 'CRITICAL':
        return { icon: <XCircle className="w-4 h-4" />, color: 'text-red-600', bg: 'bg-red-100' };
      case 'HIGH':
        return { icon: <AlertCircle className="w-4 h-4" />, color: 'text-orange-600', bg: 'bg-orange-100' };
      case 'BORDERLINE':
        return { icon: <AlertTriangle className="w-4 h-4" />, color: 'text-yellow-600', bg: 'bg-yellow-100' };
      default:
        return { icon: <CheckCircle className="w-4 h-4" />, color: 'text-green-600', bg: 'bg-green-100' };
    }
  };

  // Get chart data for selected parameter (using mock data for trends)
  const getChartData = () => {
    if (!selectedParameter) return [];
    
    if (activeTab === 'trends' && mockTrendData[selectedParameter]) {
      return mockTrendData[selectedParameter];
    }
    
    if (!trendData.length) return [];
    
    return trendData
      .filter(point => point.parameters[selectedParameter])
      .map(point => ({
        date: point.date,
        value: point.parameters[selectedParameter].value,
        status: point.parameters[selectedParameter].status
      }));
  };

  // Get line color based on parameter
  const getLineColor = (parameter: string) => {
    const colors = {
      'Hemoglobin': '#E11D48',
      'Cholesterol': '#7C3AED',
      'Blood Sugar': '#F59E0B',
      'White Blood Cells': '#10B981',
      'Creatinine': '#3B82F6'
    };
    return colors[parameter as keyof typeof colors] || '#6366F1';
  };

  // Move useEffect hooks to the top, before any conditional returns
  useEffect(() => {
    if (user && activeTab !== 'trends') {
      fetchReports();
    }
  }, [user, activeTab]);

  useEffect(() => {
    if (activeTab === 'trends' && user) {
      setAvailableParameters(Object.keys(mockTrendData));
      if (!selectedParameter) {
        setSelectedParameter(Object.keys(mockTrendData)[0]);
      }
    } else if (activeTab !== 'trends' && user) {
      fetchTrendData(selectedParameter);
    }
  }, [activeTab, user]);

  // Early return if user is not authenticated - AFTER all hooks
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 flex items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="text-gray-700 font-medium">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl p-10 text-center max-w-md">
          <div className="mb-6">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600">Please log in to access your medical reports dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-900 to-slate-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Medical Reports Dashboard
              </h1>
              <p className="text-gray-800 text-lg">
                Welcome back, <span className="font-semibold text-indigo-600">{user.name || user.email}</span>! 
                Manage and analyze your medical reports 
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-800">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
              <Upload className="w-6 h-6 text-white" />
            </div>
            Upload New Report
          </h2>
          <div className="border-2 border-dashed border-indigo-300 rounded-xl p-12 text-center bg-gradient-to-br from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 transition-all duration-300">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadReport(file);
              }}
              className="hidden"
              id="file-upload"
              disabled={uploading}
            />
            <label
              htmlFor="file-upload"
              className={`cursor-pointer ${uploading ? 'opacity-50' : ''}`}
            >
              <div className="p-4 bg-white rounded-full mx-auto mb-6 w-fit shadow-lg">
                <FileText className="w-16 h-16 text-indigo-500" />
              </div>
              <p className="text-xl font-semibold text-gray-700 mb-2">
                {uploading ? 'Processing your report...' : 'Click to upload medical report'}
              </p>
              <p className="text-gray-500">
                Support for PDF, JPG, PNG files • AI-powered parameter extraction
              </p>
            </label>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-2">
            <nav className="flex space-x-2">
              {[
                { key: 'reports', label: 'Reports', icon: FileText, color: 'from-blue-500 to-indigo-500' },
                { key: 'trends', label: 'Trends', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
              //{ key: 'insights', label: 'Insights', icon: Eye, color: 'from-purple-500 to-pink-500' }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as 'reports' | 'trends' | 'insights')}
                    className={`flex items-center gap-2 py-3 px-6 rounded-lg font-medium text-sm transition-all duration-200 ${
                      activeTab === tab.key
                        ? `bg-gradient-to-r ${tab.color} text-white shadow-lg transform scale-105`
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6">
              <h2 className="text-2xl font-bold text-white">Your Medical Reports</h2>
              <p className="text-blue-100 mt-1">Track your health journey over time</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Report Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Lab
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Parameters
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-4">
                          <div className="p-4 bg-gray-100 rounded-full">
                            <FileText className="w-12 h-12 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-lg font-medium text-gray-600">No reports uploaded yet</p>
                            <p className="text-gray-400">Upload your first medical report to get started</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    reports.map((report) => {
                      const criticalCount = report.parameters?.filter(p => p.riskLevel === 'CRITICAL').length || 0;
                      const abnormalCount = report.parameters?.filter(p => p.status !== 'NORMAL').length || 0;
                      
                      return (
                        <tr key={report.id} className="hover:bg-blue-50 transition-colors duration-200">
                          <td className="px-6 py-4">
                            <div>
                            <p className="text-sm font-medium text-blue-600 hover:underline cursor-pointer">
  <a href={report.fileUrl} target="_blank" rel="noopener noreferrer">
    {report.fileUrl.split('/').pop()}
  </a>
</p>

                            
                            
                              <p className="text-sm text-gray-500 font-medium">
                                {report.fileType.toUpperCase()}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {new Date(report.reportDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {report.labName || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="space-y-1">
                              <p className="font-medium text-gray-900">{report.parameters?.length || 0} total</p>
                              {abnormalCount > 0 && (
                                <p className="text-orange-600 font-medium">{abnormalCount} flagged</p>
                              )}
                              {criticalCount > 0 && (
                                <p className="text-red-600 font-bold">{criticalCount} critical</p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                              report.processingStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              report.processingStatus === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {report.processingStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium space-x-3">
                            <button
                              onClick={() => {
                                setSelectedReport(report);
                                setActiveTab('insights');
                                generateInsights(report.id);
                              }}
                              className="text-indigo-600 hover:text-indigo-900 inline-flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-lg transition-all duration-200"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </button>
                            <button
                              onClick={() => deleteReport(report.id)}
                              className="text-red-600 hover:text-red-900 inline-flex items-center gap-1 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg transition-all duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <TrendingUp className="w-6 h-6" />
                      Parameter Trends
                    </h2>
                    <p className="text-green-100 mt-1">Visualize your health parameters over time</p>
                  </div>
                  <select
                    value={selectedParameter}
                    onChange={(e) => setSelectedParameter(e.target.value)}
                    className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select Parameter</option>
                    {availableParameters.map((param) => (
                      <option key={param} value={param}>{param}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="p-6">
                {selectedParameter && getChartData().length > 0 ? (
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getChartData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12, fill: '#6b7280' }}
                          stroke="#9ca3af"
                        />
                        <YAxis 
                          tick={{ fontSize: 12, fill: '#6b7280' }}
                          stroke="#9ca3af"
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={getLineColor(selectedParameter)}
                          strokeWidth={3}
                          dot={{ r: 6, fill: getLineColor(selectedParameter) }}
                          activeDot={{ r: 8, fill: getLineColor(selectedParameter) }}
                          name={selectedParameter}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-96 flex items-center justify-center">
                    <div className="text-center">
                      <div className="p-4 bg-gray-100 rounded-full mb-4 mx-auto w-fit">
                        <TrendingUp className="w-12 h-12 text-gray-400" />
                      </div>
                      <p className="text-lg font-medium text-gray-600">
                        {selectedParameter 
                          ? 'No data available for this parameter'
                          : 'Select a parameter to view trends'
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Parameter Cards */}
              <div className="p-6 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {availableParameters.map((param) => (
                    <button
                      key={param}
                      onClick={() => setSelectedParameter(param)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                        selectedParameter === param
                          ? 'border-green-500 bg-green-50 shadow-lg transform scale-105'
                          : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getLineColor(param) }}
                        />
                        <span className={`font-semibold text-sm ${
                          selectedParameter === param ? 'text-green-700' : 'text-gray-700'
                        }`}>
                          {param}
                        </span>
                      </div>
                      {mockTrendData[param] && (
                        <div className="text-xs text-gray-500">
                          Latest: {mockTrendData[param][mockTrendData[param].length - 1]?.value}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            {selectedReport ? (
              <>
                {/* Report Details */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6">
                    <h2 className="text-2xl font-bold text-white">
                      Report Analysis: {selectedReport.originalFileName}
                    </h2>
                    <p className="text-purple-100 mt-1">Comprehensive health parameter analysis</p>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                      <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                        <p className="text-3xl font-bold text-blue-600 mb-2">
                          {selectedReport.parameters?.length || 0}
                        </p>
                        <p className="text-sm font-semibold text-blue-700">Total Parameters</p>
                      </div>
                      <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                        <p className="text-3xl font-bold text-green-600 mb-2">
                          {selectedReport.parameters?.filter(p => p.status === 'NORMAL').length || 0}
                        </p>
                        <p className="text-sm font-semibold text-green-700">Normal</p>
                      </div>
                      <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border border-yellow-200">
                        <p className="text-3xl font-bold text-yellow-600 mb-2">
                          {selectedReport.parameters?.filter(p => p.riskLevel === 'BORDERLINE').length || 0}
                        </p>
                        <p className="text-sm font-semibold text-yellow-700">Borderline</p>
                      </div>
                      <div className="text-center p-6 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-200">
                        <p className="text-3xl font-bold text-red-600 mb-2">
                          {selectedReport.parameters?.filter(p => p.riskLevel === 'CRITICAL').length || 0}
                        </p>
                        <p className="text-sm font-semibold text-red-700">Critical</p>
                      </div>
                    </div>

                    {/* Parameters Table */}
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Parameter</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Value</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Normal Range</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Risk Level</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {selectedReport.parameters?.map((param) => {
                            const { icon, color, bg } = getStatusDisplay(param.status, param.riskLevel);
                            return (
                              <tr key={param.id} className="hover:bg-gray-50 transition-colors duration-200">
                                <td className="px-6 py-4 font-semibold text-gray-900">{param.name}</td>
                                <td className="px-6 py-4 font-medium text-gray-800">{param.value} {param.unit}</td>
                                <td className="px-6 py-4 text-gray-600">{param.normalRange || 'N/A'}</td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${color} ${bg}`}>
                                    {icon}
                                    {param.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    param.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                                    param.riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                                    param.riskLevel === 'BORDERLINE' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                  }`}>
                                    {param.riskLevel}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* AI Insights */}
                {insights && (
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6">
                      <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                          <AlertCircle className="w-6 h-6" />
                        </div>
                        AI Health Insights
                      </h3>
                      <p className="text-indigo-100 mt-1">Powered by advanced medical AI analysis</p>
                    </div>
                    
                    <div className="p-6 space-y-6">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                        <h4 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          Summary
                        </h4>
                        <p className="text-indigo-800 leading-relaxed">{insights.summary}</p>
                      </div>

                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
                        <h4 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5" />
                          Risk Assessment
                        </h4>
                        <p className="text-amber-800 leading-relaxed">{insights.risk_assessment}</p>
                      </div>

                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                        <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5" />
                          Recommendations
                        </h4>
                        <ul className="space-y-2 text-green-800">
                          {insights.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="leading-relaxed">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {insights.critical_parameters.length > 0 && (
                        <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-6 border border-red-200">
                          <h4 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                            <XCircle className="w-5 h-5" />
                            Critical Parameters Requiring Attention
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {insights.critical_parameters.map((param, index) => (
                              <span key={index} className="px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-semibold border border-red-200">
                                {param}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-16 text-center">
                <div className="max-w-md mx-auto">
                  <div className="p-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mx-auto mb-6 w-fit">
                    <Eye className="w-16 h-16 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Report Selected</h3>
                  <p className="text-gray-600 mb-6">
                    Select a report from the Reports tab to view detailed AI-powered insights and analysis.
                  </p>
                  <button
                    onClick={() => setActiveTab('reports')}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Go to Reports
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className=" shadow-2xl p-8 flex items-center gap-4 max-w-sm mx-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          
          
          
          
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalReportsDashboard;