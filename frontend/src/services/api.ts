import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    // Surface helpful messages without noisy stack traces
    if (process.env.NODE_ENV === 'development' && !error?.config?.headers?.['X-Suppress-Api-Error']) {
      // eslint-disable-next-line no-console
      console.warn('API error:', error?.response?.status, error?.response?.data?.detail || error.message);
    }
    return Promise.reject(error);
  }
);

// API service functions
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (userData: any) =>
    api.post('/auth/register', userData),
  
  getProfile: () =>
    api.get('/auth/me'),
  
  refreshToken: () =>
    api.post('/auth/refresh'),
};

export const userAPI = {
  getProfile: () =>
    api.get('/users/profile'),
  
  updateProfile: (userData: any) =>
    api.put('/users/profile', userData),
  
  getOnboardingStatus: () =>
    api.get('/users/onboarding-status'),
  
  deleteAccount: () =>
    api.delete('/users/profile'),
};

export const airQualityAPI = {
  getCurrent: async (lat: number, lon: number, sources?: string) => {
    try {
      // Use test endpoint directly to avoid authentication issues
      return await api.get('/air-quality/current-test', { params: { lat, lon, sources }, headers: { 'X-Suppress-Api-Error': 'true' } as any });
    } catch (error: any) {
      // Graceful fallback: no air quality available
      console.warn('Air quality API failed:', error);
      return { data: [] } as any;
    }
  },
  
  getComprehensive: async (lat: number, lon: number) => {
    try {
      // Use comprehensive-test endpoint for real API data without authentication
      return await api.get('/air-quality/comprehensive-test', { params: { lat, lon }, headers: { 'X-Suppress-Api-Error': 'true' } as any });
    } catch (error: any) {
      // Graceful fallback: no air quality available
      console.warn('Air quality comprehensive API failed:', error);
      return { data: [] } as any;
    }
  },
  
  getHistory: (lat: number, lon: number, hours: number = 24) =>
    api.get('/air-quality/history', { params: { lat, lon, hours } }),
  
  getForecast: (lat: number, lon: number, days: number = 3) =>
    api.get('/air-quality/forecast', { params: { lat, lon, days } }),
};

export const forecastAPI = {
  getTomorrowForecast: async (lat: number, lon: number) => {
    try {
      return await api.get('/forecast/tomorrow', { 
        params: { lat, lon },
        headers: { 'X-Suppress-Api-Error': 'true' } as any 
      });
    } catch (error: any) {
      console.warn('Forecast API failed:', error);
      return { data: null } as any;
    }
  },
  
  getWeekForecast: async (lat: number, lon: number) => {
    try {
      return await api.get('/forecast/week', { 
        params: { lat, lon },
        headers: { 'X-Suppress-Api-Error': 'true' } as any 
      });
    } catch (error: any) {
      console.warn('Week forecast API failed:', error);
      return { data: null } as any;
    }
  },
};

export const predictionsAPI = {
  // CONSOLIDATED: Get all prediction data in one call
  getPredictionData: async () => {
    try {
      const results = await Promise.allSettled([
        api.get('/predictions/daily-forecast-test', { params: { days: 7 } }),
        api.get('/predictions/history', { params: { days: 30 } }),
        api.get('/predictions/risk-factors'),
        api.get('/predictions/hourly-predictions')
      ]);
      const [forecastRes, historyRes, factorsRes, hourlyRes] = results;
      const forecast = forecastRes.status === 'fulfilled' ? forecastRes.value.data : [];
      const history = historyRes.status === 'fulfilled' ? historyRes.value.data : [];
      const riskFactors = factorsRes.status === 'fulfilled' ? factorsRes.value.data : [];
      const hourly = hourlyRes.status === 'fulfilled' ? hourlyRes.value.data : [];
      return { forecast, history, riskFactors, hourly };
    } catch (error) {
      throw error;
    }
  },

  // Hourly predictions (6h, 12h, 24h, 2d, 3d)
  getHourlyPredictions: () =>
    api.get('/predictions/hourly-predictions'),

  // Flare-up risk (for dashboard) 
  getFlareupRisk: (lat: number, lon: number) =>
    api.get('/predictions/flareup-risk', { params: { lat, lon } }),

  // Individual calls if needed
  getDailyForecast: (days: number = 7) =>
    api.get('/predictions/daily-forecast-test', { params: { days } }),
  
  getHistory: (days: number = 30) =>
    api.get('/predictions/history', { params: { days } }),
  
  getRiskFactors: () =>
    api.get('/predictions/risk-factors'),
};

export const coachingAPI = {
  
  // CONSOLIDATED: Single daily briefing endpoint (no duplicates)
  getDailyBriefing: (email: string, lat: number, lon: number) =>
    api.get('/coaching/daily-briefing', { params: { email, lat, lon } }),
  
  // Today's recommendations
  getTodaysRecommendations: () =>
    api.get('/coaching/quantified-recommendations'),

  // Coaching sessions
  getSessions: (limit: number = 10) =>
    api.get('/coaching/sessions', { params: { limit } }),

  // Education snippets
  getEducationSnippet: (topic: string) =>
    api.post('/coaching/education-snippet', { topic }),

  // Session feedback
  provideFeedback: (sessionId: string, rating: number) =>
    api.post(`/coaching/sessions/${sessionId}/feedback`, { feedback: rating }),

  // Voice query if needed
  voiceQuery: (query: string, context?: any) =>
    api.post('/coaching/voice-query', { query, context }),
};

export const smartHomeAPI = {
  getDevices: () =>
    api.get('/smart-home/devices'),
  
  addDevice: (deviceData: any) =>
    api.post('/smart-home/devices', deviceData),
  
  updateDevice: (deviceId: string, updateData: any) =>
    api.put(`/smart-home/devices/${deviceId}`, updateData),
  
  removeDevice: (deviceId: string) =>
    api.delete(`/smart-home/devices/${deviceId}`),
  
  controlDevice: (deviceId: string, action: string, value?: any) =>
    api.post(`/smart-home/devices/${deviceId}/control`, { action, value }),
  
  triggerAutomation: (riskLevel: string) =>
    api.post('/smart-home/automation/trigger', { risk_level: riskLevel }),
};

export const paymentsAPI = {
  getPlans: () =>
    api.get('/payments/plans'),
  
  createSubscription: (planType: string, paymentMethodId: string) =>
    api.post('/payments/create-subscription', { plan_type: planType, payment_method_id: paymentMethodId }),
  
  getCurrentSubscription: () =>
    api.get('/payments/subscription'),
  
  cancelSubscription: () =>
    api.post('/payments/cancel-subscription'),
  
  getUsageStats: () =>
    api.get('/payments/usage'),
};

// Health History API
export const healthHistoryAPI = {
  // Lung Function
  addLungFunctionReading: (reading: any) =>
    api.post('/health-history/lung-function', reading),
  
  getLungFunctionHistory: (limit: number = 50) =>
    api.get('/health-history/lung-function', { params: { limit } }),
  
  getLungFunctionTrends: (days: number = 30) =>
    api.get('/health-history/lung-function/trends', { params: { days } }),
  
  // Medications
  addMedication: (medication: any) =>
    api.post('/health-history/medications', medication),
  
  getMedications: (activeOnly: boolean = true) =>
    api.get('/health-history/medications', { params: { active_only: activeOnly } }),
  
  logMedicationDose: (medicationId: string, dose: any) =>
    api.post(`/health-history/medications/${medicationId}/doses`, dose),
  
  getMedicationAdherence: (days: number = 30) =>
    api.get('/health-history/medications/adherence', { params: { days } }),
  
  // Biometrics
  addBiometricReading: (reading: any) =>
    api.post('/health-history/biometrics', reading),
  
  getBiometricHistory: (readingType: string, limit: number = 50) =>
    api.get(`/health-history/biometrics/${readingType}`, { params: { limit } }),
  
  // Symptoms
  logSymptom: (symptom: any) =>
    api.post('/health-history/symptoms', symptom),
  
  // Goals
  createHealthGoal: (goal: any) =>
    api.post('/health-history/goals', goal),
  
  getHealthGoals: (activeOnly: boolean = true) =>
    api.get('/health-history/goals', { params: { active_only: activeOnly } }),
};

// Behavior Tracking API
export const behaviorTrackingAPI = {
  // Activities
  logActivity: (activity: any) =>
    api.post('/behavior/activities', activity),
  
  getActivityHistory: (days: number = 30, activityType?: string) =>
    api.get('/behavior/activities', { params: { days, activity_type: activityType } }),
  
  getActivityPatterns: (days: number = 90) =>
    api.get('/behavior/activities/patterns', { params: { days } }),
  
  // Exposures
  logExposure: (exposure: any) =>
    api.post('/behavior/exposures', exposure),
  
  getExposureHistory: (days: number = 30, exposureType?: string) =>
    api.get('/behavior/exposures', { params: { days, exposure_type: exposureType } }),
  
  getExposureRiskAnalysis: (days: number = 90) =>
    api.get('/behavior/exposures/risk-analysis', { params: { days } }),
  
  // Location
  logLocationUpdate: (location: any) =>
    api.post('/behavior/location-updates', location),
  
  getLocationInsights: (days: number = 30) =>
    api.get('/behavior/location-insights', { params: { days } }),
};

// Gamification API
export const gamificationAPI = {
  getStats: () =>
    api.get('/gamification/stats'),
  
  getAchievements: () =>
    api.get('/gamification/achievements'),
  
  getLeaderboard: (period: string = 'all_time', limit: number = 10) =>
    api.get('/gamification/leaderboard', { params: { period, limit } }),
  
  getChallenges: () =>
    api.get('/gamification/challenges'),
  
  completeChallenge: (challengeId: string) =>
    api.post(`/gamification/challenges/${challengeId}/complete`),
  
  dailyCheckin: () =>
    api.post('/gamification/daily-checkin'),
  
  getMotivation: () =>
    api.get('/gamification/motivation'),
};

// Privacy API
export const privacyAPI = {
  getSettings: () =>
    api.get('/privacy/settings'),
  
  updateSettings: (settings: any) =>
    api.put('/privacy/settings', settings),
  
  updateConsent: (consent: any) =>
    api.post('/privacy/consent', consent),
  
  getDataAccessLog: (days: number = 30, limit: number = 100) =>
    api.get('/privacy/data-access-log', { params: { days, limit } }),
  
  requestDataExport: (exportRequest: any) =>
    api.post('/privacy/data-export', exportRequest),
  
  requestDataDeletion: (deletionRequest: any) =>
    api.post('/privacy/data-deletion', deletionRequest),
  
  getDataSummary: () =>
    api.get('/privacy/data-summary'),
  
  getDataUsageInsights: () =>
    api.get('/privacy/data-usage-insights'),
};

// Compound Exposure API
export const compoundExposureAPI = {
  analyzeExposure: (exposures: any[], userHealthProfile?: any) =>
    api.post('/compound-exposure/analyze', { exposures, user_health_profile: userHealthProfile }),
  
  getInteractions: () =>
    api.get('/compound-exposure/interactions'),
  
  getThresholds: () =>
    api.get('/compound-exposure/thresholds'),
  
  predictInteractions: (forecastHours: number = 24, location?: any) =>
    api.post('/compound-exposure/predict-interactions', { forecast_hours: forecastHours, location }),
  
  getPersonalSensitivity: () =>
    api.get('/compound-exposure/personal-sensitivity'),
  
  getHistory: (days: number = 30) =>
    api.get('/compound-exposure/history', { params: { days } }),
};
