import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';

function App() {
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [course, setCourse] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [dob, setDob] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [rating, setRating] = useState(5);
  const [agree, setAgree] = useState(false);

  const submitForm = () => {
    console.log(`
      Name: ${name}
      Email: ${email}
      Course: ${course}
      Gender: ${gender}
      DOB: ${dob.toDateString()}
      Rating: ${rating}
      Terms Accepted: ${agree ? 'Yes' : 'No'}
    `);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>🎓 Student Registration Form</Text>

      {/* Name */}
      <TextInput
        style={styles.input}
        placeholder="Enter Full Name"
        value={name}
        onChangeText={setName} />

      {/* Email */}
      <TextInput
        style={styles.input}
        placeholder="Enter Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail} />

      {/* Dropdown */}
      <Text style={styles.label}>Select Course:</Text>
      <Picker
        selectedValue={course}
        onValueChange={(itemValue) => setCourse(itemValue)}
        style={styles.picker}>
        <Picker.Item label="-- Select Course --" value="" />
        <Picker.Item label="BCA" value="bca" />
        <Picker.Item label="BSc IT" value="bscit" />
        <Picker.Item label="B.Tech" value="btech" />
        <Picker.Item label="MBA" value="mba" />
      </Picker>

      {/* Radio Buttons */}
      <Text style={styles.label}>Gender:</Text>
      <View style={styles.radioContainer}>
        <TouchableOpacity
          style={styles.radioOption}
          onPress={() => setGender('male')}>
          <View style={[styles.radioCircle, gender === 'male' && styles.selected]} />
          <Text>Male</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.radioOption}
          onPress={() => setGender('female')}>
          <View style={[styles.radioCircle, gender === 'female' && styles.selected]} />
          <Text>Female</Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker */}
      <Text style={styles.label}>Date of Birth:</Text>
      <Button title={dob.toDateString()} onPress={() => setShowDate(true)} />
      {showDate && (
        <DateTimePicker
          value={dob}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDate(false);
            if (selectedDate) setDob(selectedDate);
          } } />
      )}

      {/* Slider */}
      <Text style={styles.label}>Rate Your Coding Interest: {rating}</Text>
      <Slider
        style={{ width: '100%', height: 40 }}
        minimumValue={1}
        maximumValue={10}
        step={1}
        value={rating}
        onValueChange={setRating} />

      {/* Checkbox */}
      <View style={styles.checkboxContainer}>
        <Switch value={agree} onValueChange={setAgree} />
        <Text style={{ marginLeft: 8 }}>I agree to the terms & conditions</Text>
      </View>

      {/* Submit Button */}
      <Button title="Submit" onPress={submitForm} />
    </ScrollView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 40,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 10,
    marginVertical: 8,
    borderRadius: 5,
  },
  label: {
    fontSize: 16,
    marginTop: 10,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 5,
    marginBottom: 10,
  },
  radioContainer: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#555',
    marginRight: 5,
  },
  selected: {
    backgroundColor: '#007AFF',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
});

export default App;
