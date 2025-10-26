import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import AvatarSelector from '../components/AvatarSelector';
import toast from 'react-hot-toast';
import { HeartIcon } from '@heroicons/react/24/outline';

interface Donation {
  id: string;
  amount: number;
  currency: string;
  status: string;
  interval: string;
  created_at: string;
  cancel_at_period_end?: boolean;
  current_period_end?: number;
}

const ProfileWellness: React.FC = () => {
  const { user, updateUser, loading, refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loadingDonations, setLoadingDonations] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    age_range: '',
    location: {
      lat: '',
      lon: '',
      address: '',
    },
    environmental_sensitivities: [] as string[],
    respiratory_sensitivity: '',
    known_triggers: [] as string[],
    uses_air_purifier: false,
    uses_rescue_inhaler: false,
    outdoor_activity_level: '',
    household_info: {
      pets: false,
      smoking: false,
      air_purifier: false,
      hvac_system: '',
    },
    avatar: '',
  });

  const [newSensitivity, setNewSensitivity] = useState('');
  const [newTrigger, setNewTrigger] = useState('');

  const fetchDonations = useCallback(async () => {
    if (!user?.id) return;
    
    setLoadingDonations(true);
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
      const response = await fetch(`${API_URL}/stripe/donations/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.donations && data.donations.length > 0) {
          setDonations(data.donations);
        } else {
          setDonations([]);
        }
      }
    } catch (error) {
      console.error('Error fetching donations:', error);
      setDonations([]);
    } finally {
      setLoadingDonations(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user && localStorage.getItem('token')) {
      refreshUser();
    }
    
    if (user && !justSaved) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        age_range: (user as any).age_range || '',
        location: {
          lat: user.location?.lat?.toString() || '',
          lon: user.location?.lon?.toString() || '',
          address: user.location?.address || '',
        },
        environmental_sensitivities: (user as any).environmental_sensitivities || [],
        respiratory_sensitivity: (user as any).respiratory_sensitivity || '',
        known_triggers: (user as any).known_triggers || [],
        uses_air_purifier: (user as any).uses_air_purifier || false,
        uses_rescue_inhaler: (user as any).uses_rescue_inhaler || false,
        outdoor_activity_level: (user as any).outdoor_activity_level || '',
        household_info: {
          pets: user.household_info?.pets || false,
          smoking: user.household_info?.smoking || false,
          air_purifier: user.household_info?.air_purifier || false,
          hvac_system: user.household_info?.hvac_system || '',
        },
        avatar: (user as any).avatar || '',
      });
      fetchDonations();
    }
  }, [user, fetchDonations, refreshUser, justSaved]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updateData: any = {};
      
      // Basic fields
      if (formData.first_name.trim()) updateData.first_name = formData.first_name.trim();
      if (formData.last_name.trim()) updateData.last_name = formData.last_name.trim();
      if (formData.age_range) updateData.age_range = formData.age_range;
      if (formData.respiratory_sensitivity) updateData.respiratory_sensitivity = formData.respiratory_sensitivity;
      if (formData.outdoor_activity_level) updateData.outdoor_activity_level = formData.outdoor_activity_level;
      updateData.uses_air_purifier = formData.uses_air_purifier;
      updateData.uses_rescue_inhaler = formData.uses_rescue_inhaler;
      
      // Location
      if (formData.location.lat || formData.location.lon || formData.location.address) {
        updateData.location = {
          lat: formData.location.lat ? parseFloat(formData.location.lat) : null,
          lon: formData.location.lon ? parseFloat(formData.location.lon) : null,
          address: formData.location.address || null,
        };
      }
      
      // Wellness arrays
      updateData.environmental_sensitivities = formData.environmental_sensitivities;
      updateData.known_triggers = formData.known_triggers;
      
      // Household info
      updateData.household_info = formData.household_info;
      
      // Avatar
      if (formData.avatar) updateData.avatar = formData.avatar;

      if (user?.email) {
        updateData.email = user.email;
      }

      console.log('Wellness profile update:', updateData);
      await updateUser(updateData);
      
      toast.success('Profile saved');
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1000);
      
    } catch (error) {
      console.error('Profile update failed:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-8 flex items-center justify-center">
            <LoadingSpinner size="md" />
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          [locationField]: value,
        },
      });
    } else if (name.startsWith('household_info.')) {
      const householdField = name.split('.')[1];
      setFormData({
        ...formData,
        household_info: {
          ...formData.household_info,
          [householdField]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const addSensitivity = () => {
    if (newSensitivity.trim() && !formData.environmental_sensitivities.includes(newSensitivity.trim())) {
      setFormData({
        ...formData,
        environmental_sensitivities: [...formData.environmental_sensitivities, newSensitivity.trim()],
      });
      setNewSensitivity('');
    }
  };

  const removeSensitivity = (sensitivity: string) => {
    setFormData({
      ...formData,
      environmental_sensitivities: formData.environmental_sensitivities.filter(s => s !== sensitivity),
    });
  };

  const addTrigger = () => {
    if (newTrigger.trim() && !formData.known_triggers.includes(newTrigger.trim())) {
      setFormData({
        ...formData,
        known_triggers: [...formData.known_triggers, newTrigger.trim()],
      });
      setNewTrigger('');
    }
  };

  const removeTrigger = (trigger: string) => {
    setFormData({
      ...formData,
      known_triggers: formData.known_triggers.filter(t => t !== trigger),
    });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            location: {
              ...formData.location,
              lat: position.coords.latitude.toString(),
              lon: position.coords.longitude.toString(),
            },
          });
          toast.success('Location updated!');
        },
        (error) => {
          toast.error('Failed to get location. Please enter manually.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-900">Wellness Profile</h1>
            <p className="mt-1 text-sm text-gray-600">
              Complete your profile to get personalized environmental wellness coaching.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
            {/* Avatar Section */}
            <div className="flex justify-center py-4">
              <AvatarSelector
                currentAvatar={formData.avatar}
                onAvatarChange={(avatar) => setFormData({ ...formData, avatar })}
              />
            </div>

            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="label">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    id="first_name"
                    className="input"
                    value={formData.first_name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="last_name" className="label">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    id="last_name"
                    className="input"
                    value={formData.last_name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="age_range" className="label">
                    Age Range
                  </label>
                  <select
                    name="age_range"
                    id="age_range"
                    className="input"
                    value={formData.age_range}
                    onChange={handleChange}
                  >
                    <option value="">Select age range</option>
                    <option value="18-25">18-25</option>
                    <option value="26-35">26-35</option>
                    <option value="36-50">36-50</option>
                    <option value="51-65">51-65</option>
                    <option value="65+">65+</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Location</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="location.address" className="label">
                    Address
                  </label>
                  <input
                    type="text"
                    name="location.address"
                    id="location.address"
                    className="input"
                    placeholder="Enter your address"
                    value={formData.location.address}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="location.lat" className="label">
                      Latitude
                    </label>
                    <input
                      type="number"
                      name="location.lat"
                      id="location.lat"
                      step="any"
                      className="input"
                      value={formData.location.lat}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="location.lon" className="label">
                      Longitude
                    </label>
                    <input
                      type="number"
                      name="location.lon"
                      id="location.lon"
                      step="any"
                      className="input"
                      value={formData.location.lon}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="btn-outline text-sm"
                >
                  Use Current Location
                </button>
              </div>
            </div>

            {/* Environmental Wellness Profile */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Environmental Wellness Profile</h3>
              <p className="text-sm text-gray-600 mb-4">
                Help us understand your environmental sensitivities to provide better wellness coaching.
              </p>
              
              <div className="space-y-4">
                {/* Respiratory Sensitivity */}
                <div>
                  <label htmlFor="respiratory_sensitivity" className="label">
                    Respiratory Sensitivity
                    <span className="text-xs text-gray-500 ml-2">(How sensitive are you to air quality?)</span>
                  </label>
                  <select
                    name="respiratory_sensitivity"
                    id="respiratory_sensitivity"
                    className="input"
                    value={formData.respiratory_sensitivity}
                    onChange={handleChange}
                  >
                    <option value="">Select sensitivity level</option>
                    <option value="none">None - No sensitivity</option>
                    <option value="low">Low - Mild discomfort in poor air</option>
                    <option value="moderate">Moderate - Noticeable impact from air quality</option>
                    <option value="high">High - Very sensitive to air quality changes</option>
                  </select>
                </div>

                {/* Environmental Sensitivities */}
                <div>
                  <label className="label">
                    Environmental Sensitivities
                    <span className="text-xs text-gray-500 ml-2">(What environmental factors bother you?)</span>
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      className="input flex-1"
                      placeholder="e.g., pollen, dust, smoke, pollution"
                      value={newSensitivity}
                      onChange={(e) => setNewSensitivity(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSensitivity())}
                    />
                    <button type="button" onClick={addSensitivity} className="btn-primary">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.environmental_sensitivities.map((sensitivity) => (
                      <span
                        key={sensitivity}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
                      >
                        {sensitivity}
                        <button
                          type="button"
                          onClick={() => removeSensitivity(sensitivity)}
                          className="ml-1 text-emerald-600 hover:text-emerald-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Common: pollen, dust, pet dander, smoke, pollution, mold, cold air
                  </p>
                </div>

                {/* Known Triggers */}
                <div>
                  <label className="label">
                    Environmental Triggers
                    <span className="text-xs text-gray-500 ml-2">(What environmental factors affect you?)</span>
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      className="input flex-1"
                      placeholder="e.g., high PM2.5, ozone, humidity"
                      value={newTrigger}
                      onChange={(e) => setNewTrigger(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTrigger())}
                    />
                    <button type="button" onClick={addTrigger} className="btn-primary">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.known_triggers.map((trigger) => (
                      <span
                        key={trigger}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {trigger}
                        <button
                          type="button"
                          onClick={() => removeTrigger(trigger)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Activity Level */}
                <div>
                  <label htmlFor="outdoor_activity_level" className="label">
                    Outdoor Activity Level
                  </label>
                  <select
                    name="outdoor_activity_level"
                    id="outdoor_activity_level"
                    className="input"
                    value={formData.outdoor_activity_level}
                    onChange={handleChange}
                  >
                    <option value="">Select activity level</option>
                    <option value="sedentary">Sedentary - Mostly indoors</option>
                    <option value="moderate">Moderate - Some outdoor activity</option>
                    <option value="active">Active - Regular outdoor exercise</option>
                    <option value="very_active">Very Active - Daily outdoor training</option>
                  </select>
                </div>

                {/* Wellness Indicators */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="uses_rescue_inhaler"
                      id="uses_rescue_inhaler"
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      checked={formData.uses_rescue_inhaler}
                      onChange={(e) => setFormData({ ...formData, uses_rescue_inhaler: e.target.checked })}
                    />
                    <label htmlFor="uses_rescue_inhaler" className="ml-2 block text-sm text-gray-900">
                      I use a rescue inhaler when needed
                      <span className="text-xs text-gray-500 ml-2">(wellness indicator, not medication tracking)</span>
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="uses_air_purifier_wellness"
                      id="uses_air_purifier_wellness"
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      checked={formData.uses_air_purifier}
                      onChange={(e) => setFormData({ ...formData, uses_air_purifier: e.target.checked })}
                    />
                    <label htmlFor="uses_air_purifier_wellness" className="ml-2 block text-sm text-gray-900">
                      I use an air purifier at home
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Household Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Household Information</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="household_info.pets"
                    id="pets"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    checked={formData.household_info.pets}
                    onChange={handleChange}
                  />
                  <label htmlFor="pets" className="ml-2 block text-sm text-gray-900">
                    I have pets
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="household_info.smoking"
                    id="smoking"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    checked={formData.household_info.smoking}
                    onChange={handleChange}
                  />
                  <label htmlFor="smoking" className="ml-2 block text-sm text-gray-900">
                    Smoking household
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="household_info.air_purifier"
                    id="air_purifier"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    checked={formData.household_info.air_purifier}
                    onChange={handleChange}
                  />
                  <label htmlFor="air_purifier" className="ml-2 block text-sm text-gray-900">
                    I have an air purifier
                  </label>
                </div>
                <div>
                  <label htmlFor="hvac_system" className="label">
                    HVAC System Type
                  </label>
                  <select
                    name="household_info.hvac_system"
                    id="hvac_system"
                    className="input"
                    value={formData.household_info.hvac_system}
                    onChange={handleChange}
                  >
                    <option value="">Select HVAC type</option>
                    <option value="central_air">Central Air</option>
                    <option value="heat_pump">Heat Pump</option>
                    <option value="window_units">Window Units</option>
                    <option value="none">No HVAC</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Donations Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center justify-between">
                <div className="flex items-center">
                  <HeartIcon className="h-5 w-5 mr-2 text-emerald-500" />
                  Support & Donations
                </div>
                {donations.length > 0 && (
                  <span className="text-sm text-gray-600">
                    {donations.length} {donations.length === 1 ? 'donation' : 'donations'}
                  </span>
                )}
              </h3>
              {loadingDonations ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="sm" />
                </div>
              ) : donations.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-emerald-100 to-green-100 border-2 border-emerald-300 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Total Monthly Support</p>
                    <p className="text-3xl font-bold text-emerald-700">
                      ${donations
                        .filter(d => d.status === 'active')
                        .reduce((sum, d) => sum + d.amount, 0)
                        .toFixed(2)}
                      <span className="text-base font-normal text-gray-600">/month</span>
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Thank you for your generous support! 💚
                    </p>
                  </div>

                  <div className="space-y-2">
                    {donations.map((donation, index) => (
                      <div
                        key={donation.id}
                        className={`border rounded-lg p-4 ${
                          donation.status === 'active'
                            ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900">
                                Donation #{donations.length - index}
                              </p>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                donation.status === 'active' && !donation.cancel_at_period_end
                                  ? 'bg-green-100 text-green-800' 
                                  : donation.status === 'active' && donation.cancel_at_period_end
                                  ? 'bg-orange-100 text-orange-800'
                                  : donation.status === 'cancelled'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {donation.status === 'active' && donation.cancel_at_period_end ? 'ending' : donation.status}
                              </span>
                            </div>
                            <p className="text-xl font-bold text-emerald-600 mt-1">
                              ${donation.amount.toFixed(2)}
                              <span className="text-sm font-normal text-gray-600">
                                /{donation.interval}
                              </span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Started {new Date(donation.created_at).toLocaleDateString()}
                              {donation.cancel_at_period_end && (
                                <span className="text-orange-600 ml-2">• Will stop soon</span>
                              )}
                            </p>
                          </div>
                          {donation.status === 'active' && (
                            <a
                              href="/manage-donation"
                              className="text-sm text-primary-600 hover:text-primary-700 font-medium whitespace-nowrap"
                            >
                              Manage →
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <a
                    href="/manage-donation"
                    className="block w-full text-center px-4 py-2 border-2 border-emerald-300 text-sm font-medium rounded-md text-emerald-700 bg-white hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    <HeartIcon className="h-4 w-4 inline mr-2" />
                    Add Another Donation
                  </a>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                  <HeartIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600 mb-4">
                    You haven't made any donations yet.
                  </p>
                  <a
                    href="/manage-donation"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    <HeartIcon className="h-4 w-4 mr-2" />
                    Support Our Mission
                  </a>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary w-full sm:w-auto"
              >
                {saving ? <LoadingSpinner size="sm" /> : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileWellness;
