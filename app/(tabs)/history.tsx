import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getActivities, getUserSettings } from '@/utils/storage';
import { ActivityData, ActivityType } from '@/types';
import Colors from '@/utils/colors';
import ActivityCard from '@/components/ActivityCard';
import { formatDistance, formatDuration } from '@/utils/activity';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, Filter } from 'lucide-react-native';

export default function HistoryScreen() {
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImperial, setIsImperial] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<ActivityType[]>(['running', 'cycling', 'walking']);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  
  useEffect(() => {
    loadActivities();
  }, []);
  
  useEffect(() => {
    filterActivities();
  }, [activities, selectedTypes, currentWeekStart]);
  
  const loadActivities = async () => {
    setIsLoading(true);
    try {
      const allActivities = await getActivities();
      setActivities(allActivities.sort((a, b) => 
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      ));
      
      const userSettings = await getUserSettings();
      setIsImperial(userSettings?.units === 'imperial' || false);
      
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const filterActivities = () => {
    const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
    
    const filtered = activities.filter(activity => {
      const activityDate = new Date(activity.startTime);
      const matchesType = selectedTypes.includes(activity.type);
      const matchesWeek = 
        activityDate >= currentWeekStart && 
        activityDate <= weekEnd;
      
      return matchesType && matchesWeek;
    });
    
    setFilteredActivities(filtered);
  };
  
  const toggleActivityType = (type: ActivityType) => {
    if (selectedTypes.includes(type)) {
      if (selectedTypes.length > 1) {
        setSelectedTypes(selectedTypes.filter(t => t !== type));
      }
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };
  
  const previousWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newWeekStart);
  };
  
  const nextWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() + 7);
    
    // Don't allow going beyond current week
    if (newWeekStart <= startOfWeek(new Date(), { weekStartsOn: 1 })) {
      setCurrentWeekStart(newWeekStart);
    }
  };
  
  const formatWeekRange = () => {
    const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
    return `${format(currentWeekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
  };
  
  const calculateWeeklyStats = () => {
    if (filteredActivities.length === 0) {
      return { totalDistance: 0, totalDuration: 0, totalActivities: 0 };
    }
    
    const totalDistance = filteredActivities.reduce((sum, activity) => sum + activity.distance, 0);
    const totalDuration = filteredActivities.reduce((sum, activity) => sum + activity.duration, 0);
    
    return {
      totalDistance,
      totalDuration,
      totalActivities: filteredActivities.length,
    };
  };
  
  const stats = calculateWeeklyStats();
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Activity History</Text>
        </View>
        
        <View style={styles.weekSelector}>
          <TouchableOpacity onPress={previousWeek} style={styles.weekButton}>
            <ChevronLeft size={24} color={Colors.grey[700]} />
          </TouchableOpacity>
          
          <View style={styles.weekLabelContainer}>
            <Calendar size={16} color={Colors.grey[700]} style={styles.calendarIcon} />
            <Text style={styles.weekLabel}>{formatWeekRange()}</Text>
          </View>
          
          <TouchableOpacity 
            onPress={nextWeek} 
            style={styles.weekButton}
            disabled={currentWeekStart >= startOfWeek(new Date(), { weekStartsOn: 1 })}
          >
            <ChevronRight 
              size={24} 
              color={currentWeekStart >= startOfWeek(new Date(), { weekStartsOn: 1 }) 
                ? Colors.grey[400] 
                : Colors.grey[700]} 
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.filterContainer}>
          <View style={styles.filterHeaderRow}>
            <Filter size={16} color={Colors.grey[700]} />
            <Text style={styles.filterTitle}>Activity Type</Text>
          </View>
          
          <View style={styles.filterOptions}>
            <TouchableOpacity
              style={[
                styles.filterOption,
                selectedTypes.includes('running') && styles.filterOptionSelected,
                selectedTypes.includes('running') && { backgroundColor: Colors.activity.running.light },
              ]}
              onPress={() => toggleActivityType('running')}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  selectedTypes.includes('running') && { color: Colors.activity.running.dark },
                ]}
              >
                Running
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterOption,
                selectedTypes.includes('cycling') && styles.filterOptionSelected,
                selectedTypes.includes('cycling') && { backgroundColor: Colors.activity.cycling.light },
              ]}
              onPress={() => toggleActivityType('cycling')}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  selectedTypes.includes('cycling') && { color: Colors.activity.cycling.dark },
                ]}
              >
                Cycling
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterOption,
                selectedTypes.includes('walking') && styles.filterOptionSelected,
                selectedTypes.includes('walking') && { backgroundColor: Colors.activity.walking.light },
              ]}
              onPress={() => toggleActivityType('walking')}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  selectedTypes.includes('walking') && { color: Colors.activity.walking.dark },
                ]}
              >
                Walking
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatDistance(stats.totalDistance, isImperial)}</Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatDuration(stats.totalDuration)}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalActivities}</Text>
            <Text style={styles.statLabel}>Activities</Text>
          </View>
        </View>
        
        <View style={styles.activitiesContainer}>
          {filteredActivities.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No activities found</Text>
              <Text style={styles.emptyStateSubtext}>
                Try changing your filters or track a new activity
              </Text>
            </View>
          ) : (
            filteredActivities.map(activity => (
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
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: Colors.grey[900],
  },
  weekSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  weekButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  weekLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarIcon: {
    marginRight: 4,
  },
  weekLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.grey[800],
  },
  filterContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
  },
  filterHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.grey[700],
    marginLeft: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.grey[200],
    marginRight: 8,
    marginBottom: 8,
  },
  filterOptionSelected: {
    borderWidth: 1,
    borderColor: Colors.grey[300],
  },
  filterOptionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.grey[700],
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
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
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.grey[300],
  },
  activitiesContainer: {
    paddingBottom: 24,
  },
  emptyState: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 32,
    marginHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
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