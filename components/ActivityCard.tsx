import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ActivityData } from '@/types';
import { formatDistance, formatDuration, formatPace } from '@/utils/activity';
import Colors from '@/utils/colors';
import { format } from 'date-fns';
import { Map, Footprints, Bike } from 'lucide-react-native';

interface ActivityCardProps {
  activity: ActivityData;
  onPress?: () => void;
  isImperial?: boolean;
}

export default function ActivityCard({ activity, onPress, isImperial = false }: ActivityCardProps) {
  const getActivityColor = () => {
    switch (activity.type) {
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

  const getActivityIcon = () => {
    switch (activity.type) {
      case 'running':
        return <Map size={20} color={Colors.activity.running.main} />;
      case 'cycling':
        return <Bike size={20} color={Colors.activity.cycling.main} />;
      case 'walking':
        return <Footprints size={20} color={Colors.activity.walking.main} />;
      default:
        return <Map size={20} color={Colors.primary.main} />;
    }
  };

  const getActivityTitle = () => {
    const capitalized = activity.type.charAt(0).toUpperCase() + activity.type.slice(1);
    return `${capitalized}`;
  };

  return (
    <TouchableOpacity 
      style={[styles.card, { borderLeftColor: getActivityColor() }]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          {getActivityIcon()}
          <Text style={styles.title}>{getActivityTitle()}</Text>
        </View>
        <Text style={styles.date}>
          {format(new Date(activity.startTime), 'MMM d, yyyy • h:mm a')}
        </Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatDistance(activity.distance, isImperial)}</Text>
          <Text style={styles.statLabel}>Distance</Text>
        </View>
        
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatDuration(activity.duration)}</Text>
          <Text style={styles.statLabel}>Duration</Text>
        </View>
        
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatPace(activity.avgPace, isImperial)}</Text>
          <Text style={styles.statLabel}>Avg Pace</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: 'column',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.grey[900],
    marginLeft: 8,
  },
  date: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.grey[600],
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: Colors.grey[900],
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.grey[600],
  },
});