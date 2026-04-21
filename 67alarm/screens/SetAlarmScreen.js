import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import ActionButton from '../components/actionButton/ActionButton';
import { scheduleAlarm } from '../utils/scheduleAlarm';
import { saveAlarmTime } from '../utils/storage';

export default function SetAlarmScreen({ onNext, onBack }) {
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 1);
    return d;
  });

  async function handleNext() {
    await scheduleAlarm(date);
    await saveAlarmTime(date);
    onNext();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set Alarm</Text>

      <DateTimePicker
        value={date}
        mode="time"
        is24Hour={false}
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        onChange={(_, selected) => { if (selected) setDate(selected); }}
        style={styles.picker}
        themeVariant="dark"
      />

      <ActionButton title="Next →" onPress={handleNext} />
      <ActionButton title="Cancel" onPress={onBack} variant="secondary" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: 'white',
    marginBottom: 40,
  },
  picker: {
    width: 320,
    marginBottom: 40,
  },
});
