import React, { useRef, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { mediapipeHTML } from '../../html/mediapipe';
import RepOverlay from '../repOverlay/RepOverlay';
import MotionTracker from '../../utils/motionTracker';

export default function AlarmCamera({ targetReps, onDone }) {
  const webviewRef  = useRef(null);
  const trackerRef  = useRef(new MotionTracker());
  const doneRef     = useRef(false);

  const [reps,       setReps]       = useState(0);
  const [phase,      setPhase]      = useState('neutral');
  const [status,     setStatus]     = useState('loading');

  const handleMessage = useCallback((event) => {
    if (doneRef.current) return;
    let data;
    try { data = JSON.parse(event.nativeEvent.data); } catch { return; }

    switch (data.type) {
      case 'MODEL_READY':
        setStatus('tracking');
        break;

      case 'MODEL_ERROR':
        setStatus('error');
        break;

      case 'POSE_RESULT': {
        if (!data.detected) { setStatus('no_pose'); return; }

        const result = trackerRef.current.process(data.landmarks, Date.now());
        setStatus(result.status);
        setPhase(result.phase);
        setReps(result.reps);

        if (result.reps >= targetReps) {
          doneRef.current = true;
          setStatus('done');
          onDone?.();
        }
        break;
      }
    }
  }, [targetReps, onDone]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        source={{ html: mediapipeHTML, baseUrl: 'https://localhost' }}
        style={styles.webview}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        onPermissionRequest={req => req.grant(req.resources)}
        onMessage={handleMessage}
      />
      <RepOverlay
        reps={reps}
        targetReps={targetReps}
        status={status}
        phase={phase}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  webview:   { flex: 1 },
});