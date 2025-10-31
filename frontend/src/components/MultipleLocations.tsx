import React, { useState, useEffect } from 'react';
import { 
  MapPinIcon, 
  PlusIcon, 
  TrashIcon, 
  StarIcon,
  PencilIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';
import CitySearch from './CitySearch';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

interface SavedLocation {
  id: string;
  name: string;
  lat: number;
  lon: number;
  address?: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

interface LocationWithAQ extends SavedLocation {
  air_quality?: {
    aqi: number;
    pm25: number;
    category: string;
  };
  error?: string;
}

const MultipleLocations: React.FC = () => {
  const [locations, setLocations] = useState<LocationWithAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    lat: '',
    lon: '',
    address: ''
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  const fetchLocations = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/locations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch locations');
      
      const data = await response.json();
      setLocations(data);
      
      // Fetch air quality for each location
      if (data.length > 0) {
        fetchAllAirQuality(data);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast.error('Failed to load locations');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllAirQuality = async (locs: SavedLocation[]) => {
    const token = getAuthToken();
    
    const updatedLocations = await Promise.all(
      locs.map(async (location) => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/air-quality/current?lat=${location.lat}&lon=${location.lon}`,
            {
              headers: { 'Authorization': `Bearer ${token}` }
            }
          );
          
          if (!response.ok) {
            console.error(`Air quality API error for ${location.name}:`, response.status);
            throw new Error('Failed to fetch AQ');
          }
          
          const aqData = await response.json();
          
          // Handle array response from /current endpoint
          const currentData = Array.isArray(aqData) ? aqData[0] : aqData;
          
          return {
            ...location,
            air_quality: {
              aqi: currentData.aqi || 0,
              pm25: currentData.pm25 || 0,
              category: getAQICategory(currentData.aqi || 0)
            }
          };
        } catch (error) {
          console.error(`Error fetching air quality for ${location.name}:`, error);
          return {
            ...location,
            error: 'Failed to load air quality'
          };
        }
      })
    );
    
    setLocations(updatedLocations);
  };

  const getAQICategory = (aqi: number): string => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  const getAQIColor = (aqi: number): string => {
    if (aqi <= 50) return 'bg-green-500';
    if (aqi <= 100) return 'bg-yellow-500';
    if (aqi <= 150) return 'bg-orange-500';
    if (aqi <= 200) return 'bg-red-500';
    if (aqi <= 300) return 'bg-purple-500';
    return 'bg-red-900';
  };

  const addLocation = async () => {
    if (!formData.name || !formData.lat || !formData.lon) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/locations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          lat: parseFloat(formData.lat),
          lon: parseFloat(formData.lon),
          address: formData.address || null,
          is_primary: locations.length === 0 // First location is primary
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to add location');
      }

      toast.success('Location added successfully!');
      setShowAddForm(false);
      setFormData({ name: '', lat: '', lon: '', address: '' });
      fetchLocations();
    } catch (error: any) {
      console.error('Error adding location:', error);
      toast.error(error.message || 'Failed to add location');
    }
  };

  const updateLocation = async (id: string) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/locations/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          lat: parseFloat(formData.lat),
          lon: parseFloat(formData.lon),
          address: formData.address || null
        })
      });

      if (!response.ok) throw new Error('Failed to update location');

      toast.success('Location updated successfully!');
      setEditingId(null);
      setFormData({ name: '', lat: '', lon: '', address: '' });
      fetchLocations();
    } catch (error) {
      console.error('Error updating location:', error);
      toast.error('Failed to update location');
    }
  };

  const deleteLocation = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this location?')) {
      return;
    }

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/locations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete location');

      toast.success('Location deleted successfully!');
      fetchLocations();
    } catch (error) {
      console.error('Error deleting location:', error);
      toast.error('Failed to delete location');
    }
  };

  const setPrimaryLocation = async (id: string) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/locations/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_primary: true })
      });

      if (!response.ok) throw new Error('Failed to set primary location');

      toast.success('Primary location updated!');
      fetchLocations();
    } catch (error) {
      console.error('Error setting primary location:', error);
      toast.error('Failed to set primary location');
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            lat: position.coords.latitude.toFixed(6),
            lon: position.coords.longitude.toFixed(6)
          });
          toast.success('Current location detected!');
        },
        (error) => {
          toast.error('Failed to get current location');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <MapPinIcon className="w-7 h-7 mr-2 text-blue-600" />
            My Locations
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Save up to 5 locations to monitor air quality
          </p>
        </div>
        
        {locations.length < 5 && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Location
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingId) && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-blue-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {editingId ? 'Edit Location' : 'Add New Location'}
            </h3>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingId(null);
                setFormData({ name: '', lat: '', lon: '', address: '' });
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            {/* City Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔍 Search for a City
              </label>
              <CitySearch
                placeholder="Type city name (e.g., West Chester, OH or Cincinnati, OH)"
                onSelectCity={(city) => {
                  setFormData({
                    name: formData.name || `${city.name}, ${city.state || city.country}`,
                    lat: city.lat.toString(),
                    lon: city.lon.toString(),
                    address: city.display_name
                  });
                  toast.success(`Selected: ${city.name}, ${city.state}`);
                }}
              />
              <p className="text-xs text-gray-500 mt-1">
                Search for cities like "West Chester, OH", "Cincinnati", "Fairfield, OH", etc.
              </p>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">or enter manually</span>
              </div>
            </div>

            {/* Manual Entry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location Name *
              </label>
              <input
                type="text"
                placeholder="e.g., Home, Office, Mom's House"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude *
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="41.8781"
                  value={formData.lat}
                  onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude *
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="-87.6298"
                  value={formData.lon}
                  onChange={(e) => setFormData({ ...formData, lon: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address (Optional)
              </label>
              <input
                type="text"
                placeholder="Auto-filled from city search or enter manually"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={getCurrentLocation}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Use Current Location
              </button>

              <button
                onClick={() => editingId ? updateLocation(editingId) : addLocation()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {editingId ? 'Update Location' : 'Add Location'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Locations List */}
      {locations.length === 0 ? (
        <div className="text-center py-12">
          <MapPinIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 mb-4">No saved locations yet</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Add Your First Location
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map((location) => (
            <div
              key={location.id}
              className="border-2 border-gray-200 rounded-lg p-4 hover:shadow-lg transition relative"
            >
              {/* Primary Badge */}
              {location.is_primary && (
                <div className="absolute top-2 right-2">
                  <StarIconSolid className="w-6 h-6 text-yellow-500" />
                </div>
              )}

              {/* Location Name */}
              <h3 className="text-lg font-bold text-gray-800 mb-2 pr-8">
                {location.name}
              </h3>

              {/* Air Quality */}
              {location.air_quality ? (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl font-bold text-gray-800">
                      {location.air_quality.aqi}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${getAQIColor(location.air_quality.aqi)}`}>
                      {location.air_quality.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    PM2.5: {location.air_quality.pm25.toFixed(1)} µg/m³
                  </p>
                </div>
              ) : location.error ? (
                <div className="mb-4 text-red-500 text-sm">
                  {location.error}
                </div>
              ) : (
                <div className="mb-4">
                  <LoadingSpinner />
                </div>
              )}

              {/* Coordinates */}
              <p className="text-xs text-gray-500 mb-3">
                {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
              </p>

              {/* Actions */}
              <div className="flex gap-2">
                {!location.is_primary && (
                  <button
                    onClick={() => setPrimaryLocation(location.id)}
                    className="flex-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition text-sm flex items-center justify-center"
                    title="Set as primary"
                  >
                    <StarIcon className="w-4 h-4 mr-1" />
                    Set Primary
                  </button>
                )}
                
                <button
                  onClick={() => {
                    setEditingId(location.id);
                    setFormData({
                      name: location.name,
                      lat: location.lat.toString(),
                      lon: location.lon.toString(),
                      address: location.address || ''
                    });
                  }}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-sm"
                  title="Edit"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => deleteLocation(location.id)}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-sm"
                  title="Delete"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Location Limit Warning */}
      {locations.length >= 5 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            You've reached the maximum of 5 saved locations. Delete a location to add a new one.
          </p>
        </div>
      )}
    </div>
  );
};

export default MultipleLocations;
