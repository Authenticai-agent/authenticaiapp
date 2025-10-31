import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { BreathingExercise } from '../data/breathingExercises';

interface BreathingTimerProps {
  exercise: BreathingExercise;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
}

const BreathingTimer: React.FC<BreathingTimerProps> = ({
  exercise,
  isPlaying,
  onTogglePlay,
  onReset,
}) => {
  const [elapsed, setElapsed] = useState(0);
  const totalSeconds = exercise.duration * 60;

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setElapsed((prev) => {
        if (prev >= totalSeconds) {
          onTogglePlay();
          return totalSeconds;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, totalSeconds, onTogglePlay]);

  const handleReset = () => {
    setElapsed(0);
    onReset();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (elapsed / totalSeconds) * 100;

  return (
    <div className="mt-6">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Timer Display */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-3xl font-bold text-gray-900">
          {formatTime(elapsed)}
        </div>
        <div className="text-lg text-gray-500">
          / {formatTime(totalSeconds)}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={onTogglePlay}
          className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg"
        >
          {isPlaying ? (
            <Pause className="w-8 h-8" />
          ) : (
            <Play className="w-8 h-8 ml-1" />
          )}
        </button>

        <button
          onClick={handleReset}
          className="w-12 h-12 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Completion Message */}
      {elapsed >= totalSeconds && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
          <p className="text-green-800 font-semibold">
            🎉 Session Complete! Great job!
          </p>
        </div>
      )}
    </div>
  );
};

export default BreathingTimer;
