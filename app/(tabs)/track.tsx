import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityType, Location as LocationType } from '@/types';
import Colors from '@/utils/colors';
import { startLocationTracking, stopLocationTracking } from '@/utils/location';
import { formatDistance, formatDuration, formatPace, calculateDistance, createActivityRecord } from '@/utils/activity';
import { getUserSettings } from '@/utils/storage';
import ActivityTypeSelector from '@/components/ActivityTypeSelector';
import RouteMap from '@/components/RouteMap';
import { Play, Pause, CircleStop as StopCircle, Clock, Route, Gauge, MapPin } from 'lucide-react-native';

export default function TrackScreen() {
  const [activityType, setActivityType] = useState<ActivityType>('running');
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<LocationType[]>([]);
  const [currentLocation, setCurrentLocation] = useState<LocationType | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [distance, setDistance] = useState(0);
  const [isImperial, setIsImperial] = useState(false);
  
  const locationSubscription = useRef<{ remove: () => void } | null>(null);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    checkPermissionAndLoadSettings();
    
    return () => {
      stopTimer();
      if (locationSubscription.current) {
        stopLocationTracking(locationSubscription.current);
      }
    };
  }, []);
  
  const checkPermissionAndLoadSettings = async () => {
    setLoading(true);
    try {
      // Load user settings
      const settings = await getUserSettings();
      if (settings?.units === 'imperial') {
        setIsImperial(true);
      }
      
      // Check location permission
      if (Platform.OS === 'web') {
        // For web, check if geolocation is available
        if (navigator.geolocation) {
          setLocationPermission(true);
          // Get initial location
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const newLocation: LocationType = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                altitude: position.coords.altitude,
                accuracy: position.coords.accuracy,
                speed: position.coords.speed,
                timestamp: position.timestamp,
              };
              setCurrentLocation(newLocation);
            },
            (error) => {
              console.error('Error getting location:', error);
              setLocationPermission(false);
            }
          );
        } else {
          setLocationPermission(false);
        }
      } else {
        // Native location handling would go here
        try {
          const Location = require('expo-location');
          const { status } = await Location.requestForegroundPermissionsAsync();
          setLocationPermission(status === 'granted');
          
          if (status === 'granted') {
            const location = await Location.getCurrentPositionAsync({});
            const newLocation: LocationType = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              altitude: location.coords.altitude,
              accuracy: location.coords.accuracy,
              speed: location.coords.speed,
              timestamp: location.timestamp,
            };
            setCurrentLocation(newLocation);
          }
        } catch (error) {
          console.error('Error setting up location:', error);
          setLocationPermission(false);
        }
      }
    } catch (error) {
      console.error('Error setting up location:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const startActivity = async () => {
    if (!locationPermission) return;
    
    try {
      // Web-compatible feedback
      if (Platform.OS !== 'web') {
        try {
          const Haptics = require('expo-haptics');
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (error) {
          console.log('Haptics not available');
        }
      }
      
      setIsTracking(true);
      setIsPaused(false);
      setLocations([]);
      setDistance(0);
      setElapsedTime(0);
      
      const now = new Date();
      setStartTime(now);
      setEndTime(null);
      
      // Start the timer
      startTimer();
      
      // Start location tracking
      locationSubscription.current = await startLocationTracking(
        (location) => {
          if (!isPaused) {
            setCurrentLocation(location);
            setLocations((prev) => {
              const newLocations = [...prev, location];
              // Calculate new distance
              setDistance(calculateDistance(newLocations));
              return newLocations;
            });
          }
        },
        (error) => {
          console.error('Location tracking error:', error);
        }
      );
    } catch (error) {
      console.error('Error starting activity:', error);
    }
  };
  
  const pauseActivity = () => {
    // Web-compatible feedback
    if (Platform.OS !== 'web') {
      try {
        const Haptics = require('expo-haptics');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.log('Haptics not available');
      }
    }
    
    setIsPaused(!isPaused);
    
    if (isPaused) {
      // Resume
      startTimer();
    } else {
      // Pause
      stopTimer();
    }
  };
  
  const stopActivity = async () => {
    // Web-compatible feedback
    if (Platform.OS !== 'web') {
      try {
        const Haptics = require('expo-haptics');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.log('Haptics not available');
      }
    }
    
    // Stop tracking
    stopTimer();
    
    if (locationSubscription.current) {
      stopLocationTracking(locationSubscription.current);
      locationSubscription.current = null;
    }
    
    const now = new Date();
    setEndTime(now);
    
    if (startTime && locations.length > 0) {
      try {
        // Get user settings for proper calorie calculation
        const settings = await getUserSettings();
        const userWeight = settings?.weight || 70; // Default to 70kg
        
        // Record the activity
        await createActivityRecord(
          activityType,
          startTime,
          now,
          locations,
          userWeight
        );
      } catch (error) {
        console.error('Error saving activity:', error);
      }
    }
    
    // Reset tracking state
    setIsTracking(false);
    setIsPaused(false);
  };
  
  const startTimer = () => {
    if (timerInterval.current) clearInterval(timerInterval.current);
    
    const startTimestamp = Date.now() - elapsedTime * 1000;
    
    timerInterval.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
      setElapsedTime(elapsed);
    }, 1000);
  };
  
  const stopTimer = () => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
  };
  
  // Calculate current pace (in seconds per km)
  const currentPace = elapsedTime > 0 && distance > 0
    ? (elapsedTime / (distance / 1000))
    : 0;
    
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }
  
  if (!locationPermission) {
    return (
      <View style={styles.centerContainer}>
        <MapPin size={48} color={Colors.grey[400]} style={styles.permissionIcon} />
        <Text style={styles.permissionTitle}>Location Access Required</Text>
        <Text style={styles.permissionText}>
          {Platform.OS === 'web' 
            ? 'This app needs location access to track your activities. Please allow location access when prompted by your browser.'
            : 'This app needs location access to track your activities. Please enable location permissions in your device settings.'
          }
        </Text>
        <TouchableOpacity 
          style={styles.permissionButton}
          onPress={checkPermissionAndLoadSettings}
        >
          <Text style={styles.permissionButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Track Activity</Text>
        
        <ActivityTypeSelector
          selected={activityType}
          onSelect={setActivityType}
        />
        
        {!isTracking ? (
          <View style={styles.startContainer}>
            <TouchableOpacity 
              style={styles.startButton}
              onPress={startActivity}
              activeOpacity={0.8}
            >
              <Play size={32} color={Colors.white} />
              <Text style={styles.startButtonText}>Start Activity</Text>
            </TouchableOpacity>
            
            {currentLocation && (
              <View style={styles.locationInfo}>
                <MapPin size={16} color={Colors.grey[600]} />
                <Text style={styles.locationText}>
                  Location ready • {currentLocation.accuracy ? `±${Math.round(currentLocation.accuracy)}m` : 'GPS active'}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Clock size={24} color={Colors.primary.main} />
                <Text style={styles.statValue}>{formatDuration(elapsedTime)}</Text>
                <Text style={styles.statLabel}>Duration</Text>
              </View>
              
              <View style={styles.statCard}>
                <Route size={24} color={Colors.activity[activityType].main} />
                <Text style={styles.statValue}>{formatDistance(distance, isImperial)}</Text>
                <Text style={styles.statLabel}>Distance</Text>
              </View>
              
              <View style={styles.statCard}>
                <Gauge size={24} color={Colors.status.success.main} />
                <Text style={styles.statValue}>{formatPace(currentPace, isImperial)}</Text>
                <Text style={styles.statLabel}>Current Pace</Text>
              </View>
            </View>
            
            {currentLocation && (
              <RouteMap 
                locations={locations}
                activityType={activityType}
                height={300}
              />
            )}
            
            <View style={styles.controls}>
              <TouchableOpacity 
                style={[styles.controlButton, styles.pauseButton]} 
                onPress={pauseActivity}
              >
                {isPaused ? (
                  <Play size={24} color={Colors.grey[800]} />
                ) : (
                  <Pause size={24} color={Colors.grey[800]} />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.controlButton, styles.stopButton]} 
                onPress={stopActivity}
              >
                <StopCircle size={24} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.grey[100],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.grey[100],
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: Colors.grey[900],
    marginTop: 24,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.grey[700],
    marginTop: 16,
  },
  startContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary.main,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    shadowColor: Colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.white,
    marginLeft: 12,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.white,
    borderRadius: 8,
  },
  locationText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.grey[600],
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: Colors.grey[900],
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.grey[600],
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginHorizontal: 16,
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginHorizontal: 16,
  },
  pauseButton: {
    backgroundColor: Colors.white,
  },
  stopButton: {
    backgroundColor: Colors.status.error.main,
  },
  permissionIcon: {
    marginBottom: 16,
  },
  permissionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: Colors.grey[900],
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.grey[700],
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: Colors.primary.main,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  permissionButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.white,
  },
});