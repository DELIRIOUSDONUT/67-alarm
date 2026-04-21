import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function NumberStepper({ value, onChange, min = 1, max = 100, step = 1 }) {
  function decrement() {
    const next = value - step;
    if (next >= min) onChange(next);
  }

  function increment() {
    const next = value + step;
    if (next <= max) onChange(next);
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, value <= min && styles.buttonDisabled]}
        onPress={decrement}
        disabled={value <= min}
      >
        <Text style={styles.buttonText}>−</Text>
      </TouchableOpacity>

      <View style={styles.valueContainer}>
        <Text style={styles.value}>{value}</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, value >= max && styles.buttonDisabled]}
        onPress={increment}
        disabled={value >= max}
      >
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#333',
  },
  buttonText: {
    color: 'white',
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 36,
  },
  valueContainer: {
    minWidth: 100,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  value: {
    color: 'white',
    fontSize: 72,
    fontWeight: '900',
  },
});
