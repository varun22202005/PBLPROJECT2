import { ActivityData, UserSettings } from '../types';
import { Platform } from 'react-native';

const ACTIVITIES_KEY = 'fitness_tracker_activities';
const USER_SETTINGS_KEY = 'fitness_tracker_user_settings';

// Web storage implementation using localStorage
const webStorage = {
  setItem: (key: string, value: string) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
    }
  },
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key);
    }
    return null;
  },
};

const saveItem = async (key: string, value: string) => {
  if (Platform.OS === 'web') {
    webStorage.setItem(key, value);
    return;
  }
  // Native implementation would use SecureStore
  try {
    const SecureStore = require('expo-secure-store');
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error('Failed to save item:', error);
  }
};

const getItem = async (key: string): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return webStorage.getItem(key);
  }
  // Native implementation would use SecureStore
  try {
    const SecureStore = require('expo-secure-store');
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error('Failed to get item:', error);
    return null;
  }
};

export const saveActivities = async (activities: ActivityData[]): Promise<void> => {
  try {
    await saveItem(ACTIVITIES_KEY, JSON.stringify(activities));
  } catch (error) {
    console.error('Failed to save activities', error);
  }
};

export const getActivities = async (): Promise<ActivityData[]> => {
  try {
    const data = await getItem(ACTIVITIES_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to get activities', error);
    return [];
  }
};

export const addActivity = async (activity: ActivityData): Promise<void> => {
  try {
    const activities = await getActivities();
    activities.push(activity);
    await saveActivities(activities);
  } catch (error) {
    console.error('Failed to add activity', error);
  }
};

export const clearActivities = async (): Promise<void> => {
  try {
    await saveItem(ACTIVITIES_KEY, JSON.stringify([]));
  } catch (error) {
    console.error('Failed to clear activities', error);
  }
};

export const saveUserSettings = async (settings: UserSettings): Promise<void> => {
  try {
    await saveItem(USER_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save user settings', error);
  }
};

export const getUserSettings = async (): Promise<UserSettings | null> => {
  try {
    const data = await getItem(USER_SETTINGS_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to get user settings', error);
    return null;
  }
};

export const getRecentActivities = async (days: number = 7): Promise<ActivityData[]> => {
  try {
    const activities = await getActivities();
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - days);
    
    return activities.filter(activity => {
      const activityDate = new Date(activity.startTime);
      return activityDate >= oneWeekAgo;
    });
  } catch (error) {
    console.error('Failed to get recent activities', error);
    return [];
  }
};