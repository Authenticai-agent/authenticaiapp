/**
 * Feature Flags Configuration
 * Replace LaunchDarkly with a simple, reliable feature flag system
 */

export interface FeatureFlags {
  enablePremiumFeatures: boolean;
  enableDebugMode: boolean;
  enableAnalytics: boolean;
  enableNotifications: boolean;
  enableOfflineMode: boolean;
  enableAdvancedPredictions: boolean;
  enablePersonalizedCoaching: boolean;
  enableDataExport: boolean;
  enableApiAccess: boolean;
  enableWhiteLabelMode: boolean;
}

export class FeatureFlagService {
  private static instance: FeatureFlagService;
  private flags: FeatureFlags;

  private constructor() {
    // Default feature flags - can be overridden by environment or user preferences
    this.flags = {
      enablePremiumFeatures: this.getFeatureFlag('ENABLE_PREMIUM_FEATURES', false),
      enableDebugMode: this.getFeatureFlag('ENABLE_DEBUG_MODE', process.env.NODE_ENV === 'development'),
      enableAnalytics: this.getFeatureFlag('ENABLE_ANALYTICS', true),
      enableNotifications: this.getFeatureFlag('ENABLE_NOTIFICATIONS', true),
      enableOfflineMode: this.getFeatureFlag('ENABLE_OFFLINE_MODE', false),
      enableAdvancedPredictions: this.getFeatureFlag('ENABLE_ADVANCED_PREDICTIONS', true),
      enablePersonalizedCoaching: this.getFeatureFlag('ENABLE_PERSONALIZED_COACHING', true),
      enableDataExport: this.getFeatureFlag('ENABLE_DATA_EXPORT', false),
      enableApiAccess: this.getFeatureFlag('ENABLE_API_ACCESS', false),
      enableWhiteLabelMode: this.getFeatureFlag('ENABLE_WHITE_LABEL_MODE', false),
    };
  }

  public static getInstance(): FeatureFlagService {
    if (!FeatureFlagService.instance) {
      FeatureFlagService.instance = new FeatureFlagService();
    }
    return FeatureFlagService.instance;
  }

  private getFeatureFlag(key: string, defaultValue: boolean): boolean {
    // Check environment variables first
    const envValue = process.env[`REACT_APP_${key}`];
    if (envValue !== undefined) {
      return envValue === 'true';
    }

    // Check localStorage for user preferences
    try {
      const storedValue = localStorage.getItem(`feature_${key}`);
      if (storedValue !== null) {
        return storedValue === 'true';
      }
    } catch (error) {
      // localStorage not available
    }

    return defaultValue;
  }

  public isFeatureEnabled(flag: keyof FeatureFlags): boolean {
    return this.flags[flag];
  }

  public setFeatureFlag(flag: keyof FeatureFlags, enabled: boolean): void {
    this.flags[flag] = enabled;

    // Persist to localStorage
    try {
      localStorage.setItem(`feature_${flag.toUpperCase()}`, enabled.toString());
    } catch (error) {
      // localStorage not available
    }
  }

  public getAllFlags(): FeatureFlags {
    return { ...this.flags };
  }

  public resetToDefaults(): void {
    this.flags = {
      enablePremiumFeatures: false,
      enableDebugMode: process.env.NODE_ENV === 'development',
      enableAnalytics: true,
      enableNotifications: true,
      enableOfflineMode: false,
      enableAdvancedPredictions: true,
      enablePersonalizedCoaching: true,
      enableDataExport: false,
      enableApiAccess: false,
      enableWhiteLabelMode: false,
    };

    // Clear localStorage
    try {
      Object.keys(this.flags).forEach(key => {
        localStorage.removeItem(`feature_${key.toUpperCase()}`);
      });
    } catch (error) {
      // localStorage not available
    }
  }
}

// Export singleton instance
export const featureFlags = FeatureFlagService.getInstance();

// Export convenience functions
export const isFeatureEnabled = (flag: keyof FeatureFlags): boolean => {
  return featureFlags.isFeatureEnabled(flag);
};

export const setFeatureFlag = (flag: keyof FeatureFlags, enabled: boolean): void => {
  return featureFlags.setFeatureFlag(flag, enabled);
};

export const getAllFeatureFlags = (): FeatureFlags => {
  return featureFlags.getAllFlags();
};
