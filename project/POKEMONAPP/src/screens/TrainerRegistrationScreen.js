import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {createTrainerProfile} from '../services/trainerService';
import {testFirebaseConnection} from '../utils/firebaseDebug';
import auth from '@react-native-firebase/auth';

const REGIONS = [
  'Kanto',
  'Johto',
  'Hoenn',
  'Sinnoh',
  'Unova',
  'Kalos',
  'Alola',
  'Galar',
  'Paldea',
];

const AVATARS = [
  {id: 'male1', type: 'male', emoji: '👨', label: 'Male 1'},
  {id: 'male2', type: 'male', emoji: '🧑', label: 'Male 2'},
  {id: 'female1', type: 'female', emoji: '👩', label: 'Female 1'},
  {id: 'female2', type: 'female', emoji: '👧', label: 'Female 2'},
  {id: 'neutral1', type: 'neutral', emoji: '🧒', label: 'Neutral 1'},
  {id: 'neutral2', type: 'neutral', emoji: '🧑‍🦰', label: 'Neutral 2'},
];

const TrainerRegistrationScreen = ({navigation}) => {
  const [trainerName, setTrainerName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Test Firebase connection on mount
  useEffect(() => {
    testFirebaseConnection();
  }, []);

  const handleCreateTrainer = async () => {
    if (!trainerName.trim()) {
      setError('Please enter your trainer name');
      return;
    }

    if (trainerName.trim().length < 3) {
      setError('Trainer name must be at least 3 characters');
      return;
    }

    if (!selectedAvatar) {
      setError('Please select an avatar');
      return;
    }

    if (!selectedRegion) {
      setError('Please select your home region');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = auth().currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }

      await createTrainerProfile(user.uid, {
        trainerName: trainerName.trim(),
        avatar: selectedAvatar,
        region: selectedRegion,
      });

      navigation.replace('MainTabs');
    } catch (err) {
      setError(err.message || 'Failed to create trainer profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Text style={styles.title}>Welcome Trainer!</Text>
          <Text style={styles.subtitle}>Let's create your Trainer Card</Text>

          {/* Trainer Name Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trainer Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your trainer name"
              placeholderTextColor="#999"
              value={trainerName}
              onChangeText={setTrainerName}
              autoCapitalize="words"
              editable={!loading}
              maxLength={20}
            />
          </View>

          {/* Avatar Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose Your Avatar</Text>
            <View style={styles.avatarGrid}>
              {AVATARS.map(avatar => (
                <TouchableOpacity
                  key={avatar.id}
                  style={[
                    styles.avatarOption,
                    selectedAvatar === avatar.id && styles.avatarSelected,
                  ]}
                  onPress={() => setSelectedAvatar(avatar.id)}
                  disabled={loading}>
                  <Text style={styles.avatarEmoji}>{avatar.emoji}</Text>
                  <Text style={styles.avatarLabel}>{avatar.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Region Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Home Region</Text>
            <View style={styles.regionGrid}>
              {REGIONS.map(region => (
                <TouchableOpacity
                  key={region}
                  style={[
                    styles.regionOption,
                    selectedRegion === region && styles.regionSelected,
                  ]}
                  onPress={() => setSelectedRegion(region)}
                  disabled={loading}>
                  <Text
                    style={[
                      styles.regionText,
                      selectedRegion === region && styles.regionTextSelected,
                    ]}>
                    {region}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleCreateTrainer}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Start Your Journey!</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => navigation.replace('MainTabs')}
            disabled={loading}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f4511e',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  avatarOption: {
    width: '30%',
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 8,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  avatarSelected: {
    borderColor: '#f4511e',
    backgroundColor: '#fff5f2',
  },
  avatarEmoji: {
    fontSize: 40,
    marginBottom: 4,
  },
  avatarLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  regionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  regionOption: {
    width: '48%',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  regionSelected: {
    borderColor: '#f4511e',
    backgroundColor: '#f4511e',
  },
  regionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  regionTextSelected: {
    color: '#fff',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    height: 50,
    backgroundColor: '#f4511e',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipButton: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    color: '#999',
    fontSize: 14,
  },
});

export default TrainerRegistrationScreen;
