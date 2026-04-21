import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { CameraView } from 'expo-camera';
import PoseDetector from '../poseDetector/PoseDetector';
import RepOverlay from '../repOverlay/RepOverlay';
import MotionTracker from '../../utils/motionTracker';

const CAPTURE_INTERVAL_MS = 500;

export default function AlarmCamera({ targetReps, onDone }) {
  const cameraRef = useRef(null);
  const poseRef = useRef(null);
  const trackerRef = useRef(new MotionTracker());
  const capturingRef = useRef(false);
  const intervalRef = useRef(null);
  const doneRef = useRef(false);

  const [modelReady, setModelReady] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [reps, setReps] = useState(0);
  const [status, setStatus] = useState('loading');
  const [landmarks, setLandmarks] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  const captureAndProcess = useCallback(async () => {
    if (capturingRef.current || !cameraRef.current || doneRef.current) return;
    capturingRef.current = true;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.1,
        skipProcessing: true,
        imageType: 'jpg',
      });
      if (photo?.base64) {
        poseRef.current?.processFrame(photo.base64);
      }
    } catch {}

    capturingRef.current = false;
  }, []);

  useEffect(() => {
    if (!modelReady || !cameraReady) return;

    intervalRef.current = setInterval(captureAndProcess, CAPTURE_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [modelReady, cameraReady, captureAndProcess]);

  function handlePoseResult(data) {
    if (doneRef.current) return;

    if (!data.detected) {
      setStatus('no_pose');
      setLandmarks(null);
      setDebugInfo(null);
      return;
    }

    setLandmarks(data.landmarks);

    const result = trackerRef.current.process(data.landmarks, Date.now());
    setStatus(result.status);
    setReps(result.reps);
    setDebugInfo({
      phase: result.phase,
      leftY: result.leftY,
      rightY: result.rightY,
      leftVel: result.leftVelocity,
      rightVel: result.rightVelocity,
    });

    if (result.reps >= targetReps && !doneRef.current) {
      doneRef.current = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
      setStatus('done');
      if (onDone) onDone();
    }
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="front"
        flash="off"
        onCameraReady={() => setCameraReady(true)}
      />

      <PoseDetector
        ref={poseRef}
        onReady={() => setModelReady(true)}
        onResult={handlePoseResult}
      />

      <RepOverlay
        reps={reps}
        targetReps={targetReps}
        status={status}
        landmarks={landmarks}
        debugInfo={debugInfo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
});
