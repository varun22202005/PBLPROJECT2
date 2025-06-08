import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ActivityType } from '@/types';
import Colors from '@/utils/colors';
import { Sun as Run, Bike, Footprints } from 'lucide-react-native';

interface ActivityTypeSelectorProps {
  selected: ActivityType;
  onSelect: (type: ActivityType) => void;
}

export default function ActivityTypeSelector({ selected, onSelect }: ActivityTypeSelectorProps) {
  const activityTypes: Array<{ type: ActivityType; label: string; icon: React.ReactNode; color: string }> = [
    {
      type: 'running',
      label: 'Running',
      icon: <Run size={24} color={selected === 'running' ? Colors.white : Colors.activity.running.main} />,
      color: Colors.activity.running.main,
    },
    {
      type: 'cycling',
      label: 'Cycling',
      icon: <Bike size={24} color={selected === 'cycling' ? Colors.white : Colors.activity.cycling.main} />,
      color: Colors.activity.cycling.main,
    },
    {
      type: 'walking',
      label: 'Walking',
      icon: <Footprints size={24} color={selected === 'walking' ? Colors.white : Colors.activity.walking.main} />,
      color: Colors.activity.walking.main,
    },
  ];

  return (
    <View style={styles.container}>
      {activityTypes.map((activity) => (
        <TouchableOpacity
          key={activity.type}
          style={[
            styles.activityButton,
            selected === activity.type && { backgroundColor: activity.color },
          ]}
          onPress={() => onSelect(activity.type)}
          activeOpacity={0.8}
        >
          {activity.icon}
          <Text
            style={[
              styles.activityLabel,
              selected === activity.type && { color: Colors.white },
            ]}
          >
            {activity.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 24,
  },
  activityButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: Colors.white,
    marginHorizontal: 4,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activityLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.grey[800],
    marginTop: 8,
  },
});