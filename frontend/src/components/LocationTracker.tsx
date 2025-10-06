/**
 * Location Tracker Component
 * Handles automatic location detection and displays travel status
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapPinIcon, GlobeAltIcon, TruckIcon } from '@heroicons/react/24/outline';
import { locationService, LocationUpdate, TravelSummary } from '../services/locationService';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface LocationTrackerProps {
  onLocationChange?: (update: LocationUpdate) => void;
  className?: string;
}

export const LocationTracker: React.FC<LocationTrackerProps> = ({ 
  onLocationChange, 
  className 
}) => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [travelSummary, setTravelSummary] = useState<TravelSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locationSetByEventRef = useRef(false);

  const loadLocationStatus = useCallback(async () => {
    try {
      const [locationStatus, travelData] = await Promise.all([
        locationService.getCurrentLocationStatus(),
        locationService.getTravelSummary()
      ]);
      
      // Only update location if it wasn't set by event listener
      if (!locationSetByEventRef.current) {
        setCurrentLocation(locationStatus.current_location);
      }
      setTravelSummary(travelData);
      setIsTracking(locationStatus.current_location !== null);
    } catch (error) {
      console.error('Error loading location status:', error);
    }
  }, []);

  useEffect(() => {
    // Load initial location status
    loadLocationStatus();
    
    // Request notification permission
    locationService.requestNotificationPermission();

    // Listen for location changes from DevelopmentLocationTester
    const handleLocationChange = (event: CustomEvent) => {
      console.log('LocationTracker received location change:', event.detail);
      locationSetByEventRef.current = true;
      const newLocation = {
        city: event.detail.city,
        state: event.detail.country,
        address: `${event.detail.lat}, ${event.detail.lon}`,
        timestamp: event.detail.timestamp,
        lat: event.detail.lat,
        lon: event.detail.lon
      };
      console.log('Setting current location to:', newLocation);
      setCurrentLocation(newLocation);
    };
    
    window.addEventListener('locationChanged', handleLocationChange as EventListener);
    
    return () => {
      window.removeEventListener('locationChanged', handleLocationChange as EventListener);
    };
  }, [loadLocationStatus]);

  useEffect(() => {
    console.log('currentLocation state updated:', currentLocation);
  }, [currentLocation]);

  const startTracking = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await locationService.startLocationTracking((update) => {
        // Handle location change
        setCurrentLocation(update.current_location);
        
        // Show toast notification
        if (update.travel_detected) {
          toast.success(
            `🌍 Welcome to ${update.new_city}!\nUpdating environmental data...`,
            { duration: 5000 }
          );
        }
        
        // Call parent callback
        if (onLocationChange) {
          onLocationChange(update);
        }
        
        // Refresh travel summary
        loadLocationStatus();
      });
      
      setIsTracking(true);
      toast.success('Location tracking started');
      
      // Reload status after starting
      await loadLocationStatus();
      
    } catch (error: any) {
      setError(error.message);
      toast.error(`Failed to start location tracking: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const stopTracking = () => {
    locationService.stopLocationTracking();
    setIsTracking(false);
    toast.success('Location tracking stopped');
  };

  const refreshLocation = async () => {
    setIsLoading(true);
    try {
      const position = await locationService.getCurrentPosition();
      await locationService.triggerLocationUpdate(position.lat, position.lon);
      await loadLocationStatus();
      toast.success('Location updated successfully');
    } catch (error: any) {
      toast.error(`Failed to update location: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={clsx("bg-white rounded-lg border border-gray-200 p-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <MapPinIcon className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Location Tracking</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          {isTracking ? (
            <button
              onClick={stopTracking}
              className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm font-medium hover:bg-red-200 transition-colors"
            >
              Stop Tracking
            </button>
          ) : (
            <button
              onClick={startTracking}
              disabled={isLoading}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Starting...' : 'Start Tracking'}
            </button>
          )}
          
          <button
            onClick={refreshLocation}
            disabled={isLoading}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {isLoading ? '...' : '🔄'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Current Location */}
      {currentLocation && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center space-x-2 mb-2">
            <GlobeAltIcon className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-900">Current Location</span>
          </div>
          <p className="text-sm text-blue-800">
            📍 {currentLocation.city}, {currentLocation.state}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            {currentLocation.address}
          </p>
          <p className="text-xs text-blue-500 mt-1">
            Updated: {new Date(currentLocation.timestamp).toLocaleString()}
          </p>
        </div>
      )}

      {/* Travel Summary */}
      {travelSummary && travelSummary.locations_visited > 1 && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center space-x-2 mb-2">
            <TruckIcon className="h-4 w-4 text-green-600" />
            <span className="font-medium text-green-900">Travel Summary</span>
            {travelSummary.is_traveling && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                Traveling
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-green-600">Distance:</span>
              <span className="ml-1 font-medium text-green-800">
                {travelSummary.total_distance_km} km
              </span>
            </div>
            <div>
              <span className="text-green-600">Locations:</span>
              <span className="ml-1 font-medium text-green-800">
                {travelSummary.locations_visited}
              </span>
            </div>
            <div>
              <span className="text-green-600">Travel Time:</span>
              <span className="ml-1 font-medium text-green-800">
                {travelSummary.travel_time_hours.toFixed(1)}h
              </span>
            </div>
            <div>
              <span className="text-green-600">Cities:</span>
              <span className="ml-1 font-medium text-green-800">
                {travelSummary.cities_visited.length}
              </span>
            </div>
          </div>
          
          {travelSummary.cities_visited.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-green-600">Route:</p>
              <p className="text-xs text-green-700 font-medium">
                {travelSummary.cities_visited.join(' → ')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Status Indicator */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <div className={clsx(
            "w-2 h-2 rounded-full",
            isTracking ? "bg-green-500" : "bg-gray-400"
          )} />
          <span className="text-gray-600">
            {isTracking ? 'Tracking active' : 'Tracking inactive'}
          </span>
        </div>
        
        {isTracking && (
          <span className="text-xs text-gray-500">
            Auto-updates every 5 minutes
          </span>
        )}
      </div>

      {/* Instructions */}
      {!isTracking && (
        <div className="mt-3 p-2 bg-gray-50 rounded-md">
          <p className="text-xs text-gray-600">
            💡 Enable location tracking to automatically get updated environmental data 
            and health recommendations as you travel between cities.
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationTracker;
