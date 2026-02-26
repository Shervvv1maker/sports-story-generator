/* ============================================================
   APP.JS — Main Controller
   ─────────────────────────────────────────────────────────
   Orchestrates: stories → ElevenLabs voice → captions
                 → canvas game → MediaRecorder → download
   ============================================================ */

'use strict';

(function () {

  /* ── DOM refs ── */
  const generateBtn  = document.getElementById('generateBtn');
  const recordBtn    = document.getElementById('recordBtn');
  const downloadBtn  = document.getElementById('downloadBtn');
  const sportBtns    = document.querySelectorAll('.sportBtn');
  const platBtns     = document.querySelectorAll('.platBtn');
  const voiceSelect  = document.getElementById('voiceSelect');
  const settingsBtn  = document.getElementById('settingsBtn');
  const closeSettings= document.getElementById('closeSettingsBtn');
  const apiKeyInput  = document.getElementById('apiKeyInput');
  const saveKeyBtn   = document.getElementById('saveKeyBtn');
  const clearKeyBtn  = document.getElementById('clearKeyBtn');
  const keyStatus    = document.getElementById('keyStatus');
  const settingsModal= document.getElementById('settingsModal');

  const statusBar    = document.getElementById('statusBar');
  const statusMsg    = document.getElementById('statusMsg');
  const recIndicator = document.getElementById('recIndicator');

  /* Video overlay elements */
  const badgeEmoji   = document.getElementById('badgeEmoji');
  const badgeName    = document.getElementById('badgeName');
  const badgeYear    = document.getElementById('badgeYear');
  const sourceLabel  = document.getElementById('sourceLabel');
  const storyTitleEl = document.getElementById('storyTitleEl');
  const captionText  = document.getElementById('captionText');
  const progressFill = document.getElementById('progressFill');
  const timeLabel    = document.getElementById('timeLabel');

  /* Story preview panel */
  const storyCardTitle= document.getElementById('storyCardTitle');
  const storyCardSport= document.getElementById('storyCardSport');
  const storyCardText = document.getElementById('storyCardText');

  const canvas = document.getElementById('bgCanvas');

  /* ── State ── */
  let currentSport  = 'all';
  let currentStory  = null;
  let ttsCtrl       = null;   // ElevenLabs speak controller
  let allWords      = [];     // [{word,start,end}]
  let wordSpans     = [];     // DOM spans
  let storyDurSec   = 90;

  /* ── Sport filter ── */
  sportBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sportBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSport = btn.dataset.sport;
    });
  });

  platBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      platBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  /* ── Settings modal ── */
  settingsBtn.addEventListener('click', () => {
    apiKeyInput.value = ElevenLabs.getKey();
    settingsModal.classList.remove('hidden');
  });
  closeSettings.addEventListener('click', () => settingsModal.classList.add('hidden'));
  settingsModal.addEventListener('click', e => { if (e.target === settingsModal) settingsModal.classList.add('hidden'); });

  saveKeyBtn.addEventListener('click', async () => {
    const k = apiKeyInput.value.trim();
    if (!k) { keyStatus.textContent = '⚠ Enter a key first'; return; }
    keyStatus.textContent = 'Validating…';
    const ok = await ElevenLabs.validateKey(k);
    if (ok) {
      ElevenLabs.setKey(k);
      keyStatus.textContent = '✓ Key saved! Human AI voice enabled.';
    } else {
      keyStatus.textContent = '✗ Invalid key — check and retry.';
    }
  });
  clearKeyBtn.addEventListener('click', () => {
    ElevenLabs.clearKey();
    apiKeyInput.value = '';
    keyStatus.textContent = 'Key cleared. Browser TTS will be used.';
  });

  /* ── Status helpers ── */
  function showStatus(msg) {
    statusMsg.textContent = msg;
    statusBar.classList.remove('hidden');
  }
  function hideStatus() { statusBar.classList.add('hidden'); }

  /* ── Theme ── */
  function applyTheme(sport) {
    document.body.dataset.sport = sport;
    const m = getSportMeta(sport);
    if (badgeEmoji) badgeEmoji.textContent = m.emoji;
    if (badgeName)  badgeName.textContent  = m.name;
  }

  /* ── Caption engine ── */
  function buildCaptionSpans(words) {
    captionText.innerHTML = '';
    wordSpans = [];
    const WIN = 14;
    allWords  = words;

    words.forEach((w, i) => {
      const sp = document.createElement('span');
      sp.className = 'cw';
      sp.dataset.i = i;
      sp.textContent = w.word + ' ';
      captionText.appendChild(sp);
      wordSpans.push(sp);
    });

    /* Show first window */
    updateCaptionWindow(0);
  }

  const WIN = 14;
  let lastWordIdx = -1;

  function updateCaptionWindow(idx) {
    if (idx === lastWordIdx) return;
    lastWordIdx = idx;
    const start = Math.max(0, idx - 1);
    const end   = start + WIN;
    wordSpans.forEach((s, i) => {
      s.style.display = (i >= start && i < end) ? '' : 'none';
      s.classList.toggle('cw-active', i === idx);
    });
  }

  /* ── Progress ── */
  function setProgress(ratio) {
    progressFill.style.width = (ratio * 100).toFixed(1) + '%';
    const elapsed = Math.round(ratio * storyDurSec);
    const total   = Math.round(storyDurSec);
    const fmt = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
    timeLabel.textContent = `${fmt(elapsed)} / ${fmt(total)}`;
  }

  /* ── Display story in all panels ── */
  function displayStory(story) {
    currentStory = story;
    applyTheme(story.sport);

    const meta = getSportMeta(story.sport);
    if (badgeYear)    badgeYear.textContent    = story.year ? '· ' + story.year : '';
    if (sourceLabel)  sourceLabel.textContent  = (story.isLive ? '🔴 ESPN · ' : '📰 ') + (story.source || 'Sports History');
    if (storyTitleEl) storyTitleEl.textContent = story.title;

    storyCardTitle.textContent = story.title;
    storyCardSport.textContent = meta.emoji + ' ' + meta.name + (story.year ? ' · ' + story.year : '');
    storyCardText.textContent  = story.content.slice(0, 320) + (story.content.length > 320 ? '…' : '');

    /* Estimate duration for progress display */
    const wordCount = story.content.split(/\s+/).length;
    storyDurSec     = Math.round(wordCount / (145 / 60));
    setProgress(0);
    captionText.innerHTML = '';
  }

  /* ── Play story (preview mode, no recording) ── */
  async function playStory() {
    if (!currentStory) return;
    stopCurrentTTS();

    const voiceId = voiceSelect.value;
    const audioCtx = VideoRecorder.getAudioContext();
    if (audioCtx.state === 'suspended') await audioCtx.resume();

    const words = currentStory.content.split(/\s+/).filter(Boolean).map((w, i, arr) => {
      const wpm = 145;
      const start = i * (60 / wpm);
      return { word: w, start, end: start + (60 / wpm) * 0.9 };
    });
    buildCaptionSpans(words);
    lastWordIdx = -1;

    ttsCtrl = await ElevenLabs.speak(currentStory.content, {
      voiceId,
      audioCtx,
      onWord:     (idx) => updateCaptionWindow(idx),
      onProgress: (r)   => setProgress(r),
      onDone:     ()    => {
        setProgress(1);
        recordBtn.disabled = false;
        setTimeout(() => recordBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 400);
      },
    });
  }

  function stopCurrentTTS() {
    if (ttsCtrl) { ttsCtrl.stop(); ttsCtrl = null; }
    speechSynthesis?.cancel();
    lastWordIdx = -1;
  }

  /* ── Generate new story ── */
  async function generateStory() {
    stopCurrentTTS();
    VideoRecorder.reset();
    downloadBtn.disabled = true;
    recordBtn.disabled   = true;
    generateBtn.disabled = true;
    showStatus('Fetching story…');

    try {
      const story = await getRandomStory(currentSport);
      displayStory(story);
      hideStatus();
      generateBtn.disabled = false;
      showStatus('Story ready! Playing preview…');
      await playStory();
      hideStatus();
    } catch (err) {
      console.error(err);
      hideStatus();
      generateBtn.disabled = false;
    }
  }

  /* ── Record video ── */
  async function recordVideo() {
    if (!currentStory) return;
    if (VideoRecorder.isRecording) return;

    stopCurrentTTS();
    downloadBtn.disabled = true;
    recordBtn.disabled   = true;
    generateBtn.disabled = true;

    /* Resume AudioContext (requires user gesture — button click qualifies) */
    const audioCtx = VideoRecorder.getAudioContext();
    if (audioCtx.state === 'suspended') await audioCtx.resume();

    /* Create audio destination that MediaRecorder can capture */
    const dest = VideoRecorder.createDestination();

    showStatus('Recording video…');
    recIndicator.classList.remove('hidden');

    /* Reset game for a clean recording */
    BallGame.reset();
    captionText.innerHTML = '';
    setProgress(0);
    lastWordIdx = -1;

    /* Build captions word list */
    const words = currentStory.content.split(/\s+/).filter(Boolean).map((w, i) => {
      const wpm = 145;
      return { word: w, start: i * (60 / wpm), end: (i + 1) * (60 / wpm) * 0.9 };
    });
    buildCaptionSpans(words);
    lastWordIdx = -1;

    /* Start recording */
    VideoRecorder.start(canvas, (blob) => {
      hideStatus();
      recIndicator.classList.add('hidden');
      downloadBtn.disabled   = false;
      recordBtn.disabled     = false;
      generateBtn.disabled   = false;
      showStatus(`✅ Video ready! (${(blob.size / 1_000_000).toFixed(1)} MB) — click Download`);
    });

    /* Route ElevenLabs (or browser TTS) through the AudioContext destination
       so MediaRecorder captures it.
       For browser TTS: Web Speech API audio cannot be routed through AudioContext,
       so we capture canvas only and the downloaded file will be silent if using
       browser TTS. Encourage users to use ElevenLabs for audio in downloads. */

    const voiceId = voiceSelect.value;
    const hasEL   = ElevenLabs.hasKey() && voiceId !== 'browser';

    ttsCtrl = await ElevenLabs.speak(currentStory.content, {
      voiceId,
      audioCtx,
      onWord:     (idx) => updateCaptionWindow(idx),
      onProgress: (r)   => setProgress(r),
      onDone:     ()    => {
        setProgress(1);
        /* Give 1 second tail then stop recording */
        setTimeout(() => VideoRecorder.stop(), 1000);
      },
    });

    if (!hasEL) {
      showStatus('Recording video… (Add ElevenLabs key for audio in download)');
    }
  }

  /* ── Download ── */
  downloadBtn.addEventListener('click', () => {
    const sport = currentStory?.sport || 'sports';
    const year  = currentStory?.year  || '';
    const name  = `${sport}-story-${year}-${Date.now()}.webm`;
    VideoRecorder.download(name);
  });

  /* ── Button wiring ── */
  generateBtn.addEventListener('click', generateStory);
  recordBtn.addEventListener('click',   recordVideo);

  /* ── Keyboard shortcuts ── */
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    if (e.code === 'Enter') generateBtn.click();
    if (e.code === 'KeyR' && !e.ctrlKey) recordBtn.disabled || recordBtn.click();
    if (e.code === 'KeyD') downloadBtn.disabled || downloadBtn.click();
  });

  /* ── Init ── */
  function init() {
    applyTheme('all');
    setProgress(0);

    /* Show key status hint if key is already saved */
    if (ElevenLabs.hasKey()) {
      showStatus('✓ ElevenLabs key found — human British voice ready.');
      setTimeout(hideStatus, 3000);
    }

    /* Preload voices */
    speechSynthesis?.getVoices();
    speechSynthesis?.addEventListener('voiceschanged', () => {}, { once: true });
  }

  init();

})();
