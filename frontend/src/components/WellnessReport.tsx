import React, { useState } from 'react';
import { FileText, TrendingUp, Calendar, Download } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { collectWellnessData } from '../utils/wellnessDataCollector';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const WellnessReport: React.FC = () => {
  const { user } = useAuth();
  const [reportType, setReportType] = useState<'weekly' | 'monthly'>('weekly');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);

  const generateReport = async () => {
    setLoading(true);
    try {
      // Collect all wellness data from localStorage with user validation
      const wellnessData = collectWellnessData(reportType, user?.id);
      
      // Add user_id for database storage
      const dataWithUser = {
        ...wellnessData,
        user_id: user?.id
      };
      
      console.log('Collected wellness data:', dataWithUser);
      
      // Check if there's enough data
      if (wellnessData.total_check_ins === 0) {
        toast.error(`No check-ins found for the last ${reportType === 'weekly' ? '7' : '30'} days. Complete some check-ins first!`, {
          duration: 4000
        });
        setLoading(false);
        return;
      }
      
      // Send to backend for LLM analysis
      const response = await axios.post(`${API_BASE_URL}/wellness-reports/analyze-wellness-data`, dataWithUser);
      
      setReport(response.data.analysis);
      setReportData(wellnessData);
      
      toast.success(`${reportType === 'weekly' ? 'Weekly' : 'Monthly'} report generated! 📊`, {
        duration: 3000,
        icon: '✅'
      });
      
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast.error('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!report || !reportData) return;
    
    const reportText = `
WELLNESS REPORT
${reportType.toUpperCase()}
Generated: ${new Date().toLocaleString()}

Period: ${reportData.start_date} to ${reportData.end_date}
Total Check-ins: ${reportData.total_check_ins}

${report}
    `;
    
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wellness-report-${reportType}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Report downloaded!');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <FileText className="w-6 h-6 mr-2 text-purple-600" />
            Wellness Reports
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            AI-powered analysis of your wellness journey
          </p>
        </div>
        <TrendingUp className="w-8 h-8 text-purple-400" />
      </div>

      {/* Report Type Selection */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setReportType('weekly')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
            reportType === 'weekly'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Calendar className="inline-block w-4 h-4 mr-2" />
          Weekly Report
        </button>
        <button
          onClick={() => setReportType('monthly')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
            reportType === 'monthly'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Calendar className="inline-block w-4 h-4 mr-2" />
          Monthly Report
        </button>
      </div>

      {/* Generate Button */}
      <button
        onClick={generateReport}
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-lg font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed mb-6"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Analyzing...
          </span>
        ) : (
          `Generate ${reportType === 'weekly' ? 'Weekly' : 'Monthly'} Report`
        )}
      </button>

      {/* Report Display */}
      {report && reportData && (
        <div className="border-t pt-6">
          {/* Report Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">
                {reportType === 'weekly' ? 'Weekly' : 'Monthly'} Wellness Report
              </h4>
              <p className="text-sm text-gray-600">
                {reportData.start_date} to {reportData.end_date}
              </p>
            </div>
            <button
              onClick={downloadReport}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Download</span>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{reportData.total_check_ins}</p>
              <p className="text-xs text-gray-600">Check-ins</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{reportData.mood_data.average_intensity.toFixed(1)}</p>
              <p className="text-xs text-gray-600">Avg Mood</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-orange-600">{reportData.stress_data.average.toFixed(1)}</p>
              <p className="text-xs text-gray-600">Avg Stress</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-purple-600">{reportData.sleep_data.average.toFixed(1)}</p>
              <p className="text-xs text-gray-600">Avg Sleep</p>
            </div>
          </div>

          {/* AI Analysis */}
          <div className="prose prose-sm max-w-none bg-gray-50 rounded-lg p-6">
            <ReactMarkdown>{report}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Info Box */}
      {!report && (
        <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded">
          <p className="text-sm text-purple-900">
            <strong>📊 What's included:</strong> Your report will analyze mood patterns, stress levels, sleep quality, energy trends, and provide personalized recommendations based on your check-in data.
          </p>
        </div>
      )}
    </div>
  );
};

export default WellnessReport;
