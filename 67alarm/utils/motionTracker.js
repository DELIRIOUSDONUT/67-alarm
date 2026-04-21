const DEFAULTS = {
  handDiffThreshold: 0.03,
  smoothingFactor: 0.7,
  minRepIntervalMs: 350,
  minVisibility: 0.35,
};

export default class MotionTracker {
  constructor(options = {}) {
    this.cfg = { ...DEFAULTS, ...options };
    this.reset();
  }

  reset() {
    this.reps = 0;
    this.phase = 'neutral';
    this.lastRepTime = 0;
    this.leftYSmoothed = null;
    this.rightYSmoothed = null;
    this.prevLeftY = null;
    this.prevRightY = null;
    this.prevTimestamp = null;
  }

  process(landmarks, timestamp = Date.now()) {
    const { leftShoulder, rightShoulder, leftWrist, rightWrist } = landmarks;

    if (leftWrist.v < this.cfg.minVisibility || rightWrist.v < this.cfg.minVisibility ||
        leftShoulder.v < this.cfg.minVisibility || rightShoulder.v < this.cfg.minVisibility) {
      return { status: 'low_visibility', reps: this.reps, phase: this.phase };
    }

    const leftYRel = leftWrist.y - leftShoulder.y;
    const rightYRel = rightWrist.y - rightShoulder.y;

    if (this.leftYSmoothed === null) {
      this.leftYSmoothed = leftYRel;
      this.rightYSmoothed = rightYRel;
      this.prevLeftY = leftYRel;
      this.prevRightY = rightYRel;
      this.prevTimestamp = timestamp;
      return { status: 'initializing', reps: this.reps, phase: this.phase };
    }

    const alpha = this.cfg.smoothingFactor;
    this.leftYSmoothed = alpha * leftYRel + (1 - alpha) * this.leftYSmoothed;
    this.rightYSmoothed = alpha * rightYRel + (1 - alpha) * this.rightYSmoothed;

    const dt = Math.max(timestamp - this.prevTimestamp, 1) / 1000;
    const leftVelocity = (this.leftYSmoothed - this.prevLeftY) / dt;
    const rightVelocity = (this.rightYSmoothed - this.prevRightY) / dt;

    this.prevLeftY = this.leftYSmoothed;
    this.prevRightY = this.rightYSmoothed;
    this.prevTimestamp = timestamp;

    const diff = this.leftYSmoothed - this.rightYSmoothed;
    const thr = this.cfg.handDiffThreshold;
    const leftHigher = diff < -thr;
    const rightHigher = diff > thr;

    if (leftHigher && this.phase !== 'leftUp') {
      this.phase = 'leftUp';
    } else if (rightHigher && this.phase === 'leftUp') {
      if (timestamp - this.lastRepTime > this.cfg.minRepIntervalMs) {
        this.reps++;
        this.lastRepTime = timestamp;
        this.phase = 'rightUp';
      }
    }

    return {
      status: 'tracking',
      reps: this.reps,
      phase: this.phase,
      leftY: this.leftYSmoothed,
      rightY: this.rightYSmoothed,
      leftVelocity,
      rightVelocity,
    };
  }
}
