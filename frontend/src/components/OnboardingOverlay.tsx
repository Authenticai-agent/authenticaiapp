import React, { useState, useEffect } from 'react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for the element to highlight
  position: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingOverlayProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({ 
  isVisible, 
  onComplete, 
  onSkip 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to AuthenticAI! 🎉',
      description: 'Your personal wellness coach for managing asthma and allergies. Let\'s take a quick tour to get you started.',
      target: 'body',
      position: 'bottom'
    },
    {
      id: 'dashboard',
      title: 'Your Health Dashboard 📊',
      description: 'Here you\'ll see your personalized risk assessment, air quality data, and daily recommendations.',
      target: '[data-tour="dashboard"]',
      position: 'bottom'
    },
    {
      id: 'air-quality',
      title: 'Real-time Air Quality 🌬️',
      description: 'Monitor air quality, pollen levels, and environmental factors that affect your breathing.',
      target: '[data-tour="air-quality"]',
      position: 'bottom'
    },
    {
      id: 'predictions',
      title: 'Smart Predictions 🔮',
      description: 'Get personalized predictions and recommendations to prevent flare-ups before they happen.',
      target: '[data-tour="predictions"]',
      position: 'bottom'
    },
    {
      id: 'feedback',
      title: 'We Value Your Feedback 💬',
      description: 'Found a bug? Have an idea? Share your success story! We\'re here to help and improve.',
      target: '[data-tour="feedback"]',
      position: 'left'
    }
  ];

  useEffect(() => {
    if (!isVisible) return;

    const step = steps[currentStep];
    const element = document.querySelector(step.target) as HTMLElement;
    
    if (element) {
      setHighlightedElement(element);
      
      // Scroll element into view
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'center'
      });
    }

    // Cleanup
    return () => {
      setHighlightedElement(null);
    };
  }, [currentStep, isVisible, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isVisible) return null;

  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" />
      
      {/* Highlighted element overlay */}
      {highlightedElement && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            top: highlightedElement.offsetTop - 4,
            left: highlightedElement.offsetLeft - 4,
            width: highlightedElement.offsetWidth + 8,
            height: highlightedElement.offsetHeight + 8,
            border: '3px solid #3B82F6',
            borderRadius: '8px',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="fixed z-50 bg-white rounded-lg shadow-xl p-6 max-w-sm"
        style={{
          top: highlightedElement ? 
            step.position === 'bottom' ? highlightedElement.offsetTop + highlightedElement.offsetHeight + 20 : 
            step.position === 'top' ? highlightedElement.offsetTop - 200 : 
            highlightedElement.offsetTop + highlightedElement.offsetHeight / 2 - 100 : 
            '50%',
          left: highlightedElement ? 
            step.position === 'right' ? highlightedElement.offsetLeft + highlightedElement.offsetWidth + 20 :
            step.position === 'left' ? highlightedElement.offsetLeft - 320 :
            highlightedElement.offsetLeft + highlightedElement.offsetWidth / 2 - 150 :
            '50%',
          transform: highlightedElement ? 'none' : 'translate(-50%, -50%)'
        }}
      >
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {step.title}
          </h3>
          <p className="text-gray-600 mb-6">
            {step.description}
          </p>
          
          {/* Progress indicator */}
          <div className="flex justify-center space-x-2 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep ? 'bg-blue-500' : 
                  index < currentStep ? 'bg-blue-300' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onSkip}
              className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Skip Tour
            </button>
            
            {!isFirstStep && (
              <button
                onClick={handlePrevious}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                ← Back
              </button>
            )}
            
            <button
              onClick={handleNext}
              className="flex-1 px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
            >
              {isLastStep ? 'Get Started!' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OnboardingOverlay;
