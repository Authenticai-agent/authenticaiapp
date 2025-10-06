/**
 * Location Service
 * Handles automatic location detection and travel-based updates
 */

import { api } from './api';

export interface LocationData {
  lat: number;
  lon: number;
  accuracy?: number;
  timestamp?: string;
}

export interface LocationUpdate {
  status: string;
  location_updated: boolean;
  location_change_detected: boolean;
  distance_moved_km: number;
  travel_mode: string;
  current_location: {
    lat: number;
    lon: number;
    city: string;
    state: string;
    country: string;
    address: string;
    timestamp: string;
  };
  requires_environmental_update: boolean;
  travel_detected?: boolean;
  new_city?: string;
  previous_city?: string;
  message?: string;
}

export interface TravelSummary {
  total_distance_km: number;
  locations_visited: number;
  travel_time_hours: number;
  cities_visited: string[];
  is_traveling: boolean;
  current_city: string;
  start_city: string;
}

class LocationService {
  private watchId: number | null = null;
  private lastKnownLocation: LocationData | null = null;
  private updateInterval: NodeJS.Timeout | null = null;
  private isTracking = false;
  private onLocationChangeCallback: ((update: LocationUpdate) => void) | null = null;

  /**
   * Start automatic location tracking
   */
  startLocationTracking(onLocationChange?: (update: LocationUpdate) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      this.onLocationChangeCallback = onLocationChange || null;
      this.isTracking = true;

      // Get initial location
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const locationData: LocationData = {
              lat: position.coords.latitude,
              lon: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: new Date().toISOString()
            };

            await this.updateLocation(locationData);
            this.lastKnownLocation = locationData;

            // Start watching for location changes
            this.startWatching();
            
            // Set up periodic updates (every 5 minutes)
            this.updateInterval = setInterval(() => {
              this.checkLocationUpdate();
            }, 5 * 60 * 1000); // 5 minutes

            resolve();
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          reject(new Error(`Location access denied: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000 // 1 minute
        }
      );
    });
  }

  /**
   * Stop location tracking
   */
  stopLocationTracking(): void {
    this.isTracking = false;
    
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    this.onLocationChangeCallback = null;
  }

  /**
   * Get current location status
   */
  async getCurrentLocationStatus(): Promise<any> {
    try {
      const response = await api.get('/location/current-test');
      return response.data;
    } catch (error) {
      console.error('Error getting current location status:', error);
      throw error;
    }
  }

  /**
   * Get location history
   */
  async getLocationHistory(limit: number = 20): Promise<any[]> {
    try {
      const response = await api.get('/location/history', { params: { limit } });
      return response.data;
    } catch (error) {
      console.error('Error getting location history:', error);
      throw error;
    }
  }

  /**
   * Get travel summary
   */
  async getTravelSummary(): Promise<TravelSummary> {
    try {
      const response = await api.get('/location/travel-summary-test');
      return response.data;
    } catch (error) {
      console.error('Error getting travel summary:', error);
      throw error;
    }
  }

  /**
   * Get environmental update for current location
   */
  async getEnvironmentalUpdate(): Promise<any> {
    try {
      const response = await api.get('/location/environmental-update');
      return response.data;
    } catch (error) {
      console.error('Error getting environmental update:', error);
      throw error;
    }
  }

  /**
   * Manually trigger location update
   */
  async triggerLocationUpdate(lat: number, lon: number): Promise<any> {
    try {
      const response = await api.post('/location/trigger-environmental-update', {
        lat,
        lon,
        user_id: 'manual_update'
      });
      return response.data;
    } catch (error) {
      console.error('Error triggering location update:', error);
      throw error;
    }
  }

  /**
   * Check if user is currently traveling
   */
  async isUserTraveling(): Promise<boolean> {
    try {
      const status = await this.getCurrentLocationStatus();
      return status.is_traveling || false;
    } catch (error) {
      console.error('Error checking travel status:', error);
      return false;
    }
  }

  /**
   * Get current location from browser
   */
  getCurrentPosition(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          });
        },
        (error) => {
          reject(new Error(`Location error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }

  private startWatching(): void {
    if (!navigator.geolocation) return;

    this.watchId = navigator.geolocation.watchPosition(
      async (position) => {
        if (!this.isTracking) return;

        const newLocation: LocationData = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString()
        };

        // Check if location changed significantly
        if (this.hasLocationChangedSignificantly(newLocation)) {
          try {
            await this.updateLocation(newLocation);
            this.lastKnownLocation = newLocation;
          } catch (error) {
            console.error('Error updating location:', error);
          }
        }
      },
      (error) => {
        console.error('Location watch error:', error);
      },
      {
        enableHighAccuracy: false, // Use less battery for continuous tracking
        timeout: 30000,
        maximumAge: 120000 // 2 minutes
      }
    );
  }

  private hasLocationChangedSignificantly(newLocation: LocationData): boolean {
    if (!this.lastKnownLocation) return true;

    // Calculate distance using Haversine formula
    const distance = this.calculateDistance(
      this.lastKnownLocation.lat,
      this.lastKnownLocation.lon,
      newLocation.lat,
      newLocation.lon
    );

    // Consider significant if moved more than 1km
    return distance > 1.0;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private async updateLocation(locationData: LocationData): Promise<void> {
    try {
      const response = await api.post('/location/update', locationData);
      const update: LocationUpdate = response.data;

      // Call callback if location change detected
      if (update.location_change_detected && this.onLocationChangeCallback) {
        this.onLocationChangeCallback(update);
      }

      // Show notification for significant location changes
      if (update.travel_detected && update.message) {
        this.showLocationChangeNotification(update);
      }

    } catch (error) {
      console.error('Error updating location on server:', error);
      throw error;
    }
  }

  private async checkLocationUpdate(): Promise<void> {
    if (!this.isTracking) return;

    try {
      const currentPosition = await this.getCurrentPosition();
      if (this.hasLocationChangedSignificantly(currentPosition)) {
        await this.updateLocation(currentPosition);
        this.lastKnownLocation = currentPosition;
      }
    } catch (error) {
      console.error('Error checking location update:', error);
    }
  }

  private showLocationChangeNotification(update: LocationUpdate): void {
    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Location Changed', {
        body: update.message,
        icon: '/favicon.ico',
        tag: 'location-change'
      });
    }

    // Also log to console for development
    console.log('🌍 Location Change Detected:', update);
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
}

// Export singleton instance
export const locationService = new LocationService();
export default locationService;
