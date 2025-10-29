import React, { useState, useEffect } from 'react';
import './FlowAnimations.css';

interface FlowAnimationProps {
  category: string;
  visuals: string;
}

const FlowAnimations: React.FC<FlowAnimationProps> = ({ category, visuals }) => {
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  
  // Breathing cycle: 4s inhale, 2s hold, 4s exhale, 2s hold = 12s total
  useEffect(() => {
    if (category !== 'breathing') return;
    
    const cycle = () => {
      setBreathPhase('inhale');
      setTimeout(() => setBreathPhase('hold'), 4000);
      setTimeout(() => setBreathPhase('exhale'), 6000);
      setTimeout(() => setBreathPhase('hold'), 10000);
    };
    
    cycle();
    const interval = setInterval(cycle, 12000);
    return () => clearInterval(interval);
  }, [category]);
  
  // Breathing animations
  if (category === 'breathing') {
    
    return (
      <div className="flow-animation-container">
        <div className="breathing-animation">
          <div className="breath-instruction">
            <span className={`breath-text ${breathPhase}`}>
              {breathPhase === 'inhale' ? 'Inhale' : breathPhase === 'exhale' ? 'Exhale' : 'Hold'}
            </span>
          </div>
          <div className="lung-left"></div>
          <div className="lung-right"></div>
          <div className="breath-glow"></div>
          <div className="air-particles">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="particle" style={{ animationDelay: `${i * 0.3}s` }}></div>
            ))}
          </div>
        </div>
        <p className="animation-caption">{visuals}</p>
      </div>
    );
  }
  
  // Stretching animations
  if (category === 'stretching') {
    return (
      <div className="flow-animation-container">
        <div className="stretching-animation">
          <div className="body-outline">
            <div className="rib-cage">
              <div className="rib rib-1"></div>
              <div className="rib rib-2"></div>
              <div className="rib rib-3"></div>
              <div className="rib rib-4"></div>
            </div>
            <div className="stretch-waves">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="wave" style={{ animationDelay: `${i * 0.5}s` }}></div>
              ))}
            </div>
          </div>
        </div>
        <p className="animation-caption">{visuals}</p>
      </div>
    );
  }
  
  // Balance animations
  if (category === 'balance') {
    return (
      <div className="flow-animation-container">
        <div className="balance-animation">
          <div className="balance-figure">
            <div className="figure-head"></div>
            <div className="figure-body"></div>
            <div className="figure-arm-left"></div>
            <div className="figure-arm-right"></div>
            <div className="figure-leg-left"></div>
            <div className="figure-leg-right"></div>
          </div>
          <div className="ground-line"></div>
          <div className="balance-indicator"></div>
        </div>
        <p className="animation-caption">{visuals}</p>
      </div>
    );
  }
  
  // Energy animations
  if (category === 'energy') {
    return (
      <div className="flow-animation-container">
        <div className="energy-animation">
          <div className="energy-core"></div>
          <div className="energy-rays">
            {[...Array(12)].map((_, i) => (
              <div 
                key={i} 
                className="ray" 
                style={{ 
                  transform: `rotate(${i * 30}deg)`,
                  animationDelay: `${i * 0.1}s`
                }}
              ></div>
            ))}
          </div>
          <div className="energy-pulses">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="pulse" style={{ animationDelay: `${i * 0.8}s` }}></div>
            ))}
          </div>
        </div>
        <p className="animation-caption">{visuals}</p>
      </div>
    );
  }
  
  // Recovery animations
  if (category === 'recovery') {
    return (
      <div className="flow-animation-container">
        <div className="recovery-animation">
          <div className="healing-aura"></div>
          <div className="recovery-waves">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="recovery-wave" style={{ animationDelay: `${i * 0.6}s` }}></div>
            ))}
          </div>
          <div className="sparkles">
            {[...Array(10)].map((_, i) => (
              <div 
                key={i} 
                className="sparkle" 
                style={{ 
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              ></div>
            ))}
          </div>
        </div>
        <p className="animation-caption">{visuals}</p>
      </div>
    );
  }
  
  // Integration animations (combines multiple elements)
  if (category === 'integration') {
    return (
      <div className="flow-animation-container">
        <div className="integration-animation">
          <div className="integration-center">
            <div className="center-glow"></div>
          </div>
          <div className="orbit-rings">
            <div className="orbit orbit-1"></div>
            <div className="orbit orbit-2"></div>
            <div className="orbit orbit-3"></div>
          </div>
          <div className="floating-elements">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className="floating-element" 
                style={{ 
                  animationDelay: `${i * 0.4}s`,
                  left: `${20 + i * 12}%`
                }}
              ></div>
            ))}
          </div>
        </div>
        <p className="animation-caption">{visuals}</p>
      </div>
    );
  }
  
  // Default fallback
  return (
    <div className="flow-animation-container">
      <div className="default-animation">
        <div className="gentle-pulse"></div>
      </div>
      <p className="animation-caption">{visuals}</p>
    </div>
  );
};

export default FlowAnimations;
