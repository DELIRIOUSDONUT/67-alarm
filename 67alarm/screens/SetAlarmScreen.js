import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleAlarm } from '../utils/scheduleAlarm';

export default function SetAlarmScreen({ onBack }) {
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 1);
    return d;
  });

  async function handleSet() {
    await scheduleAlarm(date);
    await AsyncStorage.setItem('nextAlarm', date.toISOString());
    onBack();
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

      <TouchableOpacity style={styles.btn} onPress={handleSet}>
        <Text style={styles.btnText}>Set Alarm ✓</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: '900', color: 'white', marginBottom: 40 },
  picker: { width: 320, marginBottom: 40 },
  btn: { backgroundColor: '#ff3b30', paddingVertical: 16, paddingHorizontal: 40, borderRadius: 50, width: '100%', alignItems: 'center', marginBottom: 16 },
  btnText: { color: 'white', fontSize: 18, fontWeight: '700' },
  backBtn: { padding: 16 },
  backText: { color: '#888', fontSize: 16 },
});