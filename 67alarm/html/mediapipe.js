export const mediapipeHTML = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
<img id="frame" style="display:none">

<script src="https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/pose.js" crossorigin="anonymous"></script>

<script>
  let pose = null;
  let busy = false;
  let ready = false;

  function postToRN(type, payload) {
    if (window.ReactNativeWebView)
      window.ReactNativeWebView.postMessage(JSON.stringify({ type, ...payload }));
  }

  function handleMessage(e) {
    try {
      const data = JSON.parse(e.data);
      if (data.type === 'PROCESS_FRAME') processFrame(data.base64);
    } catch {}
  }

  document.addEventListener('message', handleMessage);
  window.addEventListener('message', handleMessage);

  async function processFrame(base64) {
    if (busy || !ready) return;
    busy = true;

    const img = document.getElementById('frame');
    img.onload = async () => {
      try {
        await pose.send({ image: img });
      } catch (err) {
        postToRN('FRAME_ERROR', { error: err.message });
      }
      busy = false;
    };
    img.onerror = () => {
      busy = false;
    };
    img.src = 'data:image/jpeg;base64,' + base64;
  }

  function onResults(results) {
    if (!results.poseLandmarks) {
      postToRN('POSE_RESULT', { detected: false });
      return;
    }

    const lm = results.poseLandmarks;
    postToRN('POSE_RESULT', {
      detected: true,
      landmarks: {
        leftShoulder:  { x: lm[11].x, y: lm[11].y, v: lm[11].visibility },
        rightShoulder: { x: lm[12].x, y: lm[12].y, v: lm[12].visibility },
        leftWrist:     { x: lm[15].x, y: lm[15].y, v: lm[15].visibility },
        rightWrist:    { x: lm[16].x, y: lm[16].y, v: lm[16].visibility },
      }
    });
  }

  async function init() {
    try {
      pose = new Pose({
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

      pose.onResults(onResults);

      ready = true;
      postToRN('MODEL_READY', {});
    } catch (err) {
      postToRN('MODEL_ERROR', { error: err.message });
    }
  }

  init();
</script>
</body>
</html>
`;
