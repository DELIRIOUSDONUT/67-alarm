import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NumberStepper from '../components/numberStepper/NumberStepper';
import ActionButton from '../components/actionButton/ActionButton';
import { getSixtySevenCount, saveSixtySevenCount } from '../utils/storage';

export default function SetSixtySevenScreen({ onDone, onBack }) {
  const [count, setCount] = useState(10);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await getSixtySevenCount();
      setCount(stored);
      setLoaded(true);
    })();
  }, []);

  async function handleConfirm() {
    await saveSixtySevenCount(count);
    onDone();
  }

  if (!loaded) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How many 67s?</Text>
      <Text style={styles.subtitle}>
        Set how many 67 motions you need to{'\n'}complete to dismiss the alarm
      </Text>

      <NumberStepper value={count} onChange={setCount} min={1} max={50} />

      <Text style={styles.hint}>
        {count === 1 ? '1 rep' : `${count} reps`} to wake up
      </Text>

      <View style={styles.buttons}>
        <ActionButton title="Confirm" onPress={handleConfirm} />
        <ActionButton title="Back" onPress={onBack} variant="secondary" />
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
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  hint: {
    fontSize: 16,
    color: '#ff3b30',
    fontWeight: '600',
    marginBottom: 40,
  },
  buttons: {
    width: '100%',
  },
});
