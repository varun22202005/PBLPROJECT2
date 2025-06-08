import { ActivityData, ActivityType, Location } from '../types';
import { addActivity } from './storage';

export const calculateCalories = (
  type: ActivityType,
  durationInSeconds: number,
  distanceInMeters: number,
  weightInKg: number = 70
): number => {
  // MET values (Metabolic Equivalent of Task)
  // These are approximate values
  const MET = {
    running: 9.8, // Running 6 mph (10 min/mile)
    cycling: 8.0, // Cycling 12-14 mph, moderate effort
    walking: 3.5, // Walking 4 mph, brisk pace
  };

  // Calories = MET * weight in kg * duration in hours
  const durationInHours = durationInSeconds / 3600;
  return MET[type] * weightInKg * durationInHours;
};

export const calculateAvgPace = (durationInSeconds: number, distanceInMeters: number): number => {
  if (distanceInMeters === 0) return 0;
  // Pace in seconds per kilometer
  return (durationInSeconds / (distanceInMeters / 1000));
};

export const formatPace = (paceInSecondsPerKm: number, isImperial: boolean = false): string => {
  if (paceInSecondsPerKm === 0) return '-';
  
  // Convert to minutes and seconds
  const paceInSecondsPerUnit = isImperial 
    ? paceInSecondsPerKm * 1.60934 // Convert to seconds per mile
    : paceInSecondsPerKm;
    
  const minutes = Math.floor(paceInSecondsPerUnit / 60);
  const seconds = Math.floor(paceInSecondsPerUnit % 60);
  
  return `${minutes}:${seconds.toString().padStart(2, '0')} min/${isImperial ? 'mi' : 'km'}`;
};

export const formatDistance = (distanceInMeters: number, isImperial: boolean = false): string => {
  if (isImperial) {
    // Convert to miles
    const miles = distanceInMeters / 1609.34;
    return miles < 10 
      ? `${miles.toFixed(2)} mi` 
      : `${miles.toFixed(1)} mi`;
  } else {
    // Use km
    const km = distanceInMeters / 1000;
    return km < 10 
      ? `${km.toFixed(2)} km` 
      : `${km.toFixed(1)} km`;
  }
};

export const formatDuration = (durationInSeconds: number): string => {
  const hours = Math.floor(durationInSeconds / 3600);
  const minutes = Math.floor((durationInSeconds % 3600) / 60);
  const seconds = Math.floor(durationInSeconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
};

export const calculateDistance = (locations: Location[]): number => {
  if (locations.length < 2) return 0;
  
  let totalDistance = 0;
  for (let i = 1; i < locations.length; i++) {
    totalDistance += haversineDistance(
      locations[i-1].latitude, 
      locations[i-1].longitude,
      locations[i].latitude,
      locations[i].longitude
    );
  }
  
  return totalDistance;
};

// Calculate distance between two coordinates using Haversine formula
export const haversineDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = 
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

export const createActivityRecord = async (
  type: ActivityType,
  startTime: Date,
  endTime: Date,
  route: Location[],
  weightInKg: number = 70
): Promise<ActivityData> => {
  const durationInSeconds = (endTime.getTime() - startTime.getTime()) / 1000;
  const distanceInMeters = calculateDistance(route);
  const avgPace = calculateAvgPace(durationInSeconds, distanceInMeters);
  const calories = calculateCalories(type, durationInSeconds, distanceInMeters, weightInKg);
  
  const activity: ActivityData = {
    id: generateId(),
    type,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    duration: durationInSeconds,
    distance: distanceInMeters,
    avgPace,
    calories,
    route,
  };
  
  await addActivity(activity);
  return activity;
};

// Generate a simple unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};