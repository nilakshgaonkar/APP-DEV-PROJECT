import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

/**
 * Test Firebase connection and permissions
 * Call this function to debug Firebase issues
 */
export const testFirebaseConnection = async () => {
  console.log('=== Firebase Connection Test ===');
  
  try {
    // Test 1: Check if user is authenticated
    const user = auth().currentUser;
    if (!user) {
      console.error('❌ No authenticated user found');
      return {
        success: false,
        error: 'No authenticated user',
      };
    }
    console.log('✅ User authenticated:', user.uid);
    console.log('   Email:', user.email);

    // Test 2: Try to read from Firestore
    console.log('\nTesting Firestore read access...');
    try {
      const testDoc = await firestore()
        .collection('trainers')
        .doc(user.uid)
        .get();
      console.log('✅ Firestore read access: OK');
      console.log('   Document exists:', testDoc.exists);
      if (testDoc.exists) {
        console.log('   Data:', testDoc.data());
      }
    } catch (readError) {
      console.error('❌ Firestore read error:', readError.code, readError.message);
    }

    // Test 3: Try to write to Firestore
    console.log('\nTesting Firestore write access...');
    try {
      await firestore()
        .collection('trainers')
        .doc(user.uid)
        .set(
          {
            testField: 'test',
            timestamp: firestore.FieldValue.serverTimestamp(),
          },
          {merge: true},
        );
      console.log('✅ Firestore write access: OK');
    } catch (writeError) {
      console.error('❌ Firestore write error:', writeError.code, writeError.message);
      
      if (writeError.code === 'permission-denied') {
        console.error('\n⚠️  PERMISSION DENIED ERROR');
        console.error('   This means your Firestore security rules are blocking writes.');
        console.error('   Please update your Firestore rules in Firebase Console.');
        console.error('   See FIRESTORE_SETUP_GUIDE.md for instructions.');
      }
      
      return {
        success: false,
        error: writeError.message,
        code: writeError.code,
      };
    }

    console.log('\n✅ All Firebase tests passed!');
    return {
      success: true,
      userId: user.uid,
    };
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Test creating a trainer profile with detailed logging
 */
export const testCreateTrainerProfile = async (trainerData) => {
  console.log('=== Test Create Trainer Profile ===');
  console.log('Trainer data:', trainerData);
  
  try {
    const user = auth().currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }

    console.log('User ID:', user.uid);
    console.log('Creating profile...');

    const profile = {
      ...trainerData,
      badges: [],
      pokemonCaught: 0,
      favoritePokemon: [],
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };

    await firestore().collection('trainers').doc(user.uid).set(profile);
    
    console.log('✅ Profile created successfully!');
    
    // Verify by reading it back
    const doc = await firestore().collection('trainers').doc(user.uid).get();
    console.log('Verified profile data:', doc.data());
    
    return {success: true, data: doc.data()};
  } catch (error) {
    console.error('❌ Error creating profile:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    return {success: false, error: error.message, code: error.code};
  }
};
