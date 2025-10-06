import React, { useState, useEffect } from 'react';
import { 
  SparklesIcon,
  ShieldCheckIcon,
  HomeIcon,
  AcademicCapIcon,
  ChartBarIcon,
  CreditCardIcon,
  ArrowUpRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface PremiumRiskPrediction {
  risk_score: number;
  risk_level: string;
  confidence: number;
  primary_triggers: string[];
  risk_factors: any;
  recommendations: Array<{
    action: string;
    priority: string;
    reason: string;
    impact: string;
  }>;
  forecast: Array<{
    date: string;
    risk_score: number;
    risk_level: string;
    confidence: number;
  }>;
  insights: any;
  premium_features: any;
}

interface IndoorAssessment {
  indoor_risk_score: number;
  risk_level: string;
  risk_factors: any;
  recommendations: Array<{
    action: string;
    priority: string;
    cost: string;
    impact: string;
  }>;
  improvement_plan: any;
}

const PremiumDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [premiumPrediction, setPremiumPrediction] = useState<PremiumRiskPrediction | null>(null);
  const [indoorAssessment, setIndoorAssessment] = useState<IndoorAssessment | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadPremiumData();
    }
  }, [user]);

  const loadPremiumData = async () => {
    setLoading(true);
    try {
      // Load premium prediction
      const predictionResponse = await api.post('/predictions/premium/personal-risk');
      setPremiumPrediction(predictionResponse.data);

      // Load subscription status
      const subscriptionResponse = await api.get('/predictions/premium/subscription-status');
      setSubscriptionStatus(subscriptionResponse.data);

      // Load indoor assessment with sample data
      const indoorResponse = await api.post('/predictions/premium/indoor-risk-assessment', {
        humidity: 60,
        pets: ['cat'],
        carpet_percentage: 50,
        voc_sources: ['cleaning_products']
      });
      setIndoorAssessment(indoorResponse.data);

    } catch (error) {
      console.error('Error loading premium data:', error);
      toast.error('Failed to load premium features');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'very_low': return 'text-green-600 bg-green-50 border-green-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'very_high': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Premium Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center">
                <SparklesIcon className="h-8 w-8 text-purple-600 mr-3" />
                <h1 className="text-3xl font-bold text-gray-900">Premium Health Intelligence</h1>
              </div>
              <p className="mt-2 text-lg text-gray-600">
                AI-powered personalized risk prediction and health insights
              </p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                Premium Active
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {subscriptionStatus?.billing_amount} • Next billing: {subscriptionStatus?.next_billing_date}
              </p>
            </div>
          </div>
        </div>

        {/* Premium Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Personal Risk Prediction */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <ShieldCheckIcon className="h-6 w-6 text-purple-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Personal Risk Prediction</h2>
                </div>
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                  AI-Powered
                </span>
              </div>

              {premiumPrediction && (
                <>
                  {/* Risk Score Display */}
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full border-8 border-gray-200 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-900">
                            {Math.round(premiumPrediction.risk_score)}
                          </div>
                          <div className="text-sm text-gray-500">Risk Score</div>
                        </div>
                      </div>
                      <div className={clsx(
                        'absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-sm font-medium border',
                        getRiskColor(premiumPrediction.risk_level)
                      )}>
                        {premiumPrediction.risk_level.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {/* Risk Insights */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="font-medium text-gray-900 mb-2">AI Insights</h3>
                    <p className="text-sm text-gray-700 mb-3">
                      {premiumPrediction.insights?.explanation}
                    </p>
                    <div className="flex items-center text-sm text-gray-600">
                      <span>Confidence: {Math.round(premiumPrediction.confidence * 100)}%</span>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Personalized Recommendations</h3>
                    <div className="space-y-3">
                      {premiumPrediction.recommendations.slice(0, 3).map((rec, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <span className={clsx(
                            'px-2 py-1 text-xs font-medium rounded-full',
                            getPriorityColor(rec.priority)
                          )}>
                            {rec.priority}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{rec.action}</p>
                            <p className="text-xs text-gray-600 mt-1">{rec.reason}</p>
                            <p className="text-xs text-green-600 mt-1">Impact: {rec.impact}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 7-Day Forecast */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <ChartBarIcon className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">7-Day Forecast</h3>
              </div>
              {premiumPrediction?.forecast && (
                <div className="space-y-3">
                  {premiumPrediction.forecast.slice(0, 7).map((day, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <div className="text-sm text-gray-600">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-sm font-medium text-gray-900">
                          {Math.round(day.risk_score)}
                        </div>
                        <div className={clsx(
                          'w-2 h-2 rounded-full',
                          day.risk_score > 60 ? 'bg-red-400' : 
                          day.risk_score > 40 ? 'bg-yellow-400' : 'bg-green-400'
                        )}></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Secondary Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Indoor Assessment */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <HomeIcon className="h-6 w-6 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Indoor Assessment</h3>
            </div>
            {indoorAssessment && (
              <>
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {indoorAssessment.indoor_risk_score}
                  </div>
                  <div className={clsx(
                    'text-sm font-medium px-2 py-1 rounded-full mt-1',
                    getRiskColor(indoorAssessment.risk_level)
                  )}>
                    {indoorAssessment.risk_level.toUpperCase()}
                  </div>
                </div>
                <div className="space-y-2">
                  {Object.entries(indoorAssessment.risk_factors).slice(0, 2).map(([key, value]) => (
                    <div key={key} className="text-xs text-gray-600">
                      <span className="font-medium">{key.replace('_', ' ')}:</span> {value as string}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Health Education */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <AcademicCapIcon className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Health Education</h3>
            </div>
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-blue-600">85</div>
              <div className="text-sm text-gray-600">Knowledge Score</div>
            </div>
            <div className="space-y-2">
              <div className="text-xs text-gray-600">
                <span className="font-medium">Topics Completed:</span> 12
              </div>
              <div className="text-xs text-gray-600">
                <span className="font-medium">Next Topic:</span> Indoor Air Quality
              </div>
            </div>
            <button className="w-full mt-3 text-xs bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors">
              Continue Learning
            </button>
          </div>

          {/* Health Reports */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <ChartBarIcon className="h-6 w-6 text-purple-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Health Reports</h3>
            </div>
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-purple-600">Weekly</div>
              <div className="text-sm text-gray-600">Next Report</div>
            </div>
            <div className="space-y-2">
              <div className="text-xs text-gray-600">
                <span className="font-medium">Last Report:</span> Sept 12
              </div>
              <div className="text-xs text-gray-600">
                <span className="font-medium">Trend:</span> Improving
              </div>
            </div>
            <button className="w-full mt-3 text-xs bg-purple-50 text-purple-600 py-2 rounded-lg hover:bg-purple-100 transition-colors">
              Generate Report
            </button>
          </div>

          {/* Subscription Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <CreditCardIcon className="h-6 w-6 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Subscription</h3>
            </div>
            <div className="text-center mb-4">
              <div className="text-lg font-bold text-green-600">Premium</div>
              <div className="text-sm text-gray-600">$19.99/month</div>
            </div>
            <div className="space-y-2">
              <div className="text-xs text-gray-600">
                <span className="font-medium">API Calls:</span> 847/1000
              </div>
              <div className="text-xs text-gray-600">
                <span className="font-medium">Expires:</span> Dec 31, 2025
              </div>
            </div>
            <button className="w-full mt-3 text-xs bg-green-50 text-green-600 py-2 rounded-lg hover:bg-green-100 transition-colors">
              Manage Billing
            </button>
          </div>
        </div>

        {/* Premium Features Showcase */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Unlock Your Full Health Potential</h2>
            <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
              Get personalized risk predictions, indoor air quality assessments, health education, 
              and comprehensive reports powered by advanced AI and 35+ environmental data sources.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold">42</div>
                <div className="text-sm text-purple-100">Risk Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">7</div>
                <div className="text-sm text-purple-100">Day Forecast</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">35+</div>
                <div className="text-sm text-purple-100">Data Sources</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">AI</div>
                <div className="text-sm text-purple-100">Powered</div>
              </div>
            </div>
            <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors inline-flex items-center">
              Explore All Features
              <ArrowUpRightIcon className="h-4 w-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumDashboard;
