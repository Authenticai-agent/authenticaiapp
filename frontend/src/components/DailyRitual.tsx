import React, { useState, useEffect } from 'react';
import { Wind, Activity, Shield, CheckCircle, Play, Pause } from 'lucide-react';
import ProfessionalAvatar from './ProfessionalAvatar';
import { trackDailyRitual } from '../utils/analyticsCollector';
import './DailyRitual.css';
import './ProfessionalAvatar.css';

interface DailyRitualProps {
  airQuality?: {
    aqi?: number;
    pm25?: number;
    humidity?: number;
    category?: string;
  };
}

type RitualStep = 'breathe' | 'move' | 'protect';

const DailyRitual: React.FC<DailyRitualProps> = ({ airQuality }) => {
  const [currentStep, setCurrentStep] = useState<RitualStep | null>(null);
  const [completedSteps, setCompletedSteps] = useState<RitualStep[]>([]);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [ritualCompleted, setRitualCompleted] = useState(false);

  // Check if ritual was completed today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const lastCompleted = localStorage.getItem('daily_ritual_completed');
    if (lastCompleted === today) {
      setRitualCompleted(true);
      setCompletedSteps(['breathe', 'move', 'protect']);
    }
  }, []);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((time) => time - 1);
      }, 1000);
    } else if (timer === 0 && isActive && currentStep) {
      setIsActive(false);
      handleStepComplete(currentStep);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timer, currentStep]);

  const startStep = (step: RitualStep, duration: number) => {
    setCurrentStep(step);
    setTimer(duration);
    setIsActive(true);
    
    // Track analytics
    trackDailyRitual.started(step, airQuality);
  };

  const pauseStep = () => {
    setIsActive(false);
  };

  const resumeStep = () => {
    setIsActive(true);
  };

  const handleStepComplete = (step: RitualStep) => {
    if (!completedSteps.includes(step)) {
      const newCompleted = [...completedSteps, step];
      setCompletedSteps(newCompleted);
      
      // Track phase completion
      const duration = step === 'breathe' ? 120 : step === 'move' ? 180 : 120;
      trackDailyRitual.phaseCompleted(step, duration - timer, airQuality);
      
      // Check if all steps completed
      if (newCompleted.length === 3) {
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem('daily_ritual_completed', today);
        setRitualCompleted(true);
        
        // Update streak
        const streakData = updateRitualStreak();
        
        // Track ritual completion
        trackDailyRitual.completed(420, streakData.count, airQuality);
      }
    }
    setCurrentStep(null);
  };

  const updateRitualStreak = () => {
    try {
      const stored = localStorage.getItem('daily_ritual_streak');
      const streakData = stored ? JSON.parse(stored) : { count: 0, lastDate: null };
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      if (streakData.lastDate === yesterday || streakData.lastDate === null) {
        streakData.count += 1;
      } else if (streakData.lastDate !== today) {
        streakData.count = 1;
      }
      
      streakData.lastDate = today;
      localStorage.setItem('daily_ritual_streak', JSON.stringify(streakData));
      return streakData;
    } catch (error) {
      console.error('Error updating ritual streak:', error);
      return { count: 0, lastDate: null };
    }
  };

  const getBreathingGuidance = () => {
    const aqi = airQuality?.aqi || 50;
    const humidity = airQuality?.humidity || 50;
    
    if (aqi > 100) {
      return {
        title: "Gentle Breathing",
        description: "Today's air is heavy. Let's do gentle, protective breathing.",
        technique: "4-4-4 breathing: Inhale 4 counts, hold 4, exhale 4",
        duration: 120
      };
    } else if (humidity < 40) {
      return {
        title: "Humidifying Breath",
        description: "Air is dry today. Let's humidify your airways with slow breaths.",
        technique: "Take 8 slow, deep inhales through your nose",
        duration: 120
      };
    } else {
      return {
        title: "Energizing Breath",
        description: "Air quality is good! Let's energize with deep breathing.",
        technique: "Box breathing: Inhale 4, hold 4, exhale 4, hold 4",
        duration: 120
      };
    }
  };

  const getMovementGuidance = () => {
    const aqi = airQuality?.aqi || 50;
    
    if (aqi > 100) {
      return {
        title: "Gentle Stretches",
        description: "Light indoor movements to keep your body flowing.",
        movements: ["Neck rolls", "Shoulder shrugs", "Gentle twists", "Arm circles"],
        duration: 180
      };
    } else {
      return {
        title: "Morning Flow",
        description: "Perfect day for energizing movements!",
        movements: ["Sun salutations", "Cat-cow stretches", "Standing twists", "Forward folds"],
        duration: 180
      };
    }
  };

  const getProtectionGuidance = () => {
    const aqi = airQuality?.aqi || 50;
    const pm25 = airQuality?.pm25 || 0;
    
    if (aqi > 100 || pm25 > 35) {
      return {
        title: "High Protection Mode",
        actions: [
          "✓ Keep windows closed",
          "✓ Turn on air purifier",
          "✓ Stay hydrated - drink warm water",
          "✓ Avoid outdoor exercise"
        ],
        tip: "Consider wearing a mask if you need to go outside."
      };
    } else {
      return {
        title: "Fresh Air Routine",
        actions: [
          "✓ Open windows for 10 minutes",
          "✓ Let fresh air circulate",
          "✓ Drink a glass of water",
          "✓ Perfect day for outdoor activities"
        ],
        tip: "Great day to connect with nature!"
      };
    }
  };

  const breathingGuide = getBreathingGuidance();
  const movementGuide = getMovementGuidance();
  const protectionGuide = getProtectionGuidance();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (ritualCompleted) {
    return (
      <div className="daily-ritual-card completed">
        <div className="ritual-header">
          <h2 className="ritual-title">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Daily Ritual Complete! 🎉
          </h2>
        </div>
        <div className="completion-message">
          <p className="text-lg font-semibold text-gray-900 mb-2">
            Amazing work! You've completed your morning ritual.
          </p>
          <p className="text-gray-600">
            You breathed deeply, moved mindfully, and protected your wellness. 
            Come back tomorrow for your next ritual!
          </p>
          <button
            onClick={() => {
              setRitualCompleted(false);
              setCompletedSteps([]);
              localStorage.removeItem('daily_ritual_completed');
            }}
            className="mt-4 text-sm text-purple-600 hover:text-purple-700 underline"
          >
            Practice again (for testing)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="daily-ritual-card">
      <div className="ritual-header">
        <h2 className="ritual-title">☀️ Your Daily Ritual</h2>
        <p className="ritual-subtitle">Breathe, Move, Protect — 7 minutes to wellness</p>
      </div>

      {!currentStep ? (
        <div className="ritual-steps">
          {/* Step 1: Breathe */}
          <div className={`ritual-step ${completedSteps.includes('breathe') ? 'completed' : ''}`}>
            <div className="step-icon breathe-icon">
              {completedSteps.includes('breathe') ? (
                <CheckCircle className="w-8 h-8" />
              ) : (
                <Wind className="w-8 h-8" />
              )}
            </div>
            <div className="step-content">
              <h3 className="step-title">1. Breathe (2 min)</h3>
              <p className="step-description">{breathingGuide.description}</p>
              <p className="step-technique">{breathingGuide.technique}</p>
            </div>
            {!completedSteps.includes('breathe') && (
              <button
                onClick={() => startStep('breathe', breathingGuide.duration)}
                className="step-button breathe-button"
              >
                <Play className="w-4 h-4" />
                Start
              </button>
            )}
          </div>

          {/* Step 2: Move */}
          <div className={`ritual-step ${completedSteps.includes('move') ? 'completed' : ''}`}>
            <div className="step-icon move-icon">
              {completedSteps.includes('move') ? (
                <CheckCircle className="w-8 h-8" />
              ) : (
                <Activity className="w-8 h-8" />
              )}
            </div>
            <div className="step-content">
              <h3 className="step-title">2. Move (3 min)</h3>
              <p className="step-description">{movementGuide.description}</p>
              <ul className="movement-list">
                {movementGuide.movements.map((move, idx) => (
                  <li key={idx}>• {move}</li>
                ))}
              </ul>
            </div>
            {!completedSteps.includes('move') && (
              <button
                onClick={() => startStep('move', movementGuide.duration)}
                className="step-button move-button"
              >
                <Play className="w-4 h-4" />
                Start
              </button>
            )}
          </div>

          {/* Step 3: Protect */}
          <div className={`ritual-step ${completedSteps.includes('protect') ? 'completed' : ''}`}>
            <div className="step-icon protect-icon">
              {completedSteps.includes('protect') ? (
                <CheckCircle className="w-8 h-8" />
              ) : (
                <Shield className="w-8 h-8" />
              )}
            </div>
            <div className="step-content">
              <h3 className="step-title">3. Protect (2 min)</h3>
              <p className="step-description">Mindful environmental scan</p>
              <ul className="protection-list">
                {protectionGuide.actions.map((action, idx) => (
                  <li key={idx}>{action}</li>
                ))}
              </ul>
              <p className="protection-tip">💡 {protectionGuide.tip}</p>
            </div>
            {!completedSteps.includes('protect') && (
              <button
                onClick={() => startStep('protect', 120)}
                className="step-button protect-button"
              >
                <Play className="w-4 h-4" />
                Start
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="ritual-active">
          <div className="active-step-header">
            <h3 className="active-step-title">
              {currentStep === 'breathe' && '🫁 Breathing Practice'}
              {currentStep === 'move' && '🧘 Movement Flow'}
              {currentStep === 'protect' && '🛡️ Protection Scan'}
            </h3>
            <div className="timer">{formatTime(timer)}</div>
          </div>

          <div className="active-step-content">
            {currentStep === 'breathe' && (
              <div className="breathing-practice">
                <div className="avatar-container">
                  <ProfessionalAvatar pose="breathing" animation="belly-breathing-animation" color="#60a5fa" />
                </div>
                <div className="practice-instructions">
                  <p className="text-lg font-semibold mb-2">{breathingGuide.technique}</p>
                  <p className="text-gray-600">Follow the avatar's breathing rhythm. Breathe deeply and slowly.</p>
                </div>
              </div>
            )}

            {currentStep === 'move' && (
              <div className="movement-practice">
                <div className="avatar-container">
                  <ProfessionalAvatar pose="stretching" animation="arms-fold-animation" color="#34d399" />
                </div>
                <div className="practice-instructions">
                  <p className="text-lg font-semibold mb-2">Gentle movements</p>
                  <ul className="space-y-1">
                    {movementGuide.movements.map((move, idx) => (
                      <li key={idx} className="text-gray-700">• {move}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {currentStep === 'protect' && (
              <div className="protection-practice">
                <div className="protection-checklist">
                  {protectionGuide.actions.map((action, idx) => (
                    <div key={idx} className="checklist-item">
                      <span className="text-lg">{action}</span>
                    </div>
                  ))}
                </div>
                <p className="protection-reminder mt-4 text-center text-gray-600">
                  Take a moment to notice your environment and make these adjustments.
                </p>
              </div>
            )}
          </div>

          <div className="active-step-controls">
            {isActive ? (
              <button onClick={pauseStep} className="control-button pause-button">
                <Pause className="w-5 h-5" />
                Pause
              </button>
            ) : (
              <button onClick={resumeStep} className="control-button resume-button">
                <Play className="w-5 h-5" />
                Resume
              </button>
            )}
            <button
              onClick={() => handleStepComplete(currentStep)}
              className="control-button complete-button"
            >
              <CheckCircle className="w-5 h-5" />
              Complete
            </button>
          </div>
        </div>
      )}

      {completedSteps.length > 0 && completedSteps.length < 3 && !currentStep && (
        <div className="progress-indicator">
          <p className="text-sm text-gray-600">
            {completedSteps.length} of 3 steps completed — keep going! 💪
          </p>
        </div>
      )}
    </div>
  );
};

export default DailyRitual;
