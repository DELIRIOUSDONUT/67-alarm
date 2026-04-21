import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function LandmarkDot({ x, y, color, label }) {
  return (
    <View style={[styles.dot, {
      backgroundColor: color,
      left: `${(1 - x) * 100}%`,
      top: `${y * 100}%`,
    }]}>
      <Text style={styles.dotLabel}>{label}</Text>
    </View>
  );
}

export default function RepOverlay({ reps, targetReps, status, landmarks, debugInfo }) {
  const statusMessages = {
    loading: 'Loading pose model...',
    initializing: 'Getting ready...',
    low_visibility: 'Step back so arms are visible',
    tracking: 'Do your 67s!',
    no_pose: 'No person detected',
    done: 'Done!',
  };

  const displayStatus = statusMessages[status] || status || '';

  const fmt = (n) => n != null ? n.toFixed(3) : '—';

  return (
    <View style={styles.container} pointerEvents="none">
      {landmarks && (
        <>
          <LandmarkDot x={landmarks.leftShoulder.x} y={landmarks.leftShoulder.y} color="#ffff00" label="LS" />
          <LandmarkDot x={landmarks.rightShoulder.x} y={landmarks.rightShoulder.y} color="#ffff00" label="RS" />
          <LandmarkDot x={landmarks.leftWrist.x} y={landmarks.leftWrist.y} color="#ff3333" label="LW" />
          <LandmarkDot x={landmarks.rightWrist.x} y={landmarks.rightWrist.y} color="#3399ff" label="RW" />
        </>
      )}

      <Text style={styles.reps}>
        {reps} / {targetReps}
      </Text>

      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>{displayStatus}</Text>
      </View>

      {debugInfo && (
        <View style={styles.debugBox}>
          <Text style={styles.debugText}>phase: {debugInfo.phase}</Text>
          <Text style={[styles.debugText, { color: '#ff3333' }]}>
            L wrist Y: {fmt(debugInfo.leftY)} vel: {fmt(debugInfo.leftVel)}
          </Text>
          <Text style={[styles.debugText, { color: '#3399ff' }]}>
            R wrist Y: {fmt(debugInfo.rightY)} vel: {fmt(debugInfo.rightVel)}
          </Text>
          <Text style={styles.debugText}>
            {(() => {
              const diff = debugInfo.leftY - debugInfo.rightY;
              const lh = diff < -0.03;
              const rh = diff > 0.03;
              return `L${lh ? '↑' : '↓'} R${rh ? '↑' : '↓'} diff:${diff != null ? diff.toFixed(3) : '—'}`;
            })()}
          </Text>
        </View>
      )}

      <View style={[styles.indicator, {
        backgroundColor: status === 'tracking' ? '#0f0' : status === 'low_visibility' ? '#ff0' : '#f00'
      }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  reps: {
    fontSize: 72,
    fontWeight: '900',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    letterSpacing: 2,
  },
  statusBadge: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  statusText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 18,
    textAlign: 'center',
  },
  debugBox: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 10,
    alignSelf: 'stretch',
  },
  debugText: {
    color: 'white',
    fontSize: 13,
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  dot: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: -10,
    marginTop: -10,
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  dotLabel: {
    color: 'white',
    fontSize: 8,
    fontWeight: '900',
  },
  indicator: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 16,
    height: 16,
    borderRadius: 8,
  },
});
