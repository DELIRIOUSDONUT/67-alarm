const DEFAULTS = {
  diffThreshold: 0.08,
  smoothingFactor: 0.6,
  minRepIntervalMs: 400,
  minVisibility: 0.3,
  debug: true,
};

export default class MotionTracker {
  constructor(options = {}) {
    this.cfg = { ...DEFAULTS, ...options };
    this.reset();
  }

  reset() {
    this.reps = 0;
    // phases: 'neutral' | 'leftUp' | 'leftDown' | 'rightUp' | 'rightDown'
    this.phase = 'neutral';
    this.lastRepTime = 0;
    this.leftYSmoothed = null;
    this.rightYSmoothed = null;
  }

  process(landmarks, timestamp = Date.now()) {
    const vis = (lm) => lm.visibility ?? lm.v ?? 1;
    const { leftShoulder, rightShoulder, leftWrist, rightWrist } = landmarks;

    if (
      vis(leftWrist)     < this.cfg.minVisibility ||
      vis(rightWrist)    < this.cfg.minVisibility ||
      vis(leftShoulder)  < this.cfg.minVisibility ||
      vis(rightShoulder) < this.cfg.minVisibility
    ) {
      return { status: 'low_visibility', reps: this.reps, phase: this.phase };
    }

    const leftYRel  = leftWrist.y  - leftShoulder.y;
    const rightYRel = rightWrist.y - rightShoulder.y;

    if (this.leftYSmoothed === null) {
      this.leftYSmoothed  = leftYRel;
      this.rightYSmoothed = rightYRel;
      return { status: 'initializing', reps: this.reps, phase: this.phase };
    }

    const a = this.cfg.smoothingFactor;
    this.leftYSmoothed  = a * leftYRel  + (1 - a) * this.leftYSmoothed;
    this.rightYSmoothed = a * rightYRel + (1 - a) * this.rightYSmoothed;

    const thr = this.cfg.diffThreshold;
    // Negative rel = wrist is ABOVE shoulder
    const leftIsUp   = this.leftYSmoothed  < -thr;
    const leftIsDown = this.leftYSmoothed  >  thr;
    const rightIsUp  = this.rightYSmoothed < -thr;
    const rightIsDown = this.rightYSmoothed >  thr;

    const now = timestamp;
    const canCount = now - this.lastRepTime > this.cfg.minRepIntervalMs;

    switch (this.phase) {
      case 'neutral':
        // Accept whichever arm goes up first
        if (leftIsUp && canCount) {
          this.reps++;
          this.lastRepTime = now;
          this.phase = 'leftUp';
        } else if (rightIsUp && canCount) {
          this.reps++;
          this.lastRepTime = now;
          this.phase = 'rightUp';
        }
        break;

      case 'leftUp':
        // Wait for left to come down
        if (leftIsDown) this.phase = 'leftDown';
        break;

      case 'leftDown':
        // Now right must go up
        if (rightIsUp && canCount) {
          this.reps++;
          this.lastRepTime = now;
          this.phase = 'rightUp';
        }
        break;

      case 'rightUp':
        // Wait for right to come down
        if (rightIsDown) this.phase = 'rightDown';
        break;

      case 'rightDown':
        // Now left must go up
        if (leftIsUp && canCount) {
          this.reps++;
          this.lastRepTime = now;
          this.phase = 'leftUp';
        }
        break;
    }

    if (this.cfg.debug) {
      console.log(
        `[67] L=${this.leftYSmoothed.toFixed(3)} R=${this.rightYSmoothed.toFixed(3)} | phase=${this.phase} | reps=${this.reps}`
      );
    }

    return {
      status: 'tracking',
      reps: this.reps,
      phase: this.phase,
      leftY: this.leftYSmoothed,
      rightY: this.rightYSmoothed,
    };
  }
}