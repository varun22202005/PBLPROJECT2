export type ActivityType = 'running' | 'cycling' | 'walking';

export interface Location {
  latitude: number;
  longitude: number;
  altitude?: number | null;
  timestamp: number;
  accuracy?: number | null;
  speed?: number | null;
}

export interface ActivityData {
  id: string;
  type: ActivityType;
  startTime: string;
  endTime: string;
  duration: number; // in seconds
  distance: number; // in meters
  avgPace: number; // in seconds per km
  calories: number;
  route: Location[];
}

export interface UserSettings {
  name: string;
  weight: number; // in kg
  height: number; // in cm
  gender: 'male' | 'female' | 'other';
  units: 'metric' | 'imperial';
}