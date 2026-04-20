import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ onSetAlarm, onAlarmFiring }) {
  const [nextAlarm, setNextAlarm] = useState(null);

  useEffect(() => {
    loadAlarm();
  }, []);

  async function loadAlarm() {
    const stored = await AsyncStorage.getItem('nextAlarm');
    if (stored) setNextAlarm(new Date(stored));
  }

  const timeStr = nextAlarm
    ? nextAlarm.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>67 Alarm</Text>

      {timeStr ? (
        <View style={styles.alarmBox}>
          <Text style={styles.alarmLabel}>Next alarm</Text>
          <Text style={styles.alarmTime}>{timeStr}</Text>
        </View>
      ) : (
        <Text style={styles.noAlarm}>No alarm set</Text>
      )}

      <TouchableOpacity style={styles.btn} onPress={onSetAlarm}>
        <Text style={styles.btnText}>{timeStr ? 'Change Alarm' : 'Set Alarm'}</Text>
      </TouchableOpacity>

      {/* Dev button to test alarm screen without waiting */}
      <TouchableOpacity style={[styles.btn, styles.testBtn]} onPress={onAlarmFiring}>
        <Text style={styles.btnText}>🧪 Test Alarm Now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 36, fontWeight: '900', color: 'white', marginBottom: 48, letterSpacing: 2 },
  alarmBox: { alignItems: 'center', marginBottom: 40 },
  alarmLabel: { color: '#888', fontSize: 14, letterSpacing: 1, textTransform: 'uppercase' },
  alarmTime: { color: 'white', fontSize: 64, fontWeight: '800' },
  noAlarm: { color: '#555', fontSize: 18, marginBottom: 40 },
  btn: { backgroundColor: '#ff3b30', paddingVertical: 16, paddingHorizontal: 40, borderRadius: 50, marginBottom: 16, width: '100%', alignItems: 'center' },
  testBtn: { backgroundColor: '#333' },
  btnText: { color: 'white', fontSize: 18, fontWeight: '700' },
});