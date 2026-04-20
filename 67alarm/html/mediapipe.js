export const mediapipeHTML = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #000; overflow: hidden; width: 100vw; height: 100vh; }
  video, canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; }
  video { transform: scaleX(-1); }
  canvas { pointer-events: none; }
  #overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    display: flex; flex-direction: column;
    justify-content: space-between; align-items: center;
    padding: 40px 20px; pointer-events: none;
  }
  #reps {
    font-family: sans-serif; font-size: 72px; font-weight: 900;
    color: white; text-shadow: 0 0 20px rgba(0,0,0,0.8);
  }
  #status {
    font-family: sans-serif; font-size: 18px;
    color: rgba(255,255,255,0.95);
    background: rgba(0,0,0,0.45);
    padding: 8px 16px; border-radius: 20px;
    text-align: center;
  }
  #indicator {
    width: 20px; height: 20px; border-radius: 50%;
    background: grey; position: fixed; top: 20px; right: 20px;
  }
</style>
</head>
<body>
<video id="video" playsinline autoplay muted></video>
<canvas id="canvas"></canvas>
<div id="overlay">
  <div id="reps">0</div>
  <div id="status">Starting camera...</div>
</div>
<div id="indicator"></div>

<script src="https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/pose.js" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@0.5.1675469404/drawing_utils.js" crossorigin="anonymous"></script>

<script>
  let reps = 0;
  let targetReps = 10;
  let phase = 'neutral';
  let lastRepTime = 0;
  const MIN_REP_INTERVAL = 300; // ms debounce between reps

  const video = document.getElementById('video');
  const repsEl = document.getElementById('reps');
  const statusEl = document.getElementById('status');
  const indicatorEl = document.getElementById('indicator');

  function postToRN(type, payload) {
    const msg = JSON.stringify({ type, ...payload });
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(msg);
  }

  document.addEventListener('message', (e) => {
    try {
      const data = JSON.parse(e.data);
      if (data.type === 'SET_TARGET') targetReps = data.reps;
    } catch {}
  });

  window.addEventListener('message', (e) => {
    try {
      const data = JSON.parse(e.data);
      if (data.type === 'SET_TARGET') targetReps = data.reps;
    } catch {}
  });

  async function startCamera() {
    try {
        console.log("requesting camera");

        const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
        });

        console.log("camera OK");

        video.srcObject = stream;

        video.onloadedmetadata = () => {
        video.play().catch(console.error);
        };

        statusEl.textContent = 'Loading pose model...';
        postToRN('CAMERA_READY', {});
    } catch (err) {
        console.log("camera ERROR:", err);

        statusEl.textContent = 'Camera error: ' + err.message;
        postToRN('CAMERA_ERROR', { error: err.message });
    }
  }

  function onResults(results) {
    if (!results.poseLandmarks) {
      indicatorEl.style.background = 'red';
      return;
    }

    indicatorEl.style.background = 'lime';
    const lm = results.poseLandmarks;

    // Landmark indices:
    // 11 = left shoulder, 12 = right shoulder
    // 15 = left wrist,   16 = right wrist
    const ls = lm[11], rs = lm[12];
    const lw = lm[15], rw = lm[16];

    if (!lw || !rw || !ls || !rs) return;
    if (lw.visibility < 0.4 || rw.visibility < 0.4) {
      statusEl.textContent = 'Step back so arms are visible';
      return;
    }

    statusEl.textContent = 'Do your 67s!';

    // Y increases downward, so wrist.y < shoulder.y means wrist is ABOVE shoulder
    const THRESHOLD = 0.06;
    const leftUp   = lw.y < ls.y - THRESHOLD;
    const rightUp  = rw.y < rs.y - THRESHOLD;
    const leftDown = lw.y > ls.y + THRESHOLD;
    const rightDown = rw.y > rs.y + THRESHOLD;

    const now = Date.now();

    // Detect alternating: left-up+right-down → right-up+left-down = 1 rep
    if (leftUp && rightDown && phase !== 'left-up') {
      phase = 'left-up';
    } else if (rightUp && leftDown && phase === 'left-up') {
      if (now - lastRepTime > MIN_REP_INTERVAL) {
        phase = 'right-up';
        reps++;
        lastRepTime = now;
        repsEl.textContent = reps;
        postToRN('REP', { reps });

        if (reps >= targetReps) {
          statusEl.textContent = 'Done';
          postToRN('DONE', { reps });
        }
      }
    }
  }

  async function init() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    await startCamera();

    const pose = new Pose({
      locateFile: (file) =>
        'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/' + file
    });

    pose.setOptions({
      modelComplexity: 0,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults((results) => {
      onResults(results);

      if (!video.videoWidth || !video.videoHeight) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);

      if (results.poseLandmarks) {
        drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {
          color: '#00ffff', lineWidth: 4
        });
        drawLandmarks(ctx, results.poseLandmarks, {
          color: '#ff0077', lineWidth: 2, radius: 4
        });
      }

      ctx.restore();
    });

    video.addEventListener('loadeddata', () => {
      async function loop() {
        if (video.readyState >= 2) await pose.send({ image: video });
        requestAnimationFrame(loop);
      }
      loop();
    });
  }

  init();
</script>
</body>
</html>
`;