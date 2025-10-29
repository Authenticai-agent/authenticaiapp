import React from 'react';
import { Droplets, Wind, Thermometer, Cloud, Sun, AlertCircle } from 'lucide-react';

interface MicroCoachingPromptsProps {
  airQuality?: {
    aqi?: number;
    pm25?: number;
    pm10?: number;
    humidity?: number;
    temperature?: number;
    co2?: number;
  };
  weather?: {
    condition?: string;
    description?: string;
  };
}

const MicroCoachingPrompts: React.FC<MicroCoachingPromptsProps> = ({ airQuality, weather }) => {
  const getCoachingPrompts = () => {
    const prompts: Array<{ icon: React.ReactNode; message: string; action: string; color: string }> = [];
    
    const aqi = airQuality?.aqi || 50;
    const pm25 = airQuality?.pm25 || 0;
    const humidity = airQuality?.humidity || 50;
    const temperature = airQuality?.temperature || 20;
    const co2 = airQuality?.co2 || 400;
    
    // Humidity-based prompts
    if (humidity < 40) {
      prompts.push({
        icon: <Droplets className="w-5 h-5" />,
        message: `Humidity is low (${humidity}%) — your airways need moisture`,
        action: "Take 8 slow inhales through your nose to humidify your airways naturally",
        color: "blue"
      });
    } else if (humidity > 70) {
      prompts.push({
        icon: <Droplets className="w-5 h-5" />,
        message: `High humidity (${humidity}%) — air feels heavy`,
        action: "Practice gentle 4-4-4 breathing: inhale 4, hold 4, exhale 4",
        color: "indigo"
      });
    }
    
    // AQI-based prompts
    if (aqi > 100) {
      prompts.push({
        icon: <AlertCircle className="w-5 h-5" />,
        message: "Air quality is poor today — protect your lungs",
        action: "Keep windows closed, turn on air purifier, and stay hydrated with warm water",
        color: "red"
      });
    } else if (aqi < 50) {
      prompts.push({
        icon: <Sun className="w-5 h-5" />,
        message: "Air quality is excellent — perfect day!",
        action: "Great time for a short walk or open windows for 10 minutes",
        color: "green"
      });
    }
    
    // PM2.5-based prompts
    if (pm25 > 35) {
      prompts.push({
        icon: <Wind className="w-5 h-5" />,
        message: `PM2.5 is elevated (${pm25.toFixed(1)}µg/m³)`,
        action: "Avoid outdoor exercise. Try indoor stretching and keep air purifier running",
        color: "orange"
      });
    }
    
    // CO2-based prompts
    if (co2 > 800) {
      prompts.push({
        icon: <Cloud className="w-5 h-5" />,
        message: "CO₂ levels slightly elevated indoors",
        action: "Open a window for 3 minutes, then do 4-7-8 breathing (inhale 4, hold 7, exhale 8)",
        color: "purple"
      });
    }
    
    // Temperature-based prompts
    if (temperature < 10) {
      prompts.push({
        icon: <Thermometer className="w-5 h-5" />,
        message: "Cold air outside — protect your airways",
        action: "If going out, breathe through your nose and wear a scarf over your mouth",
        color: "cyan"
      });
    } else if (temperature > 30) {
      prompts.push({
        icon: <Thermometer className="w-5 h-5" />,
        message: "Hot day ahead — stay hydrated",
        action: "Drink water every hour and avoid outdoor activities during peak heat",
        color: "red"
      });
    }
    
    // Weather-based prompts
    if (weather?.condition?.toLowerCase().includes('rain')) {
      prompts.push({
        icon: <Cloud className="w-5 h-5" />,
        message: "🌧 Air cleaned by rain — breathe easy!",
        action: "Perfect moment for a short walk or deep breathing by an open window",
        color: "blue"
      });
    }
    
    // Default wellness prompt if no specific conditions
    if (prompts.length === 0) {
      prompts.push({
        icon: <Sun className="w-5 h-5" />,
        message: "Conditions are balanced today",
        action: "Perfect day for your regular wellness routine — breathe, move, and stay mindful",
        color: "green"
      });
    }
    
    return prompts.slice(0, 3); // Return max 3 prompts
  };

  const prompts = getCoachingPrompts();
  
  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; icon: string }> = {
      blue: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-900', icon: 'text-blue-600' },
      indigo: { bg: 'bg-indigo-50', border: 'border-indigo-300', text: 'text-indigo-900', icon: 'text-indigo-600' },
      green: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-900', icon: 'text-green-600' },
      red: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-900', icon: 'text-red-600' },
      orange: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-900', icon: 'text-orange-600' },
      purple: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-900', icon: 'text-purple-600' },
      cyan: { bg: 'bg-cyan-50', border: 'border-cyan-300', text: 'text-cyan-900', icon: 'text-cyan-600' },
    };
    return colors[color] || colors.green;
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Your Micro-Habits Today</h3>
      {prompts.map((prompt, index) => {
        const colors = getColorClasses(prompt.color);
        return (
          <div
            key={index}
            className={`${colors.bg} border-2 ${colors.border} rounded-lg p-4 transition-all hover:shadow-md`}
          >
            <div className="flex items-start gap-3">
              <div className={`${colors.icon} flex-shrink-0 mt-0.5`}>
                {prompt.icon}
              </div>
              <div className="flex-1">
                <p className={`font-semibold ${colors.text} mb-1`}>
                  {prompt.message}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Action:</strong> {prompt.action}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MicroCoachingPrompts;
