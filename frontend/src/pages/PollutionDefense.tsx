import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../hooks/useLocation';
import { 
  Shield, Wind, Droplets, Apple, Heart, CheckCircle, 
  Clock, MapPin, Sparkles, Activity, Home
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

type Phase = 'check' | 'pre' | 'during' | 'post';

interface AirQuality {
  aqi: number;
  pm25: number;
  o3: number;
  no2: number;
  severity: string;
  label: string;
  location: {
    lat: number;
    lon: number;
  };
}

interface ActivationData {
  should_activate: boolean;
  air_quality: AirQuality | null;
  user_sensitivity: {
    is_sensitive: boolean;
    asthma_severity?: string;
  };
  message: string;
}

const PollutionDefense: React.FC = () => {
  const { user } = useAuth();
  const { currentLocation, isTemporary } = useLocation();
  const [phase, setPhase] = useState<Phase>('check');
  const [loading, setLoading] = useState(false);
  const [activationData, setActivationData] = useState<ActivationData | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [walkStartTime, setWalkStartTime] = useState<Date | null>(null);
  
  // Checklist states
  const [checklist, setChecklist] = useState({
    mask: false,
    eyewear: false,
    route: false,
    timing: false,
    hydrated: false,
    snack: false
  });
  
  // Symptom check states
  const [symptoms, setSymptoms] = useState({
    cough: false,
    wheeze: false,
    fatigue: false,
    eye_irritation: false,
    throat_irritation: false,
    overall_feeling: 3
  });
  
  // Recovery checklist
  const [recovery, setRecovery] = useState({
    washed: false,
    changed_clothes: false,
    breathing_exercise: false,
    hydrated: false,
    air_purifier: false
  });

  // Symptom recommendation state
  const [symptomRecommendation, setSymptomRecommendation] = useState<{
    message: string;
    severe: boolean;
  } | null>(null);

  // Completed protocol state
  const [completedProtocol, setCompletedProtocol] = useState<{
    date: string;
    checklist: typeof checklist;
    walkStartTime: Date | null;
    recovery: typeof recovery;
    symptoms: typeof symptoms;
    recommendation: string;
  } | null>(null);

  useEffect(() => {
    // Load today's protocol if it exists
    loadTodayProtocol();
    
    // Only check activation if we have a location
    if (currentLocation) {
      checkActivation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, currentLocation]); // Trigger when user OR location changes

  const loadTodayProtocol = () => {
    try {
      const protocols = JSON.parse(localStorage.getItem('pollution_defense_protocols') || '[]');
      const today = new Date().toISOString().split('T')[0];
      
      // Find protocol from today
      const todayProtocol = protocols.find((p: any) => {
        const protocolDate = new Date(p.date).toISOString().split('T')[0];
        return protocolDate === today;
      });

      if (todayProtocol) {
        // Restore the completed protocol state
        setCompletedProtocol(todayProtocol);
        setSymptomRecommendation({
          message: todayProtocol.recommendation,
          severe: todayProtocol.severe_symptoms || false
        });
        setPhase('post'); // Show the completion screen
        
        // Restore all the data
        if (todayProtocol.checklist) setChecklist(todayProtocol.checklist);
        if (todayProtocol.recovery) setRecovery(todayProtocol.recovery);
        if (todayProtocol.symptoms) setSymptoms(todayProtocol.symptoms);
        if (todayProtocol.walkStartTime) setWalkStartTime(new Date(todayProtocol.walkStartTime));
      }
    } catch (error) {
      console.error('Error loading today\'s protocol:', error);
    }
  };

  // Auto-reminder during walk phase
  useEffect(() => {
    if (phase === 'during' && walkStartTime) {
      const interval = setInterval(() => {
        showWalkReminder();
      }, 5 * 60 * 1000); // Every 5 minutes

      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, walkStartTime]);

  const checkActivation = async () => {
    if (!currentLocation) {
      // Don't show error - the UI will display location setup screen
      return;
    }

    console.log('🔍 Checking activation with location:', {
      lat: currentLocation.lat,
      lon: currentLocation.lon,
      user_id: user?.id
    });

    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/pollution-defense/should-activate`, {
        params: {
          user_id: user?.id,
          lat: currentLocation.lat,
          lon: currentLocation.lon
        }
      });

      console.log('📊 API Response:', response.data);
      setActivationData(response.data);
      
      // Don't show toast - information will be displayed on screen
    } catch (error) {
      console.error('Error checking activation:', error);
      // Don't show toast - will show error on screen
    } finally {
      setLoading(false);
    }
  };

  const startSession = async () => {
    if (!activationData?.air_quality || !user) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/pollution-defense/session/start`, {
        user_id: user.id,
        phase: 'pre_exposure',
        aqi: activationData.air_quality.aqi,
        pm25: activationData.air_quality.pm25,
        o3: activationData.air_quality.o3,
        location: user.location,
        checklist_completed: checklist
      });

      setSessionId(response.data.session_id);
      setPhase('pre');
      // Removed toast - status shown on screen
    } catch (error) {
      console.error('Error starting session:', error);
      // Session tracking is optional - continue anyway
    }
  };

  const startWalk = async () => {
    // No backend call needed - just update UI state
    const now = new Date();
    setWalkStartTime(now);
    setPhase('during');
  };

  const showWalkReminder = () => {
    // Reminders are now shown permanently on screen during walk phase
    // No need for toast notifications
  };

  const completeWalk = async () => {
    // No backend call needed - just update UI state
    setPhase('post');
  };

  const submitSymptomCheck = async () => {
    if (!sessionId || !user) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/pollution-defense/symptom-check`, {
        user_id: user.id,
        session_id: sessionId,
        ...symptoms
      });

      // Store recommendation in state instead of showing toast
      setSymptomRecommendation({
        message: response.data.recommendation,
        severe: response.data.severe_symptoms || false
      });

      // Mark protocol as completed and store for 3 days
      const now = new Date();
      const completedData = {
        date: now.toISOString(),
        checklist,
        walkStartTime,
        recovery,
        symptoms,
        recommendation: response.data.recommendation,
        severe_symptoms: response.data.severe_symptoms || false,
        aqi: activationData?.air_quality?.aqi,
        location: currentLocation
      };

      // Store in localStorage for 3 days
      const existingProtocols = JSON.parse(localStorage.getItem('pollution_defense_protocols') || '[]');
      
      // Remove protocols older than 3 days
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      const recentProtocols = existingProtocols.filter((p: any) => 
        new Date(p.date) > threeDaysAgo
      );
      
      // Add new protocol
      recentProtocols.push(completedData);
      localStorage.setItem('pollution_defense_protocols', JSON.stringify(recentProtocols));

      // Set completed state
      setCompletedProtocol(completedData);

      // Send to analytics
      try {
        await axios.post(`${API_BASE_URL}/analytics/pollution-defense`, {
          user_id: user?.id,
          ...completedData
        });
      } catch (analyticsError) {
        console.error('Failed to send analytics:', analyticsError);
        // Don't fail the whole operation if analytics fails
      }

      // Don't reset - stay on post phase to show completion

    } catch (error) {
      console.error('Error submitting symptoms:', error);
      // Show error in state instead of toast
      setSymptomRecommendation({
        message: 'Failed to submit symptom check. Please try again.',
        severe: true
      });
    }
  };


  // Show location setup if no location available
  if (!currentLocation && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <MapPin className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Location Required</h2>
            <p className="text-gray-600 mb-6">
              To check air quality and activate pollution defense, please set your location first.
            </p>
            <a
              href="/air-quality"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <MapPin className="w-5 h-5 mr-2" />
              Go to Air Quality to Set Location
            </a>
            <p className="text-sm text-gray-500 mt-4">
              You'll be able to search for any city worldwide
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Wind className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Checking air quality...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <Shield className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pollution Defense Protocol</h1>
              <p className="text-gray-600">A daily personal defense routine for walking or commuting through polluted environments</p>
            </div>
          </div>

          {isTemporary && (
            <div className="mb-3 flex items-center text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded">
              <MapPin className="w-4 h-4 mr-1" />
              <span>Viewing temporary location (will reset to GPS on logout)</span>
            </div>
          )}

          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border-l-4 border-blue-500">
            <h3 className="font-semibold text-blue-900 mb-2">🌫️ About This Protocol</h3>
            <p className="text-blue-800 text-sm">
              This routine helps you minimize health impact when walking or commuting through polluted areas. 
              Follow the 3-phase protocol: <strong>Before You Go</strong>, <strong>During Exposure</strong>, and <strong>After You Return</strong>.
            </p>
          </div>
        </div>

        {/* Protocol Overview - Always Visible */}
        {phase === 'check' && (
          <div className="space-y-6">
            {/* Phase 1: Before You Go */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 font-bold">1</span>
                Before You Go (2-3 min)
              </h2>
              
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">✅ Check & Plan</h3>
                  <ul className="text-gray-700 text-sm space-y-1">
                    <li>• Check current AQI (PM2.5, O₃, NO₂) - available on Dashboard</li>
                    <li>• Plan timing: Avoid rush hour (7-9 AM, 4-6 PM)</li>
                    <li>• Choose micro-routes: Parks, side streets, paths away from traffic</li>
                    <li>• Morning before sunrise or after rain = cleaner air</li>
                  </ul>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">🧥 Gear Up</h3>
                  <ul className="text-gray-700 text-sm space-y-1">
                    <li>• <strong>Mask:</strong> N95/N99/FFP2 with full seal</li>
                    <li>• <strong>Eyewear:</strong> Sunglasses or light goggles protect from particles</li>
                    <li>• <strong>Clothing:</strong> Long sleeves + hair covering reduce soot/dust</li>
                  </ul>
                </div>

                <div className="border-l-4 border-cyan-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">🧃 Pre-Exposure Boost</h3>
                  <ul className="text-gray-700 text-sm space-y-1">
                    <li>• <strong>Hydrate:</strong> Glass of water with lemon or green tea</li>
                    <li>• <strong>Snack:</strong> Orange, kiwi, or berries (Vitamin C + antioxidants)</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={startSession}
                className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Shield className="w-5 h-5 mr-2" />
                Start Protocol Session
              </button>
            </div>

            {/* Phase 2: During Exposure */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-green-100 text-green-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 font-bold">2</span>
                During Exposure (Smart Movement)
              </h2>
              
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">💨 Breathing Strategy</h3>
                  <ul className="text-gray-700 text-sm space-y-1">
                    <li>• Breathe through nose, not mouth (filters ~30% of particulates)</li>
                    <li>• Avoid deep or rapid breathing (no jogging in high pollution)</li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">🏙️ Route Behavior</h3>
                  <ul className="text-gray-700 text-sm space-y-1">
                    <li>• Walk on upwind side of traffic</li>
                    <li>• Stay 1-2m from curb (cuts exposure 20-40%)</li>
                    <li>• Skip idling cars, bus stops, construction zones</li>
                  </ul>
                </div>

                <div className="border-l-4 border-orange-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">🕓 Limit Exposure Time</h3>
                  <ul className="text-gray-700 text-sm space-y-1">
                    <li>• Stay outside only as long as necessary</li>
                    <li>• Take breaks indoors or in shaded green areas</li>
                    <li>• Trees can cut local PM by up to 25%</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Phase 3: After Exposure */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-red-100 text-red-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 font-bold">3</span>
                After You Return (Detox & Recovery)
              </h2>
              
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">🚿 Cleanse</h3>
                  <ul className="text-gray-700 text-sm space-y-1">
                    <li>• Wash face, hands, hair immediately</li>
                    <li>• Change outer clothes to avoid carrying particles indoors</li>
                  </ul>
                </div>

                <div className="border-l-4 border-cyan-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">💧 Hydrate & Recover</h3>
                  <ul className="text-gray-700 text-sm space-y-1">
                    <li>• Drink 1-2 glasses water or coconut water</li>
                    <li>• Herbal teas: ginger, turmeric, licorice, tulsi, peppermint</li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">🫁 Lung Recovery (3-5 min)</h3>
                  <ul className="text-gray-700 text-sm space-y-1">
                    <li>• <strong>Box breathing:</strong> 4-4-4-4 (inhale-hold-exhale-hold)</li>
                    <li>• <strong>Shoulder roll + deep sigh:</strong> Relieves thoracic tension</li>
                    <li>• <strong>Humming breath:</strong> Creates nitric oxide, opens airways</li>
                  </ul>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">🥗 Nutrition Reinforcement</h3>
                  <ul className="text-gray-700 text-sm space-y-1">
                    <li>• <strong>Antioxidants:</strong> Spinach, berries, citrus, broccoli, avocado, nuts</li>
                    <li>• <strong>Omega-3s:</strong> Fish, chia, flax (reduce inflammation)</li>
                    <li>• <strong>Detox helpers:</strong> Cruciferous vegetables support liver</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Long-term Resilience */}
            <div className="bg-gradient-to-r from-green-50 to-cyan-50 rounded-xl shadow-lg p-6 border-l-4 border-green-500">
              <h2 className="text-xl font-bold text-gray-900 mb-4">🌿 Long-Term Resilience</h2>
              
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Daily Habits</h3>
                  <ul className="text-gray-700 text-sm space-y-1">
                    <li>• Run HEPA air purifiers 1-2 hours after coming home</li>
                    <li>• Ventilate when outdoor AQI &lt; 80</li>
                    <li>• Exercise indoors on poor-air days</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Weekly Clean-Air Reset</h3>
                  <ul className="text-gray-700 text-sm space-y-1">
                    <li>• Spend 2-3 hours in green or coastal area</li>
                    <li>• Practice lung cleansing yoga or guided breathing</li>
                    <li>• Track how you feel before and after</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Phase: Pre-Exposure */}
        {phase === 'pre' && (
          <div className="space-y-6">
            {/* Back Button */}
            <button
              onClick={() => {
                if (completedProtocol) {
                  setPhase('post');
                } else {
                  setPhase('check');
                }
              }}
              className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Protocol Overview
            </button>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="w-6 h-6 text-blue-600 mr-2" />
                Before You Go (2-3 min)
              </h2>

              {/* Gear Checklist */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Quick Prep Checklist</h3>
                <div className="space-y-2">
                  {[
                    { key: 'mask', label: 'Wear a fitted N95/FFP2 mask (seal check)', required: true },
                    { key: 'eyewear', label: 'Sunglasses/eyewear to reduce irritation' },
                    { key: 'route', label: 'Pick side streets/park edge; stay off the curb' },
                    { key: 'timing', label: 'Avoid rush hour if possible' }
                  ].map(item => (
                    <label key={item.key} className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={checklist[item.key as keyof typeof checklist]}
                        onChange={(e) => setChecklist({ ...checklist, [item.key]: e.target.checked })}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <span className="ml-3 text-gray-900">
                        {item.label}
                        {item.required && <span className="text-red-500 ml-1">*</span>}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Hydration */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Droplets className="w-5 h-5 text-blue-600 mr-2" />
                  Hydrate
                </h3>
                <div className="space-y-2">
                  {[
                    'Water (250-350 ml)',
                    'Green tea (unsweetened)',
                    'Water + lemon'
                  ].map((option, idx) => (
                    <div key={idx} className="p-3 bg-blue-50 rounded-lg text-gray-800">
                      💧 {option}
                    </div>
                  ))}
                </div>
                <label className="flex items-center mt-3">
                  <input
                    type="checkbox"
                    checked={checklist.hydrated}
                    onChange={(e) => setChecklist({ ...checklist, hydrated: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <span className="ml-2 text-gray-700">I've hydrated</span>
                </label>
              </div>

              {/* Antioxidant Snack */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Apple className="w-5 h-5 text-green-600 mr-2" />
                  Antioxidant Snack (Optional)
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Orange or kiwi',
                    'Handful of berries',
                    'Small apple + almonds'
                  ].map((option, idx) => (
                    <div key={idx} className="p-2 bg-green-50 rounded-lg text-sm text-gray-800">
                      🍊 {option}
                    </div>
                  ))}
                </div>
                <label className="flex items-center mt-3">
                  <input
                    type="checkbox"
                    checked={checklist.snack}
                    onChange={(e) => setChecklist({ ...checklist, snack: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <span className="ml-2 text-gray-700">I've had a snack</span>
                </label>
              </div>

              {/* Breathing Tip */}
              <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">💨 Breathing Plan</h3>
                <p className="text-gray-800">
                  During the walk, breathe through your nose and keep an easy-moderate pace.
                </p>
              </div>

              <button
                onClick={startWalk}
                disabled={!checklist.mask}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <MapPin className="w-5 h-5 mr-2" />
                Start Walk Mode
              </button>
              {!checklist.mask && (
                <p className="text-red-600 text-sm mt-2 text-center">* Mask is required to proceed</p>
              )}
            </div>
          </div>
        )}

        {/* Phase: During Exposure */}
        {phase === 'during' && (
          <div className="space-y-6">
            {/* Back Button */}
            <button
              onClick={() => {
                if (completedProtocol) {
                  setPhase('post');
                } else {
                  setPhase('check');
                }
              }}
              className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Protocol Overview
            </button>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Activity className="w-6 h-6 text-green-600 mr-2 animate-pulse" />
                Walk Mode Active
              </h2>

              {walkStartTime && (
                <div className="bg-green-50 rounded-lg p-4 mb-6 border-2 border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Started at</p>
                      <p className="font-semibold text-gray-900">{walkStartTime.toLocaleTimeString()}</p>
                    </div>
                    <Clock className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">💨 Nasal Breathing</h3>
                  <p className="text-blue-800 text-sm">Inhale through the nose, relaxed pace. Nasal passages filter ~30% of particulates.</p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-2">🚶 Micro-route Tips</h3>
                  <ul className="text-purple-800 text-sm space-y-1">
                    <li>• Stay 1-2m from the curb (reduces exposure 20-40%)</li>
                    <li>• Avoid idling vehicles and bus stops</li>
                    <li>• Walk on upwind side of traffic</li>
                  </ul>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <h3 className="font-semibold text-orange-900 mb-2">⏱️ Pace Control</h3>
                  <p className="text-orange-800 text-sm">Keep an easy to moderate pace. Avoid deep or rapid breathing.</p>
                </div>
              </div>

              <button
                onClick={completeWalk}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                I'm Done - Start Recovery
              </button>
            </div>
          </div>
        )}

        {/* Phase: Post-Exposure */}
        {phase === 'post' && (
          <div className="space-y-6">
            {/* Back Button */}
            <button
              onClick={() => {
                if (completedProtocol) {
                  setPhase('post');
                } else {
                  setPhase('check');
                }
              }}
              className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Protocol Overview
            </button>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Heart className="w-6 h-6 text-red-600 mr-2" />
                Recovery & Detox (4-6 min)
              </h2>

              {/* Quick Clean */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">🚿 Quick Clean</h3>
                <div className="space-y-2">
                  {[
                    { key: 'washed', label: 'Wash hands and face' },
                    { key: 'changed_clothes', label: 'Change outer layer if dusty' }
                  ].map(item => (
                    <label key={item.key} className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={recovery[item.key as keyof typeof recovery]}
                        onChange={(e) => setRecovery({ ...recovery, [item.key]: e.target.checked })}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <span className="ml-3 text-gray-900">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Breathing Exercise */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">🫁 Lung Recovery (3 min)</h3>
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 mb-3">
                  <p className="font-semibold text-purple-900 mb-2">Box Breathing (4-4-4-4)</p>
                  <p className="text-purple-800 text-sm mb-2">Inhale 4s → Hold 4s → Exhale 4s → Hold 4s</p>
                  <p className="text-purple-700 text-xs">Repeat 4 cycles</p>
                </div>
                <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg p-4">
                  <p className="font-semibold text-blue-900 mb-2">Humming Breath</p>
                  <p className="text-blue-800 text-sm mb-2">Inhale 3s → Exhale 6s (with "mmm" sound)</p>
                  <p className="text-blue-700 text-xs">Repeat 5 cycles - Creates nitric oxide to help airways open</p>
                </div>
                <label className="flex items-center mt-3">
                  <input
                    type="checkbox"
                    checked={recovery.breathing_exercise}
                    onChange={(e) => setRecovery({ ...recovery, breathing_exercise: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <span className="ml-2 text-gray-700">Breathing exercise completed</span>
                </label>
              </div>

              {/* Hydration */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Droplets className="w-5 h-5 text-blue-600 mr-2" />
                  Re-hydrate
                </h3>
                <div className="space-y-2">
                  {[
                    'Water (250-350 ml)',
                    'Turmeric-ginger tea',
                    'Peppermint tea'
                  ].map((option, idx) => (
                    <div key={idx} className="p-3 bg-blue-50 rounded-lg text-gray-800">
                      💧 {option}
                    </div>
                  ))}
                </div>
                <label className="flex items-center mt-3">
                  <input
                    type="checkbox"
                    checked={recovery.hydrated}
                    onChange={(e) => setRecovery({ ...recovery, hydrated: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <span className="ml-2 text-gray-700">I've re-hydrated</span>
                </label>
              </div>

              {/* Home Air Reset */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Home className="w-5 h-5 text-green-600 mr-2" />
                  Home Air Reset
                </h3>
                <div className="space-y-2">
                  <div className="p-3 bg-green-50 rounded-lg text-gray-800">
                    🌬️ Run HEPA purifier 60-120 min
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg text-gray-800">
                    🪟 Ventilate if outdoor AQI &lt; 80
                  </div>
                </div>
                <label className="flex items-center mt-3">
                  <input
                    type="checkbox"
                    checked={recovery.air_purifier}
                    onChange={(e) => setRecovery({ ...recovery, air_purifier: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <span className="ml-2 text-gray-700">Air purifier running</span>
                </label>
              </div>

              {/* Symptom Check */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">🩺 How do you feel now?</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Overall Feeling (1 = Great, 5 = Not good)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={symptoms.overall_feeling}
                    onChange={(e) => setSymptoms({ ...symptoms, overall_feeling: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>😊 Great</span>
                    <span>😐 OK</span>
                    <span>😟 Not good</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    { key: 'cough', label: 'Cough/irritation', icon: '😷' },
                    { key: 'wheeze', label: 'Wheezing', icon: '🫁' },
                    { key: 'fatigue', label: 'Fatigue', icon: '😴' },
                    { key: 'eye_irritation', label: 'Eye irritation', icon: '👁️' },
                    { key: 'throat_irritation', label: 'Throat irritation', icon: '🗣️' }
                  ].map(item => (
                    <label key={item.key} className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={symptoms[item.key as keyof typeof symptoms] as boolean}
                        onChange={(e) => setSymptoms({ ...symptoms, [item.key]: e.target.checked })}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <span className="ml-3 text-gray-900">{item.icon} {item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Show recommendation if available */}
              {symptomRecommendation && (
                <div className={`mt-6 p-4 rounded-lg border-2 ${
                  symptomRecommendation.severe 
                    ? 'bg-red-50 border-red-500' 
                    : 'bg-green-50 border-green-500'
                }`}>
                  <h3 className={`font-semibold mb-2 ${
                    symptomRecommendation.severe ? 'text-red-900' : 'text-green-900'
                  }`}>
                    {symptomRecommendation.severe ? '⚠️ Important' : '✅ Recommendation'}
                  </h3>
                  <p className={symptomRecommendation.severe ? 'text-red-800' : 'text-green-800'}>
                    {symptomRecommendation.message}
                  </p>
                </div>
              )}

              {completedProtocol ? (
                <>
                  {/* Completion Summary */}
                  <div className="mt-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 border-2 border-blue-300">
                    <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
                      <Sparkles className="w-6 h-6 mr-2" />
                      Protocol Completed!
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Completed:</span>
                        <span className="font-semibold text-gray-900">
                          {new Date(completedProtocol.date).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Duration:</span>
                        <span className="font-semibold text-gray-900">
                          {completedProtocol.walkStartTime 
                            ? `${Math.round((new Date().getTime() - new Date(completedProtocol.walkStartTime).getTime()) / 60000)} min`
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Data stored for:</span>
                        <span className="font-semibold text-gray-900">3 days</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
                    <p className="text-amber-900 text-sm mb-3">
                      You've already completed the protocol today. You can retake it if needed, or come back tomorrow for a fresh protocol.
                    </p>
                    <button
                      onClick={() => {
                        // Remove today's protocol from storage
                        const protocols = JSON.parse(localStorage.getItem('pollution_defense_protocols') || '[]');
                        const today = new Date().toISOString().split('T')[0];
                        const filteredProtocols = protocols.filter((p: any) => {
                          const protocolDate = new Date(p.date).toISOString().split('T')[0];
                          return protocolDate !== today;
                        });
                        localStorage.setItem('pollution_defense_protocols', JSON.stringify(filteredProtocols));
                        
                        // Reset all state
                        setPhase('check');
                        setSessionId(null);
                        setWalkStartTime(null);
                        setSymptomRecommendation(null);
                        setCompletedProtocol(null);
                        setChecklist({
                          mask: false,
                          eyewear: false,
                          route: false,
                          timing: false,
                          hydrated: false,
                          snack: false
                        });
                        setRecovery({
                          washed: false,
                          changed_clothes: false,
                          breathing_exercise: false,
                          hydrated: false,
                          air_purifier: false
                        });
                        setSymptoms({
                          cough: false,
                          wheeze: false,
                          fatigue: false,
                          eye_irritation: false,
                          throat_irritation: false,
                          overall_feeling: 3
                        });
                      }}
                      className="w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors flex items-center justify-center"
                    >
                      <Shield className="w-5 h-5 mr-2" />
                      Retake Protocol?
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={submitSymptomCheck}
                  className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Complete Protocol
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PollutionDefense;
