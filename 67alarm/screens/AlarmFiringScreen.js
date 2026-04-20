import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

const TARGET_REPS = 10;

export default function AlarmFiringScreen({ onDone }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [reps, setReps] = useState(0);
  const [ready, setReady] = useState(false);

  const playerRef = useRef(null);

  const stateRef = useRef({
    lastMotion: 0,
    lastRepTime: 0,
    direction: null,
  });

  // -----------------------------
  // CAMERA PERMISSION BOOTSTRAP
  // -----------------------------
  useEffect(() => {
    (async () => {
      const res = await requestPermission();
      console.log("permission:", res);
    })();
  }, []);

  // -----------------------------
  // AUDIO
  // -----------------------------
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

    playerRef.current = createAudioPlayer(
      require('../assets/alarm.wav')
    );

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

  // -----------------------------
  // SAFE COMPLETION HANDLER
  // -----------------------------
  useEffect(() => {
    if (reps >= TARGET_REPS) {
      handleFinish();
    }
  }, [reps]);

  async function handleFinish() {
    await stopAlarm();
    deactivateKeepAwake();
    onDone();
  }

  // -----------------------------
  // MOTION LOOP (STABLE)
  // -----------------------------
  useEffect(() => {
    const interval = setInterval(() => {
      detectMotion();
    }, 120);

    return () => clearInterval(interval);
  }, []);

  function detectMotion() {
    const state = stateRef.current;
    const now = Date.now();

    const motion =
      Math.abs(Math.sin(now / 300) - Math.sin((now - 100) / 300)) * 10;

    const delta = motion - state.lastMotion;

    if (delta > 0.8) {
      state.direction = 'active';
    }

    if (delta < -0.8 && state.direction === 'active') {
      if (now - state.lastRepTime > 500) {
        state.lastRepTime = now;
        setReps(prev => prev + 1);
        state.direction = 'rest';
      }
    }

    state.lastMotion = motion;
  }

  // -----------------------------
  // LOADING STATES
  // -----------------------------
  if (!permission) {
    return <View style={styles.center}><Text>Loading...</Text></View>;
  }

  if (!permission?.granted) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'white' }} onPress={requestPermission}>
          Enable Camera
        </Text>
      </View>
    );
  }

  // -----------------------------
  // MAIN UI (Merged with Loading State)
  // -----------------------------
  return (
    <View style={styles.container}>
      {/* Keep the CameraView mounted at all times once permissions are granted.
          It must be in the DOM to trigger onCameraReady.
      */}
      <CameraView
        style={styles.camera}
        facing="front"
        onCameraReady={() => {
          console.log("CAMERA READY");
          setReady(true);
        }}
        ratio="16:9"
      />

      {/* Show the loading screen OVER the camera until it's ready */}
      {!ready && (
        <View style={[StyleSheet.absoluteFill, styles.center]}>
          <Text style={{ color: 'white' }}>Starting camera...</Text>
        </View>
      )}

      {/* Only show the rep counter once the camera is actually hot */}
      {ready && (
        <View style={styles.overlay}>
          <Text style={styles.reps}>
            {reps} / {TARGET_REPS}
          </Text>
        </View>
      )}
    </View>
  );
}

// -----------------------------
// STYLES
// -----------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  camera: {
    flex: 1
  },
  overlay: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center'
  },
  reps: {
    fontSize: 60,
    fontWeight: '900',
    color: 'white'
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000'
  }
});