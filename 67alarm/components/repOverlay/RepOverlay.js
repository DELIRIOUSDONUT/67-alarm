import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';

const PHASE_INSTRUCTIONS = {
  neutral:   { next: 'left',  action: 'up',   text: 'Raise your LEFT arm' },
  leftUp:    { next: 'left',  action: 'down',  text: 'Lower your LEFT arm' },
  leftDown:  { next: 'right', action: 'up',   text: 'Raise your RIGHT arm' },
  rightUp:   { next: 'right', action: 'down', text: 'Lower your RIGHT arm' },
  rightDown: { next: 'left',  action: 'up',   text: 'Raise your LEFT arm' },
};

export default function RepOverlay({ reps, targetReps, status, phase }) {
  const flashAnim    = useRef(new Animated.Value(0)).current;
  const scaleAnim    = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const prevReps     = useRef(0);

  useEffect(() => {
    if (reps > prevReps.current) {
      prevReps.current = reps;

      Animated.sequence([
        Animated.timing(flashAnim, { toValue: 1, duration: 60,  useNativeDriver: false }),
        Animated.timing(flashAnim, { toValue: 0, duration: 300, useNativeDriver: false }),
      ]).start();

      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.7, duration: 80, useNativeDriver: false }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: false, friction: 4 }),
      ]).start();
    }

    Animated.timing(progressAnim, {
      toValue: Math.min(reps / targetReps, 1),
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [reps]);

  const isDone = reps >= targetReps;
  const instruction = PHASE_INSTRUCTIONS[phase] ?? PHASE_INSTRUCTIONS.neutral;

  const statusText = {
    loading:        'Loading model...',
    no_pose:        'Step back — can\'t see you',
    low_visibility: 'More light needed',
    initializing:   'Initializing...',
    tracking:       isDone ? 'Done!' : instruction.text,
    done:           'Done!',
  }[status] ?? '...';

  const progressColor = progressAnim.interpolate({
    inputRange:  [0, 0.5, 1],
    outputRange: ['#ff3b30', '#ffcc00', '#00ff88'],
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">

      {/* Flash on rep */}
      <Animated.View
        style={[StyleSheet.absoluteFill, {
          backgroundColor: '#00ff88',
          opacity: flashAnim,
          zIndex: 20,
        }]}
      />

      {/* Arm indicators */}
      {!isDone && status === 'tracking' && (
        <View style={styles.armsRow}>
          <ArmIndicator
            label="LEFT"
            side="left"
            phase={phase}
          />
          <ArmIndicator
            label="RIGHT"
            side="right"
            phase={phase}
          />
        </View>
      )}

      {/* Instruction pill */}
      <View style={styles.instructionPill}>
        <Text style={styles.instructionText}>{statusText}</Text>
      </View>

      {/* Rep counter */}
      <View style={styles.center}>
        <Animated.Text style={[
          styles.repNumber,
          { transform: [{ scale: scaleAnim }], color: isDone ? '#00ff88' : 'white' },
        ]}>
          {reps}
        </Animated.Text>
        <Text style={styles.repTarget}>/ {targetReps}</Text>
        {isDone && <Text style={styles.doneLabel}>DONE 🔥</Text>}
      </View>

      {/* Progress bar */}
      <View style={styles.progressBg}>
        <Animated.View style={[
          styles.progressFill,
          {
            width: progressAnim.interpolate({ inputRange: [0,1], outputRange: ['0%','100%'] }),
            backgroundColor: progressColor,
          },
        ]} />
      </View>

    </View>
  );
}

// Per-arm indicator — shows current state and what's expected
function ArmIndicator({ label, side, phase }) {
  const isActive   = phase === `${side}Up`;    // arm is currently raised
  const isExpected = (                          // this arm is what we're waiting for
    (side === 'left'  && (phase === 'neutral' || phase === 'rightDown')) ||
    (side === 'right' && phase === 'leftDown')
  );
  const needsDown  = (                          // arm is up and needs to come down
    (side === 'left'  && phase === 'leftUp') ||
    (side === 'right' && phase === 'rightUp')
  );

  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(glowAnim, {
      toValue: isActive ? 1 : isExpected ? 0.6 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [isActive, isExpected]);

  // Pulse animation when this arm is expected next
  useEffect(() => {
    if (isExpected) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 400, useNativeDriver: false }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 400, useNativeDriver: false }),
        ])
      );
      pulse.start();
      return () => {
        pulse.stop();
        // Reset via animation instead of setValue
        Animated.timing(pulseAnim, { toValue: 1, duration: 150, useNativeDriver: false }).start();
      };
    }
  }, [isExpected]);

  const borderColor = glowAnim.interpolate({
    inputRange:  [0, 0.6, 1],
    outputRange: ['rgba(255,255,255,0.15)', '#ffcc00', '#00ff88'],
  });
  const bgColor = glowAnim.interpolate({
    inputRange:  [0, 0.6, 1],
    outputRange: ['rgba(0,0,0,0.4)', 'rgba(255,204,0,0.15)', 'rgba(0,255,136,0.2)'],
  });
  const textColor = glowAnim.interpolate({
    inputRange:  [0, 0.6, 1],
    outputRange: ['rgba(255,255,255,0.3)', '#ffcc00', '#00ff88'],
  });

  // Arrow points up when expected/active, down when needs to lower
  const arrowSymbol = needsDown ? '↓' : '↑';
  const arrowColor  = needsDown ? '#ff3b30' : textColor;

  return (
    <Animated.View style={[
      styles.armBox,
      { borderColor, backgroundColor: bgColor, transform: [{ scale: pulseAnim }] }
    ]}>
      <Animated.Text style={[styles.armArrow, { color: arrowColor }]}>
        {arrowSymbol}
      </Animated.Text>
      <Animated.Text style={[styles.armLabel, { color: textColor }]}>
        {label}
      </Animated.Text>
      {isExpected && !isActive && (
        <Text style={styles.nextTag}>NEXT</Text>
      )}
      {isActive && (
        <Text style={styles.upTag}>UP ✓</Text>
      )}
      {needsDown && (
        <Text style={styles.downTag}>LOWER</Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  armsRow: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 32,
  },
  armBox: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 18,
    borderWidth: 2,
    minWidth: 100,
  },
  armArrow: {
    fontSize: 30,
    fontWeight: '900',
  },
  armLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  nextTag: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '800',
    color: '#ffcc00',
    letterSpacing: 1.5,
  },
  upTag: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '800',
    color: '#00ff88',
    letterSpacing: 1,
  },
  downTag: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '800',
    color: '#ff3b30',
    letterSpacing: 1,
  },
  instructionPill: {
    position: 'absolute',
    top: 210,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 22,
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  center: {
    position: 'absolute',
    top: 0, bottom: 80,
    left: 0, right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  repNumber: {
    fontSize: 96,
    fontWeight: '900',
    lineHeight: 104,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  repTarget: {
    fontSize: 22,
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '600',
    marginTop: -4,
  },
  doneLabel: {
    marginTop: 12,
    fontSize: 30,
    fontWeight: '900',
    color: '#00ff88',
    letterSpacing: 3,
  },
  progressBg: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 7,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  progressFill: {
    height: 7,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
});