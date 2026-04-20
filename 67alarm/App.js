import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import HomeScreen from './screens/HomeScreen';
import SetAlarmScreen from './screens/SetAlarmScreen';
import AlarmFiringScreen from './screens/AlarmFiringScreen';

export default function App() {
  const [screen, setScreen] = useState('home'); // 'home' | 'setAlarm' | 'firing'

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root}>
        {screen === 'home' && (
          <HomeScreen
            onSetAlarm={() => setScreen('setAlarm')}
            onAlarmFiring={() => setScreen('firing')}
          />
        )}
        {screen === 'setAlarm' && (
          <SetAlarmScreen onBack={() => setScreen('home')} />
        )}
        {screen === 'firing' && (
          <AlarmFiringScreen onDone={() => setScreen('home')} />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
});