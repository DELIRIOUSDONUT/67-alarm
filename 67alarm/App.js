import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import HomeScreen from './screens/HomeScreen';
import SetAlarmScreen from './screens/SetAlarmScreen';
import SetSixtySevenScreen from './screens/SetSixtySevenScreen';
import ConfigureAlarmScreen from './screens/ConfigureAlarmScreen';
import AlarmFiringScreen from './screens/AlarmFiringScreen';

export default function App() {
  const [screen, setScreen] = useState('home');
  const notifReceivedRef = useRef(null);
  const notifResponseRef = useRef(null);

  useEffect(() => {
    notifReceivedRef.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        const data = notification.request.content.data;
        if (data?.type === 'alarm') {
          setScreen('firing');
        }
      }
    );

    notifResponseRef.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        if (data?.type === 'alarm') {
          setScreen('firing');
        }
      }
    );

    return () => {
      notifReceivedRef.current?.remove();
      notifResponseRef.current?.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root}>
        {screen === 'home' && (
          <HomeScreen
            onSetAlarm={() => setScreen('setAlarm')}
            onConfigure={() => setScreen('configure')}
            onAlarmFiring={() => setScreen('firing')}
          />
        )}
        {screen === 'setAlarm' && (
          <SetAlarmScreen
            onNext={() => setScreen('setSixtySeven')}
            onBack={() => setScreen('home')}
          />
        )}
        {screen === 'setSixtySeven' && (
          <SetSixtySevenScreen
            onDone={() => setScreen('home')}
            onBack={() => setScreen('setAlarm')}
          />
        )}
        {screen === 'configure' && (
          <ConfigureAlarmScreen onBack={() => setScreen('home')} />
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
