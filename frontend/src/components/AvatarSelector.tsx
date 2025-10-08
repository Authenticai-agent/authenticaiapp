import React, { useState } from 'react';
import { CameraIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface AvatarSelectorProps {
  currentAvatar?: string;
  onAvatarChange: (avatar: string) => void;
}

// 5 simple preset avatars using emoji/unicode characters
const PRESET_AVATARS = [
  { id: 'avatar-1', emoji: '😊', label: 'Happy' },
  { id: 'avatar-2', emoji: '🌟', label: 'Star' },
  { id: 'avatar-3', emoji: '🦋', label: 'Butterfly' },
  { id: 'avatar-4', emoji: '🌸', label: 'Flower' },
  { id: 'avatar-5', emoji: '💚', label: 'Heart' },
];

const AvatarSelector: React.FC<AvatarSelectorProps> = ({ currentAvatar, onAvatarChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size should be less than 2MB');
      return;
    }

    setUploading(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        console.log('Avatar uploaded, base64 length:', base64String.length);
        onAvatarChange(base64String);
        setIsOpen(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handlePresetSelect = (avatarId: string) => {
    console.log('Preset avatar selected:', avatarId);
    onAvatarChange(avatarId);
    setIsOpen(false);
  };

  const getAvatarDisplay = () => {
    if (!currentAvatar) {
      return <UserCircleIcon className="w-full h-full text-gray-400" />;
    }

    // Check if it's a preset avatar
    const preset = PRESET_AVATARS.find(a => a.id === currentAvatar);
    if (preset) {
      return <span className="text-6xl">{preset.emoji}</span>;
    }

    // It's an uploaded image
    if (currentAvatar.startsWith('data:image')) {
      return <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />;
    }

    return <UserCircleIcon className="w-full h-full text-gray-400" />;
  };

  return (
    <div className="relative">
      {/* Avatar Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden hover:ring-4 hover:ring-blue-500 transition-all group"
      >
        {getAvatarDisplay()}
        
        {/* Camera overlay on hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
          <CameraIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </button>

      {/* Selection Modal */}
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80">
          <h3 className="text-lg font-semibold mb-3">Choose Avatar</h3>
          
          {/* Preset Avatars */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Select a preset:</p>
            <div className="grid grid-cols-5 gap-2">
              {PRESET_AVATARS.map((avatar) => (
                <button
                  type="button"
                  key={avatar.id}
                  onClick={() => handlePresetSelect(avatar.id)}
                  className={`relative w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-3xl hover:ring-2 hover:ring-blue-500 transition-all ${
                    currentAvatar === avatar.id ? 'ring-2 ring-blue-600' : ''
                  }`}
                  title={avatar.label}
                >
                  {avatar.emoji}
                  {currentAvatar === avatar.id && (
                    <CheckCircleIcon className="absolute -top-1 -right-1 w-5 h-5 text-blue-600 bg-white rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Upload Photo */}
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-2">Or upload your photo:</p>
            <label className="block">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
              <div className="cursor-pointer bg-blue-50 hover:bg-blue-100 border-2 border-dashed border-blue-300 rounded-lg p-4 text-center transition-colors">
                {uploading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-sm text-blue-600">Uploading...</span>
                  </div>
                ) : (
                  <>
                    <CameraIcon className="w-8 h-8 text-blue-600 mx-auto mb-1" />
                    <p className="text-sm text-blue-600 font-medium">Click to upload</p>
                    <p className="text-xs text-gray-500 mt-1">Max 2MB</p>
                  </>
                )}
              </div>
            </label>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="mt-3 w-full py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default AvatarSelector;
