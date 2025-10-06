import React, { useState, useEffect } from 'react';
import { ChartBarIcon, ExclamationTriangleIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { predictionsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import InteractivePredictionChart from '../components/InteractivePredictionChart';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface Prediction {
  id: string;
  risk_score: number;
  risk_level: string;
  factors: any;
  recommendations: any[];
  prediction_date: string;
  created_at: string;
}

interface MLPrediction {
  date: string;
  time_horizon: string;
  prediction_time: string;
  risk_score: number;
  risk_level: string;
  contributing_factors: string[];
  personalized_recommendations: Array<{
    type: string;
    action: string;
    reasoning: string;
    urgency: string;
    expected_benefit: string;
  }>;
  confidence_level: number;
  emergency_indicators: string[];
}

const Predictions: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [forecast, setForecast] = useState<Prediction[]>([]);
  const [history, setHistory] = useState<Prediction[]>([]);
  const [riskFactors, setRiskFactors] = useState<any>(null);
  const [selectedView, setSelectedView] = useState<'forecast' | 'history'>('forecast');
  const [mlPredictions, setMlPredictions] = useState<MLPrediction[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedPrediction, setSelectedPrediction] = useState<MLPrediction | null>(null);

  const loadPredictionData = React.useCallback(async () => {
    if (!user?.location) return;

    setLoading(true);
    try {
      const [forecastRes, historyRes, factorsRes] = await Promise.all([
        predictionsAPI.getDailyForecast(7),
        predictionsAPI.getHistory(30),
        predictionsAPI.getRiskFactors()
      ]);

      setForecast(forecastRes.data || []);
      setHistory(historyRes.data || []);
      setRiskFactors(factorsRes.data || null);
      
      // Load ML predictions
      if (forecastRes.data && forecastRes.data.daily_predictions) {
        setMlPredictions(forecastRes.data.daily_predictions);
        // Set first prediction as default selected day
        if (forecastRes.data.daily_predictions.length > 0) {
          setSelectedDay(forecastRes.data.daily_predictions[0].date);
          setSelectedPrediction(forecastRes.data.daily_predictions[0]);
        }
      } else {
        // Fallback: try to extract from the response structure
        console.log('Full forecast response:', forecastRes.data);
        if (forecastRes.data && Array.isArray(forecastRes.data)) {
          setMlPredictions(forecastRes.data);
          if (forecastRes.data.length > 0) {
            setSelectedDay(forecastRes.data[0].date);
            setSelectedPrediction(forecastRes.data[0]);
          }
        }
      }
    } catch (error) {
      console.error('Error loading prediction data:', error);
      toast.error('Failed to load prediction data');
    } finally {
      setLoading(false);
    }
  }, [user?.location]);

  useEffect(() => {
    if (user?.location) {
      loadPredictionData();
    }
  }, [user, loadPredictionData]);

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'text-success-600 bg-success-50 border-success-200';
      case 'moderate':
        return 'text-warning-600 bg-warning-50 border-warning-200';
      case 'high':
        return 'text-danger-600 bg-danger-50 border-danger-200';
      case 'very_high':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleDaySelect = React.useCallback((prediction: MLPrediction) => {
    setSelectedDay(prediction.date);
    setSelectedPrediction(prediction);
  }, []);

  const getRiskIcon = (riskLevel: string) => {
    const iconClass = "h-5 w-5";
    switch (riskLevel) {
      case 'low':
        return <div className={`${iconClass} bg-success-400 rounded-full`} />;
      case 'moderate':
        return <ExclamationTriangleIcon className={`${iconClass} text-warning-500`} />;
      case 'high':
        return <ExclamationTriangleIcon className={`${iconClass} text-danger-500`} />;
      case 'very_high':
        return <ExclamationTriangleIcon className={`${iconClass} text-red-500`} />;
      default:
        return <div className={`${iconClass} bg-gray-400 rounded-full`} />;
    }
  };

  const formatChartData = (data: Prediction[]) => {
    return data.map(item => ({
      date: new Date(item.prediction_date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      risk_score: item.risk_score,
      risk_level: item.risk_level,
    }));
  };

  const getFactorImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-danger-600 bg-danger-50';
      case 'moderate':
        return 'text-warning-600 bg-warning-50';
      case 'low':
        return 'text-success-600 bg-success-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (!user?.location) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-warning-400" />
            <h2 className="mt-2 text-lg font-medium text-gray-900">Location Required</h2>
            <p className="mt-1 text-sm text-gray-500">
              Please set your location in your profile to view risk predictions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Risk Predictions</h1>
          <p className="mt-1 text-sm text-gray-600">
            AI-powered flareup risk forecasting based on environmental data
          </p>
        </div>

        {/* View Toggle */}
        <div className="mb-6">
          <div className="sm:hidden">
            <select
              value={selectedView}
              onChange={(e) => setSelectedView(e.target.value as 'forecast' | 'history')}
              className="input"
            >
              <option value="forecast">7-Day Forecast</option>
              <option value="history">30-Day History</option>
            </select>
          </div>
          <div className="hidden sm:block">
            <nav className="flex space-x-8">
              <button
                onClick={() => setSelectedView('forecast')}
                className={clsx(
                  'py-2 px-1 border-b-2 font-medium text-sm',
                  selectedView === 'forecast'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                7-Day Forecast
              </button>
              <button
                onClick={() => setSelectedView('history')}
                className={clsx(
                  'py-2 px-1 border-b-2 font-medium text-sm',
                  selectedView === 'history'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                30-Day History
              </button>
            </nav>
          </div>
        </div>

        {/* Mobile-Optimized Chart */}
        <div className="card">
          {selectedView === 'forecast' && mlPredictions.length > 0 ? (
            <InteractivePredictionChart
              predictions={mlPredictions}
              onDaySelect={handleDaySelect}
              selectedDay={selectedDay}
            />
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedView === 'forecast' ? 'Risk Forecast' : 'Risk History'}
                </h3>
                <ChartBarIcon className="h-5 w-5 text-gray-400" />
              </div>
              
              {(selectedView === 'forecast' ? forecast : history).length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formatChartData(selectedView === 'forecast' ? forecast : history)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip 
                        formatter={(value: number) => [`${value.toFixed(1)}%`, 'Risk Score']}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Bar 
                        dataKey="risk_score" 
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No prediction data available
                </div>
              )}
            </>
          )}
        </div>

        {/* Current Risk Factors - Mobile Optimized */}
        {riskFactors && (
          <div className="mt-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Risk Factors</h3>
              {riskFactors.environmental_factors && riskFactors.environmental_factors.length > 0 ? (
                <div className="space-y-3">
                  {riskFactors.environmental_factors.map((factor: any, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <span className={clsx(
                        'px-2 py-1 text-xs font-medium rounded-full',
                        getFactorImpactColor(factor.risk_level)
                      )}>
                        {factor.risk_level}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {factor.factor.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-gray-600">{factor.reasoning}</p>
                        {factor.impact_score && (
                          <p className="text-xs text-gray-500">Impact Score: {factor.impact_score}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No significant environmental risk factors detected</p>
              )}
            </div>
          </div>
        )}

        {/* Selected Day Details - Mobile Optimized */}
        {selectedPrediction && (
          <div className="mt-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {selectedPrediction.time_horizon} Prediction - {new Date(selectedPrediction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </h3>
              
              <div className="space-y-6">
                {/* Risk Overview */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">ML Risk Assessment</h4>
                      <p className="text-sm text-gray-600">Time Horizon: {selectedPrediction.time_horizon}</p>
                      <p className="text-sm text-gray-600">Prediction Time: {new Date(selectedPrediction.prediction_time).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">
                        {Math.round(selectedPrediction.risk_score)}%
                      </div>
                      <div className={clsx(
                        'px-3 py-1 text-sm font-medium rounded-full',
                        getRiskColor(selectedPrediction.risk_level).replace('border-', '')
                      )}>
                        {selectedPrediction.risk_level.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Confidence Level</p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${selectedPrediction.confidence_level}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{selectedPrediction.confidence_level.toFixed(0)}% confidence</p>
                    </div>
                  </div>
                </div>

                {/* Contributing Factors */}
                {selectedPrediction.contributing_factors.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Contributing Factors</h4>
                    <div className="space-y-2">
                      {selectedPrediction.contributing_factors.map((factor, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
                          <p className="text-sm text-gray-700">{factor}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Personalized Recommendations */}
                {selectedPrediction.personalized_recommendations.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Personalized Recommendations</h4>
                    <div className="space-y-4">
                      {selectedPrediction.personalized_recommendations.map((rec, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-medium text-gray-900">{rec.action}</h5>
                            <span className={clsx(
                              'px-2 py-1 text-xs font-medium rounded-full',
                              rec.urgency === 'high' ? 'bg-red-100 text-red-800' :
                              rec.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            )}>
                              {rec.urgency}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{rec.reasoning}</p>
                          <p className="text-sm text-green-600 font-medium">{rec.expected_benefit}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Emergency Indicators */}
                {selectedPrediction.emergency_indicators.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-red-600 mb-3">Emergency Indicators</h4>
                    <div className="space-y-2">
                      {selectedPrediction.emergency_indicators.map((indicator, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                          <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5" />
                          <p className="text-sm text-red-700">{indicator}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Predictions;
