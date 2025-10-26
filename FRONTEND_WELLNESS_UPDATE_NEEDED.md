# Frontend Wellness Update - Profile.tsx Changes Needed

## Status: ⚠️ PARTIALLY COMPLETE

### ✅ Completed:
- State variables updated (formData structure)
- Form submission logic updated
- Basic information section (age → age_range)
- Profile description text updated

### ❌ Still Needed in Profile.tsx:

#### 1. Update Helper Functions (lines 220-286)

Replace these medical functions:
```typescript
// DELETE THESE:
const addAllergy = () => { ... }
const removeAllergy = (allergy: string) => { ... }
const addCondition = () => { ... }
const removeCondition = (condition: string) => { ... }
const addMedication = () => { ... }
const removeMedication = (med: string) => { ... }
const addTrigger = () => { ... }  // Keep but modify
const removeTrigger = (trigger: string) => { ... }  // Keep but modify
```

With these wellness functions:
```typescript
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
```

#### 2. Replace "Health Information" Section (lines 441-586)

**OLD (Medical):**
```tsx
<h3>Health Information</h3>
- Health Conditions (free text)
- Asthma Severity (dropdown)
- Allergies (free text)
- Triggers (free text)
- Medications (free text)
```

**NEW (Wellness):**
```tsx
<h3>Environmental Wellness Profile</h3>

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
    <span className="text-xs text-gray-500 ml-2">(What bothers you?)</span>
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
<div className="space-y-3">
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
      name="uses_air_purifier"
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
```

## Quick Implementation Option

Would you like me to:

**Option A:** Create a completely new `ProfileWellness.tsx` file with all wellness fields (clean slate)

**Option B:** Continue editing the existing `Profile.tsx` file piece by piece (more complex due to TypeScript errors)

**Option C:** Provide you with the complete replacement code for the wellness section that you can manually copy/paste

## Recommendation

**Option A** is cleanest - I can create a new wellness-focused profile page, then you can:
1. Test the new wellness version
2. Switch the route from old Profile to new ProfileWellness
3. Delete the old medical version once confirmed working

This avoids TypeScript errors during the transition and gives you a clean implementation.

**What would you prefer?**
