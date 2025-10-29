import React from 'react';
import { X } from 'lucide-react';
import ProfessionalAvatar from './ProfessionalAvatar';
import './ExerciseDetail.css';
import './ProfessionalAvatar.css';

interface ExerciseDetailProps {
  exercise: string;
  index: number;
  onClose: () => void;
}

const ExerciseDetail: React.FC<ExerciseDetailProps> = ({ exercise, index, onClose }) => {
  const getExerciseAnimation = (exerciseName: string) => {
    const lowerName = exerciseName.toLowerCase();
    
    // Seated belly breathing
    if (lowerName.includes('belly breathing') || lowerName.includes('seated belly')) {
      return (
        <div className="exercise-animation">
          <div className="professional-demo-container">
            <div className="avatar-wrapper">
              <ProfessionalAvatar pose="breathing" animation="belly-breathing-animation" color="#60a5fa" />
            </div>
            <div className="breath-indicators">
              <div className="breath-label inhale-label">
                <span className="arrow">↓</span> Inhale
              </div>
              <div className="breath-label exhale-label">
                <span className="arrow">↑</span> Exhale
              </div>
            </div>
          </div>
          <div className="exercise-instructions">
            <h4>How to do it:</h4>
            <ol>
              <li>Sit comfortably with your back straight</li>
              <li>Place one hand on your belly</li>
              <li>Breathe in slowly through your nose, feeling your belly expand</li>
              <li>Exhale slowly through your mouth, feeling your belly contract</li>
              <li>Repeat 10 times, focusing on deep, slow breaths</li>
            </ol>
          </div>
        </div>
      );
    }
    
    // Torso twists
    if (lowerName.includes('torso twist')) {
      return (
        <div className="exercise-animation">
          <div className="professional-demo-container">
            <div className="avatar-wrapper">
              <ProfessionalAvatar pose="standing" animation="torso-twist-animation" color="#34d399" />
            </div>
            <div className="rotation-indicators">
              <div className="rotation-label left-label">← Left</div>
              <div className="rotation-label right-label">Right →</div>
            </div>
          </div>
          <div className="exercise-instructions">
            <h4>How to do it:</h4>
            <ol>
              <li>Sit or stand with your spine straight</li>
              <li>Place your hands on your hips or extend arms out</li>
              <li>Gently rotate your torso to the left, hold for 2 seconds</li>
              <li>Return to center</li>
              <li>Rotate to the right, hold for 2 seconds</li>
              <li>Repeat 5-10 times on each side</li>
            </ol>
          </div>
        </div>
      );
    }
    
    // Shoulder rolls
    if (lowerName.includes('shoulder roll')) {
      return (
        <div className="exercise-animation">
          <div className="professional-demo-container">
            <div className="avatar-wrapper">
              <ProfessionalAvatar pose="standing" animation="shoulder-roll-animation" color="#a78bfa" />
            </div>
            <div className="roll-indicators">
              <div className="roll-label forward-label">↻ Forward</div>
              <div className="roll-label backward-label">↺ Backward</div>
            </div>
          </div>
          <div className="exercise-instructions">
            <h4>How to do it:</h4>
            <ol>
              <li>Stand or sit with your arms relaxed at your sides</li>
              <li>Roll your shoulders forward in a circular motion 5 times</li>
              <li>Pause briefly</li>
              <li>Roll your shoulders backward in a circular motion 5 times</li>
              <li>Focus on smooth, controlled movements</li>
            </ol>
          </div>
        </div>
      );
    }
    
    // Arms up and fold down
    if (lowerName.includes('arms up') || lowerName.includes('fold down')) {
      return (
        <div className="exercise-animation">
          <div className="professional-demo-container">
            <div className="avatar-wrapper">
              <ProfessionalAvatar pose="stretching" animation="arms-fold-animation" color="#f59e0b" />
            </div>
            <div className="movement-indicators">
              <div className="movement-label inhale-label">↑ Inhale</div>
              <div className="movement-label exhale-label">↓ Exhale</div>
            </div>
          </div>
          <div className="exercise-instructions">
            <h4>How to do it:</h4>
            <ol>
              <li>Stand with feet hip-width apart</li>
              <li>Inhale deeply as you raise your arms overhead</li>
              <li>Reach up tall, lengthening your spine</li>
              <li>Exhale as you fold forward from your hips</li>
              <li>Let your arms hang down or touch the ground</li>
              <li>Inhale to rise back up with arms overhead</li>
              <li>Repeat 5 times, moving with your breath</li>
            </ol>
          </div>
        </div>
      );
    }
    
    // Default animation for any other exercise
    return (
      <div className="exercise-animation">
        <div className="professional-demo-container">
          <div className="avatar-wrapper">
            <ProfessionalAvatar pose="standing" color="#6b7280" />
          </div>
        </div>
        <div className="exercise-instructions">
          <h4>Exercise: {exercise}</h4>
          <p>Follow the visual guide and perform this movement mindfully.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="exercise-detail-overlay" onClick={onClose}>
      <div className="exercise-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          <X className="w-6 h-6" />
        </button>
        
        <div className="exercise-header">
          <span className="exercise-number">{index + 1}</span>
          <h3 className="exercise-title">{exercise}</h3>
        </div>
        
        {getExerciseAnimation(exercise)}
      </div>
    </div>
  );
};

export default ExerciseDetail;
