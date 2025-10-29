/**
 * Analytics Collector - Centralized data collection for AI Coach analysis
 * Tracks all user interactions, wellness data, and environmental correlations
 */

export interface AnalyticsEvent {
  eventType: string;
  timestamp: string;
  userId?: string;
  data: Record<string, any>;
  sessionId: string;
  environmentalContext?: {
    aqi?: number;
    pm25?: number;
    humidity?: number;
    temperature?: number;
    pollenLevel?: string;
  };
}

class AnalyticsCollector {
  private sessionId: string;
  private eventQueue: AnalyticsEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startAutoFlush();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startAutoFlush() {
    // Flush events every 30 seconds
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 30000);
  }

  /**
   * Track any event with environmental context
   */
  track(eventType: string, data: Record<string, any> = {}, environmentalContext?: any) {
    const event: AnalyticsEvent = {
      eventType,
      timestamp: new Date().toISOString(),
      userId: this.getUserId(),
      data,
      sessionId: this.sessionId,
      environmentalContext
    };

    this.eventQueue.push(event);
    
    // Also save to localStorage for offline support
    this.saveToLocalStorage(event);

    // Flush if queue is large
    if (this.eventQueue.length >= 10) {
      this.flush();
    }
  }

  private getUserId(): string | undefined {
    try {
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        return userData.id;
      }
    } catch (error) {
      console.error('Error getting user ID:', error);
    }
    return undefined;
  }

  private saveToLocalStorage(event: AnalyticsEvent) {
    try {
      const stored = localStorage.getItem('analytics_events');
      const events: AnalyticsEvent[] = stored ? JSON.parse(stored) : [];
      events.push(event);
      
      // Keep only last 1000 events in localStorage
      const trimmed = events.slice(-1000);
      localStorage.setItem('analytics_events', JSON.stringify(trimmed));
    } catch (error) {
      console.error('Error saving analytics to localStorage:', error);
    }
  }

  async flush() {
    if (this.eventQueue.length === 0) return;

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
      await fetch(`${API_BASE_URL}/analytics/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events: eventsToSend }),
      });
    } catch (error) {
      console.error('Error flushing analytics:', error);
      // Re-queue events on failure
      this.eventQueue.unshift(...eventsToSend);
    }
  }

  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush();
  }
}

// Singleton instance
const analytics = new AnalyticsCollector();

// Specific tracking functions for different features

export const trackDailyRitual = {
  started: (phase: string, airQuality?: any) => {
    analytics.track('daily_ritual.started', { phase }, airQuality);
  },
  
  phaseCompleted: (phase: string, duration: number, airQuality?: any) => {
    analytics.track('daily_ritual.phase_completed', { 
      phase, 
      duration_seconds: duration 
    }, airQuality);
  },
  
  completed: (totalDuration: number, streak: number, airQuality?: any) => {
    analytics.track('daily_ritual.completed', { 
      total_duration_seconds: totalDuration,
      streak_count: streak
    }, airQuality);
  },
  
  abandoned: (phase: string, timeSpent: number) => {
    analytics.track('daily_ritual.abandoned', { 
      phase, 
      time_spent_seconds: timeSpent 
    });
  }
};

export const trackPollutionDefense = {
  triggered: (aqi: number, pm25: number, reason: string) => {
    analytics.track('pollution_defense.triggered', { 
      aqi, 
      pm25, 
      trigger_reason: reason 
    });
  },
  
  preChecklistCompleted: (items: string[], airQuality?: any) => {
    analytics.track('pollution_defense.pre_checklist_completed', { 
      completed_items: items 
    }, airQuality);
  },
  
  walkStarted: (duration: number, airQuality?: any) => {
    analytics.track('pollution_defense.walk_started', { 
      planned_duration_minutes: duration 
    }, airQuality);
  },
  
  walkCompleted: (actualDuration: number, remindersShown: number, airQuality?: any) => {
    analytics.track('pollution_defense.walk_completed', { 
      actual_duration_seconds: actualDuration,
      reminders_shown: remindersShown
    }, airQuality);
  },
  
  symptomsReported: (symptoms: any, airQuality?: any) => {
    analytics.track('pollution_defense.symptoms_reported', symptoms, airQuality);
  }
};

export const trackMicroCoaching = {
  promptShown: (promptType: string, message: string, airQuality?: any) => {
    analytics.track('micro_coaching.prompt_shown', { 
      prompt_type: promptType,
      message 
    }, airQuality);
  },
  
  promptActioned: (promptType: string, action: string) => {
    analytics.track('micro_coaching.prompt_actioned', { 
      prompt_type: promptType,
      action 
    });
  }
};

export const trackWellnessJournal = {
  entryCreated: (mood: string, feeling: number, notes: string, airQuality?: any) => {
    analytics.track('wellness_journal.entry_created', { 
      mood, 
      feeling_score: feeling,
      has_notes: notes.length > 0
    }, airQuality);
  },
  
  correlationViewed: (metric: string, correlation: number) => {
    analytics.track('wellness_journal.correlation_viewed', { 
      metric, 
      correlation_strength: correlation 
    });
  }
};

export const trackEnvironmentalTips = {
  tipShown: (tipType: string, recipe: string, airQuality?: any) => {
    analytics.track('environmental_tips.tip_shown', { 
      tip_type: tipType,
      recipe 
    }, airQuality);
  },
  
  recipeCompleted: (tipType: string) => {
    analytics.track('environmental_tips.recipe_completed', { 
      tip_type: tipType 
    });
  }
};

export const trackLungEnergy = {
  checkIn: (noFlareUp: boolean, streak: number, airQuality?: any) => {
    analytics.track('lung_energy.check_in', { 
      no_flare_up: noFlareUp,
      streak_count: streak
    }, airQuality);
  },
  
  levelUp: (newLevel: string, totalPoints: number) => {
    analytics.track('lung_energy.level_up', { 
      new_level: newLevel,
      total_points: totalPoints
    });
  }
};

export const trackMorningMovement = {
  flowStarted: (day: number, flowName: string) => {
    analytics.track('morning_movement.flow_started', { 
      day_number: day,
      flow_name: flowName
    });
  },
  
  flowCompleted: (day: number, duration: number) => {
    analytics.track('morning_movement.flow_completed', { 
      day_number: day,
      duration_seconds: duration
    });
  },
  
  exerciseViewed: (exerciseName: string, index: number) => {
    analytics.track('morning_movement.exercise_viewed', { 
      exercise_name: exerciseName,
      exercise_index: index
    });
  }
};

export const trackAffirmation = {
  viewed: (affirmation: string, category: string) => {
    analytics.track('affirmation.viewed', { 
      affirmation,
      category
    });
  },
  
  completed: (affirmation: string, repetitions: number) => {
    analytics.track('affirmation.completed', { 
      affirmation,
      repetitions
    });
  }
};

export const trackAppUsage = {
  sessionStarted: () => {
    analytics.track('app.session_started', {});
  },
  
  sessionEnded: (duration: number) => {
    analytics.track('app.session_ended', { 
      duration_seconds: duration 
    });
  },
  
  pageViewed: (pageName: string) => {
    analytics.track('app.page_viewed', { 
      page_name: pageName 
    });
  },
  
  featureUsed: (featureName: string, action: string) => {
    analytics.track('app.feature_used', { 
      feature_name: featureName,
      action
    });
  }
};

export const trackAirQuality = {
  dataFetched: (aqi: number, pm25: number, location: string) => {
    analytics.track('air_quality.data_fetched', { 
      aqi, 
      pm25, 
      location 
    });
  },
  
  alertTriggered: (alertType: string, threshold: number, currentValue: number) => {
    analytics.track('air_quality.alert_triggered', { 
      alert_type: alertType,
      threshold,
      current_value: currentValue
    });
  }
};

// Export singleton
export default analytics;
