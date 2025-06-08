import { Platform } from 'react-native';
import { Location as LocationType } from '../types';

// Web-compatible location tracking using browser geolocation API
export const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(false);
        return;
      }
      
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          resolve(true);
        } else if (result.state === 'prompt') {
          // Will be prompted when getCurrentPosition is called
          resolve(true);
        } else {
          resolve(false);
        }
      }).catch(() => {
        // Fallback for browsers that don't support permissions API
        resolve(true);
      });
    });
  } else {
    // Native implementation would go here
    try {
      const Location = require('expo-location');
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }
};

export const startLocationTracking = async (
  callback: (location: LocationType) => void,
  errorCallback: (error: any) => void
): Promise<{ remove: () => void } | null> => {
  if (Platform.OS === 'web') {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      errorCallback(new Error('Location permission not granted'));
      return null;
    }

    if (!navigator.geolocation) {
      errorCallback(new Error('Geolocation is not supported by this browser'));
      return null;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        errorCallback(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000,
      }
    );

    return {
      remove: () => navigator.geolocation.clearWatch(watchId),
    };
  } else {
    // Native implementation would go here
    try {
      const Location = require('expo-location');
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        errorCallback(new Error('Location permission not granted'));
        return null;
      }

      return await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.BestForNavigation, distanceInterval: 5 },
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
  }
};

export const stopLocationTracking = (
  subscription: { remove: () => void } | null
): void => {
  if (subscription) {
    subscription.remove();
  }
};

export const getCurrentLocation = async (): Promise<LocationType | null> => {
  if (Platform.OS === 'web') {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return null;

    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser');
      return null;
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          console.error('Error getting current location:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  } else {
    // Native implementation would go here
    try {
      const Location = require('expo-location');
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