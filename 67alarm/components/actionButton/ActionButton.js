import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function ActionButton({ title, onPress, variant = 'primary', style }) {
  const btnStyle = variant === 'secondary' ? styles.secondary : styles.primary;
  const textStyle = variant === 'secondary' ? styles.secondaryText : styles.primaryText;

  return (
    <TouchableOpacity style={[styles.base, btnStyle, style]} onPress={onPress}>
      <Text style={[styles.baseText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 50,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  baseText: {
    fontSize: 18,
    fontWeight: '700',
  },
  primary: {
    backgroundColor: '#ff3b30',
  },
  primaryText: {
    color: 'white',
  },
  secondary: {
    backgroundColor: '#333',
  },
  secondaryText: {
    color: 'white',
  },
});
