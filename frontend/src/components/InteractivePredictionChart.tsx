import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format } from 'date-fns';

interface PredictionData {
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

interface InteractivePredictionChartProps {
  predictions: PredictionData[];
  onDaySelect: (prediction: PredictionData) => void;
  selectedDay?: string;
}

const InteractivePredictionChart: React.FC<InteractivePredictionChartProps> = ({
  predictions,
  onDaySelect,
  selectedDay
}) => {
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  // Prepare chart data
  const chartData = predictions.map((pred, index) => {
    // Calculate the actual date based on time horizon from September 27, 2025
    const baseDate = new Date('2025-09-27');
    const timeHorizons: Record<string, number> = {
      '6h': 0.25, '10h': 0.42, '24h': 1, '2d': 2, '3d': 3, '4d': 4, '5d': 5, '6d': 6, '7d': 7
    };
    const daysToAdd = timeHorizons[pred.time_horizon] || index;
    const date = new Date(baseDate.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
    
    const isToday = index === 0;
    const isSelected = selectedDay === pred.date;
    const isHovered = hoveredBar === pred.date;

    return {
      ...pred,
      displayDate: isToday ? 'Today' : format(date, 'MMM d'),
      fullDate: `${pred.time_horizon} - ${format(date, 'EEEE, MMMM d, yyyy')}`,
      isToday,
      isSelected,
      isHovered,
      // Use real contributing factors from ML prediction instead of hardcoded ones
      dayRiskFactors: pred.contributing_factors || []
    };
  });


  // Get color based on risk level
  const getRiskColor = (riskLevel: string, isSelected: boolean, isHovered: boolean) => {
    if (isSelected || isHovered) {
      return '#3B82F6'; // Blue for selected/hovered
    }

    switch (riskLevel) {
      case 'very_high':
        return '#DC2626'; // Red
      case 'high':
        return '#EA580C'; // Orange
      case 'moderate':
        return '#D97706'; // Amber
      case 'low':
        return '#16A34A'; // Green
      case 'very_low':
        return '#059669'; // Emerald
      default:
        return '#6B7280'; // Gray
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      // Use real ML prediction data instead of hardcoded text
      const prediction = data.personalized_recommendations && data.personalized_recommendations.length > 0 
        ? data.personalized_recommendations[0].reasoning || "ML prediction based on environmental factors"
        : "ML prediction based on environmental factors";
      
      const recommendation = data.personalized_recommendations && data.personalized_recommendations.length > 0 
        ? data.personalized_recommendations[0].action || "Follow ML recommendations"
        : "Follow ML recommendations";
      
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg max-w-md">
          <div className="mb-3">
            <p className="font-semibold text-gray-900 text-sm">{data.fullDate}</p>
            <div className="flex items-center space-x-4 mt-1">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                data.risk_level === 'very_high' ? 'bg-red-100 text-red-800' :
                data.risk_level === 'high' ? 'bg-orange-100 text-orange-800' :
                data.risk_level === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {data.risk_score.toFixed(0)}% Risk
              </span>
              <span className="text-xs text-gray-500">
                {data.confidence_level.toFixed(0)}% Confidence
              </span>
            </div>
          </div>
          
          <div className="mb-3">
            <p className="text-xs font-medium text-gray-700 mb-1">Prediction:</p>
            <p className="text-xs text-gray-600 leading-relaxed">{prediction}</p>
          </div>
          
          <div className="mb-3">
            <p className="text-xs font-medium text-gray-700 mb-1">Recommendation:</p>
            <p className="text-xs text-gray-600 leading-relaxed">{recommendation}</p>
          </div>
          
          {data.dayRiskFactors && data.dayRiskFactors.length > 0 && (
            <div className="mb-2">
              <p className="text-xs font-medium text-gray-700 mb-1">Risk Factors for {data.time_horizon}:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                {data.dayRiskFactors.slice(0, 4).map((factor: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="text-xs text-gray-400 pt-2 border-t">
            ML-Enhanced Prediction • {data.time_horizon}
          </div>
        </div>
      );
    }
    return null;
  };

  // Handle bar click
  const handleBarClick = (data: any) => {
    const prediction = predictions.find(p => p.date === data.date);
    if (prediction) {
      onDaySelect(prediction);
    }
  };

  // Handle bar hover
  const handleMouseEnter = (data: any) => {
    setHoveredBar(data.date);
  };

  const handleMouseLeave = () => {
    setHoveredBar(null);
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">ML Risk Forecast (6h - 7d)</h3>
        <p className="text-sm text-gray-600">
          Click on any bar to see detailed ML predictions for that time horizon
        </p>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            onClick={handleBarClick}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="displayDate" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              domain={[0, 100]}
              label={{ value: 'ML Risk Score (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="risk_score" 
              radius={[4, 4, 0, 0]}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getRiskColor(entry.risk_level, entry.isSelected, entry.isHovered)}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-600 rounded mr-2"></div>
          <span>Very High Risk</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-orange-600 rounded mr-2"></div>
          <span>High Risk</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-amber-600 rounded mr-2"></div>
          <span>Moderate Risk</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-600 rounded mr-2"></div>
          <span>Low Risk</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-emerald-600 rounded mr-2"></div>
          <span>Very Low Risk</span>
        </div>
      </div>
    </div>
  );
};

export default InteractivePredictionChart;
