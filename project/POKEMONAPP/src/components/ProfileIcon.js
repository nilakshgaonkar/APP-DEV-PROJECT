import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import auth from '@react-native-firebase/auth';
import {getUserProfile} from '../services/profileService';

const ProfileIcon = ({onPress}) => {
  const [initial, setInitial] = useState('U');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserInitial();
  }, []);

  const loadUserInitial = async () => {
    try {
      const currentUser = auth().currentUser;
      if (currentUser) {
        let displayName = currentUser.displayName;
        let username = null;
        
        // Try to get from profile
        try {
          const profile = await getUserProfile(currentUser.uid);
          if (profile) {
            // Prefer username, then displayName
            username = profile.username;
            displayName = profile.displayName || displayName;
          }
        } catch (error) {
          // Fallback to auth user data
          console.warn('Could not load profile for icon:', error);
        }

        // Get initial from username, display name, or email
        if (username) {
          setInitial(username.charAt(0).toUpperCase());
        } else if (displayName) {
          setInitial(displayName.charAt(0).toUpperCase());
        } else if (currentUser.email) {
          setInitial(currentUser.email.charAt(0).toUpperCase());
        }
      }
    } catch (error) {
      console.error('Error loading user initial:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      disabled={loading}>
      <View style={styles.iconContainer}>
        <Text style={styles.initialText}>{initial}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 15,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  initialText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileIcon;

