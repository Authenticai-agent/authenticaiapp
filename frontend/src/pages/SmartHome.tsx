import React, { useState, useEffect } from 'react';
import { HomeIcon, PlusIcon, Cog6ToothIcon, PowerIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { smartHomeAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface SmartDevice {
  id: string;
  device_type: string;
  device_name: string;
  device_id: string;
  platform: string;
  settings: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const SmartHome: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState<SmartDevice[]>([]);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [controlLoading, setControlLoading] = useState<string | null>(null);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    setLoading(true);
    try {
      const response = await smartHomeAPI.getDevices();
      setDevices(response.data || []);
    } catch (error) {
      console.error('Error loading devices:', error);
      toast.error('Failed to load smart home devices');
    } finally {
      setLoading(false);
    }
  };

  const controlDevice = async (deviceId: string, action: string, value?: any) => {
    setControlLoading(deviceId);
    try {
      const response = await smartHomeAPI.controlDevice(deviceId, action, value);
      toast.success(`${response.data.device_name}: ${response.data.result}`);
      await loadDevices(); // Refresh device list
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to control device';
      toast.error(message);
    } finally {
      setControlLoading(null);
    }
  };

  const removeDevice = async (deviceId: string) => {
    if (!window.confirm('Are you sure you want to delete this device?')) return;
    
    try {
      await smartHomeAPI.removeDevice(deviceId);
      toast.success('Device removed successfully');
      await loadDevices();
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to remove device';
      toast.error(message);
    }
  };

  const triggerAutomation = async (riskLevel: string) => {
    try {
      const response = await smartHomeAPI.triggerAutomation(riskLevel);
      toast.success(`Automation triggered: ${response.data.actions_taken.length} actions taken`);
      if (response.data.actions_taken.length > 0) {
        response.data.actions_taken.forEach((action: string) => {
          toast.success(action, { duration: 2000 });
        });
      }
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to trigger automation';
      toast.error(message);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    const iconClass = "h-6 w-6";
    switch (deviceType) {
      case 'air_purifier':
        return <div className={`${iconClass} bg-blue-400 rounded-full`} />;
      case 'humidifier':
        return <div className={`${iconClass} bg-cyan-400 rounded-full`} />;
      case 'dehumidifier':
        return <div className={`${iconClass} bg-orange-400 rounded-full`} />;
      case 'hvac':
        return <HomeIcon className={`${iconClass} text-gray-600`} />;
      case 'smart_plug':
        return <PowerIcon className={`${iconClass} text-gray-600`} />;
      default:
        return <Cog6ToothIcon className={`${iconClass} text-gray-600`} />;
    }
  };

  const getDeviceActions = (deviceType: string) => {
    switch (deviceType) {
      case 'air_purifier':
      case 'humidifier':
      case 'dehumidifier':
      case 'smart_plug':
        return [
          { label: 'Turn On', action: 'turn_on', variant: 'success' },
          { label: 'Turn Off', action: 'turn_off', variant: 'secondary' },
        ];
      case 'hvac':
        return [
          { label: 'Fan On', action: 'set_fan', value: 'on', variant: 'primary' },
          { label: 'Fan Auto', action: 'set_fan', value: 'auto', variant: 'secondary' },
        ];
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Smart Home Control</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your connected devices and automate your environment
            </p>
          </div>
          <button
            onClick={() => setShowAddDevice(true)}
            className="btn-primary"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Device
          </button>
        </div>

        {/* Automation Quick Actions */}
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Automation</h3>
          <p className="text-sm text-gray-600 mb-4">
            Trigger automated responses based on risk levels
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => triggerAutomation('low')}
              className="btn-success text-sm"
            >
              Low Risk Mode
            </button>
            <button
              onClick={() => triggerAutomation('moderate')}
              className="btn-warning text-sm"
            >
              Moderate Risk Mode
            </button>
            <button
              onClick={() => triggerAutomation('high')}
              className="btn-danger text-sm"
            >
              High Risk Mode
            </button>
            <button
              onClick={() => triggerAutomation('very_high')}
              className="btn-danger text-sm"
            >
              Emergency Mode
            </button>
          </div>
        </div>

        {/* Devices Grid */}
        {devices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.map((device) => (
              <div key={device.id} className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getDeviceIcon(device.device_type)}
                    <div>
                      <h4 className="font-medium text-gray-900">{device.device_name}</h4>
                      <p className="text-sm text-gray-500 capitalize">
                        {device.device_type.replace('_', ' ')} • {device.platform}
                      </p>
                    </div>
                  </div>
                  <div className={clsx(
                    'w-3 h-3 rounded-full',
                    device.is_active ? 'bg-success-400' : 'bg-gray-300'
                  )} />
                </div>

                <div className="space-y-2">
                  {getDeviceActions(device.device_type).map((actionConfig) => (
                    <button
                      key={actionConfig.action}
                      onClick={() => controlDevice(device.id, actionConfig.action, 'value' in actionConfig ? actionConfig.value : undefined)}
                      disabled={controlLoading === device.id}
                      className={clsx(
                        'w-full text-sm',
                        actionConfig.variant === 'success' ? 'btn-success' :
                        actionConfig.variant === 'primary' ? 'btn-primary' :
                        actionConfig.variant === 'secondary' ? 'btn-secondary' :
                        'btn-outline'
                      )}
                    >
                      {controlLoading === device.id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        actionConfig.label
                      )}
                    </button>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
                  <button
                    onClick={() => removeDevice(device.id)}
                    className="text-sm text-danger-600 hover:text-danger-800"
                  >
                    Remove
                  </button>
                  <span className="text-xs text-gray-500">
                    Added {new Date(device.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center">
            <HomeIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Smart Devices</h3>
            <p className="text-gray-500 mb-4">
              Connect your smart home devices to enable automated environmental control.
            </p>
            <button
              onClick={() => setShowAddDevice(true)}
              className="btn-primary"
            >
              Add Your First Device
            </button>
          </div>
        )}

        {/* Add Device Modal */}
        {showAddDevice && (
          <AddDeviceModal
            onClose={() => setShowAddDevice(false)}
            onDeviceAdded={() => {
              setShowAddDevice(false);
              loadDevices();
            }}
          />
        )}

        {/* Subscription Upgrade Prompt */}
        {user?.subscription_tier === 'free' && devices.length >= 1 && (
          <div className="mt-8 card bg-primary-50 border-primary-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-primary-900">Upgrade for More Devices</h4>
                <p className="text-sm text-primary-700">
                  Free plan allows 1 device. Upgrade to Premium for up to 10 devices.
                </p>
              </div>
              <button className="btn-primary text-sm">
                Upgrade Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Add Device Modal Component
interface AddDeviceModalProps {
  onClose: () => void;
  onDeviceAdded: () => void;
}

const AddDeviceModal: React.FC<AddDeviceModalProps> = ({ onClose, onDeviceAdded }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    device_type: '',
    device_name: '',
    device_id: '',
    platform: '',
  });

  const deviceTypes = [
    { value: 'air_purifier', label: 'Air Purifier' },
    { value: 'humidifier', label: 'Humidifier' },
    { value: 'dehumidifier', label: 'Dehumidifier' },
    { value: 'hvac', label: 'HVAC System' },
    { value: 'smart_plug', label: 'Smart Plug' },
  ];

  const platforms = [
    { value: 'ecobee', label: 'Ecobee' },
    { value: 'nest', label: 'Google Nest' },
    { value: 'kasa', label: 'TP-Link Kasa' },
    { value: 'philips_hue', label: 'Philips Hue' },
    { value: 'generic', label: 'Generic/Other' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await smartHomeAPI.addDevice(formData);
      toast.success('Device added successfully!');
      onDeviceAdded();
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to add device';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add Smart Device</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="device_type" className="label">
                Device Type
              </label>
              <select
                name="device_type"
                id="device_type"
                required
                className="input"
                value={formData.device_type}
                onChange={handleChange}
              >
                <option value="">Select device type</option>
                {deviceTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="device_name" className="label">
                Device Name
              </label>
              <input
                type="text"
                name="device_name"
                id="device_name"
                required
                className="input"
                placeholder="e.g., Living Room Air Purifier"
                value={formData.device_name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="device_id" className="label">
                Device ID
              </label>
              <input
                type="text"
                name="device_id"
                id="device_id"
                required
                className="input"
                placeholder="Device's unique identifier"
                value={formData.device_id}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="platform" className="label">
                Platform
              </label>
              <select
                name="platform"
                id="platform"
                required
                className="input"
                value={formData.platform}
                onChange={handleChange}
              >
                <option value="">Select platform</option>
                {platforms.map((platform) => (
                  <option key={platform.value} value={platform.value}>
                    {platform.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Add Device'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SmartHome;
