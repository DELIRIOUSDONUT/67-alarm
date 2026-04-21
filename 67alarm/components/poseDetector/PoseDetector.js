import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { mediapipeHTML } from '../../html/mediapipe';

const PoseDetector = forwardRef(function PoseDetector({ onReady, onResult, onError }, ref) {
  const webViewRef = useRef(null);
  const readyRef = useRef(false);

  useImperativeHandle(ref, () => ({
    processFrame(base64) {
      if (!readyRef.current || !webViewRef.current) return;
      webViewRef.current.postMessage(
        JSON.stringify({ type: 'PROCESS_FRAME', base64 })
      );
    },
  }));

  function handleMessage(event) {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      switch (data.type) {
        case 'MODEL_READY':
          readyRef.current = true;
          if (onReady) onReady();
          break;
        case 'MODEL_ERROR':
          if (onError) onError(data.error);
          break;
        case 'POSE_RESULT':
          if (onResult) onResult(data);
          break;
        case 'FRAME_ERROR':
          if (onError) onError(data.error);
          break;
      }
    } catch {}
  }

  return (
    <View style={styles.hidden}>
      <WebView
        ref={webViewRef}
        source={{ html: mediapipeHTML }}
        style={styles.webView}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        onMessage={handleMessage}
      />
    </View>
  );
});

export default PoseDetector;

const styles = StyleSheet.create({
  hidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    overflow: 'hidden',
  },
  webView: {
    width: 1,
    height: 1,
  },
});
