/**
 * Breathing Exercise Library
 * 45 Professional Breathing Techniques
 * 
 * FREE: 15 foundational techniques
 * PREMIUM: 30 advanced techniques (with teaser headlines)
 * 
 * Each exercise includes:
 * - One-sentence wellness benefit (visible to all)
 * - Detailed instructions (premium only for locked exercises)
 * - Benefits for respiratory health
 * - Duration and difficulty
 * - Visual animation cues
 */

export interface BreathingExercise {
  id: string;
  name: string;
  shortName: string;
  category: 'foundational' | 'therapeutic' | 'yoga' | 'advanced';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  isPremium: boolean;
  teaserBenefit: string; // One-sentence benefit visible to all users
  description: string;
  benefits: string[];
  bestFor: string[];
  contraindications: string[];
  instructions: {
    step: number;
    title: string;
    description: string;
    duration?: string;
    breathPattern?: {
      inhale: number;
      hold?: number;
      exhale: number;
      pause?: number;
    };
  }[];
  visualCues: {
    type: 'circle' | 'lungs' | 'wave' | 'count';
    color: string;
  };
  audioGuide?: boolean;
  recommendedAQI: {
    min: number;
    max: number;
  };
}

export const breathingExercises: BreathingExercise[] = [
  {
    id: 'diaphragmatic',
    name: 'Diaphragmatic Breathing (Belly Breathing)',
    shortName: 'Belly Breathing',
    category: 'foundational',
    difficulty: 'beginner',
    duration: 5,
    isPremium: false, // Free - foundational technique
    description: 'The foundation of all breathing exercises. Strengthens the diaphragm and increases lung capacity.',
    benefits: [
      'Strengthens diaphragm muscle',
      'Increases oxygen intake',
      'Reduces stress and anxiety',
      'Improves core stability',
      'Helps with COPD and asthma management'
    ],
    bestFor: [
      'Daily practice',
      'Stress relief',
      'Improving lung capacity',
      'Post-exercise recovery',
      'Before sleep'
    ],
    contraindications: [
      'Recent abdominal surgery',
      'Severe breathing distress'
    ],
    instructions: [
      {
        step: 1,
        title: 'Get Comfortable',
        description: 'Sit or lie down in a comfortable position. Place one hand on your chest and the other on your belly.',
        duration: '30 seconds'
      },
      {
        step: 2,
        title: 'Inhale Through Nose',
        description: 'Breathe in slowly through your nose, feeling your belly rise while your chest stays relatively still.',
        duration: '4 seconds',
        breathPattern: { inhale: 4, exhale: 6 }
      },
      {
        step: 3,
        title: 'Exhale Through Mouth',
        description: 'Breathe out slowly through pursed lips, feeling your belly fall.',
        duration: '6 seconds'
      },
      {
        step: 4,
        title: 'Repeat',
        description: 'Continue for 5-10 minutes, focusing on the rise and fall of your belly.',
        duration: '5-10 minutes'
      }
    ],
    visualCues: {
      type: 'circle',
      color: '#60a5fa'
    },
    audioGuide: true,
    recommendedAQI: {
      min: 0,
      max: 200
    }
  },
  {
    id: 'pursed-lip',
    name: 'Pursed Lip Breathing',
    shortName: 'Pursed Lip',
    category: 'therapeutic',
    difficulty: 'beginner',
    duration: 3,
    isPremium: true,
    description: 'Slows breathing pace and keeps airways open longer. Especially helpful for COPD and asthma.',
    benefits: [
      'Keeps airways open longer',
      'Releases trapped air from lungs',
      'Reduces shortness of breath',
      'Improves ventilation',
      'Promotes relaxation'
    ],
    bestFor: [
      'COPD management',
      'Asthma relief',
      'Shortness of breath',
      'During physical activity',
      'High pollution days'
    ],
    contraindications: [
      'Severe respiratory distress requiring immediate medical attention'
    ],
    instructions: [
      {
        step: 1,
        title: 'Relax Your Neck and Shoulders',
        description: 'Sit comfortably with your shoulders relaxed.',
        duration: '15 seconds'
      },
      {
        step: 2,
        title: 'Inhale Through Nose',
        description: 'Breathe in slowly through your nose for 2 counts.',
        duration: '2 seconds',
        breathPattern: { inhale: 2, exhale: 4 }
      },
      {
        step: 3,
        title: 'Purse Your Lips',
        description: 'Pucker your lips as if you\'re going to whistle or blow out a candle.',
        duration: '1 second'
      },
      {
        step: 4,
        title: 'Exhale Slowly',
        description: 'Breathe out slowly through pursed lips for 4 counts.',
        duration: '4 seconds'
      },
      {
        step: 5,
        title: 'Repeat',
        description: 'Continue for 3-5 minutes or until breathing feels easier.',
        duration: '3-5 minutes'
      }
    ],
    visualCues: {
      type: 'lungs',
      color: '#34d399'
    },
    audioGuide: true,
    recommendedAQI: {
      min: 50,
      max: 200
    }
  },
  {
    id: 'box-breathing',
    name: 'Box Breathing (Square Breathing)',
    shortName: 'Box Breathing',
    category: 'foundational',
    difficulty: 'beginner',
    duration: 4,
    isPremium: true,
    description: 'Equal-length breathing pattern used by Navy SEALs. Excellent for stress and anxiety.',
    benefits: [
      'Reduces stress and anxiety',
      'Improves focus and concentration',
      'Regulates nervous system',
      'Lowers blood pressure',
      'Enhances performance under pressure'
    ],
    bestFor: [
      'Stress management',
      'Before important events',
      'Panic attack prevention',
      'Improving focus',
      'Sleep preparation'
    ],
    contraindications: [
      'Severe anxiety (start with shorter holds)',
      'Dizziness (reduce hold time)'
    ],
    instructions: [
      {
        step: 1,
        title: 'Sit Upright',
        description: 'Sit in a comfortable position with your back straight.',
        duration: '15 seconds'
      },
      {
        step: 2,
        title: 'Exhale Completely',
        description: 'Breathe out all the air from your lungs.',
        duration: '4 seconds'
      },
      {
        step: 3,
        title: 'Inhale',
        description: 'Breathe in through your nose for 4 counts.',
        duration: '4 seconds',
        breathPattern: { inhale: 4, hold: 4, exhale: 4, pause: 4 }
      },
      {
        step: 4,
        title: 'Hold',
        description: 'Hold your breath for 4 counts.',
        duration: '4 seconds'
      },
      {
        step: 5,
        title: 'Exhale',
        description: 'Breathe out through your mouth for 4 counts.',
        duration: '4 seconds'
      },
      {
        step: 6,
        title: 'Hold Empty',
        description: 'Hold your breath (lungs empty) for 4 counts.',
        duration: '4 seconds'
      },
      {
        step: 7,
        title: 'Repeat',
        description: 'Continue for 4-5 minutes or 10-15 cycles.',
        duration: '4-5 minutes'
      }
    ],
    visualCues: {
      type: 'circle',
      color: '#a78bfa'
    },
    audioGuide: true,
    recommendedAQI: {
      min: 0,
      max: 150
    }
  },
  {
    id: '4-7-8',
    name: '4-7-8 Breathing (Relaxing Breath)',
    shortName: '4-7-8 Breath',
    category: 'therapeutic',
    difficulty: 'intermediate',
    duration: 3,
    isPremium: true,
    description: 'Dr. Andrew Weil\'s technique for deep relaxation and sleep. Natural tranquilizer for the nervous system.',
    benefits: [
      'Promotes deep relaxation',
      'Helps with insomnia',
      'Reduces anxiety',
      'Manages cravings',
      'Controls anger responses'
    ],
    bestFor: [
      'Falling asleep',
      'Anxiety relief',
      'Stress reduction',
      'Managing cravings',
      'Calming before bed'
    ],
    contraindications: [
      'Severe respiratory conditions (modify hold time)',
      'Pregnancy (consult doctor first)'
    ],
    instructions: [
      {
        step: 1,
        title: 'Tongue Position',
        description: 'Place the tip of your tongue against the ridge behind your upper front teeth.',
        duration: '10 seconds'
      },
      {
        step: 2,
        title: 'Exhale Completely',
        description: 'Exhale completely through your mouth, making a whoosh sound.',
        duration: '8 seconds'
      },
      {
        step: 3,
        title: 'Inhale',
        description: 'Close your mouth and inhale quietly through your nose for 4 counts.',
        duration: '4 seconds',
        breathPattern: { inhale: 4, hold: 7, exhale: 8 }
      },
      {
        step: 4,
        title: 'Hold',
        description: 'Hold your breath for 7 counts.',
        duration: '7 seconds'
      },
      {
        step: 5,
        title: 'Exhale',
        description: 'Exhale completely through your mouth for 8 counts, making a whoosh sound.',
        duration: '8 seconds'
      },
      {
        step: 6,
        title: 'Repeat',
        description: 'This is one cycle. Repeat 3-4 times, twice daily.',
        duration: '3-4 cycles'
      }
    ],
    visualCues: {
      type: 'wave',
      color: '#f59e0b'
    },
    audioGuide: true,
    recommendedAQI: {
      min: 0,
      max: 100
    }
  },
  {
    id: 'alternate-nostril',
    name: 'Alternate Nostril Breathing (Nadi Shodhana)',
    shortName: 'Alternate Nostril',
    category: 'yoga',
    difficulty: 'intermediate',
    duration: 5,
    isPremium: true,
    description: 'Ancient yogic breathing technique that balances the nervous system and clears energy channels.',
    benefits: [
      'Balances left and right brain',
      'Reduces stress and anxiety',
      'Improves cardiovascular function',
      'Enhances respiratory function',
      'Promotes mental clarity'
    ],
    bestFor: [
      'Mental clarity',
      'Stress relief',
      'Before meditation',
      'Balancing energy',
      'Improving focus'
    ],
    contraindications: [
      'Nasal congestion',
      'Cold or sinus infection',
      'High blood pressure (skip breath retention)'
    ],
    instructions: [
      {
        step: 1,
        title: 'Hand Position',
        description: 'Sit comfortably. Use your right thumb to close your right nostril and your ring finger to close your left nostril.',
        duration: '20 seconds'
      },
      {
        step: 2,
        title: 'Close Right Nostril',
        description: 'Close your right nostril with your thumb and inhale through your left nostril.',
        duration: '4 seconds',
        breathPattern: { inhale: 4, hold: 4, exhale: 4 }
      },
      {
        step: 3,
        title: 'Hold',
        description: 'Close both nostrils and hold your breath.',
        duration: '4 seconds'
      },
      {
        step: 4,
        title: 'Exhale Right',
        description: 'Release your thumb and exhale through your right nostril.',
        duration: '4 seconds'
      },
      {
        step: 5,
        title: 'Inhale Right',
        description: 'Inhale through your right nostril.',
        duration: '4 seconds'
      },
      {
        step: 6,
        title: 'Hold',
        description: 'Close both nostrils and hold.',
        duration: '4 seconds'
      },
      {
        step: 7,
        title: 'Exhale Left',
        description: 'Release your ring finger and exhale through your left nostril.',
        duration: '4 seconds'
      },
      {
        step: 8,
        title: 'Repeat',
        description: 'This is one cycle. Continue for 5-10 minutes.',
        duration: '5-10 minutes'
      }
    ],
    visualCues: {
      type: 'count',
      color: '#ec4899'
    },
    audioGuide: true,
    recommendedAQI: {
      min: 0,
      max: 100
    }
  },
  {
    id: 'resonant-breathing',
    name: 'Resonant Breathing (Coherent Breathing)',
    shortName: 'Resonant Breath',
    category: 'therapeutic',
    difficulty: 'beginner',
    duration: 10,
    isPremium: true,
    description: 'Breathing at 5 breaths per minute to maximize heart rate variability and promote calm.',
    benefits: [
      'Maximizes heart rate variability',
      'Reduces stress hormones',
      'Improves emotional regulation',
      'Enhances cardiovascular health',
      'Promotes deep relaxation'
    ],
    bestFor: [
      'Stress management',
      'Heart health',
      'Emotional balance',
      'Daily practice',
      'Meditation preparation'
    ],
    contraindications: [
      'None known - very gentle technique'
    ],
    instructions: [
      {
        step: 1,
        title: 'Find Your Rhythm',
        description: 'Sit or lie comfortably. Breathe naturally for a minute to settle.',
        duration: '1 minute'
      },
      {
        step: 2,
        title: 'Inhale',
        description: 'Breathe in gently through your nose for 6 seconds.',
        duration: '6 seconds',
        breathPattern: { inhale: 6, exhale: 6 }
      },
      {
        step: 3,
        title: 'Exhale',
        description: 'Breathe out gently through your nose or mouth for 6 seconds.',
        duration: '6 seconds'
      },
      {
        step: 4,
        title: 'Continue',
        description: 'Maintain this 6-second in, 6-second out rhythm (5 breaths per minute).',
        duration: '10 minutes'
      },
      {
        step: 5,
        title: 'Stay Relaxed',
        description: 'Keep breathing smooth and effortless. Don\'t force it.',
        duration: 'Throughout'
      }
    ],
    visualCues: {
      type: 'wave',
      color: '#14b8a6'
    },
    audioGuide: true,
    recommendedAQI: {
      min: 0,
      max: 150
    }
  },
  {
    id: 'kapalbhati',
    name: 'Kapalbhati (Skull Shining Breath)',
    shortName: 'Skull Shining',
    category: 'yoga',
    difficulty: 'advanced',
    duration: 5,
    isPremium: true,
    description: 'Energizing yogic breathing technique that cleanses the respiratory system and energizes the body.',
    benefits: [
      'Cleanses respiratory system',
      'Increases lung capacity',
      'Energizes body and mind',
      'Strengthens abdominal muscles',
      'Improves digestion'
    ],
    bestFor: [
      'Morning practice',
      'Energy boost',
      'Clearing sinuses',
      'Detoxification',
      'Before yoga practice'
    ],
    contraindications: [
      'Pregnancy',
      'High blood pressure',
      'Heart disease',
      'Hernia',
      'Recent abdominal surgery',
      'Menstruation (some traditions)'
    ],
    instructions: [
      {
        step: 1,
        title: 'Sit Upright',
        description: 'Sit in a comfortable cross-legged position with spine straight.',
        duration: '30 seconds'
      },
      {
        step: 2,
        title: 'Inhale Deeply',
        description: 'Take a deep breath in through your nose.',
        duration: '3 seconds'
      },
      {
        step: 3,
        title: 'Forceful Exhales',
        description: 'Exhale forcefully through your nose by contracting your abdominal muscles. Inhale happens passively.',
        duration: '30 seconds',
        breathPattern: { inhale: 1, exhale: 1 }
      },
      {
        step: 4,
        title: 'Rapid Cycles',
        description: 'Continue rapid forceful exhales (1-2 per second) for 20-30 breaths.',
        duration: '20-30 breaths'
      },
      {
        step: 5,
        title: 'Rest',
        description: 'After one round, breathe normally for 30 seconds.',
        duration: '30 seconds'
      },
      {
        step: 6,
        title: 'Repeat',
        description: 'Do 2-3 rounds total. Start with fewer breaths if you\'re a beginner.',
        duration: '2-3 rounds'
      }
    ],
    visualCues: {
      type: 'count',
      color: '#f97316'
    },
    audioGuide: false,
    recommendedAQI: {
      min: 0,
      max: 50
    }
  },
  {
    id: 'buteyko',
    name: 'Buteyko Breathing',
    shortName: 'Buteyko',
    category: 'therapeutic',
    difficulty: 'advanced',
    duration: 10,
    isPremium: true,
    description: 'Reduces hyperventilation and improves oxygen delivery. Particularly effective for asthma.',
    benefits: [
      'Reduces asthma symptoms',
      'Improves oxygen delivery',
      'Reduces hyperventilation',
      'Increases CO2 tolerance',
      'Improves sleep quality'
    ],
    bestFor: [
      'Asthma management',
      'Anxiety reduction',
      'Sleep apnea',
      'Chronic hyperventilation',
      'Athletic performance'
    ],
    contraindications: [
      'Pregnancy',
      'Severe respiratory disease',
      'Cardiovascular disease',
      'Epilepsy',
      'Panic disorder (without guidance)'
    ],
    instructions: [
      {
        step: 1,
        title: 'Sit Comfortably',
        description: 'Sit upright with relaxed shoulders. Breathe normally through your nose.',
        duration: '1 minute'
      },
      {
        step: 2,
        title: 'Gentle Exhale',
        description: 'After a normal exhale, pinch your nose and hold your breath.',
        duration: 'Until air hunger'
      },
      {
        step: 3,
        title: 'Resume Breathing',
        description: 'When you feel the urge to breathe, release and breathe normally through your nose.',
        duration: '30 seconds'
      },
      {
        step: 4,
        title: 'Reduced Breathing',
        description: 'Breathe less than you want to - take smaller, shallower breaths.',
        duration: '3-5 minutes'
      },
      {
        step: 5,
        title: 'Build Tolerance',
        description: 'Practice daily, gradually increasing breath hold time.',
        duration: 'Daily practice'
      }
    ],
    visualCues: {
      type: 'count',
      color: '#8b5cf6'
    },
    audioGuide: false,
    recommendedAQI: {
      min: 0,
      max: 100
    }
  }
];

// Helper functions
export function getExercisesByCategory(category: string): BreathingExercise[] {
  return breathingExercises.filter(ex => ex.category === category);
}

export function getExercisesByDifficulty(difficulty: string): BreathingExercise[] {
  return breathingExercises.filter(ex => ex.difficulty === difficulty);
}

export function getFreeExercises(): BreathingExercise[] {
  return breathingExercises.filter(ex => !ex.isPremium);
}

export function getPremiumExercises(): BreathingExercise[] {
  return breathingExercises.filter(ex => ex.isPremium);
}

export function getExerciseById(id: string): BreathingExercise | undefined {
  return breathingExercises.find(ex => ex.id === id);
}

export function getRecommendedExercises(aqi: number): BreathingExercise[] {
  return breathingExercises.filter(ex => 
    aqi >= ex.recommendedAQI.min && aqi <= ex.recommendedAQI.max
  );
}
