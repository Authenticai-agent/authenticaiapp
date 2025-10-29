/**
 * 30-Day Morning Movement Program
 * Low-intensity, guided flows safe for all ages
 * Each flow: 5-10 minutes
 */

export interface MorningFlow {
  day: number;
  title: string;
  goal: string;
  duration: number; // minutes
  moves: string[];
  visuals: string;
  category: 'breathing' | 'stretching' | 'balance' | 'energy' | 'recovery' | 'integration';
  difficulty: 'easy' | 'moderate';
  indoorSafe: boolean;
  outdoorRecommended: boolean;
  aqiThreshold?: number; // Don't do outdoors if AQI above this
}

export const morningMovementProgram: MorningFlow[] = [
  {
    day: 1,
    title: "Morning Breath Reset",
    goal: "Calm lungs, wake up diaphragm",
    duration: 8,
    moves: [
      "Seated belly breathing × 10",
      "Gentle torso twists",
      "Shoulder rolls (forward/back)",
      "Inhale arms up → exhale fold down × 5"
    ],
    visuals: "Blue glow radiating from chest → lungs expanding gently",
    category: 'breathing',
    difficulty: 'easy',
    indoorSafe: true,
    outdoorRecommended: false
  },
  {
    day: 2,
    title: "Open the Ribs",
    goal: "Expand lung capacity",
    duration: 6,
    moves: [
      "Side stretches (both arms up)",
      "Chest opener behind back",
      "Gentle cat-cow pose"
    ],
    visuals: "Animated ribs expanding with soft sound waves",
    category: 'stretching',
    difficulty: 'easy',
    indoorSafe: true,
    outdoorRecommended: false
  },
  {
    day: 3,
    title: "Grounding in Clean Air",
    goal: "Stabilize breathing and balance after waking",
    duration: 7,
    moves: [
      "Slow march in place",
      "Toe-heel balance",
      "Hands on chest → 4-count breathing"
    ],
    visuals: "Standing in sunlight with air particles floating away",
    category: 'balance',
    difficulty: 'easy',
    indoorSafe: true,
    outdoorRecommended: true,
    aqiThreshold: 50
  },
  {
    day: 4,
    title: "Pollen Defense Flow",
    goal: "Clear sinuses, activate lymph",
    duration: 8,
    moves: [
      "Sinus tapping (forehead, under eyes)",
      "Side neck rolls",
      "Arm circles"
    ],
    visuals: "Animated pollen particles fading as you exhale",
    category: 'recovery',
    difficulty: 'easy',
    indoorSafe: true,
    outdoorRecommended: false
  },
  {
    day: 5,
    title: "Oxygen Boost Stretch",
    goal: "Boost circulation and oxygenation",
    duration: 9,
    moves: [
      "Arm swings × 20",
      "Standing back stretch",
      "Deep inhale → reach → exhale drop arms"
    ],
    visuals: "Flowing air currents around the body",
    category: 'energy',
    difficulty: 'moderate',
    indoorSafe: true,
    outdoorRecommended: true,
    aqiThreshold: 80
  },
  {
    day: 6,
    title: "Smog Shield Routine",
    goal: "Recover after high AQI exposure",
    duration: 7,
    moves: [
      "Diaphragm massage (hands on belly)",
      "Shoulder shrugs",
      "Seated side bends"
    ],
    visuals: "Grey haze clearing into blue background",
    category: 'recovery',
    difficulty: 'easy',
    indoorSafe: true,
    outdoorRecommended: false
  },
  {
    day: 7,
    title: "Week 1 Reset",
    goal: "Deep relaxation, full breath cycle reset",
    duration: 8,
    moves: [
      "4-7-8 breathing",
      "Child's pose hold",
      "Gentle standing side flow"
    ],
    visuals: "Lungs glowing softly like light bulbs",
    category: 'integration',
    difficulty: 'easy',
    indoorSafe: true,
    outdoorRecommended: false
  },
  {
    day: 8,
    title: "Calm Flow for Sensitive Lungs",
    goal: "Reduce tension and airway constriction",
    duration: 6,
    moves: [
      "Seated shoulder rolls",
      "Inhale arms → exhale slow reach",
      "Slow exhale through pursed lips"
    ],
    visuals: "Air moving in rhythmic waves",
    category: 'breathing',
    difficulty: 'easy',
    indoorSafe: true,
    outdoorRecommended: false
  },
  {
    day: 9,
    title: "Energize Without Overheating",
    goal: "Boost energy safely for poor air days",
    duration: 9,
    moves: [
      "Step-touch with controlled breathing",
      "Cross-body punches",
      "Standing twists"
    ],
    visuals: "Warm orange sunlight, energetic beat",
    category: 'energy',
    difficulty: 'moderate',
    indoorSafe: true,
    outdoorRecommended: false
  },
  {
    day: 10,
    title: "Allergy Recovery Set",
    goal: "Improve drainage, reduce pressure",
    duration: 5,
    moves: [
      "Forward fold (knees bent)",
      "Gentle nods (yes/no)",
      "Shoulder lift + drop"
    ],
    visuals: "Light mist symbolizing relief",
    category: 'recovery',
    difficulty: 'easy',
    indoorSafe: true,
    outdoorRecommended: false
  },
  {
    day: 11,
    title: "Morning Qi-Breath Flow",
    goal: "Integrate breath + motion (Tai Chi-inspired)",
    duration: 10,
    moves: [
      "'Gather air' slow arm lifts",
      "'Push air' gentle forward press",
      "'Circle of calm' full shoulder rolls"
    ],
    visuals: "Circular energy rings moving with body",
    category: 'integration',
    difficulty: 'moderate',
    indoorSafe: true,
    outdoorRecommended: true,
    aqiThreshold: 60
  },
  {
    day: 12,
    title: "Humidity Balance Flow",
    goal: "Balance hydration and energy",
    duration: 7,
    moves: [
      "Inhale: palms open → Exhale: palms close",
      "Wrist and ankle circles",
      "Gentle squats × 5"
    ],
    visuals: "Water droplets forming smooth waves",
    category: 'balance',
    difficulty: 'easy',
    indoorSafe: true,
    outdoorRecommended: false
  },
  {
    day: 13,
    title: "Lymphatic Drain Reset",
    goal: "Support detox & immune function",
    duration: 8,
    moves: [
      "Gentle tapping (collarbone, underarm)",
      "Arm swings across chest",
      "Slow head turns"
    ],
    visuals: "Green gradient symbolizing renewal",
    category: 'recovery',
    difficulty: 'easy',
    indoorSafe: true,
    outdoorRecommended: false
  },
  {
    day: 14,
    title: "End of Week Recovery",
    goal: "Relax lungs, spine, and shoulders",
    duration: 6,
    moves: [
      "Seated twist",
      "Side stretch",
      "Deep exhale release"
    ],
    visuals: "Sunset glow around chest area",
    category: 'integration',
    difficulty: 'easy',
    indoorSafe: true,
    outdoorRecommended: false
  },
  {
    day: 15,
    title: "Lung Strength Builder",
    goal: "Strengthen diaphragm and intercostals",
    duration: 8,
    moves: [
      "Pursed-lip breathing",
      "Controlled inhale with hands on ribs",
      "Core tightening pulses"
    ],
    visuals: "Expanding rings from the chest",
    category: 'breathing',
    difficulty: 'moderate',
    indoorSafe: true,
    outdoorRecommended: false
  },
  {
    day: 16,
    title: "Airway Flow Yoga",
    goal: "Mobilize spine and open chest",
    duration: 9,
    moves: [
      "Cat-cow",
      "Cobra to child's pose",
      "Forward reach"
    ],
    visuals: "Light rays entering the lungs",
    category: 'stretching',
    difficulty: 'moderate',
    indoorSafe: true,
    outdoorRecommended: false
  },
  {
    day: 17,
    title: "Breathe + Balance",
    goal: "Train focus and posture",
    duration: 7,
    moves: [
      "Tree pose breathing",
      "Shoulder blade squeeze",
      "Chest lift + slow release"
    ],
    visuals: "Tree leaves responding to breath",
    category: 'balance',
    difficulty: 'moderate',
    indoorSafe: true,
    outdoorRecommended: true,
    aqiThreshold: 70
  },
  {
    day: 18,
    title: "Post-Smoke Exposure Flow",
    goal: "Cleanse after smoky or polluted air",
    duration: 8,
    moves: [
      "Deep nasal exhale",
      "Arm sweep motions",
      "Gentle backbend"
    ],
    visuals: "Animated smoke fading to clear sky",
    category: 'recovery',
    difficulty: 'easy',
    indoorSafe: true,
    outdoorRecommended: false
  },
  {
    day: 19,
    title: "Heart–Lung Harmony",
    goal: "Synchronize heartbeat + breathing",
    duration: 10,
    moves: [
      "Seated heart-tap rhythm",
      "5-count inhale, 5-count exhale",
      "Side-to-side motion"
    ],
    visuals: "Pulsing light synced with heart rate",
    category: 'integration',
    difficulty: 'moderate',
    indoorSafe: true,
    outdoorRecommended: false
  },
  {
    day: 20,
    title: "Wake-Up Walk Flow",
    goal: "Low-impact indoor cardio",
    duration: 7,
    moves: [
      "March in place",
      "Side steps",
      "Arm reach + pull"
    ],
    visuals: "Dynamic flow lines following limbs",
    category: 'energy',
    difficulty: 'easy',
    indoorSafe: true,
    outdoorRecommended: true,
    aqiThreshold: 80
  },
  {
    day: 21,
    title: "Ozone Defense Set",
    goal: "Calm nerves and restore focus",
    duration: 6,
    moves: [
      "Slow shoulder circles",
      "Forward bend → rise with inhale",
      "Ear-to-shoulder stretch"
    ],
    visuals: "Purple 'protective aura' around body",
    category: 'recovery',
    difficulty: 'easy',
    indoorSafe: true,
    outdoorRecommended: false
  },
  {
    day: 22,
    title: "Morning Mobility Map",
    goal: "Full-body alignment check",
    duration: 9,
    moves: [
      "Neck → shoulders → hips → knees rolls",
      "Gentle stretch chain"
    ],
    visuals: "Body schematic lighting up zones",
    category: 'stretching',
    difficulty: 'moderate',
    indoorSafe: true,
    outdoorRecommended: false
  },
  {
    day: 23,
    title: "Forest Breath Visualization",
    goal: "Mental cleansing, focus boost",
    duration: 6,
    moves: [
      "Deep forest breathing visualization",
      "Seated back stretch"
    ],
    visuals: "Green mist and forest light animation",
    category: 'breathing',
    difficulty: 'easy',
    indoorSafe: true,
    outdoorRecommended: true,
    aqiThreshold: 50
  },
  {
    day: 24,
    title: "Gentle Core + Breath",
    goal: "Support posture and lung expansion",
    duration: 8,
    moves: [
      "Seated leg lift (small)",
      "Side plank on knees",
      "Controlled breath per move"
    ],
    visuals: "Radiating yellow light from core",
    category: 'energy',
    difficulty: 'moderate',
    indoorSafe: true,
    outdoorRecommended: false
  },
  {
    day: 25,
    title: "Mindful Flow Reset",
    goal: "Combine mindfulness and motion",
    duration: 7,
    moves: [
      "3-count breath per pose",
      "Small Tai Chi arm arcs"
    ],
    visuals: "Floating petals per movement",
    category: 'integration',
    difficulty: 'easy',
    indoorSafe: true,
    outdoorRecommended: true,
    aqiThreshold: 60
  },
  {
    day: 26,
    title: "Calm Start – Allergy Season",
    goal: "Reduce inflammation & tension",
    duration: 6,
    moves: [
      "Sinus massage",
      "Seated chest opener",
      "Extended exhale breathing"
    ],
    visuals: "Light blue calming mist",
    category: 'recovery',
    difficulty: 'easy',
    indoorSafe: true,
    outdoorRecommended: false
  },
  {
    day: 27,
    title: "Lung Energy Booster",
    goal: "Build stamina without stress",
    duration: 9,
    moves: [
      "Shoulder push + release",
      "Controlled squat with breath"
    ],
    visuals: "Energy lines rising upward",
    category: 'energy',
    difficulty: 'moderate',
    indoorSafe: true,
    outdoorRecommended: false
  },
  {
    day: 28,
    title: "Full-Body Air Flow",
    goal: "Oxygenate and detox",
    duration: 10,
    moves: [
      "Forward folds",
      "Wide arm swings",
      "Deep breathing cycle"
    ],
    visuals: "Air current particles swirling gracefully",
    category: 'integration',
    difficulty: 'moderate',
    indoorSafe: true,
    outdoorRecommended: true,
    aqiThreshold: 70
  },
  {
    day: 29,
    title: "Restorative Breath Flow",
    goal: "Deep calm before day starts",
    duration: 8,
    moves: [
      "Supported backbend (hands behind chair)",
      "Extended exhale 6s",
      "Body scan meditation"
    ],
    visuals: "Warm amber sunrise fade",
    category: 'breathing',
    difficulty: 'easy',
    indoorSafe: true,
    outdoorRecommended: false
  },
  {
    day: 30,
    title: "Clean Air Celebration Flow",
    goal: "Integrate all — strength, breath, calm",
    duration: 10,
    moves: [
      "Full body stretch sequence",
      "Hands to heart, gratitude breath",
      "Victory pose"
    ],
    visuals: "Golden sunrise with expanding light waves",
    category: 'integration',
    difficulty: 'moderate',
    indoorSafe: true,
    outdoorRecommended: true,
    aqiThreshold: 80
  }
];

// Helper function to get current day's flow
export const getCurrentDayFlow = (): MorningFlow => {
  const startDate = localStorage.getItem('morningFlowStartDate');
  
  if (!startDate) {
    // First time - start at day 1
    localStorage.setItem('morningFlowStartDate', new Date().toISOString());
    return morningMovementProgram[0];
  }
  
  const start = new Date(startDate);
  const today = new Date();
  const daysDiff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const currentDay = (daysDiff % 30) + 1; // Loop back to day 1 after day 30
  
  return morningMovementProgram[currentDay - 1];
};

// Helper function to check if flow is completed today
export const isFlowCompletedToday = (): boolean => {
  const lastCompleted = localStorage.getItem('lastFlowCompletedDate');
  const today = new Date().toISOString().split('T')[0];
  return lastCompleted === today;
};

// Helper function to mark flow as completed
export const markFlowCompleted = (): void => {
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem('lastFlowCompletedDate', today);
  
  // Update streak
  const streakData = JSON.parse(localStorage.getItem('morningFlowStreak') || '{"current": 0, "longest": 0, "lastDate": null}');
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  if (streakData.lastDate === yesterday) {
    streakData.current += 1;
  } else if (streakData.lastDate !== today) {
    streakData.current = 1;
  }
  
  streakData.longest = Math.max(streakData.longest, streakData.current);
  streakData.lastDate = today;
  
  localStorage.setItem('morningFlowStreak', JSON.stringify(streakData));
};

// Get streak data
export const getFlowStreak = () => {
  return JSON.parse(localStorage.getItem('morningFlowStreak') || '{"current": 0, "longest": 0, "lastDate": null}');
};
