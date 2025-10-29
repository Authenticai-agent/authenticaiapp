# 📍 Smart Location Management - DEPLOYED

## ✅ Feature: Temporary Location with Auto-Reset

Users can now check air quality for different locations (e.g., travel destinations) while maintaining their GPS home location.

## 🎯 How It Works

### 1. **GPS Location (Permanent)**
- Automatically detected on login/registration
- Saved to database
- Restored on every login
- Used as "home" location

### 2. **Temporary Location (Session-Only)**
- User can manually set a different location
- Stored in `localStorage` as `temp_location`
- Used for checking air quality in other cities
- **Automatically cleared on logout**

### 3. **Auto-Reset on Logout**
- When user logs out → `temp_location` cleared
- When user logs back in → GPS location restored
- Fresh GPS detection if no location exists

## 🔄 User Flow

### Scenario 1: Checking Travel Destination
```
1. User in NYC (GPS: 40.7128, -74.0060)
2. User sets temporary location to Paris (48.8566, 2.3522)
3. App shows Paris air quality
4. Indicator: "Viewing temporary location (will reset to GPS on logout)"
5. User logs out
6. User logs back in
7. App automatically shows NYC air quality (GPS location restored)
```

### Scenario 2: Normal Usage
```
1. User logs in
2. GPS location automatically detected
3. No temporary location set
4. App uses GPS location
5. User logs out and back in
6. Same GPS location used
```

## 🛠️ Technical Implementation

### New Hook: `useLocation()`

```typescript
const {
  currentLocation,        // Current location in use (temp or GPS)
  isTemporary,           // Is it a temporary location?
  gpsLocation,           // Permanent GPS location
  setTemporaryLocation,  // Set temp location
  clearTemporaryLocation, // Clear temp, use GPS
  updateGPSLocation,     // Update permanent GPS
  requestCurrentGPS,     // Get current GPS from browser
} = useLocation();
```

### Location Priority
```
temp_location (localStorage) 
  ↓ if not set
user.location (database) 
  ↓ if not set
Request GPS from browser
```

### Storage Strategy

**localStorage:**
- `gps_location` - Cached GPS location (kept on logout)
- `temp_location` - Temporary override (cleared on logout)

**Database:**
- `users.location` - Permanent GPS location

**Session:**
- `user.location` - Current user object location

## 📱 UI Indicators

When viewing temporary location:
```
┌─────────────────────────────────────────────────┐
│ 📍 Viewing temporary location                  │
│    (will reset to GPS on logout)               │
└─────────────────────────────────────────────────┘
```

## 🔐 Security & Privacy

### On Logout (AuthContext):
```typescript
// Clear temporary location
localStorage.removeItem('temp_location');

// Keep GPS location for next login
// localStorage.getItem('gps_location') ← KEPT

// Clear all user data
localStorage.removeItem('wellness_streak');
// ... etc
```

### On Login:
```typescript
// Restore GPS location
const gpsLocation = localStorage.getItem('gps_location');

// Request fresh GPS if not available
if (!user.location) {
  requestAndSaveLocation(user);
}
```

## 🎨 Example Usage in Components

### Pollution Defense:
```typescript
const { currentLocation, isTemporary } = useLocation();

// Check AQI for current location (temp or GPS)
const response = await axios.get('/pollution-defense/should-activate', {
  params: {
    lat: currentLocation.lat,
    lon: currentLocation.lon
  }
});

// Show indicator if temporary
{isTemporary && (
  <div className="text-amber-700">
    📍 Viewing temporary location (will reset to GPS on logout)
  </div>
)}
```

### Profile Settings (Future):
```typescript
const { 
  currentLocation, 
  setTemporaryLocation, 
  clearTemporaryLocation 
} = useLocation();

// User wants to check Paris air quality
const checkParis = () => {
  setTemporaryLocation({ lat: 48.8566, lon: 2.3522 });
};

// User wants to go back to GPS location
const useMyLocation = () => {
  clearTemporaryLocation();
};
```

## 📊 Data Flow

### Login Flow:
```
User logs in
  ↓
Fetch user profile
  ↓
Check if user.location exists
  ↓ NO
Request GPS from browser
  ↓
Save to database + localStorage
  ↓
Set user.location
```

### Temporary Location Flow:
```
User clicks "Check other location"
  ↓
User enters city/coordinates
  ↓
setTemporaryLocation({ lat, lon })
  ↓
Save to localStorage.temp_location
  ↓
All features use temp location
  ↓
Show "temporary location" indicator
```

### Logout Flow:
```
User logs out
  ↓
localStorage.removeItem('temp_location')
  ↓
localStorage keeps 'gps_location'
  ↓
Clear user state
  ↓
Redirect to login
```

### Re-Login Flow:
```
User logs back in
  ↓
Fetch user profile (has GPS location)
  ↓
No temp_location in localStorage
  ↓
Use GPS location
  ↓
All features use GPS location
```

## 🚀 Deployment

✅ **Deployed** - Commit `13e69a7`
✅ **Hook Created** - `frontend/src/hooks/useLocation.ts`
✅ **AuthContext Updated** - Auto-reset on logout
✅ **PollutionDefense Updated** - Uses hook with indicator

## 🎯 Benefits

1. **Travel Planning**: Check air quality before traveling
2. **Family/Friends**: Check air quality for loved ones in other cities
3. **Privacy**: GPS location always resets on logout
4. **Convenience**: No need to manually reset location
5. **Security**: Temporary data cleared automatically

## 🔮 Future Enhancements

1. **Location Search**: Add city search UI
2. **Saved Locations**: Save favorite locations
3. **Location History**: Track recently checked locations
4. **Map Interface**: Visual location picker
5. **Geofencing**: Auto-switch based on GPS movement

---

**Result**: Users can explore air quality anywhere while their GPS home location is always preserved and restored! 🌍
