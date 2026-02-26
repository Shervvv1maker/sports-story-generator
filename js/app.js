/* ============================================================
   APP.JS — Main Controller  (v3)
   ─────────────────────────────────────────────────────────
   Flow:
     1. Generate Story  → fetch silently → overlay shows on canvas instantly
     2. Record Video    → MediaRecorder + TTS → captions update on canvas
     3. Download        → save WebM file
     4. Post / Schedule → social.js helpers

   All video overlays (Reddit card, captions, progress bar) are drawn
   directly on the 540×960 canvas so they appear in the recording.
   ============================================================ */

'use strict';

(function () {

  /* ── DOM refs ── */
  const generateBtn    = document.getElementById('generateBtn');
  const recordBtn      = document.getElementById('recordBtn');
  const downloadBtn    = document.getElementById('downloadBtn');
  const sportBtns      = document.querySelectorAll('.sportBtn');
  const platBtns       = document.querySelectorAll('.platBtn');
  const voiceSelect    = document.getElementById('voiceSelect');
  const settingsBtn    = document.getElementById('settingsBtn');
  const closeSettings  = document.getElementById('closeSettingsBtn');
  const apiKeyInput    = document.getElementById('apiKeyInput');
  const saveKeyBtn     = document.getElementById('saveKeyBtn');
  const clearKeyBtn    = document.getElementById('clearKeyBtn');
  const keyStatus      = document.getElementById('keyStatus');
  const settingsModal  = document.getElementById('settingsModal');
  const statusBar      = document.getElementById('statusBar');
  const statusMsg      = document.getElementById('statusMsg');
  const recIndicator   = document.getElementById('recIndicator');

  /* Control-panel story card */
  const storyCardTitle = document.getElementById('storyCardTitle');
  const storyCardSport = document.getElementById('storyCardSport');
  const storyCardText  = document.getElementById('storyCardText');

  /* Social section */
  const postTikTok     = document.getElementById('postTikTok');
  const postYouTube    = document.getElementById('postYouTube');
  const postInsta      = document.getElementById('postInsta');
  const copyCapBtn     = document.getElementById('copyCaptionBtn');
  const scheduleInput  = document.getElementById('scheduleInput');
  const scheduleBtn    = document.getElementById('scheduleBtn');
  const schedulePlatSel= document.getElementById('schedulePlatSel');
  const scheduledList  = document.getElementById('scheduledList');

  const canvas = document.getElementById('bgCanvas');
  const CW = 540, CH = 960;

  /* ── State ── */
  let currentSport  = 'all';
  let currentStory  = null;
  let ttsCtrl       = null;
  let storyWords    = [];
  let storyDurSec   = 90;

  /* ── Canvas overlay state ── */
  let overlayActive   = false;
  let overlayCaption  = '';       // current 3-word group
  let overlayProgress = 0;        // 0–1
  let overlayTitle    = '';
  let overlaySub      = 'r/sports';
  let overlayUpvotes  = '0k';
  let overlaySportCol = '#ff6b35';

  /* sport → subreddit & colour */
  const SPORT_SUBS = {
    football: 'r/nfl', basketball: 'r/nba', baseball: 'r/baseball',
    soccer: 'r/soccer', golf: 'r/golf', f1: 'r/formula1', all: 'r/sports',
  };
  const SPORT_COLORS = {
    football: '#a0522d', basketball: '#ff6b00', baseball: '#d22730',
    soccer: '#00a36c', golf: '#2e8b57', f1: '#e8002d', all: '#ff6b35',
  };

  /* ══════════════════════════════════════════
     CANVAS OVERLAY DRAW HELPERS
     All sizes are in native canvas pixels (540×960)
  ══════════════════════════════════════════ */

  /** Rounded rectangle path (polyfill-safe) */
  function rrect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y,     x + w, y + r,     r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x,     y + h, x,     y + h - r, r);
    ctx.lineTo(x,     y + r);
    ctx.arcTo(x,     y,     x + r, y,          r);
    ctx.closePath();
  }

  /** Word-wrap text onto canvas. Returns number of lines drawn. */
  function drawWrappedText(ctx, text, x, y, maxW, lineH, maxLines) {
    const words = text.split(' ');
    let line = '', linesDrawn = 0;
    for (let i = 0; i < words.length; i++) {
      const test = line ? line + ' ' + words[i] : words[i];
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, x, y + linesDrawn * lineH);
        linesDrawn++;
        if (linesDrawn >= maxLines) return linesDrawn;
        line = words[i];
      } else {
        line = test;
      }
    }
    if (line && linesDrawn < maxLines) {
      ctx.fillText(line, x, y + linesDrawn * lineH);
      linesDrawn++;
    }
    return linesDrawn;
  }

  /** Full-canvas vignette gradient */
  function drawVignette(ctx) {
    const g = ctx.createLinearGradient(0, 0, 0, CH);
    g.addColorStop(0,    'rgba(0,0,0,0.62)');
    g.addColorStop(0.26, 'rgba(0,0,0,0.0)');
    g.addColorStop(0.60, 'rgba(0,0,0,0.0)');
    g.addColorStop(1.0,  'rgba(0,0,0,0.82)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, CW, CH);
  }

  /** Reddit-style post card at the top of the frame */
  function drawRedditCard(ctx) {
    const mx = 22, my = 52;
    const cw = CW - mx * 2, ch = 192;
    const tx = mx + 22;

    /* Card background */
    ctx.fillStyle = 'rgba(6, 6, 10, 0.82)';
    rrect(ctx, mx, my, cw, ch, 18);
    ctx.fill();

    /* Card border */
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.lineWidth = 1.5;
    rrect(ctx, mx, my, cw, ch, 18);
    ctx.stroke();

    /* Orange Reddit circle */
    const cx2 = tx + 14, cy2 = my + 44;
    ctx.beginPath();
    ctx.arc(cx2, cy2, 15, 0, Math.PI * 2);
    ctx.fillStyle = '#FF4500';
    ctx.fill();

    /* "r" letter inside circle */
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 15px Inter, Arial, sans-serif';
    ctx.textAlign   = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('r', cx2, cy2);

    /* Subreddit name */
    ctx.fillStyle    = '#FF6634';
    ctx.font         = '700 23px Inter, Arial, sans-serif';
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(overlaySub, tx + 36, cy2);

    /* Upvotes — right-aligned */
    ctx.fillStyle = 'rgba(255,255,255,0.44)';
    ctx.font      = '600 19px Inter, Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('⬆ ' + overlayUpvotes, mx + cw - 20, cy2);

    /* Separator */
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(mx + 14, my + 72);
    ctx.lineTo(mx + cw - 14, my + 72);
    ctx.stroke();

    /* Title (wrapped, max 2 lines) */
    ctx.fillStyle    = '#FFFFFF';
    ctx.font         = '700 27px Inter, Arial, sans-serif';
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'top';
    drawWrappedText(ctx, overlayTitle, tx, my + 84, cw - 44, 35, 2);
  }

  /** Clean white captions — 3 words at a time, heavy black outline */
  function drawCaptions(ctx) {
    if (!overlayCaption) return;

    const cy = Math.round(CH * 0.755);
    let fontSize = 54;
    const maxW   = CW - 60;

    ctx.save();
    ctx.textAlign   = 'center';
    ctx.textBaseline = 'middle';

    /* Scale down until text fits on one line */
    ctx.font = `900 ${fontSize}px Inter, "Arial Black", Impact, sans-serif`;
    while (ctx.measureText(overlayCaption).width > maxW && fontSize > 28) {
      fontSize -= 2;
      ctx.font = `900 ${fontSize}px Inter, "Arial Black", Impact, sans-serif`;
    }

    /* Thick black outline */
    ctx.lineJoin    = 'round';
    ctx.lineWidth   = Math.round(fontSize * 0.19);
    ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
    ctx.strokeText(overlayCaption, CW / 2, cy);

    /* Bright white fill */
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(overlayCaption, CW / 2, cy);

    ctx.restore();
  }

  /** Thin progress bar + time label at the very bottom */
  function drawProgress(ctx) {
    const barH = 7, barY = CH - 34, m = 30, barW = CW - m * 2;

    ctx.save();

    /* Track */
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    rrect(ctx, m, barY, barW, barH, 3.5);
    ctx.fill();

    /* Fill */
    const fill = barW * Math.max(0, Math.min(overlayProgress, 1));
    if (fill > 1) {
      ctx.fillStyle = overlaySportCol;
      rrect(ctx, m, barY, fill, barH, 3.5);
      ctx.fill();
    }

    /* Time label (right-aligned above bar) */
    const elapsed = Math.round(overlayProgress * storyDurSec);
    const total   = Math.round(storyDurSec);
    const fmt     = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    ctx.font         = '700 19px Inter, Arial, sans-serif';
    ctx.fillStyle    = 'rgba(255,255,255,0.65)';
    ctx.textAlign    = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`${fmt(elapsed)} / ${fmt(total)}`, CW - m, barY - 6);

    ctx.restore();
  }

  /* ── Master overlay renderer — called by game.js each frame ── */
  window.renderVideoOverlay = function (ctx, _CW, _CH) {
    if (!overlayActive) return;
    ctx.save();
    drawVignette(ctx);
    drawRedditCard(ctx);
    drawCaptions(ctx);
    drawProgress(ctx);
    ctx.restore();
  };

  /* ══════════════════════════════════════════
     STATE HELPERS
  ══════════════════════════════════════════ */

  function applyTheme(sport) {
    document.body.dataset.sport = sport;
  }

  function displayStory(story) {
    currentStory = story;

    /* Control-panel card */
    const meta = getSportMeta(story.sport);
    storyCardTitle.textContent = story.title;
    storyCardSport.textContent = (meta.emoji || '') + ' ' + (meta.name || story.sport) +
                                 (story.year ? ' · ' + story.year : '');
    storyCardText.textContent  = story.content.slice(0, 320) +
                                 (story.content.length > 320 ? '…' : '');

    /* Canvas overlay */
    const sp         = story.sport || 'all';
    overlaySportCol  = SPORT_COLORS[sp] || '#ff6b35';
    overlaySub       = SPORT_SUBS[sp]   || 'r/sports';
    overlayUpvotes   = (10 + Math.random() * 80).toFixed(1) + 'k';
    overlayTitle     = story.title;
    overlayProgress  = 0;
    overlayCaption   = '';
    overlayActive    = true;

    applyTheme(sp);

    /* Pre-build word list for 3-word grouping */
    const WPM = 145;
    storyWords = story.content.split(/\s+/).filter(Boolean).map((w, i) => ({
      word:  w,
      start: i * (60 / WPM),
      end:   (i + 1) * (60 / WPM) * 0.9,
    }));
    const wordCount = storyWords.length;
    storyDurSec = Math.max(60, Math.round(wordCount / (WPM / 60)));
  }

  /* ══════════════════════════════════════════
     TTS
  ══════════════════════════════════════════ */

  function stopCurrentTTS() {
    if (ttsCtrl) { ttsCtrl.stop(); ttsCtrl = null; }
    speechSynthesis?.cancel();
  }

  /* Word callback → update 3-word caption group */
  function onWord(idx) {
    const gs = Math.floor(idx / 3) * 3;
    overlayCaption = storyWords.slice(gs, gs + 3).map(w => w.word).join(' ');
  }

  /* ══════════════════════════════════════════
     STATUS BAR
  ══════════════════════════════════════════ */

  let statusTimer = null;
  function showStatus(msg, autohide = 0) {
    statusMsg.textContent = msg;
    statusBar.classList.remove('hidden');
    if (statusTimer) clearTimeout(statusTimer);
    if (autohide) statusTimer = setTimeout(hideStatus, autohide);
  }
  function hideStatus() {
    statusBar.classList.add('hidden');
    statusTimer = null;
  }

  /* ══════════════════════════════════════════
     SOCIAL HELPERS
  ══════════════════════════════════════════ */

  function setSocialEnabled(on) {
    [postTikTok, postYouTube, postInsta, copyCapBtn, scheduleBtn].forEach(el => {
      if (el) el.disabled = !on;
    });
  }

  function currentFilename() {
    const sport = currentStory?.sport || 'sports';
    const year  = currentStory?.year  || '';
    return `${sport}-story-${year || Date.now()}.webm`;
  }

  function renderScheduledList() {
    if (!scheduledList) return;
    const items = Social.getSchedules();
    if (!items.length) {
      scheduledList.innerHTML = '<p class="scheduleEmpty">No posts scheduled.</p>';
      return;
    }
    scheduledList.innerHTML = items.map(it => `
      <div class="scheduleItem">
        <span class="sched-icon">${Social.PLATFORMS[it.platform]?.emoji || '📱'}</span>
        <div class="sched-info">
          <div class="sched-title">${it.storyTitle || 'Story'}</div>
          <div class="sched-time">${new Date(it.scheduledAt).toLocaleString()}</div>
        </div>
        <button class="sched-cancel" data-id="${it.id}">✕</button>
      </div>
    `).join('');

    scheduledList.querySelectorAll('.sched-cancel').forEach(btn => {
      btn.addEventListener('click', () => {
        Social.cancel(btn.dataset.id);
        renderScheduledList();
      });
    });
  }

  /* ══════════════════════════════════════════
     GENERATE (instant — no preview step)
  ══════════════════════════════════════════ */

  async function generateStory() {
    stopCurrentTTS();
    VideoRecorder.reset();
    downloadBtn.disabled = true;
    recordBtn.disabled   = true;
    generateBtn.disabled = true;
    setSocialEnabled(false);
    showStatus('Fetching story…');

    try {
      const story = await getRandomStory(currentSport);
      displayStory(story);
      hideStatus();
      generateBtn.disabled = false;
      recordBtn.disabled   = false;
      showStatus('✅ Story ready — click Record to make your video!', 4000);
    } catch (err) {
      console.error(err);
      hideStatus();
      generateBtn.disabled = false;
      showStatus('⚠ Error fetching story. Please try again.', 3500);
    }
  }

  /* ══════════════════════════════════════════
     RECORD
  ══════════════════════════════════════════ */

  async function recordVideo() {
    if (!currentStory || VideoRecorder.isRecording) return;

    stopCurrentTTS();
    downloadBtn.disabled = true;
    recordBtn.disabled   = true;
    generateBtn.disabled = true;
    setSocialEnabled(false);

    /* Resume AudioContext (requires user gesture — button click qualifies) */
    const audioCtx = VideoRecorder.getAudioContext();
    if (audioCtx.state === 'suspended') await audioCtx.resume();

    /* Create MediaStream destination for audio capture */
    const dest = VideoRecorder.createDestination();

    /* Reset overlay counters */
    overlayProgress = 0;
    overlayCaption  = '';

    showStatus('🔴 Recording…');
    recIndicator.classList.remove('hidden');

    /* Reset game for a clean take */
    BallGame.reset();

    /* Start MediaRecorder */
    VideoRecorder.start(canvas, (blob) => {
      hideStatus();
      recIndicator.classList.add('hidden');
      downloadBtn.disabled   = false;
      recordBtn.disabled     = false;
      generateBtn.disabled   = false;
      setSocialEnabled(true);
      showStatus(`✅ Video ready (${(blob.size / 1_000_000).toFixed(1)} MB) — Download or Post!`, 0);
    });

    /* Start TTS — drives captions + progress on canvas */
    const voiceId = voiceSelect.value;
    ttsCtrl = await ElevenLabs.speak(currentStory.content, {
      voiceId,
      audioCtx,
      dest,       // routes audio through MediaStreamDestination for recording
      onWord:     (idx) => onWord(idx),
      onProgress: (r)   => { overlayProgress = r; },
      onDone:     ()    => {
        overlayProgress = 1;
        overlayCaption  = '';
        /* Give 1.2 s tail before stopping */
        setTimeout(() => VideoRecorder.stop(), 1200);
      },
    });

    if (!ElevenLabs.hasKey() || voiceId === 'browser') {
      showStatus('🔴 Recording… (add ElevenLabs key for audio in the file)');
    }
  }

  /* ══════════════════════════════════════════
     EVENT WIRING
  ══════════════════════════════════════════ */

  /* Generate + Record */
  generateBtn.addEventListener('click', generateStory);
  recordBtn.addEventListener('click',   recordVideo);

  /* Download */
  downloadBtn.addEventListener('click', () => VideoRecorder.download(currentFilename()));

  /* Social platform buttons */
  if (postTikTok)  postTikTok.addEventListener('click',  () => Social.postNow('tiktok',    currentFilename()));
  if (postYouTube) postYouTube.addEventListener('click', () => Social.postNow('youtube',   currentFilename()));
  if (postInsta)   postInsta.addEventListener('click',   () => Social.postNow('instagram', currentFilename()));

  /* Copy caption */
  if (copyCapBtn) {
    copyCapBtn.addEventListener('click', async () => {
      if (!currentStory) return;
      const ok = await Social.copyCaption(currentStory.title, currentStory.content);
      const orig = copyCapBtn.querySelector('span:last-child');
      if (orig) orig.textContent = ok ? '✓ Copied!' : '✗ Failed';
      setTimeout(() => { if (orig) orig.textContent = 'Copy Caption'; }, 2200);
    });
  }

  /* Schedule */
  if (scheduleBtn) {
    scheduleBtn.addEventListener('click', () => {
      const dtVal = scheduleInput?.value;
      const plat  = schedulePlatSel?.value || 'tiktok';
      if (!dtVal) { showStatus('⚠ Pick a date/time first.', 2500); return; }
      const ms = new Date(dtVal).getTime();
      if (ms < Date.now() + 30_000) { showStatus('⚠ Please choose a future time.', 2500); return; }

      Social.schedule(plat, ms, currentStory?.title || 'Sports Story', currentFilename());
      renderScheduledList();
      showStatus(`⏰ Scheduled for ${new Date(ms).toLocaleString()}`, 4000);
    });
  }

  /* Reflect schedule fires in UI */
  window.addEventListener('ssg:scheduleFired', () => renderScheduledList());

  /* Sport filter */
  sportBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sportBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSport = btn.dataset.sport;
    });
  });

  /* Platform selector (visual only) */
  platBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      platBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  /* Settings modal */
  settingsBtn.addEventListener('click', () => {
    apiKeyInput.value = ElevenLabs.getKey();
    settingsModal.classList.remove('hidden');
  });
  closeSettings.addEventListener('click', () => settingsModal.classList.add('hidden'));
  settingsModal.addEventListener('click', e => {
    if (e.target === settingsModal) settingsModal.classList.add('hidden');
  });

  saveKeyBtn.addEventListener('click', async () => {
    const k = apiKeyInput.value.trim();
    if (!k) { keyStatus.textContent = '⚠ Enter a key first'; return; }
    keyStatus.textContent = 'Validating…';
    const ok = await ElevenLabs.validateKey(k);
    if (ok) {
      ElevenLabs.setKey(k);
      keyStatus.textContent = '✓ Key saved! Human British voice enabled.';
    } else {
      keyStatus.textContent = '✗ Invalid key — check and retry.';
    }
  });

  clearKeyBtn.addEventListener('click', () => {
    ElevenLabs.clearKey();
    apiKeyInput.value = '';
    keyStatus.textContent = 'Key cleared. Browser TTS will be used.';
  });

  /* Keyboard shortcuts */
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    if (e.code === 'Enter')                         generateBtn.click();
    if (e.code === 'KeyR' && !e.ctrlKey && !recordBtn.disabled)   recordBtn.click();
    if (e.code === 'KeyD' && !downloadBtn.disabled) downloadBtn.click();
  });

  /* ══════════════════════════════════════════
     INIT
  ══════════════════════════════════════════ */

  function init() {
    applyTheme('all');
    setSocialEnabled(false);
    renderScheduledList();
    Social.init();

    speechSynthesis?.getVoices();
    speechSynthesis?.addEventListener('voiceschanged', () => {}, { once: true });

    if (ElevenLabs.hasKey()) {
      showStatus('✓ ElevenLabs key found — human British voice ready.', 3500);
    }
  }

  init();

})();
