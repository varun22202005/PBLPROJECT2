import React from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import Colors from '@/utils/colors';
import { Location } from '@/types';

// Component to be used on native platforms only
const NativeMap = Platform.select({
  native: () => {
    const { default: MapView, Polyline, Marker, PROVIDER_GOOGLE } = require('react-native-maps');
    
    return ({ 
      locations, 
      activityType, 
      showMarkers = true,
      height = 250 
    }) => {
      if (locations.length === 0) return null;
      
      const coords = locations.map(loc => ({
        latitude: loc.latitude,
        longitude: loc.longitude,
      }));
      
      const getRegion = () => {
        if (locations.length === 0) return null;
        
        // Find the bounding coordinates
        let minLat = locations[0].latitude;
        let maxLat = locations[0].latitude;
        let minLng = locations[0].longitude;
        let maxLng = locations[0].longitude;
        
        locations.forEach(loc => {
          minLat = Math.min(minLat, loc.latitude);
          maxLat = Math.max(maxLat, loc.latitude);
          minLng = Math.min(minLng, loc.longitude);
          maxLng = Math.max(maxLng, loc.longitude);
        });
        
        // Add some padding
        const latDelta = (maxLat - minLat) * 1.5 || 0.005;
        const lngDelta = (maxLng - minLng) * 1.5 || 0.005;
        
        return {
          latitude: (minLat + maxLat) / 2,
          longitude: (minLng + maxLng) / 2,
          latitudeDelta: Math.max(latDelta, 0.005),
          longitudeDelta: Math.max(lngDelta, 0.005),
        };
      };
      
      const getRouteColor = () => {
        switch (activityType) {
          case 'running':
            return Colors.activity.running.main;
          case 'cycling':
            return Colors.activity.cycling.main;
          case 'walking':
            return Colors.activity.walking.main;
          default:
            return Colors.primary.main;
        }
      };
      
      const provider = Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined;
      
      return (
        <View style={[styles.container, { height }]}>
          <MapView
            style={styles.map}
            initialRegion={getRegion()}
            provider={provider}
          >
            <Polyline
              coordinates={coords}
              strokeWidth={4}
              strokeColor={getRouteColor()}
            />
            
            {showMarkers && locations.length > 0 && (
              <>
                <Marker
                  coordinate={{
                    latitude: locations[0].latitude,
                    longitude: locations[0].longitude,
                  }}
                  pinColor={Colors.status.success.main}
                  title="Start"
                />
                
                <Marker
                  coordinate={{
                    latitude: locations[locations.length - 1].latitude,
                    longitude: locations[locations.length - 1].longitude,
                  }}
                  pinColor={Colors.status.error.main}
                  title="Finish"
                />
              </>
            )}
          </MapView>
        </View>
      );
    };
  },
  // Return null for web to avoid even importing the component
  default: () => null,
})();

// Web-specific map component
const WebMap = ({ 
  locations, 
  height = 250 
}) => {
  return (
    <View style={[styles.container, { height }]}>
      <View style={[styles.webMapPlaceholder, { backgroundColor: Colors.grey[200] }]}>
        <Text style={styles.webMapText}>Route Map</Text>
        <Text style={styles.webMapSubtext}>
          {locations.length} GPS points • {(calculateDistance(locations) / 1000).toFixed(2)} km
        </Text>
      </View>
    </View>
  );
};

interface RouteMapProps {
  locations: Location[];
  activityType: string;
  showMarkers?: boolean;
  height?: number;
}

export default function RouteMap({ 
  locations, 
  activityType,
  showMarkers = true,
  height = 250
}: RouteMapProps) {
  if (locations.length === 0) return null;
  
  // Use platform-specific component
  if (Platform.OS === 'web') {
    return <WebMap locations={locations} height={height} />;
  } else if (NativeMap) {
    return <NativeMap 
      locations={locations} 
      activityType={activityType} 
      showMarkers={showMarkers} 
      height={height} 
    />;
  }
  
  // Fallback (should never happen)
  return null;
}

// Helper function to calculate distance for web display
const calculateDistance = (locations: Location[]): number => {
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

// Haversine formula to calculate distance between coordinates
const haversineDistance = (
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

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 16,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  webMapPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  webMapText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.grey[800],
  },
  webMapSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.grey[600],
    marginTop: 8,
  }
});