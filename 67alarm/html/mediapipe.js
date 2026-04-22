export const mediapipeHTML = `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #000; overflow: hidden; width: 100vw; height: 100vh; }
  #video {
    width: 100vw; height: 100vh;
    object-fit: cover;
    transform: scaleX(-1);
  }
  #status {
    position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%);
    background: rgba(0,0,0,0.6); color: white;
    padding: 8px 18px; border-radius: 20px;
    font-family: sans-serif; font-size: 15px;
    pointer-events: none;
  }
  #dot {
    position: fixed; top: 16px; left: 16px;
    width: 12px; height: 12px; border-radius: 50%;
    background: grey;
  }
</style>
</head>
<body>
<video id="video" playsinline autoplay muted></video>
<div id="status">Starting camera...</div>
<div id="dot"></div>

<script src="https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/pose.js" crossorigin="anonymous"></script>

<script>
const video  = document.getElementById('video');
const status = document.getElementById('status');
const dot    = document.getElementById('dot');

function post(obj) {
  if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(obj));
}

// ── Camera ──────────────────────────────────────────────
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 480 } },
      audio: false,
    });
    video.srcObject = stream;
    status.textContent = 'Loading model...';
  } catch (err) {
    status.textContent = 'Camera error: ' + err.message;
    post({ type: 'MODEL_ERROR', error: err.message });
  }
}

// ── MediaPipe ────────────────────────────────────────────
const pose = new Pose({
  locateFile: f => 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/' + f,
});

pose.setOptions({
  modelComplexity: 0,
  smoothLandmarks: true,
  enableSegmentation: false,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});

pose.onResults(results => {
  if (!results.poseLandmarks) {
    dot.style.background = 'red';
    post({ type: 'POSE_RESULT', detected: false });
    return;
  }

  dot.style.background = 'lime';
  status.textContent   = 'Swing! 💪';

  const lm = results.poseLandmarks;

  // Send only the 4 landmarks we need — keep message tiny
  post({
    type: 'POSE_RESULT',
    detected: true,
    landmarks: {
      leftShoulder:  { x: lm[11].x, y: lm[11].y, visibility: lm[11].visibility },
      rightShoulder: { x: lm[12].x, y: lm[12].y, visibility: lm[12].visibility },
      leftWrist:     { x: lm[15].x, y: lm[15].y, visibility: lm[15].visibility },
      rightWrist:    { x: lm[16].x, y: lm[16].y, visibility: lm[16].visibility },
    },
  });
});

// ── Loop ─────────────────────────────────────────────────
async function init() {
  await startCamera();

  await new Promise(res => video.addEventListener('loadeddata', res, { once: true }));

  await pose.initialize();
  status.textContent = 'Ready!';
  post({ type: 'MODEL_READY' });

  async function loop() {
    if (video.readyState >= 2) {
      await pose.send({ image: video });
    }
    requestAnimationFrame(loop);
  }
  loop();
}

init().catch(err => {
  status.textContent = 'Init error: ' + err.message;
  post({ type: 'MODEL_ERROR', error: err.message });
});
</script>
</body>
</html>`;