import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Wind, 
  Heart, 
  Zap, 
  RefreshCw, 
  CheckCircle, 
  Play,
  Calendar,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { 
  morningMovementProgram, 
  getCurrentDayFlow, 
  isFlowCompletedToday,
  markFlowCompleted,
  getFlowStreak,
  type MorningFlow
} from '../data/morningMovementProgram';
import FlowAnimations from './FlowAnimations';
import ExerciseDetail from './ExerciseDetail';
import toast from 'react-hot-toast';

interface MorningMovementProgramProps {
  currentAQI?: number;
  pollenLevel?: string;
  isPremium?: boolean;
}

const MorningMovementProgram: React.FC<MorningMovementProgramProps> = ({ 
  currentAQI = 50, 
  pollenLevel = 'low',
  isPremium = false // Free users by default
}) => {
  const FREE_FLOW_LIMIT = 10; // First 10 flows are free
  const [currentFlow, setCurrentFlow] = useState<MorningFlow>(getCurrentDayFlow());
  const [isCompleted, setIsCompleted] = useState(isFlowCompletedToday());
  const [streak, setStreak] = useState(getFlowStreak());
  const [showAllFlows, setShowAllFlows] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<MorningFlow | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<{ exercise: string; index: number } | null>(null);

  useEffect(() => {
    setCurrentFlow(getCurrentDayFlow());
    setIsCompleted(isFlowCompletedToday());
    setStreak(getFlowStreak());
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'breathing': return <Wind className="w-5 h-5" />;
      case 'stretching': return <RefreshCw className="w-5 h-5" />;
      case 'balance': return <Heart className="w-5 h-5" />;
      case 'energy': return <Zap className="w-5 h-5" />;
      case 'recovery': return <Heart className="w-5 h-5" />;
      case 'integration': return <Sun className="w-5 h-5" />;
      default: return <Sun className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'breathing': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'stretching': return 'bg-green-100 text-green-800 border-green-300';
      case 'balance': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'energy': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'recovery': return 'bg-pink-100 text-pink-800 border-pink-300';
      case 'integration': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleCompleteFlow = () => {
    // Check if flow is locked
    if (!isPremium && currentFlow.day > FREE_FLOW_LIMIT) {
      toast.error('🔒 This flow is premium only. Upgrade to unlock all 30 days!', {
        duration: 4000
      });
      return;
    }
    
    markFlowCompleted();
    setIsCompleted(true);
    setStreak(getFlowStreak());
    toast.success(`🎉 Day ${currentFlow.day} completed! Keep up the momentum!`, {
      duration: 4000,
      icon: '✅'
    });
  };

  const isFlowLocked = (day: number) => {
    return !isPremium && day > FREE_FLOW_LIMIT;
  };

  const getAirQualityRecommendation = (flow: MorningFlow) => {
    if (!flow.outdoorRecommended) {
      return { safe: true, message: 'Indoor flow - safe for all conditions' };
    }
    
    if (flow.aqiThreshold && currentAQI > flow.aqiThreshold) {
      return { 
        safe: false, 
        message: `⚠️ AQI is ${currentAQI}. Recommended to do indoors today.` 
      };
    }
    
    return { 
      safe: true, 
      message: `✅ Air quality is good (AQI: ${currentAQI}). Safe for outdoor practice!` 
    };
  };

  const airQualityRec = getAirQualityRecommendation(currentFlow);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">🌞 30-Day Morning Movement</h2>
            <p className="text-white/90">Low-intensity flows for lung health & energy</p>
          </div>
          <Sun className="w-16 h-16 opacity-80" />
        </div>
        
        {/* Streak Display */}
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{streak.current}</div>
              <div className="text-sm text-white/80">Day Streak</div>
            </div>
            <div className="h-12 w-px bg-white/30"></div>
            <div className="text-center">
              <div className="text-3xl font-bold">{streak.longest}</div>
              <div className="text-sm text-white/80">Best Streak</div>
            </div>
          </div>
          <TrendingUp className="w-8 h-8 opacity-60" />
        </div>
      </div>

      {/* Today's Flow Card */}
      <div className={`bg-white rounded-xl shadow-lg p-8 border-2 ${isFlowLocked(currentFlow.day) ? 'border-gray-300 opacity-75' : 'border-purple-200'}`}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl font-bold text-purple-600">Day {currentFlow.day}</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border-2 ${getCategoryColor(currentFlow.category)} flex items-center gap-2`}>
                {getCategoryIcon(currentFlow.category)}
                {currentFlow.category}
              </span>
              {isFlowLocked(currentFlow.day) && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-700 border-2 border-gray-300">
                  🔒 Premium (Coming Soon)
                </span>
              )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{currentFlow.title}</h3>
            <p className="text-gray-600 italic">"{currentFlow.goal}"</p>
          </div>
          {isCompleted && !isFlowLocked(currentFlow.day) && (
            <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Completed!</span>
            </div>
          )}
        </div>

        {/* Animated Visual or Locked Overlay */}
        {isFlowLocked(currentFlow.day) ? (
          <div className="relative">
            <div className="filter blur-sm">
              <FlowAnimations category={currentFlow.category} visuals={currentFlow.visuals} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
              <div className="text-center text-white">
                <div className="text-6xl mb-4">🔒</div>
                <div className="text-2xl font-bold mb-2">Premium Feature</div>
                <div className="text-lg">Coming Soon</div>
              </div>
            </div>
          </div>
        ) : (
          <FlowAnimations category={currentFlow.category} visuals={currentFlow.visuals} />
        )}

        {/* Air Quality Alert */}
        {!airQualityRec.safe && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800">{airQualityRec.message}</p>
          </div>
        )}

        {/* Flow Details */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-blue-600 font-medium mb-1">Duration</div>
            <div className="text-2xl font-bold text-blue-900">{currentFlow.duration} min</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-sm text-purple-600 font-medium mb-1">Difficulty</div>
            <div className="text-2xl font-bold text-purple-900 capitalize">{currentFlow.difficulty}</div>
          </div>
        </div>

        {/* Moves */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Play className="w-5 h-5 text-purple-600" />
            Today's Moves
          </h4>
          <div className="space-y-2">
            {currentFlow.moves.map((move, index) => (
              <div 
                key={index} 
                className="flex items-start gap-3 bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-purple-50 hover:shadow-md transition-all duration-200 group"
                onClick={() => setSelectedExercise({ exercise: move, index })}
              >
                <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold group-hover:scale-110 transition-transform">
                  {index + 1}
                </span>
                <span className="text-gray-700 group-hover:text-purple-900 font-medium">{move}</span>
                <span className="ml-auto text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </div>
            ))}
          </div>
        </div>


        {/* Complete Button */}
        {!isCompleted && (
          <button
            onClick={handleCompleteFlow}
            disabled={isFlowLocked(currentFlow.day)}
            className={`w-full py-4 rounded-lg font-semibold transition-all shadow-md flex items-center justify-center gap-2 ${
              isFlowLocked(currentFlow.day)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
            }`}
          >
            {isFlowLocked(currentFlow.day) ? (
              <>
                🔒 Locked - Premium Only
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Mark as Completed
              </>
            )}
          </button>
        )}
      </div>

      {/* View All Flows Button */}
      <button
        onClick={() => setShowAllFlows(!showAllFlows)}
        className="w-full bg-white border-2 border-purple-200 text-purple-600 py-3 rounded-lg font-medium hover:bg-purple-50 transition-all flex items-center justify-center gap-2"
      >
        <Calendar className="w-5 h-5" />
        {showAllFlows ? 'Hide' : 'View'} All 30 Days
      </button>

      {/* All Flows Grid */}
      {showAllFlows && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Complete 30-Day Program
            <span className="text-sm font-normal text-gray-600 ml-3">
              ({FREE_FLOW_LIMIT} free, {morningMovementProgram.length - FREE_FLOW_LIMIT} premium)
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {morningMovementProgram.map((flow) => {
              const locked = isFlowLocked(flow.day);
              return (
                <button
                  key={flow.day}
                  onClick={() => !locked && setSelectedFlow(flow)}
                  disabled={locked}
                  className={`text-left p-4 rounded-lg border-2 transition-all ${
                    locked
                      ? 'border-gray-300 bg-gray-100 opacity-60 cursor-not-allowed'
                      : flow.day === currentFlow.day
                      ? 'border-purple-500 bg-purple-50 hover:shadow-md'
                      : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${locked ? 'text-gray-500' : 'text-purple-600'}`}>
                        Day {flow.day}
                      </span>
                      {locked && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                          🔒 Premium
                        </span>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      locked ? 'bg-gray-200 text-gray-600' : getCategoryColor(flow.category)
                    }`}>
                      {flow.duration}m
                    </span>
                  </div>
                  <h4 className={`font-semibold text-sm mb-1 ${locked ? 'text-gray-600' : 'text-gray-900'}`}>
                    {flow.title}
                  </h4>
                  <p className={`text-xs line-clamp-2 ${locked ? 'text-gray-500' : 'text-gray-600'}`}>
                    {flow.goal}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Flow Modal */}
      {selectedFlow && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedFlow(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl font-bold text-purple-600">Day {selectedFlow.day}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border-2 ${getCategoryColor(selectedFlow.category)}`}>
                    {selectedFlow.category}
                  </span>
                  {isFlowLocked(selectedFlow.day) && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-700 border-2 border-gray-300">
                      🔒 Premium (Coming Soon)
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedFlow.title}</h3>
                <p className="text-gray-600 italic">"{selectedFlow.goal}"</p>
              </div>
              <button
                onClick={() => setSelectedFlow(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Animated Visual in Modal or Locked Overlay */}
              {isFlowLocked(selectedFlow.day) ? (
                <div className="relative">
                  <div className="filter blur-sm">
                    <FlowAnimations category={selectedFlow.category} visuals={selectedFlow.visuals} />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
                    <div className="text-center text-white">
                      <div className="text-6xl mb-4">🔒</div>
                      <div className="text-2xl font-bold mb-2">Premium Feature</div>
                      <div className="text-lg">Coming Soon</div>
                    </div>
                  </div>
                </div>
              ) : (
                <FlowAnimations category={selectedFlow.category} visuals={selectedFlow.visuals} />
              )}

              <div className="flex gap-4">
                <div className="bg-blue-50 rounded-lg p-3 flex-1">
                  <div className="text-sm text-blue-600 font-medium">Duration</div>
                  <div className="text-xl font-bold text-blue-900">{selectedFlow.duration} min</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 flex-1">
                  <div className="text-sm text-purple-600 font-medium">Difficulty</div>
                  <div className="text-xl font-bold text-purple-900 capitalize">{selectedFlow.difficulty}</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Moves:</h4>
                <div className="space-y-2">
                  {selectedFlow.moves.map((move, index) => (
                    <div key={index} className="flex items-start gap-2 text-gray-700">
                      <span className="text-purple-600 font-bold">{index + 1}.</span>
                      <span>{move}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Program Info */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-3">🌿 Program Features</h4>
        <ul className="space-y-2 text-blue-800 text-sm">
          <li>✅ Synced to your local AQI and pollen data</li>
          <li>✅ Indoor/Outdoor versions based on air quality</li>
          <li>✅ Progress tracker with streak rewards</li>
          <li>✅ Safe for all ages and fitness levels</li>
          <li>✅ 5-10 minute flows perfect for busy mornings</li>
          <li>🎁 <strong>First {FREE_FLOW_LIMIT} days FREE</strong> - Days {FREE_FLOW_LIMIT + 1}-30 coming soon with premium</li>
        </ul>
      </div>

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <ExerciseDetail
          exercise={selectedExercise.exercise}
          index={selectedExercise.index}
          onClose={() => setSelectedExercise(null)}
        />
      )}
    </div>
  );
};

export default MorningMovementProgram;
