import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import {launchImageLibrary} from 'react-native-image-picker';
import {
  getUserProfile,
  createOrUpdateProfile,
  uploadProfilePhoto,
  deleteProfilePhoto,
} from '../services/profileService';
import {signOut} from '../services/auth';
import useFavorites from '../hooks/useFavorites';
import {getCachedPokemon} from '../utils/pokemonCache';

const ProfileScreen = ({navigation}) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [editing, setEditing] = useState(false);
  const {favorites, loading: favoritesLoading} = useFavorites();
  const [lastSearch, setLastSearch] = useState(null);
  const [lastSearchLoading, setLastSearchLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const currentUser = auth().currentUser;
      if (currentUser) {
        setUser(currentUser);
        
        // Try to get profile from Firestore
        let userProfile = null;
        try {
          userProfile = await getUserProfile(currentUser.uid);
        } catch (firestoreError) {
          console.warn('Firestore not available, using auth user data:', firestoreError);
        }

        if (userProfile) {
          setProfile(userProfile);
          setDisplayName(userProfile.username || userProfile.displayName || '');
          await loadLastSearch(currentUser.uid);
        } else {
          // Fallback to auth user data if Firestore is not available
          const fallbackProfile = {
            email: currentUser.email,
            displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
            username: null,
            photoURL: currentUser.photoURL || null,
          };
          setProfile(fallbackProfile);
          setDisplayName(fallbackProfile.displayName);
          await loadLastSearch(currentUser.uid);
          
          // Try to create profile in Firestore (but don't fail if it doesn't work)
          try {
            await createOrUpdateProfile(currentUser.uid, fallbackProfile);
          } catch (createError) {
            console.warn('Could not create profile in Firestore:', createError);
            // Continue with fallback profile
          }
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Show basic profile from auth if available
      const currentUser = auth().currentUser;
      if (currentUser) {
        setUser(currentUser);
        const fallbackProfile = {
          email: currentUser.email,
          displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
          username: null,
          photoURL: currentUser.photoURL || null,
        };
        setProfile(fallbackProfile);
        setDisplayName(fallbackProfile.displayName);
        await loadLastSearch(currentUser.uid);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadLastSearch = async (userUid) => {
    try {
      setLastSearchLoading(true);
      if (!userUid) {
        setLastSearch(null);
        return;
      }
      const cached = await getCachedPokemon(userUid);
      if (cached && cached.length > 0) {
        setLastSearch(cached[0]);
      } else {
        setLastSearch(null);
      }
    } catch (error) {
      console.error('Error loading last searched Pokémon:', error);
      setLastSearch(null);
    } finally {
      setLastSearchLoading(false);
    }
  };

  const handleImagePicker = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
    };

    launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        return;
      }

      if (response.errorMessage) {
        Alert.alert('Error', response.errorMessage);
        return;
      }

      if (response.assets && response.assets[0]) {
        try {
          setUploading(true);
          const imageUri = response.assets[0].uri;

          let photoURL = imageUri; // Fallback to local URI
          
          // Try to upload to Firebase Storage
          try {
            photoURL = await uploadProfilePhoto(user.uid, imageUri);
            
            // Delete old photo if exists
            if (profile?.photoURL && profile.photoURL.includes('firebasestorage')) {
              await deleteProfilePhoto(profile.photoURL);
            }
          } catch (storageError) {
            console.warn('Could not upload to Firebase Storage, using local URI:', storageError);
            Alert.alert('Warning', 'Photo saved locally. Firebase Storage may not be configured.');
          }

          // Update profile (try Firestore, but continue with local update if it fails)
          const updatedProfile = {
            ...profile,
            photoURL,
          };
          
          try {
            await createOrUpdateProfile(user.uid, updatedProfile);
          } catch (firestoreError) {
            console.warn('Could not save to Firestore:', firestoreError);
          }
          
          setProfile(updatedProfile);
          Alert.alert('Success', 'Profile photo updated!');
        } catch (error) {
          Alert.alert('Error', error.message);
        } finally {
          setUploading(false);
        }
      }
    });
  };

  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }

    try {
      setSaving(true);
      const updatedProfile = {
        ...profile,
        username: displayName.trim(),
        displayName: displayName.trim(), // Also update displayName for compatibility
      };
      
      // Try to save to Firestore, but don't fail if it doesn't work
      try {
        await createOrUpdateProfile(user.uid, updatedProfile);
      } catch (firestoreError) {
        console.warn('Could not save to Firestore, saving locally:', firestoreError);
      }
      
      setProfile(updatedProfile);
      setEditing(false);
      Alert.alert('Success', 'Profile updated!');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              navigation.reset({
                index: 0,
                routes: [{name: 'Login'}],
              });
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f4511e" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!user || !profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Unable to load profile</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.profileHeader}>
        {/* Profile Photo */}
        <TouchableOpacity
          style={styles.photoContainer}
          onPress={handleImagePicker}
          disabled={uploading}>
          {uploading ? (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator size="large" color="#f4511e" />
            </View>
          ) : (
            <>
              {profile.photoURL ? (
                <Image source={{uri: profile.photoURL}} style={styles.profilePhoto} />
              ) : (
                <View style={styles.placeholderPhoto}>
                  <Text style={styles.placeholderText}>
                    {(profile.username || profile.displayName)?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
              )}
              <View style={styles.cameraIcon}>
                <Text style={styles.cameraIconText}>📷</Text>
              </View>
            </>
          )}
        </TouchableOpacity>

        {/* Username/Display Name */}
        {editing ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.nameInput}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Username"
              placeholderTextColor="#999"
              autoCapitalize="none"
            />
            <View style={styles.editButtons}>
              <TouchableOpacity
                style={[styles.editButton, styles.cancelButton]}
                onPress={() => {
                  setDisplayName(profile.username || profile.displayName || '');
                  setEditing(false);
                }}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editButton, styles.saveButton]}
                onPress={handleSaveProfile}
                disabled={saving}>
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.nameContainer}>
            <Text style={styles.displayName}>
              {profile.username || profile.displayName || 'User'}
            </Text>
            <TouchableOpacity
              style={styles.editNameButton}
              onPress={() => setEditing(true)}>
              <Text style={styles.editNameButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Info summary */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Username</Text>
            <Text style={styles.infoValue}>
              {profile.username || profile.displayName || 'User'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{profile.email || user.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Favorites</Text>
            <Text style={styles.infoValue}>
              {favoritesLoading ? '...' : favorites.length}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last searched Pokémon</Text>
            <Text style={styles.infoValue}>
              {lastSearchLoading
                ? '...'
                : lastSearch?.name
                ? lastSearch.name
                : 'None yet'}
            </Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleSignOut}>
          <Text style={styles.actionButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#f4511e',
  },
  placeholderPhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f4511e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#f4511e',
  },
  placeholderText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#f4511e',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  cameraIconText: {
    fontSize: 20,
  },
  uploadingContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  editNameButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
  },
  editNameButtonText: {
    color: '#f4511e',
    fontSize: 12,
    fontWeight: '600',
  },
  infoCard: {
    width: '100%',
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textTransform: 'capitalize',
  },
  editContainer: {
    width: '100%',
    marginBottom: 10,
  },
  nameInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 18,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#f4511e',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  actionsContainer: {
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: '#d32f2f',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ProfileScreen;

