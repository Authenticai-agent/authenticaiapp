import React, { useEffect, useState } from 'react';
import { Volume2, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

interface Affirmation {
  id: string;
  affirmation: string;
  category: string;
  focus: string;
}

interface AffirmationData {
  affirmation: Affirmation;
  instruction: string;
  day: number;
  repetitions: number;
  tip: string;
}

const DailyAffirmation: React.FC = () => {
  const [data, setData] = useState<AffirmationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    // Check if already completed today
    const completedToday = localStorage.getItem('affirmation_completed_date');
    const today = new Date().toISOString().split('T')[0];
    
    // Reset if it's a new day
    if (completedToday && completedToday !== today) {
      setCompleted(false);
      localStorage.removeItem('affirmation_completed_date');
    } else if (completedToday === today) {
      setCompleted(true);
    }
    
    fetchAffirmation();
  }, []);
  
  // Check for date change every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const completedToday = localStorage.getItem('affirmation_completed_date');
      const today = new Date().toISOString().split('T')[0];
      
      if (completedToday && completedToday !== today) {
        setCompleted(false);
        localStorage.removeItem('affirmation_completed_date');
        fetchAffirmation(); // Fetch new affirmation for new day
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

  const fetchAffirmation = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/affirmations/daily`);
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch affirmation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    const today = new Date().toISOString().split('T')[0];
    
    // Save in old format for backward compatibility
    localStorage.setItem('affirmation_completed_date', today);
    
    // Save in new format for wellness reports
    try {
      const stored = localStorage.getItem('daily_affirmation_completed');
      const completions: Array<{date: string; affirmation: string}> = stored ? JSON.parse(stored) : [];
      
      // Check if already completed today
      const existingIndex = completions.findIndex(c => c.date === today);
      if (existingIndex === -1) {
        completions.push({
          date: today,
          affirmation: data?.affirmation.affirmation || 'Daily affirmation'
        });
        
        // Keep only last 90 days
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        const filtered = completions.filter(c => new Date(c.date) >= ninetyDaysAgo);
        
        localStorage.setItem('daily_affirmation_completed', JSON.stringify(filtered));
      }
    } catch (error) {
      console.error('Error saving affirmation completion:', error);
    }
    
    setCompleted(true);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Volume2 className="w-6 h-6 text-white animate-pulse" />
            <h3 className="text-white font-bold text-lg">Today's Affirmation</h3>
          </div>
          {completed && (
            <CheckCircle className="w-6 h-6 text-white" />
          )}
        </div>
      </div>

      {/* Affirmation Content */}
      <div className="p-6">
        {/* Main Affirmation */}
        <div className="bg-white rounded-lg p-6 mb-4 border-2 border-purple-200">
          <p className="text-xl font-semibold text-gray-900 leading-relaxed text-center">
            "{data.affirmation.affirmation}"
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
              {data.affirmation.category}
            </span>
            <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium">
              {data.affirmation.focus}
            </span>
          </div>
        </div>

        {/* VOCAL INSTRUCTION - PROMINENT */}
        <div className="bg-gradient-to-r from-orange-100 to-red-100 border-2 border-orange-400 rounded-lg p-5 mb-4">
          <div className="flex items-start space-x-3">
            <Volume2 className="w-8 h-8 text-orange-600 flex-shrink-0 animate-bounce" />
            <div>
              <h4 className="font-bold text-orange-900 text-lg mb-2">
                📢 READ THIS OUT LOUD 5 TIMES
              </h4>
              <p className="text-orange-800 font-medium">
                {data.instruction}
              </p>
            </div>
          </div>
        </div>

        {/* Tip */}
        <div className="bg-purple-50 rounded-lg p-4 mb-4">
          <p className="text-sm text-purple-900">
            <strong>💡 Tip:</strong> {data.tip}
          </p>
        </div>

        {/* Completion Button */}
        {!completed ? (
          <button
            onClick={handleComplete}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-lg font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md flex items-center justify-center space-x-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>I've Completed My 5 Repetitions</span>
          </button>
        ) : (
          <div className="bg-green-100 border-2 border-green-400 rounded-lg p-4 text-center">
            <p className="text-green-800 font-semibold flex items-center justify-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>✅ Completed Today! Come back tomorrow for a new affirmation.</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyAffirmation;
