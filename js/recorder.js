/* ============================================================
   RECORDER.JS — Canvas + Audio → Downloadable WebM Video
   ─────────────────────────────────────────────────────────
   Captures the background canvas stream + AudioContext
   destination stream via MediaRecorder.
   Output: 9:16 WebM (540×960) ready for TikTok, Reels, Shorts.

   Flow:
     1. VideoRecorder.prepare(audioBuffer)  — loads audio
     2. VideoRecorder.start()               — starts recording + playback
     3. (auto-stops when audio ends)
     4. VideoRecorder.download(filename)    — triggers file download
   ============================================================ */

'use strict';

window.VideoRecorder = (function () {

  let mediaRecorder = null;
  let recordedChunks = [];
  let audioCtx       = null;
  let audioSource    = null;
  let destNode       = null;
  let videoBlob      = null;
  let isRecording    = false;

  /* ── AudioContext singleton (must be resumed after user gesture) ── */
  function getAudioCtx() {
    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  }

  /* ── Build combined canvas + audio stream ── */
  function buildStream(canvas, frameRate = 30) {
    const canvasStream = canvas.captureStream(frameRate);

    if (destNode) {
      destNode.stream.getAudioTracks().forEach(t => canvasStream.addTrack(t));
    }

    return canvasStream;
  }

  /* ── Choose best supported mime type ── */
  function bestMime() {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=h264,opus',
      'video/webm',
    ];
    return types.find(t => MediaRecorder.isTypeSupported(t)) || 'video/webm';
  }

  /* ── Public API ── */
  return {

    get isRecording() { return isRecording; },

    /* Returns the AudioContext so ElevenLabs can route audio through it */
    getAudioContext() { return getAudioCtx(); },

    /* Create a MediaStreamDestination node so we can capture
       whatever the app plays through it into the video recording.
       Call this ONCE before starting recording, then route all
       audio sources → this.destNode → audioCtx.destination       */
    createDestination() {
      const ctx = getAudioCtx();
      destNode  = ctx.createMediaStreamDestination();
      /* Also route to speakers */
      destNode.connect(ctx.destination);
      return destNode;
    },

    /* Start recording from the canvas (+ audio if destNode exists).
       onStop(blob) is called when recording finishes.            */
    start(canvas, onStop) {
      if (isRecording) return;
      recordedChunks = [];
      videoBlob      = null;
      isRecording    = true;

      const stream = buildStream(canvas);
      const mime   = bestMime();

      mediaRecorder = new MediaRecorder(stream, {
        mimeType:          mime,
        videoBitsPerSecond: 4_000_000,   // 4 Mbps — good TikTok quality
        audioBitsPerSecond:   128_000,
      });

      mediaRecorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) recordedChunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        isRecording = false;
        videoBlob   = new Blob(recordedChunks, { type: mime });
        if (onStop) onStop(videoBlob);
      };

      mediaRecorder.start(250);   // collect data every 250ms
    },

    /* Stop recording manually (also called automatically by app when audio ends) */
    stop() {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
      isRecording = false;
    },

    /* Trigger browser download of the recorded video */
    download(filename = 'sports-story.webm') {
      if (!videoBlob) { console.warn('No recording yet'); return; }
      const url = URL.createObjectURL(videoBlob);
      const a   = document.createElement('a');
      a.href     = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 2000);
    },

    /* Returns true if a video is ready to download */
    hasVideo() { return !!videoBlob; },

    /* Clean up */
    reset() {
      recordedChunks = [];
      videoBlob      = null;
      isRecording    = false;
      mediaRecorder  = null;
    },
  };

})();
