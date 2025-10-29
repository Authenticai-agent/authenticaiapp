import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, AlertTriangle, Wind, Droplets, Home, Coffee, Play, Pause, Check } from 'lucide-react';
import './PollutionDefenseProtocol.css';

interface PollutionDefenseProtocolProps {
  airQuality?: {
    aqi?: number;
    pm25?: number;
    ozone?: number;
    no2?: number;
    category?: string;
  };
  userProfile?: {
    hasAsthma?: boolean;
    hasCOPD?: boolean;
    hasAllergies?: boolean;
    age?: number;
  };
}

type Phase = 'pre' | 'during' | 'post' | 'completed';

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  required?: boolean;
}

const PollutionDefenseProtocol: React.FC<PollutionDefenseProtocolProps> = ({ 
  airQuality,
  userProfile 
}) => {
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<Phase>('pre');
  const [walkTimer, setWalkTimer] = useState(0);
  const [isWalking, setIsWalking] = useState(false);
  const [reminderCount, setReminderCount] = useState(0);
  
  // Checklists
  const [preChecklist, setPreChecklist] = useState<ChecklistItem[]>([
    { id: 'mask', label: 'Wear fitted N95/FFP2 mask (seal check)', checked: false, required: true },
    { id: 'eyewear', label: 'Sunglasses/eyewear to reduce irritation', checked: false },
    { id: 'route', label: 'Pick side streets/park edge; stay off curb', checked: false },
    { id: 'timing', label: 'Avoid rush hour if possible', checked: false }
  ]);
  
  const [postChecklist, setPostChecklist] = useState<ChecklistItem[]>([
    { id: 'wash', label: 'Wash hands and face', checked: false },
    { id: 'eyes', label: 'Rinse eyes if irritated', checked: false },
    { id: 'clothes', label: 'Change outer layer if dusty', checked: false }
  ]);

  const [symptoms, setSymptoms] = useState({
    cough: false,
    wheeze: false,
    fatigue: false,
    feeling: 3
  });

  // Check if protocol should be triggered
  const shouldTrigger = () => {
    const aqi = airQuality?.aqi || 0;
    const pm25 = airQuality?.pm25 || 0;
    const ozone = airQuality?.ozone || 0;
    
    return aqi > 100 || pm25 > 35 || ozone > 70;
  };

  // Get severity level
  const getSeverity = (): 'high' | 'moderate' | 'low' => {
    const aqi = airQuality?.aqi || 0;
    if (aqi > 150) return 'high';
    if (aqi > 100) return 'moderate';
    return 'low';
  };

  // Check if user is sensitive
  const isSensitive = () => {
    return userProfile?.hasAsthma || 
           userProfile?.hasCOPD || 
           userProfile?.hasAllergies || 
           (userProfile?.age && userProfile.age >= 65);
  };

  // Walk mode timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isWalking) {
      interval = setInterval(() => {
        setWalkTimer(prev => prev + 1);
        
        // Show reminder every 5 minutes
        if (walkTimer > 0 && walkTimer % 300 === 0) {
          setReminderCount(prev => prev + 1);
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isWalking, walkTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleChecklistItem = (phase: 'pre' | 'post', id: string) => {
    if (phase === 'pre') {
      setPreChecklist(prev => 
        prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item)
      );
    } else {
      setPostChecklist(prev => 
        prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item)
      );
    }
  };

  const canProceedFromPre = () => {
    return preChecklist.filter(item => item.required).every(item => item.checked);
  };

  const startWalkMode = () => {
    setCurrentPhase('during');
    setIsWalking(true);
    setWalkTimer(0);
  };

  const endWalkMode = () => {
    setIsWalking(false);
    setCurrentPhase('post');
  };

  const completeProtocol = () => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('pollution_defense_completed', today);
    
    // Save symptom check
    localStorage.setItem('pollution_defense_symptoms', JSON.stringify({
      date: today,
      ...symptoms
    }));
    
    setCurrentPhase('completed');
  };

  if (!shouldTrigger() && !isActive) {
    return (
      <div className="pollution-defense-inactive">
        <div className="inactive-card">
          <Shield className="w-12 h-12 text-green-600 mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Air Quality is Good
          </h3>
          <p className="text-gray-600 text-sm">
            No pollution defense needed today. Enjoy your outdoor activities!
          </p>
          <button
            onClick={() => setIsActive(true)}
            className="mt-4 text-sm text-blue-600 hover:text-blue-700 underline"
          >
            Activate protocol anyway
          </button>
        </div>
      </div>
    );
  }

  const severity = getSeverity();
  const aqi = airQuality?.aqi || 0;
  const aqiLabel = airQuality?.category || 'Unhealthy';

  return (
    <div className={`pollution-defense-protocol ${severity}`}>
      {/* Alert Header */}
      <div className="protocol-header">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="w-6 h-6 text-orange-600" />
          <h2 className="text-xl font-bold text-gray-900">
            🌫️ Pollution Defense Mode
          </h2>
        </div>
        <div className="air-quality-status">
          <p className="text-sm font-semibold">
            Air is {aqiLabel} (AQI {aqi})
          </p>
          {isSensitive() && (
            <p className="text-xs text-red-600 mt-1">
              ⚠️ Extra care recommended for sensitive individuals
            </p>
          )}
        </div>
      </div>

      {/* Phase: Pre-Exposure */}
      {currentPhase === 'pre' && (
        <div className="protocol-phase pre-exposure">
          <div className="phase-header">
            <h3 className="phase-title">Before You Go (2–3 min)</h3>
            <p className="phase-subtitle">Prepare & Protect</p>
          </div>

          {/* Air Quality Info */}
          <div className="info-card">
            <h4 className="font-semibold text-gray-900 mb-2">Current Air Quality</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>AQI: <strong>{aqi}</strong></div>
              <div>PM2.5: <strong>{airQuality?.pm25?.toFixed(1) || 'N/A'} µg/m³</strong></div>
              {airQuality?.ozone && <div>O₃: <strong>{airQuality.ozone} ppb</strong></div>}
              {airQuality?.no2 && <div>NO₂: <strong>{airQuality.no2} ppb</strong></div>}
            </div>
          </div>

          {/* Gear Checklist */}
          <div className="checklist-card">
            <h4 className="font-semibold text-gray-900 mb-3">✅ Quick Prep</h4>
            <div className="space-y-2">
              {preChecklist.map(item => (
                <label key={item.id} className="checklist-item">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleChecklistItem('pre', item.id)}
                    className="checkbox"
                  />
                  <span className={item.checked ? 'checked' : ''}>
                    {item.label}
                    {item.required && <span className="text-red-600 ml-1">*</span>}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Hydration */}
          <div className="action-card">
            <Droplets className="w-5 h-5 text-blue-600" />
            <div>
              <h4 className="font-semibold text-gray-900">Hydrate</h4>
              <p className="text-sm text-gray-600">
                Drink water with lemon, green tea, or plain water (250-350ml)
              </p>
            </div>
          </div>

          {/* Snack */}
          <div className="action-card">
            <Coffee className="w-5 h-5 text-orange-600" />
            <div>
              <h4 className="font-semibold text-gray-900">Antioxidant Snack</h4>
              <p className="text-sm text-gray-600">
                Orange, kiwi, berries, or apple + almonds
              </p>
            </div>
          </div>

          {/* Breathing Tip */}
          <div className="tip-card">
            <p className="text-sm">
              <strong>💨 Breathing Plan:</strong> During the walk, breathe through your nose and keep an easy-moderate pace.
            </p>
          </div>

          <button
            onClick={startWalkMode}
            disabled={!canProceedFromPre()}
            className="primary-button"
          >
            <Play className="w-5 h-5" />
            Start Walk Mode
          </button>
        </div>
      )}

      {/* Phase: During Exposure */}
      {currentPhase === 'during' && (
        <div className="protocol-phase during-exposure">
          <div className="phase-header">
            <h3 className="phase-title">During Your Walk</h3>
            <div className="walk-timer">{formatTime(walkTimer)}</div>
          </div>

          {/* Active Reminders */}
          <div className="reminder-cards">
            <div className="reminder-card">
              <Wind className="w-6 h-6 text-blue-600" />
              <div>
                <h4 className="font-semibold">Nasal Breathing</h4>
                <p className="text-sm text-gray-600">
                  Inhale through nose, relaxed pace. Nose filters ~30% of particulates.
                </p>
              </div>
            </div>

            <div className="reminder-card">
              <Shield className="w-6 h-6 text-green-600" />
              <div>
                <h4 className="font-semibold">Micro-Route Tips</h4>
                <p className="text-sm text-gray-600">
                  Stay 1-2m from curb • Avoid idling vehicles • Walk on upwind side
                </p>
              </div>
            </div>

            {reminderCount > 0 && (
              <div className="reminder-card highlight">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
                <div>
                  <h4 className="font-semibold">5-Minute Check</h4>
                  <p className="text-sm text-gray-600">
                    How are you feeling? Slow pace if needed. Stay mindful of your breathing.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Pause Option */}
          <div className="pause-card">
            <h4 className="font-semibold mb-2">60-Second Calm Pause (Optional)</h4>
            <ol className="text-sm text-gray-700 space-y-1">
              <li>1. Relax shoulders</li>
              <li>2. 4-second inhale (nose)</li>
              <li>3. 6-second exhale (nose/hum)</li>
              <li>4. Repeat x5</li>
            </ol>
          </div>

          <div className="button-group">
            {isWalking ? (
              <button onClick={() => setIsWalking(false)} className="secondary-button">
                <Pause className="w-5 h-5" />
                Pause Timer
              </button>
            ) : (
              <button onClick={() => setIsWalking(true)} className="secondary-button">
                <Play className="w-5 h-5" />
                Resume Timer
              </button>
            )}
            <button onClick={endWalkMode} className="primary-button">
              <Check className="w-5 h-5" />
              I'm Done
            </button>
          </div>
        </div>
      )}

      {/* Phase: Post-Exposure */}
      {currentPhase === 'post' && (
        <div className="protocol-phase post-exposure">
          <div className="phase-header">
            <h3 className="phase-title">After You Return (4–6 min)</h3>
            <p className="phase-subtitle">Detox & Recovery</p>
          </div>

          {/* Cleanup Checklist */}
          <div className="checklist-card">
            <h4 className="font-semibold text-gray-900 mb-3">🚿 Quick Clean</h4>
            <div className="space-y-2">
              {postChecklist.map(item => (
                <label key={item.id} className="checklist-item">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleChecklistItem('post', item.id)}
                    className="checkbox"
                  />
                  <span className={item.checked ? 'checked' : ''}>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Lung Recovery */}
          <div className="recovery-card">
            <h4 className="font-semibold text-gray-900 mb-2">🫁 Lung Recovery (3 min)</h4>
            <div className="breathing-sequence">
              <div className="sequence-step">
                <strong>Box Breathing (4 cycles):</strong>
                <p className="text-sm">Inhale 4 • Hold 4 • Exhale 4 • Hold 4</p>
              </div>
              <div className="sequence-step">
                <strong>Humming Breath (5 cycles):</strong>
                <p className="text-sm">Inhale 3 • Exhale 6 with "mmm" sound</p>
              </div>
            </div>
          </div>

          {/* Rehydrate */}
          <div className="action-card">
            <Droplets className="w-5 h-5 text-blue-600" />
            <div>
              <h4 className="font-semibold text-gray-900">Re-hydrate</h4>
              <p className="text-sm text-gray-600">
                Water, turmeric-ginger tea, or peppermint tea (250-350ml)
              </p>
            </div>
          </div>

          {/* Nutrition */}
          <div className="nutrition-card">
            <h4 className="font-semibold text-gray-900 mb-2">🥗 Post-Pollution Meal</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Leafy salad + citrus + olive oil + walnuts</li>
              <li>• Steamed broccoli + salmon/tofu + brown rice</li>
              <li>• Berry yogurt bowl + chia/flax</li>
            </ul>
          </div>

          {/* Home Air Reset */}
          <div className="action-card">
            <Home className="w-5 h-5 text-purple-600" />
            <div>
              <h4 className="font-semibold text-gray-900">Home Air Reset</h4>
              <p className="text-sm text-gray-600">
                Run HEPA purifier 60-120 min • Ventilate if outdoor AQI &lt; 80
              </p>
            </div>
          </div>

          {/* Symptom Check */}
          <div className="symptom-check">
            <h4 className="font-semibold text-gray-900 mb-3">How do you feel now?</h4>
            
            <div className="feeling-scale mb-4">
              <label className="text-sm text-gray-700 mb-2 block">Overall feeling:</label>
              <input
                type="range"
                min="1"
                max="5"
                value={symptoms.feeling}
                onChange={(e) => setSymptoms({...symptoms, feeling: parseInt(e.target.value)})}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Great</span>
                <span>Not good</span>
              </div>
            </div>

            <div className="symptom-checkboxes space-y-2">
              <label className="checklist-item">
                <input
                  type="checkbox"
                  checked={symptoms.cough}
                  onChange={(e) => setSymptoms({...symptoms, cough: e.target.checked})}
                  className="checkbox"
                />
                <span>Cough/irritation</span>
              </label>
              <label className="checklist-item">
                <input
                  type="checkbox"
                  checked={symptoms.wheeze}
                  onChange={(e) => setSymptoms({...symptoms, wheeze: e.target.checked})}
                  className="checkbox"
                />
                <span>Wheezing</span>
              </label>
              <label className="checklist-item">
                <input
                  type="checkbox"
                  checked={symptoms.fatigue}
                  onChange={(e) => setSymptoms({...symptoms, fatigue: e.target.checked})}
                  className="checkbox"
                />
                <span>Fatigue</span>
              </label>
            </div>

            {(symptoms.wheeze || symptoms.feeling >= 4) && (
              <div className="emergency-notice">
                <AlertTriangle className="w-5 h-5" />
                <p className="text-sm">
                  <strong>Take Extra Care:</strong> If symptoms escalate, seek medical advice.
                </p>
              </div>
            )}
          </div>

          <button onClick={completeProtocol} className="primary-button">
            <CheckCircle className="w-5 h-5" />
            Save Recovery
          </button>
        </div>
      )}

      {/* Phase: Completed */}
      {currentPhase === 'completed' && (
        <div className="protocol-phase completed">
          <div className="completion-card">
            <CheckCircle className="w-16 h-16 text-green-600 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Protocol Complete! 🎉
            </h3>
            <p className="text-gray-600 mb-4">
              You've successfully protected yourself and recovered from pollution exposure.
              You're building long-term resilience — one mindful step at a time.
            </p>
            <div className="stats-grid">
              <div className="stat">
                <p className="text-2xl font-bold text-blue-600">{formatTime(walkTimer)}</p>
                <p className="text-sm text-gray-600">Walk Duration</p>
              </div>
              <div className="stat">
                <p className="text-2xl font-bold text-green-600">{symptoms.feeling}/5</p>
                <p className="text-sm text-gray-600">Feeling Score</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsActive(false);
                setCurrentPhase('pre');
                setWalkTimer(0);
              }}
              className="secondary-button mt-4"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PollutionDefenseProtocol;
