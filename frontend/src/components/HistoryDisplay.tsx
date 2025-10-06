/**
 * History Display Component
 * Shows 3-day prediction and recommendation history
 */

import React, { useState, useEffect } from 'react';
import { ClockIcon, MapPinIcon, ChartBarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface PredictionHistory {
  id: string;
  timestamp: string;
  location_name: string;
  risk_score: number;
  risk_level: string;
  top_factors: string[];
  prediction_horizon: string;
  confidence: number;
  environmental_summary: {
    pm25: number;
    ozone: number;
    temperature: number;
    humidity: number;
  };
}

interface RecommendationHistory {
  id: string;
  timestamp: string;
  location_name: string;
  risk_score: number;
  risk_context: string;
  recommendations: Array<{
    type: string;
    description: string;
    benefit?: string;
  }>;
  quantified_benefits: Record<string, string>;
  environmental_trigger: string;
}

interface HistoryDisplayProps {
  userId: string;
  className?: string;
}

export const HistoryDisplay: React.FC<HistoryDisplayProps> = ({ userId, className }) => {
  const [predictions, setPredictions] = useState<PredictionHistory[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'predictions' | 'recommendations'>('predictions');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        
        // Fetch both predictions and recommendations
        const [predictionsRes, recommendationsRes] = await Promise.all([
          fetch(`http://localhost:8000/api/v1/history/predictions/${userId}?days=3`),
          fetch(`http://localhost:8000/api/v1/history/recommendations/${userId}?days=3`)
        ]);

        if (predictionsRes.ok) {
          const predictionsData = await predictionsRes.json();
          setPredictions(predictionsData.prediction_history || []);
        }

        if (recommendationsRes.ok) {
          const recommendationsData = await recommendationsRes.json();
          setRecommendations(recommendationsData.recommendation_history || []);
        }
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const getRiskBadgeClass = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">3-Day History</h3>
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('predictions')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'predictions'
                  ? 'bg-purple-100 text-purple-800'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Predictions ({predictions.length})
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'recommendations'
                  ? 'bg-purple-100 text-purple-800'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Recommendations ({recommendations.length})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'predictions' && (
          <div className="space-y-4">
            {predictions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ChartBarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No prediction history available</p>
                <p className="text-sm">Make some predictions to see them here</p>
              </div>
            ) : (
              predictions.map((prediction) => (
                <div key={prediction.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPinIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {prediction.location_name}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getRiskBadgeClass(prediction.risk_level)}`}>
                          {prediction.risk_level}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          {formatTimestamp(prediction.timestamp)}
                        </span>
                        <span>Score: {prediction.risk_score}/100</span>
                        <span>Confidence: {Math.round(prediction.confidence * 100)}%</span>
                      </div>

                      {prediction.top_factors.length > 0 && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-700">Top Factors:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {prediction.top_factors.slice(0, 3).map((factor, index) => (
                              <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                {factor}
                              </span>
                            ))}
                            {prediction.top_factors.length > 3 && (
                              <span className="px-2 py-1 text-xs text-gray-500">
                                +{prediction.top_factors.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>PM2.5: {prediction.environmental_summary.pm25} μg/m³</div>
                        <div>Ozone: {prediction.environmental_summary.ozone} ppb</div>
                        <div>Temp: {prediction.environmental_summary.temperature}°C</div>
                        <div>Humidity: {prediction.environmental_summary.humidity}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            {recommendations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircleIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No recommendation history available</p>
                <p className="text-sm">Start using the app to get personalized recommendations</p>
              </div>
            ) : (
              recommendations.map((recommendation) => (
                <div key={recommendation.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPinIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {recommendation.location_name}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getRiskBadgeClass(recommendation.risk_score > 60 ? 'high' : 'moderate')}`}>
                          Risk: {recommendation.risk_score}/100
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          {formatTimestamp(recommendation.timestamp)}
                        </span>
                        <span>Trigger: {recommendation.environmental_trigger}</span>
                      </div>

                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-700">Recommendations:</span>
                        <div className="mt-1 space-y-1">
                          {recommendation.recommendations.slice(0, 3).map((rec, index) => (
                            <div key={index} className="text-sm text-gray-600 flex items-start">
                              <CheckCircleIcon className="w-4 h-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                              <span>{rec.description}</span>
                              {rec.benefit && (
                                <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                                  {rec.benefit}
                                </span>
                              )}
                            </div>
                          ))}
                          {recommendation.recommendations.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{recommendation.recommendations.length - 3} more recommendations
                            </span>
                          )}
                        </div>
                      </div>

                      {Object.keys(recommendation.quantified_benefits).length > 0 && (
                        <div className="bg-blue-50 p-3 rounded">
                          <span className="text-sm font-medium text-blue-900">Quantified Benefits:</span>
                          <div className="mt-1 text-sm text-blue-800">
                            {Object.entries(recommendation.quantified_benefits).map(([key, value]) => (
                              <div key={key}>• {key}: {value}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryDisplay;
