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
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token } = response.data;
      
      localStorage.setItem('token', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Fetch user and merge with full profile
      const userResponse = await api.get('/auth/me');
      let mergedUser = userResponse.data;
      console.log('User from /auth/me:', mergedUser);
      console.log('Avatar from /auth/me:', mergedUser.avatar);
      
      try {
        const profileResp = await api.put('/users/profile', { email }, {
          headers: { 'X-Suppress-Api-Error': 'true' }
        } as any);
        const profileData = profileResp.data?.profile_data || {};
        console.log('Profile data from /users/profile:', profileData);
        console.log('Avatar from profile:', profileData.avatar);
        
        const normalized = {
          ...profileData,
          location: profileData.location || (
            (profileData.location_lat !== undefined || profileData.location_lon !== undefined || profileData.location_address)
              ? { lat: profileData.location_lat, lon: profileData.location_lon, address: profileData.location_address }
              : undefined
          )
        };
        mergedUser = { ...mergedUser, ...normalized };
        console.log('Final merged user:', mergedUser);
        console.log('Final avatar:', mergedUser.avatar);
      } catch (e) {
        console.log('Profile merge error:', e);
      }
      setUser(mergedUser);
      setLoading(false);
      
      toast.success('Welcome back!');
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Login failed';
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
    // Clear all session data
    localStorage.removeItem('token');
    localStorage.clear(); // Clear all localStorage to prevent any data leakage
    sessionStorage.clear(); // Clear sessionStorage as well
    
    // Remove authorization header
    delete api.defaults.headers.common['Authorization'];
    
    // Clear user state
    setUser(null);
    
    // Clear browser cache for security
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
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
