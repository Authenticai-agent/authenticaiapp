import React, { useEffect, useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

interface Inspiration {
  id: string;
  quote: string;
  author: string;
  category: string;
  theme: string;
}

const DailyInspiration: React.FC = () => {
  const [inspiration, setInspiration] = useState<Inspiration | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInspiration = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/inspirations/daily`);
      setInspiration(response.data.inspiration);
    } catch (error) {
      console.error('Failed to fetch inspiration:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspiration();
  }, []);

  const getCategoryEmoji = (category: string) => {
    const emojis: Record<string, string> = {
      breathing: '🫁',
      wellness: '💚',
      environment: '🌍',
      mindfulness: '🧘',
      empowerment: '💪',
      rest: '😴'
    };
    return emojis[category] || '✨';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      breathing: 'from-blue-500 to-cyan-500',
      wellness: 'from-green-500 to-emerald-500',
      environment: 'from-teal-500 to-green-500',
      mindfulness: 'from-purple-500 to-pink-500',
      empowerment: 'from-orange-500 to-red-500',
      rest: 'from-indigo-500 to-purple-500'
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!inspiration) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {/* Gradient Header */}
      <div className={`bg-gradient-to-r ${getCategoryColor(inspiration.category)} p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-white" />
            <h3 className="text-white font-semibold">Daily Inspiration</h3>
          </div>
          <button
            onClick={fetchInspiration}
            className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
            title="Get new inspiration"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quote Content */}
      <div className="p-6">
        <div className="flex items-start space-x-3 mb-4">
          <span className="text-3xl">{getCategoryEmoji(inspiration.category)}</span>
          <p className="text-lg text-gray-800 italic leading-relaxed">
            "{inspiration.quote}"
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">— {inspiration.author}</p>
          <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getCategoryColor(inspiration.category)} text-white`}>
            {inspiration.category}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DailyInspiration;
