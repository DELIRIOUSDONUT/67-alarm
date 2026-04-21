import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ActionButton from '../components/actionButton/ActionButton';
import { getAlarmTime, getSixtySevenCount } from '../utils/storage';

export default function HomeScreen({ onSetAlarm, onConfigure, onAlarmFiring }) {
  const [nextAlarm, setNextAlarm] = useState(null);
  const [sixtySevenCount, setSixtySevenCount] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const storedTime = await getAlarmTime();
    const storedCount = await getSixtySevenCount();
    if (storedTime) setNextAlarm(storedTime);
    setSixtySevenCount(storedCount);
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
          <Text style={styles.repsInfo}>
            {sixtySevenCount} × 67s to dismiss
          </Text>
        </View>
      ) : (
        <Text style={styles.noAlarm}>No alarm set</Text>
      )}

      <ActionButton
        title={timeStr ? 'Set New Alarm' : 'Set Alarm'}
        onPress={onSetAlarm}
      />

      {timeStr && (
        <ActionButton
          title="Configure"
          onPress={onConfigure}
          variant="secondary"
        />
      )}

      <ActionButton
        title="Test Alarm Now"
        onPress={onAlarmFiring}
        variant="secondary"
      />
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
    fontSize: 36,
    fontWeight: '900',
    color: 'white',
    marginBottom: 48,
    letterSpacing: 2,
  },
  alarmBox: {
    alignItems: 'center',
    marginBottom: 40,
  },
  alarmLabel: {
    color: '#888',
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  alarmTime: {
    color: 'white',
    fontSize: 64,
    fontWeight: '800',
  },
  repsInfo: {
    color: '#ff3b30',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  noAlarm: {
    color: '#555',
    fontSize: 18,
    marginBottom: 40,
  },
});
