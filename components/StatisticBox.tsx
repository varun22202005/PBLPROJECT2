import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/utils/colors';
import { Video as LucideIcon } from 'lucide-react-native';

interface StatisticBoxProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color?: string;
}

export default function StatisticBox({ label, value, icon, color = Colors.primary.main }: StatisticBoxProps) {
  return (
    <View style={[styles.container, { borderLeftColor: color }]}>
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    borderLeftWidth: 4,
    marginBottom: 8,
  },
  iconContainer: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  value: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: Colors.grey[900],
    marginBottom: 4,
  },
  label: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.grey[600],
  },
});