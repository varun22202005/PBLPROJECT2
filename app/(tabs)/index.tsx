import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getRecentActivities, getUserSettings } from '@/utils/storage';
import { ActivityData, UserSettings } from '@/types';
import Colors from '@/utils/colors';
import ActivityCard from '@/components/ActivityCard';
import StatisticBox from '@/components/StatisticBox';
import { Clock, Route, Flame, Footprints } from 'lucide-react-native';
import { formatDistance, formatDuration, formatPace } from '@/utils/activity';

export default function HomeScreen() {
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [stats, setStats] = useState({
    totalDistance: 0,
    totalDuration: 0,
    totalCalories: 0,
    totalActivities: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const recentActivities = await getRecentActivities(7);
      const settings = await getUserSettings();
      
      setActivities(recentActivities);
      setUserSettings(settings);
      
      // Calculate summary statistics
      calculateStats(recentActivities);
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (activityData: ActivityData[]) => {
    const totalDistance = activityData.reduce((sum, activity) => sum + activity.distance, 0);
    const totalDuration = activityData.reduce((sum, activity) => sum + activity.duration, 0);
    const totalCalories = activityData.reduce((sum, activity) => sum + activity.calories, 0);
    
    setStats({
      totalDistance,
      totalDuration,
      totalCalories,
      totalActivities: activityData.length,
    });
  };

  const isImperial = userSettings?.units === 'imperial';

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello{userSettings?.name ? `, ${userSettings.name}` : ''}!</Text>
          <Text style={styles.subtitle}>Here's your activity summary</Text>
        </View>

        <View style={styles.statsContainer}>
          <StatisticBox
            label="Total Distance"
            value={formatDistance(stats.totalDistance, isImperial)}
            icon={<Route size={24} color={Colors.primary.main} />}
            color={Colors.primary.main}
          />
          <StatisticBox
            label="Active Time"
            value={formatDuration(stats.totalDuration)}
            icon={<Clock size={24} color={Colors.activity.running.main} />}
            color={Colors.activity.running.main}
          />
          <StatisticBox
            label="Calories Burned"
            value={`${Math.round(stats.totalCalories)} kcal`}
            icon={<Flame size={24} color={Colors.activity.cycling.main} />}
            color={Colors.activity.cycling.main}
          />
          <StatisticBox
            label="Total Activities"
            value={`${stats.totalActivities}`}
            icon={<Footprints size={24} color={Colors.activity.walking.main} />}
            color={Colors.activity.walking.main}
          />
        </View>

        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          {activities.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No recent activities</Text>
              <Text style={styles.emptyStateSubtext}>Start tracking your first workout!</Text>
            </View>
          ) : (
            activities.slice(0, 5).map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                isImperial={isImperial}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.grey[100],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.grey[100],
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  greeting: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: Colors.grey[900],
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.grey[600],
  },
  statsContainer: {
    padding: 16,
  },
  recentSection: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.grey[900],
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  emptyStateText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.grey[800],
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.grey[600],
    textAlign: 'center',
  },
});