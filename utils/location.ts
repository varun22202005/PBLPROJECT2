import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { Location as LocationType } from '../types';

export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
};

export const startLocationTracking = async (
  callback: (location: LocationType) => void,
  errorCallback: (error: any) => void
): Promise<Location.LocationSubscription | null> => {
  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      errorCallback(new Error('Location permission not granted'));
      return null;
    }

    // For web, we need different accuracy settings
    const options = Platform.OS === 'web' 
      ? { accuracy: Location.Accuracy.High, timeInterval: 1000 }
      : { accuracy: Location.Accuracy.BestForNavigation, distanceInterval: 5 };

    return await Location.watchPositionAsync(
      options,
      (location) => {
        callback({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          altitude: location.coords.altitude,
          accuracy: location.coords.accuracy,
          speed: location.coords.speed,
          timestamp: location.timestamp,
        });
      }
    );
  } catch (error) {
    errorCallback(error);
    return null;
  }
};

export const stopLocationTracking = (
  subscription: Location.LocationSubscription | null
): void => {
  if (subscription) {
    subscription.remove();
  }
};

export const getCurrentLocation = async (): Promise<LocationType | null> => {
  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return null;

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      altitude: location.coords.altitude,
      accuracy: location.coords.accuracy,
      speed: location.coords.speed,
      timestamp: location.timestamp,
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
};

export const getLocationRegion = (
  latitude: number, 
  longitude: number, 
  latitudeDelta = 0.005, 
  longitudeDelta = 0.005
) => {
  return {
    latitude,
    longitude,
    latitudeDelta,
    longitudeDelta,
  };
};