import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, TextInput, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserSettings } from '@/types';
import { getUserSettings, saveUserSettings, clearActivities } from '@/utils/storage';
import Colors from '@/utils/colors';
import { User, Weight, Ruler, ArrowRightLeft, Save, Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function ProfileScreen() {
  const [userSettings, setUserSettings] = useState<UserSettings>({
    name: '',
    weight: 70,
    height: 170,
    gender: 'male',
    units: 'metric',
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    loadUserSettings();
  }, []);
  
  const loadUserSettings = async () => {
    setIsLoading(true);
    try {
      const settings = await getUserSettings();
      if (settings) {
        setUserSettings(settings);
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveSettings = async () => {
    try {
      await saveUserSettings(userSettings);
      setIsEditing(false);
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error saving user settings:', error);
    }
  };
  
  const toggleUnits = () => {
    setUserSettings(prev => ({
      ...prev,
      units: prev.units === 'metric' ? 'imperial' : 'metric',
    }));
  };
  
  const clearAllData = async () => {
    if (Platform.OS === 'web') {
      // For web, use confirm
      if (confirm('Are you sure you want to delete all activities? This cannot be undone.')) {
        await clearActivities();
        Alert.alert('Success', 'All activities have been deleted.');
      }
    } else {
      // For native platforms, use Alert
      Alert.alert(
        'Delete All Activities',
        'Are you sure you want to delete all activities? This cannot be undone.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await clearActivities();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Success', 'All activities have been deleted.');
            },
          },
        ]
      );
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          {!isEditing && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.section}>
          <View style={styles.profileSection}>
            <View style={styles.avatarPlaceholder}>
              <User size={40} color={Colors.grey[500]} />
            </View>
            <View style={styles.nameContainer}>
              {isEditing ? (
                <TextInput
                  style={styles.nameInput}
                  value={userSettings.name}
                  onChangeText={(text) => setUserSettings(prev => ({ ...prev, name: text }))}
                  placeholder="Your Name"
                />
              ) : (
                <Text style={styles.name}>
                  {userSettings.name || 'Add your name'}
                </Text>
              )}
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputRow}>
            <View style={styles.inputLabel}>
              <Weight size={20} color={Colors.grey[700]} />
              <Text style={styles.labelText}>Weight</Text>
            </View>
            <View style={styles.inputContainer}>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={userSettings.weight.toString()}
                  onChangeText={(text) => {
                    const weight = parseFloat(text) || 0;
                    setUserSettings(prev => ({ ...prev, weight }));
                  }}
                  keyboardType="numeric"
                />
              ) : (
                <Text style={styles.inputValue}>
                  {userSettings.weight} {userSettings.units === 'metric' ? 'kg' : 'lb'}
                </Text>
              )}
            </View>
          </View>
          
          <View style={styles.inputRow}>
            <View style={styles.inputLabel}>
              <Ruler size={20} color={Colors.grey[700]} />
              <Text style={styles.labelText}>Height</Text>
            </View>
            <View style={styles.inputContainer}>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={userSettings.height.toString()}
                  onChangeText={(text) => {
                    const height = parseFloat(text) || 0;
                    setUserSettings(prev => ({ ...prev, height }));
                  }}
                  keyboardType="numeric"
                />
              ) : (
                <Text style={styles.inputValue}>
                  {userSettings.height} {userSettings.units === 'metric' ? 'cm' : 'in'}
                </Text>
              )}
            </View>
          </View>
          
          <View style={styles.inputRow}>
            <View style={styles.inputLabel}>
              <ArrowRightLeft size={20} color={Colors.grey[700]} />
              <Text style={styles.labelText}>Units</Text>
            </View>
            <View style={styles.inputContainer}>
              {isEditing ? (
                <View style={styles.unitsRow}>
                  <Text style={styles.unitsText}>
                    {userSettings.units === 'metric' ? 'Metric (km, kg)' : 'Imperial (mi, lb)'}
                  </Text>
                  <Switch
                    value={userSettings.units === 'imperial'}
                    onValueChange={toggleUnits}
                    trackColor={{ false: Colors.grey[300], true: Colors.primary.light }}
                    thumbColor={userSettings.units === 'imperial' ? Colors.primary.main : Colors.grey[100]}
                  />
                </View>
              ) : (
                <Text style={styles.inputValue}>
                  {userSettings.units === 'metric' ? 'Metric (km, kg)' : 'Imperial (mi, lb)'}
                </Text>
              )}
            </View>
          </View>
        </View>
        
        {isEditing && (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveSettings}
          >
            <Save size={20} color={Colors.white} />
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        )}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={clearAllData}
          >
            <Trash2 size={20} color={Colors.status.error.main} />
            <Text style={styles.dangerButtonText}>Delete All Activities</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.versionText}>Fitness Tracker v1.0.0</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: Colors.grey[900],
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.primary.main,
    borderRadius: 8,
  },
  editButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: Colors.white,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.grey[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: Colors.grey[900],
  },
  nameInput: {
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    color: Colors.grey[900],
    borderWidth: 1,
    borderColor: Colors.grey[300],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.grey[800],
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  labelText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.grey[800],
    marginLeft: 12,
  },
  inputContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  input: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.grey[900],
    textAlign: 'right',
    borderWidth: 1,
    borderColor: Colors.grey[300],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    width: 100,
  },
  inputValue: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.grey[700],
  },
  unitsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unitsText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.grey[700],
    marginRight: 12,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary.main,
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 24,
    shadowColor: Colors.primary.main,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.white,
    marginLeft: 8,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.status.error.light,
    borderRadius: 8,
    backgroundColor: Colors.status.error.lighter,
  },
  dangerButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.status.error.main,
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    padding: 24,
  },
  versionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.grey[500],
  },
});