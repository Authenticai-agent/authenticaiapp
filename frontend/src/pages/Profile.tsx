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

const Profile: React.FC = () => {
  const { user, updateUser, loading, refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loadingDonations, setLoadingDonations] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    age: '',
    location: {
      lat: '',
      lon: '',
      address: '',
    },
    allergies: [] as string[],
    health_conditions: [] as string[],
    medications: [] as string[],
    asthma_severity: '',
    triggers: [] as string[],
    household_info: {
      pets: false,
      smoking: false,
      air_purifier: false,
      hvac_system: '',
    },
    avatar: '',
  });

  const [newAllergy, setNewAllergy] = useState('');
  const [newTrigger, setNewTrigger] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newMedication, setNewMedication] = useState('');

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
    // Ensure we pull latest merged profile when arriving at Profile
    if (!user && localStorage.getItem('token')) {
      refreshUser();
    }
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        age: user.age?.toString() || '',
        location: {
          lat: user.location?.lat?.toString() || '',
          lon: user.location?.lon?.toString() || '',
          address: user.location?.address || '',
        },
        allergies: user.allergies || [],
        health_conditions: (user as any).health_conditions || [],
        medications: (user as any).medications || [],
        asthma_severity: user.asthma_severity || '',
        triggers: user.triggers || [],
        household_info: {
          pets: user.household_info?.pets || false,
          smoking: user.household_info?.smoking || false,
          air_purifier: user.household_info?.air_purifier || false,
          hvac_system: user.household_info?.hvac_system || '',
        },
        avatar: (user as any).avatar || '',
      });
      // Fetch donations
      fetchDonations();
    }
  }, [user, fetchDonations, refreshUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Prepare update data, filtering out empty values
      const updateData: any = {};
      
      // Basic fields
      if (formData.first_name.trim()) updateData.first_name = formData.first_name.trim();
      if (formData.last_name.trim()) updateData.last_name = formData.last_name.trim();
      if (formData.age && parseInt(formData.age) > 0) updateData.age = parseInt(formData.age);
      if (formData.asthma_severity) updateData.asthma_severity = formData.asthma_severity;
      
      // Location - only include if we have coordinates or address
      if (formData.location.lat || formData.location.lon || formData.location.address) {
        updateData.location = {
          lat: formData.location.lat ? parseFloat(formData.location.lat) : null,
          lon: formData.location.lon ? parseFloat(formData.location.lon) : null,
          address: formData.location.address || null,
        };
      }
      
      // Arrays
      if (formData.allergies.length > 0) updateData.allergies = formData.allergies;
      if (formData.triggers.length > 0) updateData.triggers = formData.triggers;
      if (formData.health_conditions.length > 0) updateData.health_conditions = formData.health_conditions;
      if (formData.medications.length > 0) updateData.medications = formData.medications;
      
      // Household info
      updateData.household_info = formData.household_info;
      
      // Avatar
      if (formData.avatar) updateData.avatar = formData.avatar;

      // Ensure email is included so the backend can target the correct row
      if (user?.email) {
        updateData.email = user.email;
      }

      console.log('Profile form submission - prepared update data:', updateData);
      console.log('Avatar value being sent:', formData.avatar);
      console.log('Avatar in updateData:', updateData.avatar);
      await updateUser(updateData);
      
      // Show success message and refresh the form
      console.log('Profile update completed successfully');
      toast.success('Profile saved');
      
    } catch (error) {
      // Error handling is done in the AuthContext
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

  const addAllergy = () => {
    if (newAllergy.trim() && !formData.allergies.includes(newAllergy.trim())) {
      setFormData({
        ...formData,
        allergies: [...formData.allergies, newAllergy.trim()],
      });
      setNewAllergy('');
    }
  };

  const addCondition = () => {
    if (newCondition.trim() && !formData.health_conditions.includes(newCondition.trim())) {
      setFormData({
        ...formData,
        health_conditions: [...formData.health_conditions, newCondition.trim()],
      });
      setNewCondition('');
    }
  };

  const removeCondition = (condition: string) => {
    setFormData({
      ...formData,
      health_conditions: formData.health_conditions.filter(c => c !== condition),
    });
  };

  const addMedication = () => {
    if (newMedication.trim() && !formData.medications.includes(newMedication.trim())) {
      setFormData({
        ...formData,
        medications: [...formData.medications, newMedication.trim()],
      });
      setNewMedication('');
    }
  };

  const removeMedication = (med: string) => {
    setFormData({
      ...formData,
      medications: formData.medications.filter(m => m !== med),
    });
  };

  const removeAllergy = (allergy: string) => {
    setFormData({
      ...formData,
      allergies: formData.allergies.filter(a => a !== allergy),
    });
  };

  const addTrigger = () => {
    if (newTrigger.trim() && !formData.triggers.includes(newTrigger.trim())) {
      setFormData({
        ...formData,
        triggers: [...formData.triggers, newTrigger.trim()],
      });
      setNewTrigger('');
    }
  };

  const removeTrigger = (trigger: string) => {
    setFormData({
      ...formData,
      triggers: formData.triggers.filter(t => t !== trigger),
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
            <h1 className="text-xl font-semibold text-gray-900">Profile Settings</h1>
            <p className="mt-1 text-sm text-gray-600">
              Complete your profile to get personalized health recommendations.
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
                  <label htmlFor="age" className="label">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    id="age"
                    min="1"
                    max="120"
                    className="input"
                    value={formData.age}
                    onChange={handleChange}
                  />
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

            {/* Health Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Health Information</h3>
              <div className="space-y-4">
                {/* Health Conditions */}
                <div>
                  <label className="label">Health Conditions</label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      className="input flex-1"
                      placeholder="Add condition (e.g., asthma_severity:severe)"
                      value={newCondition}
                      onChange={(e) => setNewCondition(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCondition())}
                    />
                    <button type="button" onClick={addCondition} className="btn-primary">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.health_conditions.map((c) => (
                      <span key={c} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {c}
                        <button type="button" onClick={() => removeCondition(c)} className="ml-1 text-indigo-600 hover:text-indigo-800">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="asthma_severity" className="label">
                    Asthma Severity
                  </label>
                  <select
                    name="asthma_severity"
                    id="asthma_severity"
                    className="input"
                    value={formData.asthma_severity}
                    onChange={handleChange}
                  >
                    <option value="">Select severity</option>
                    <option value="none">No asthma</option>
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>

                {/* Allergies */}
                <div>
                  <label className="label">Allergies</label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      className="input flex-1"
                      placeholder="Add allergy (e.g., pollen, dust mites)"
                      value={newAllergy}
                      onChange={(e) => setNewAllergy(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                    />
                    <button
                      type="button"
                      onClick={addAllergy}
                      className="btn-primary"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.allergies.map((allergy) => (
                      <span
                        key={allergy}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                      >
                        {allergy}
                        <button
                          type="button"
                          onClick={() => removeAllergy(allergy)}
                          className="ml-1 text-primary-600 hover:text-primary-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Triggers */}
                <div>
                  <label className="label">Triggers</label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      className="input flex-1"
                      placeholder="Add trigger (e.g., smoke, cold air)"
                      value={newTrigger}
                      onChange={(e) => setNewTrigger(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTrigger())}
                    />
                    <button
                      type="button"
                      onClick={addTrigger}
                      className="btn-primary"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.triggers.map((trigger) => (
                      <span
                        key={trigger}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800"
                      >
                        {trigger}
                        <button
                          type="button"
                          onClick={() => removeTrigger(trigger)}
                          className="ml-1 text-warning-600 hover:text-warning-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Medications */}
                <div>
                  <label className="label">Medications</label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      className="input flex-1"
                      placeholder="Add medication (e.g., albuterol)"
                      value={newMedication}
                      onChange={(e) => setNewMedication(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMedication())}
                    />
                    <button type="button" onClick={addMedication} className="btn-primary">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.medications.map((m) => (
                      <span key={m} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        {m}
                        <button type="button" onClick={() => removeMedication(m)} className="ml-1 text-emerald-600 hover:text-emerald-800">×</button>
                      </span>
                    ))}
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
                  {/* Total Summary */}
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

                  {/* Individual Donations */}
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

                  {/* Add More Button */}
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

export default Profile;
