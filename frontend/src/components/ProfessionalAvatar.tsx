import React from 'react';

interface ProfessionalAvatarProps {
  pose: 'standing' | 'sitting' | 'breathing' | 'stretching' | 'balance';
  animation?: string;
  color?: string;
}

const ProfessionalAvatar: React.FC<ProfessionalAvatarProps> = ({ 
  pose, 
  animation = '', 
  color = '#6366f1' 
}) => {
  
  // Standing pose
  if (pose === 'standing') {
    return (
      <svg viewBox="0 0 100 200" className={`professional-avatar ${animation}`}>
        {/* Head */}
        <circle cx="50" cy="20" r="12" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5"/>
        <circle cx="47" cy="18" r="1.5" fill="#374151"/>
        <circle cx="53" cy="18" r="1.5" fill="#374151"/>
        <path d="M 45 23 Q 50 25 55 23" stroke="#374151" strokeWidth="1" fill="none"/>
        
        {/* Torso */}
        <ellipse cx="50" cy="60" rx="18" ry="30" fill={color} opacity="0.9"/>
        
        {/* Arms */}
        <g className="arms">
          <ellipse cx="32" cy="55" rx="5" ry="20" fill={color} opacity="0.8" transform="rotate(-20 32 55)"/>
          <ellipse cx="68" cy="55" rx="5" ry="20" fill={color} opacity="0.8" transform="rotate(20 68 55)"/>
          <circle cx="30" cy="70" r="4" fill="#fbbf24" opacity="0.9"/>
          <circle cx="70" cy="70" r="4" fill="#fbbf24" opacity="0.9"/>
        </g>
        
        {/* Legs */}
        <g className="legs">
          <ellipse cx="42" cy="120" rx="6" ry="35" fill={color} opacity="0.85"/>
          <ellipse cx="58" cy="120" rx="6" ry="35" fill={color} opacity="0.85"/>
          <ellipse cx="42" cy="160" rx="7" ry="15" fill="#374151" opacity="0.8"/>
          <ellipse cx="58" cy="160" rx="7" ry="15" fill="#374151" opacity="0.8"/>
        </g>
      </svg>
    );
  }
  
  // Sitting pose
  if (pose === 'sitting') {
    return (
      <svg viewBox="0 0 120 140" className={`professional-avatar ${animation}`}>
        {/* Head */}
        <circle cx="60" cy="20" r="12" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5"/>
        <circle cx="57" cy="18" r="1.5" fill="#374151"/>
        <circle cx="63" cy="18" r="1.5" fill="#374151"/>
        <path d="M 55 23 Q 60 25 65 23" stroke="#374151" strokeWidth="1" fill="none"/>
        
        {/* Torso */}
        <ellipse cx="60" cy="55" rx="20" ry="28" fill={color} opacity="0.9"/>
        
        {/* Arms */}
        <g className="arms">
          <ellipse cx="40" cy="55" rx="5" ry="18" fill={color} opacity="0.8" transform="rotate(-10 40 55)"/>
          <ellipse cx="80" cy="55" rx="5" ry="18" fill={color} opacity="0.8" transform="rotate(10 80 55)"/>
          <circle cx="38" cy="70" r="4" fill="#fbbf24" opacity="0.9"/>
          <circle cx="82" cy="70" r="4" fill="#fbbf24" opacity="0.9"/>
        </g>
        
        {/* Legs (bent, sitting) */}
        <g className="legs">
          <ellipse cx="50" cy="95" rx="8" ry="20" fill={color} opacity="0.85" transform="rotate(70 50 95)"/>
          <ellipse cx="70" cy="95" rx="8" ry="20" fill={color} opacity="0.85" transform="rotate(110 70 95)"/>
          <ellipse cx="30" cy="110" rx="10" ry="8" fill="#374151" opacity="0.8"/>
          <ellipse cx="90" cy="110" rx="10" ry="8" fill="#374151" opacity="0.8"/>
        </g>
      </svg>
    );
  }
  
  // Breathing pose (with expanding chest indicator)
  if (pose === 'breathing') {
    return (
      <svg viewBox="0 0 120 140" className={`professional-avatar ${animation}`}>
        {/* Head */}
        <circle cx="60" cy="20" r="12" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5"/>
        <circle cx="57" cy="18" r="1.5" fill="#374151"/>
        <circle cx="63" cy="18" r="1.5" fill="#374151"/>
        <path d="M 55 23 Q 60 25 65 23" stroke="#374151" strokeWidth="1" fill="none"/>
        
        {/* Torso with breath indicator */}
        <ellipse cx="60" cy="55" rx="20" ry="28" fill={color} opacity="0.9" className="breathing-torso"/>
        
        {/* Breath glow */}
        <circle cx="60" cy="55" r="15" fill="#60a5fa" opacity="0.3" className="breath-glow"/>
        
        {/* Lungs visualization */}
        <g className="lungs">
          <ellipse cx="52" cy="55" rx="6" ry="10" fill="#93c5fd" opacity="0.6" className="lung-left"/>
          <ellipse cx="68" cy="55" rx="6" ry="10" fill="#93c5fd" opacity="0.6" className="lung-right"/>
        </g>
        
        {/* Arms */}
        <g className="arms">
          <ellipse cx="40" cy="55" rx="5" ry="18" fill={color} opacity="0.8" transform="rotate(-10 40 55)"/>
          <ellipse cx="80" cy="55" rx="5" ry="18" fill={color} opacity="0.8" transform="rotate(10 80 55)"/>
        </g>
        
        {/* Legs */}
        <g className="legs">
          <ellipse cx="50" cy="95" rx="8" ry="20" fill={color} opacity="0.85" transform="rotate(70 50 95)"/>
          <ellipse cx="70" cy="95" rx="8" ry="20" fill={color} opacity="0.85" transform="rotate(110 70 95)"/>
        </g>
      </svg>
    );
  }
  
  // Stretching pose
  if (pose === 'stretching') {
    return (
      <svg viewBox="0 0 100 200" className={`professional-avatar ${animation}`}>
        {/* Head */}
        <circle cx="50" cy="20" r="12" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5"/>
        <circle cx="47" cy="18" r="1.5" fill="#374151"/>
        <circle cx="53" cy="18" r="1.5" fill="#374151"/>
        <path d="M 45 23 Q 50 25 55 23" stroke="#374151" strokeWidth="1" fill="none"/>
        
        {/* Torso */}
        <ellipse cx="50" cy="60" rx="18" ry="30" fill={color} opacity="0.9" className="stretching-torso"/>
        
        {/* Arms (raised) */}
        <g className="arms">
          <ellipse cx="35" cy="40" rx="5" ry="22" fill={color} opacity="0.8" transform="rotate(-45 35 40)" className="arm-left"/>
          <ellipse cx="65" cy="40" rx="5" ry="22" fill={color} opacity="0.8" transform="rotate(45 65 40)" className="arm-right"/>
          <circle cx="25" cy="30" r="4" fill="#fbbf24" opacity="0.9"/>
          <circle cx="75" cy="30" r="4" fill="#fbbf24" opacity="0.9"/>
        </g>
        
        {/* Legs */}
        <g className="legs">
          <ellipse cx="42" cy="120" rx="6" ry="35" fill={color} opacity="0.85"/>
          <ellipse cx="58" cy="120" rx="6" ry="35" fill={color} opacity="0.85"/>
          <ellipse cx="42" cy="160" rx="7" ry="15" fill="#374151" opacity="0.8"/>
          <ellipse cx="58" cy="160" rx="7" ry="15" fill="#374151" opacity="0.8"/>
        </g>
      </svg>
    );
  }
  
  // Balance pose
  if (pose === 'balance') {
    return (
      <svg viewBox="0 0 100 200" className={`professional-avatar ${animation}`}>
        {/* Head */}
        <circle cx="50" cy="20" r="12" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5"/>
        <circle cx="47" cy="18" r="1.5" fill="#374151"/>
        <circle cx="53" cy="18" r="1.5" fill="#374151"/>
        <path d="M 45 23 Q 50 25 55 23" stroke="#374151" strokeWidth="1" fill="none"/>
        
        {/* Torso */}
        <ellipse cx="50" cy="60" rx="18" ry="30" fill={color} opacity="0.9"/>
        
        {/* Arms (extended for balance) */}
        <g className="arms">
          <ellipse cx="20" cy="55" rx="5" ry="20" fill={color} opacity="0.8" transform="rotate(-90 20 55)" className="arm-left"/>
          <ellipse cx="80" cy="55" rx="5" ry="20" fill={color} opacity="0.8" transform="rotate(90 80 55)" className="arm-right"/>
          <circle cx="5" cy="55" r="4" fill="#fbbf24" opacity="0.9"/>
          <circle cx="95" cy="55" r="4" fill="#fbbf24" opacity="0.9"/>
        </g>
        
        {/* Legs (one leg raised for balance) */}
        <g className="legs">
          <ellipse cx="50" cy="120" rx="6" ry="35" fill={color} opacity="0.85" className="standing-leg"/>
          <ellipse cx="60" cy="100" rx="6" ry="20" fill={color} opacity="0.85" transform="rotate(45 60 100)" className="raised-leg"/>
          <ellipse cx="50" cy="160" rx="7" ry="15" fill="#374151" opacity="0.8"/>
        </g>
      </svg>
    );
  }
  
  return null;
};

export default ProfessionalAvatar;
