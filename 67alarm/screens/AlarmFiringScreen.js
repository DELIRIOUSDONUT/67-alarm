import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, PermissionsAndroid } from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import AlarmCamera from '../components/alarmCamera/AlarmCamera';
import { getSixtySevenCount } from '../utils/storage';

export default function AlarmFiringScreen({ onDone }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [targetReps, setTargetReps] = useState(null);
  const [permissionReady, setPermissionReady] = useState(false);
  const [finished, setFinished] = useState(false);
  const playerRef = useRef(null);

  useEffect(() => {
    (async () => {
      const count = await getSixtySevenCount();
      setTargetReps(count);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      let granted = permission?.granted;
      if (!granted) {
        const res = await requestPermission();
        granted = res?.granted;
      }
      if (Platform.OS === 'android') {
        try {
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA
          );
          granted = granted || result === PermissionsAndroid.RESULTS.GRANTED;
        } catch {}
      }
      if (granted) setPermissionReady(true);
    })();
  }, []);

  useEffect(() => {
    activateKeepAwakeAsync();
    playAlarm();
    return () => {
      deactivateKeepAwake();
      stopAlarm();
    };
  }, []);

  async function playAlarm() {
    await setAudioModeAsync({ playsInSilentMode: true });
    playerRef.current = createAudioPlayer(require('../assets/alarm.wav'));
    playerRef.current.loop = true;
    playerRef.current.play();
  }

  async function stopAlarm() {
    if (playerRef.current) {
      playerRef.current.stop();
      playerRef.current.remove();
      playerRef.current = null;
    }
  }

  async function handleDone() {
    if (finished) return;
    setFinished(true);
    await stopAlarm();
    deactivateKeepAwake();
    onDone();
  }

  if (targetReps === null || !permissionReady) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>
          {!permissionReady ? 'Requesting camera access...' : 'Loading...'}
        </Text>
        {permission && !permission.granted && (
          <Text style={styles.permissionHint} onPress={requestPermission}>
            Tap to grant camera permission
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AlarmCamera targetReps={targetReps} onDone={handleDone} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
  },
  permissionHint: {
    color: '#ff3b30',
    fontSize: 16,
    marginTop: 20,
    textDecorationLine: 'underline',
  },
});
