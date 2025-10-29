import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  age?: number;
  location?: {
    lat: number;
    lon: number;
    address?: string;
  };
  allergies?: string[];
  asthma_severity?: string;
  triggers?: string[];
  health_conditions?: string[];
  medications?: string[];
  household_info?: any;
  avatar?: string;
  subscription_tier: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      let baseUser = response.data;

      // Fetch full profile (via safe PUT echo) and merge to ensure location and other fields are present
      try {
        const profileResp = await api.put('/users/profile', { email: baseUser?.email }, {
          headers: { 'X-Suppress-Api-Error': 'true' }
        } as any);
        const profileData = profileResp.data?.profile_data || {};
        const normalized = {
          ...profileData,
          location: profileData.location || (
            (profileData.location_lat !== undefined || profileData.location_lon !== undefined || profileData.location_address)
              ? { lat: profileData.location_lat, lon: profileData.location_lon, address: profileData.location_address }
              : undefined
          )
        };
        baseUser = { ...baseUser, ...normalized };
      } catch (e) {
        // ignore profile fetch error; keep base user
      }

      setUser(baseUser);
    } catch (error: any) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    console.log('🔐 Login attempt for:', email);
    setLoading(true); // Set loading to prevent premature redirect
    
    try {
      console.log('📡 Calling /auth/login...');
      const response = await api.post('/auth/login', { email, password });
      const { access_token } = response.data;
      console.log('✅ Login successful, got token');
      
      localStorage.setItem('token', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Fetch user profile
      console.log('📡 Fetching user profile from /auth/me...');
      const userResponse = await api.get('/auth/me');
      let mergedUser = userResponse.data;
      console.log('✅ Got user data:', mergedUser);
      
      // Try to merge with extended profile (non-blocking)
      try {
        console.log('📡 Fetching extended profile...');
        const profileResp = await api.put('/users/profile', { email }, {
          headers: { 'X-Suppress-Api-Error': 'true' }
        } as any);
        const profileData = profileResp.data?.profile_data || {};
        
        const normalized = {
          ...profileData,
          location: profileData.location || (
            (profileData.location_lat !== undefined || profileData.location_lon !== undefined || profileData.location_address)
              ? { lat: profileData.location_lat, lon: profileData.location_lon, address: profileData.location_address }
              : undefined
          )
        };
        mergedUser = { ...mergedUser, ...normalized };
        console.log('✅ Merged profile data');
      } catch (e) {
        console.warn('⚠️  Profile merge failed (non-critical):', e);
      }
      
      // Set user and complete login
      console.log('✅ Setting user and completing login');
      setUser(mergedUser);
      setLoading(false);
      
      toast.success('Welcome back!');
      console.log('🎉 Login complete!');
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      const message = error.response?.data?.detail || error.message || 'Login failed';
      toast.error(message);
      setLoading(false);
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { access_token } = response.data;
      
      localStorage.setItem('token', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Fetch user and merge with full profile
      const userResponse = await api.get('/auth/me');
      let mergedUser = userResponse.data;
      try {
        const profileResp = await api.put('/users/profile', { email: userData.email }, {
          headers: { 'X-Suppress-Api-Error': 'true' }
        } as any);
        const profileData = profileResp.data?.profile_data || {};
        const normalized = {
          ...profileData,
          location: profileData.location || (
            (profileData.location_lat !== undefined || profileData.location_lon !== undefined || profileData.location_address)
              ? { lat: profileData.location_lat, lon: profileData.location_lon, address: profileData.location_address }
              : undefined
          )
        };
        mergedUser = { ...mergedUser, ...normalized };
      } catch (e) {}
      setUser(mergedUser);
      setLoading(false);
      
      toast.success('Account created successfully!');
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Registration failed';
      toast.error(message);
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    // SECURITY: Clear ALL user-specific data to prevent data leakage between users
    
    // Auth tokens
    localStorage.removeItem('token');
    
    // Dashboard data
    localStorage.removeItem('riskPrediction');
    localStorage.removeItem('airQuality');
    localStorage.removeItem('dailyBriefing');
    localStorage.removeItem('lastUserId');
    localStorage.removeItem('lastBriefingUserId');
    
    // Wellness data - MUST be cleared for security
    localStorage.removeItem('breathingRiskTrend');
    localStorage.removeItem('wellness_streak');
    localStorage.removeItem('wellness_check_ins');
    localStorage.removeItem('dailyFeelings');
    localStorage.removeItem('lungEnergyCheckIns');
    
    // Daily activities
    localStorage.removeItem('affirmation_completed_date');
    localStorage.removeItem('daily_affirmation_completed');
    localStorage.removeItem('challenges_completed');
    localStorage.removeItem('daily_ritual_completed');
    localStorage.removeItem('daily_ritual_streak');
    localStorage.removeItem('pollution_defense_completed');
    localStorage.removeItem('pollution_defense_symptoms');
    
    // Morning flow program
    localStorage.removeItem('morningFlowStartDate');
    localStorage.removeItem('lastFlowCompletedDate');
    localStorage.removeItem('morningFlowStreak');
    
    // Briefing limits
    localStorage.removeItem('briefing_usage');
    
    // Location data
    localStorage.removeItem('effective_location');
    
    // Analytics
    localStorage.removeItem('analytics_events');
    
    // Last daily reset
    localStorage.removeItem('last_daily_reset');
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Remove authorization header
    delete api.defaults.headers.common['Authorization'];
    
    // Clear user state
    setUser(null);
    
    // Force page reload to clear any cached data and redirect to login
    window.location.href = '/login';
    
    toast.success('Logged out successfully');
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const payload = { ...userData, email: user.email };
      const resp = await api.put('/users/profile', payload);

      // Backend returns { status, message, user_id, email, profile_data, ... }
      const updated = resp.data?.profile_data ?? {};
      const merged: User = {
        ...user,
        email: resp.data?.email ?? user.email,
        first_name: updated.first_name ?? user.first_name,
        last_name: updated.last_name ?? user.last_name,
        asthma_severity: updated.asthma_severity ?? user.asthma_severity,
        age: updated.age ?? user.age,
        location: updated.location ?? user.location,
        avatar: updated.avatar ?? user.avatar,
        updated_at: new Date().toISOString(),
      } as User;

      setUser(merged);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      const message = error?.response?.data?.detail || 'Update failed';
      toast.error(message);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      let mergedUser = response.data;
      try {
        const profileResp = await api.get('/users/profile', {
          headers: { 'X-Suppress-Api-Error': 'true' }
        } as any);
        // GET /users/profile returns the User object directly
        const profileData = profileResp.data || {};
        const normalized = {
          ...profileData,
          location: profileData.location || (
            (profileData.location_lat !== undefined || profileData.location_lon !== undefined || profileData.location_address)
              ? { lat: profileData.location_lat, lon: profileData.location_lon, address: profileData.location_address }
              : undefined
          )
        };
        mergedUser = { ...mergedUser, ...normalized };
      } catch (e) {}
      setUser(mergedUser);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
