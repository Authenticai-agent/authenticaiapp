import React, { useEffect, useState } from 'react';
import { BreathingExercise } from '../data/breathingExercises';
import './BreathingAnimation.css';

interface BreathingAnimationProps {
  exercise: BreathingExercise;
  isPlaying: boolean;
}

const BreathingAnimation: React.FC<BreathingAnimationProps> = ({ exercise, isPlaying }) => {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale');
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!isPlaying) {
      setPhase('inhale');
      setScale(1);
      return;
    }

    const pattern = exercise.instructions.find(i => i.breathPattern)?.breathPattern;
    if (!pattern) return;

    const { inhale, hold = 0, exhale, pause = 0 } = pattern;
    const totalCycle = (inhale + hold + exhale + pause) * 1000;

    const animate = () => {
      // Inhale
      setPhase('inhale');
      setScale(1.5);

      setTimeout(() => {
        // Hold
        if (hold > 0) {
          setPhase('hold');
        }

        setTimeout(() => {
          // Exhale
          setPhase('exhale');
          setScale(1);

          setTimeout(() => {
            // Pause
            if (pause > 0) {
              setPhase('pause');
            }
          }, exhale * 1000);
        }, hold * 1000);
      }, inhale * 1000);
    };

    animate();
    const interval = setInterval(animate, totalCycle);

    return () => clearInterval(interval);
  }, [isPlaying, exercise]);

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale':
        return 'Breathe In';
      case 'hold':
        return 'Hold';
      case 'exhale':
        return 'Breathe Out';
      case 'pause':
        return 'Pause';
    }
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'inhale':
        return exercise.visualCues.color;
      case 'hold':
        return '#fbbf24';
      case 'exhale':
        return '#34d399';
      case 'pause':
        return '#94a3b8';
    }
  };

  if (exercise.visualCues.type === 'circle') {
    return (
      <div className="breathing-animation-container">
        <div className="relative w-full h-96 flex items-center justify-center">
          <div
            className="breathing-circle"
            style={{
              transform: `scale(${scale})`,
              backgroundColor: getPhaseColor(),
              transition: `transform ${exercise.instructions.find(i => i.breathPattern)?.breathPattern?.inhale || 4}s ease-in-out`,
            }}
          />
          <div className="absolute text-center">
            <p className="text-3xl font-bold text-white drop-shadow-lg">
              {getPhaseText()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (exercise.visualCues.type === 'lungs') {
    return (
      <div className="breathing-animation-container">
        <div className="relative w-full h-96 flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="w-64 h-64">
            {/* Left Lung */}
            <ellipse
              cx="70"
              cy="100"
              rx="30"
              ry="60"
              fill={getPhaseColor()}
              opacity={phase === 'inhale' ? 0.8 : 0.4}
              style={{
                transform: `scale(${phase === 'inhale' ? scale : 1})`,
                transformOrigin: 'center',
                transition: 'all 2s ease-in-out',
              }}
            />
            {/* Right Lung */}
            <ellipse
              cx="130"
              cy="100"
              rx="30"
              ry="60"
              fill={getPhaseColor()}
              opacity={phase === 'inhale' ? 0.8 : 0.4}
              style={{
                transform: `scale(${phase === 'inhale' ? scale : 1})`,
                transformOrigin: 'center',
                transition: 'all 2s ease-in-out',
              }}
            />
          </svg>
          <div className="absolute text-center">
            <p className="text-2xl font-bold" style={{ color: getPhaseColor() }}>
              {getPhaseText()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (exercise.visualCues.type === 'wave') {
    return (
      <div className="breathing-animation-container">
        <div className="relative w-full h-96 flex items-center justify-center">
          <svg viewBox="0 0 400 200" className="w-full h-64">
            <path
              d={`M 0 100 Q 100 ${phase === 'inhale' ? 50 : 150} 200 100 T 400 100`}
              fill="none"
              stroke={getPhaseColor()}
              strokeWidth="4"
              style={{
                transition: 'all 2s ease-in-out',
              }}
            />
          </svg>
          <div className="absolute text-center">
            <p className="text-2xl font-bold" style={{ color: getPhaseColor() }}>
              {getPhaseText()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Default count visualization
  return (
    <div className="breathing-animation-container">
      <div className="relative w-full h-96 flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl font-bold mb-4" style={{ color: getPhaseColor() }}>
            {getPhaseText()}
          </p>
          <div
            className="w-32 h-32 rounded-full mx-auto"
            style={{
              backgroundColor: getPhaseColor(),
              transform: `scale(${scale})`,
              transition: 'all 2s ease-in-out',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default BreathingAnimation;
