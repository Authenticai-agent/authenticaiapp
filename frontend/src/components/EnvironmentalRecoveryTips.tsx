import React from 'react';
import { Coffee, Droplets, Wind, Flame, Leaf } from 'lucide-react';

interface EnvironmentalRecoveryTipsProps {
  airQuality?: {
    aqi?: number;
    pm25?: number;
    humidity?: number;
  };
  pollenLevel?: string;
}

interface RecoveryTip {
  title: string;
  icon: React.ReactNode;
  description: string;
  recipe: string;
  benefits: string;
  howTo: string[];
}

const EnvironmentalRecoveryTips: React.FC<EnvironmentalRecoveryTipsProps> = ({ 
  airQuality, 
  pollenLevel 
}) => {
  
  const getTodaysTip = (): RecoveryTip => {
    const aqi = airQuality?.aqi || 50;
    const pm25 = airQuality?.pm25 || 0;
    const humidity = airQuality?.humidity || 50;
    const pollen = pollenLevel?.toLowerCase() || 'low';
    
    // Smoggy/High PM2.5 day
    if (aqi > 100 || pm25 > 35) {
      return {
        title: "Warm Ginger Tea",
        icon: <Coffee className="w-6 h-6" />,
        description: "Smoggy day? Ginger helps clear airways and reduce inflammation.",
        recipe: "Fresh ginger + honey + lemon + warm water",
        benefits: "Anti-inflammatory, clears mucus, soothes throat, boosts immunity",
        howTo: [
          "Slice 1-inch fresh ginger root",
          "Steep in hot water for 5-10 minutes",
          "Add 1 tsp honey and squeeze of lemon",
          "Sip slowly while warm"
        ]
      };
    }
    
    // Dry air day
    if (humidity < 40) {
      return {
        title: "Steam Inhalation Ritual",
        icon: <Droplets className="w-6 h-6" />,
        description: "Dry air? Steam helps humidify and soothe your airways.",
        recipe: "Hot water + eucalyptus oil (optional)",
        benefits: "Moisturizes airways, loosens mucus, opens nasal passages, relaxing",
        howTo: [
          "Boil water and pour into a large bowl",
          "Add 2-3 drops eucalyptus oil (optional)",
          "Lean over bowl with towel over head",
          "Breathe deeply for 5-10 minutes",
          "Keep eyes closed during steam"
        ]
      };
    }
    
    // High pollen day
    if (pollen === 'high' || pollen === 'very high') {
      return {
        title: "Nasal Rinse Routine",
        icon: <Wind className="w-6 h-6" />,
        description: "High pollen? Nasal rinsing removes allergens and provides relief.",
        recipe: "Saline solution (salt + warm water)",
        benefits: "Removes pollen, reduces congestion, prevents sinus infections, drug-free",
        howTo: [
          "Mix 1/4 tsp salt in 8 oz warm water",
          "Use neti pot or nasal rinse bottle",
          "Tilt head over sink at 45° angle",
          "Pour solution through one nostril",
          "Let it drain from other nostril",
          "Repeat on other side",
          "Blow nose gently"
        ]
      };
    }
    
    // Cold/winter day
    if (airQuality?.aqi && airQuality.aqi < 50) {
      return {
        title: "Turmeric Golden Milk",
        icon: <Flame className="w-6 h-6" />,
        description: "Clean air day! Boost your wellness with anti-inflammatory golden milk.",
        recipe: "Turmeric + milk + honey + cinnamon",
        benefits: "Anti-inflammatory, immune boost, antioxidants, promotes sleep",
        howTo: [
          "Warm 1 cup milk (dairy or plant-based)",
          "Add 1/2 tsp turmeric powder",
          "Add pinch of black pepper (enhances absorption)",
          "Add 1 tsp honey and dash of cinnamon",
          "Whisk well and enjoy warm"
        ]
      };
    }
    
    // Default: Green tea
    return {
      title: "Mint & Green Tea",
      icon: <Leaf className="w-6 h-6" />,
      description: "Balanced day — support your respiratory health with antioxidants.",
      recipe: "Green tea + fresh mint + honey",
      benefits: "Antioxidants, opens sinuses, anti-inflammatory, calming",
      howTo: [
        "Steep green tea bag in hot water (not boiling)",
        "Add 4-5 fresh mint leaves",
        "Steep for 3-5 minutes",
        "Add honey to taste",
        "Breathe in the steam before sipping"
      ]
    };
  };

  const tip = getTodaysTip();

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border-2 border-emerald-200 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-emerald-600 text-white p-3 rounded-full">
          {tip.icon}
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">🌿 Today's Wellness Recipe</h3>
          <p className="text-sm text-gray-600">{tip.description}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg p-5 mb-4">
        <h4 className="text-lg font-bold text-emerald-900 mb-2">{tip.title}</h4>
        <p className="text-gray-700 font-medium mb-3">
          <strong>Recipe:</strong> {tip.recipe}
        </p>
        
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-900 mb-2">✨ Benefits:</p>
          <p className="text-sm text-gray-700">{tip.benefits}</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-900 mb-2">📋 How to Make:</p>
          <ol className="space-y-2">
            {tip.howTo.map((step, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="font-bold text-emerald-600 flex-shrink-0">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="bg-emerald-100 rounded-lg p-4 border border-emerald-300">
        <p className="text-sm text-emerald-900">
          <strong>💚 Wellness Tip:</strong> Make this part of your daily ritual. 
          Consistency builds resilience against environmental challenges.
        </p>
      </div>
    </div>
  );
};

export default EnvironmentalRecoveryTips;
