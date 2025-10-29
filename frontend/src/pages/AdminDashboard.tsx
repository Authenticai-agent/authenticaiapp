import React, { useState, useEffect } from 'react';
import { 
  Users, TrendingUp, Activity, Brain, Download, 
  Calendar, BarChart3, AlertCircle, CheckCircle 
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

interface MetricCard {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}

interface UserBehaviorData {
  totalUsers: number;
  activeToday: number;
  dailyRitualCompletionRate: number;
  avgSessionDuration: number;
  retentionRate: number;
}

interface WellnessCorrelation {
  metric: string;
  correlation: number;
  sampleSize: number;
  insight: string;
}

const AdminDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [metrics, setMetrics] = useState<UserBehaviorData | null>(null);
  const [correlations, setCorrelations] = useState<WellnessCorrelation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [metricsRes, correlationsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/admin/metrics?range=${timeRange}`),
        axios.get(`${API_BASE_URL}/admin/correlations?range=${timeRange}`)
      ]);
      
      setMetrics(metricsRes.data);
      setCorrelations(correlationsRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (dataType: string) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/export/${dataType}?range=${timeRange}`,
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${dataType}_${timeRange}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const metricCards: MetricCard[] = [
    {
      title: 'Total Users',
      value: metrics?.totalUsers || 0,
      change: '+12%',
      trend: 'up',
      icon: <Users className="w-6 h-6" />
    },
    {
      title: 'Active Today',
      value: metrics?.activeToday || 0,
      change: '+8%',
      trend: 'up',
      icon: <Activity className="w-6 h-6" />
    },
    {
      title: 'Ritual Completion',
      value: `${metrics?.dailyRitualCompletionRate || 0}%`,
      change: '+15%',
      trend: 'up',
      icon: <CheckCircle className="w-6 h-6" />
    },
    {
      title: 'Avg Session',
      value: `${metrics?.avgSessionDuration || 0}m`,
      change: '+22%',
      trend: 'up',
      icon: <TrendingUp className="w-6 h-6" />
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🧠 AI Coach Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Comprehensive analytics for AI-powered wellness insights
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeRange === range
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
            </button>
          ))}
        </div>

        <button
          onClick={() => exportData('all')}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export All Data
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metricCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                {card.icon}
              </div>
              {card.trend && (
                <span className={`text-sm font-semibold ${
                  card.trend === 'up' ? 'text-green-600' : 
                  card.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {card.change}
                </span>
              )}
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">{card.title}</h3>
            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Feature Usage Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Daily Ritual Analytics */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Daily Ritual Analytics</h2>
            <button
              onClick={() => exportData('daily_ritual')}
              className="text-sm text-purple-600 hover:text-purple-700"
            >
              Export
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Completion Rate</span>
              <span className="font-bold text-purple-600">78%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Avg Duration</span>
              <span className="font-bold text-purple-600">6.8 min</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Most Completed Phase</span>
              <span className="font-bold text-purple-600">Breathe (92%)</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Avg Streak</span>
              <span className="font-bold text-purple-600">12 days</span>
            </div>
          </div>
        </div>

        {/* Pollution Defense Analytics */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Pollution Defense</h2>
            <button
              onClick={() => exportData('pollution_defense')}
              className="text-sm text-purple-600 hover:text-purple-700"
            >
              Export
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Activations</span>
              <span className="font-bold text-orange-600">234</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Completion Rate</span>
              <span className="font-bold text-orange-600">65%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Avg Walk Duration</span>
              <span className="font-bold text-orange-600">18 min</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Symptoms Reported</span>
              <span className="font-bold text-orange-600">12%</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights - Wellness Correlations */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 shadow-md border-2 border-purple-200 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="w-8 h-8 text-purple-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI-Discovered Correlations</h2>
            <p className="text-sm text-gray-600">Machine learning insights from user data</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {correlations.length > 0 ? correlations.map((corr, index) => (
            <div key={index} className="bg-white rounded-lg p-4 border border-purple-200">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{corr.metric}</h3>
                <span className={`text-sm font-bold ${
                  Math.abs(corr.correlation) > 0.7 ? 'text-red-600' :
                  Math.abs(corr.correlation) > 0.4 ? 'text-orange-600' : 'text-green-600'
                }`}>
                  {(corr.correlation * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-2">{corr.insight}</p>
              <p className="text-xs text-gray-500">Sample size: {corr.sampleSize} users</p>
            </div>
          )) : (
            <div className="col-span-2 text-center py-8 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Collecting data for AI analysis...</p>
              <p className="text-sm">Correlations will appear after sufficient data collection</p>
            </div>
          )}
        </div>
      </div>

      {/* User Engagement Patterns */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">User Engagement Patterns</h2>
          <button
            onClick={() => exportData('engagement')}
            className="text-sm text-purple-600 hover:text-purple-700"
          >
            Export
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">6.2</p>
            <p className="text-sm text-gray-600">Days/week active</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <BarChart3 className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">14.5 min</p>
            <p className="text-sm text-gray-600">Avg session time</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">82%</p>
            <p className="text-sm text-gray-600">7-day retention</p>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Data Export Options</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Daily Ritual Data', type: 'daily_ritual' },
            { name: 'Pollution Defense', type: 'pollution_defense' },
            { name: 'Wellness Journal', type: 'wellness_journal' },
            { name: 'Lung Energy Metrics', type: 'lung_energy' },
            { name: 'Environmental Data', type: 'environmental' },
            { name: 'User Behavior', type: 'user_behavior' }
          ].map((item) => (
            <button
              key={item.type}
              onClick={() => exportData(item.type)}
              className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors"
            >
              <span className="font-medium text-gray-900">{item.name}</span>
              <Download className="w-5 h-5 text-gray-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
