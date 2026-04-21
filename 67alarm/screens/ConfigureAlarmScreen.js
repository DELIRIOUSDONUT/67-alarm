import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import NumberStepper from '../components/numberStepper/NumberStepper';
import ActionButton from '../components/actionButton/ActionButton';
import { getAlarmTime, saveAlarmTime, getSixtySevenCount, saveSixtySevenCount } from '../utils/storage';
import { scheduleAlarm } from '../utils/scheduleAlarm';

export default function ConfigureAlarmScreen({ onBack }) {
  const [date, setDate] = useState(new Date());
  const [count, setCount] = useState(10);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const storedTime = await getAlarmTime();
      const storedCount = await getSixtySevenCount();
      if (storedTime) setDate(storedTime);
      setCount(storedCount);
      setLoaded(true);
    })();
  }, []);

  async function handleSave() {
    await scheduleAlarm(date);
    await saveAlarmTime(date);
    await saveSixtySevenCount(count);
    onBack();
  }

  if (!loaded) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configure Alarm</Text>

      <Text style={styles.sectionLabel}>Alarm Time</Text>
      <DateTimePicker
        value={date}
        mode="time"
        is24Hour={false}
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        onChange={(_, selected) => { if (selected) setDate(selected); }}
        style={styles.picker}
        themeVariant="dark"
      />

      <Text style={styles.sectionLabel}>67s Required</Text>
      <NumberStepper value={count} onChange={setCount} min={1} max={50} />
      <Text style={styles.hint}>
        {count === 1 ? '1 rep' : `${count} reps`} to dismiss
      </Text>

      <View style={styles.buttons}>
        <ActionButton title="Save Changes" onPress={handleSave} />
        <ActionButton title="Cancel" onPress={onBack} variant="secondary" />
      </View>
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
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 14,
    color: '#888',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  picker: {
    width: 320,
    marginBottom: 32,
  },
  hint: {
    fontSize: 16,
    color: '#ff3b30',
    fontWeight: '600',
    marginBottom: 32,
  },
  buttons: {
    width: '100%',
  },
});
