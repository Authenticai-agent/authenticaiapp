import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PollutionDetective: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-slate-900/50 border-b border-slate-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-xl font-bold text-white">🕵️ PollutionDetective</h1>
        </div>
      </div>

      {/* Game iframe - loads the complete standalone HTML game */}
      <iframe
        src="/pollution-detective.html"
        title="PollutionDetective Game"
        className="w-full"
        style={{ height: 'calc(100vh - 73px)', border: 'none' }}
      />
    </div>
  );
};

export default PollutionDetective;
