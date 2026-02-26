/* =============================================
   APP.JS — Main Controller
   ─────────────────────────────────────────────
   1–2 minute short-form sports story videos.
   Wires: stories.js · game.js · tts.js
   ============================================= */

'use strict';

(function () {

  /* ── DOM refs ── */
  const generateBtn  = document.getElementById('generateBtn');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const replayBtn    = document.getElementById('replayBtn');
  const muteBtn      = document.getElementById('muteBtn');
  const skipBtn      = document.getElementById('skipBtn');
  const sportBtns    = document.querySelectorAll('.sportBtn');
  const badgeEmoji   = document.getElementById('badgeEmoji');
  const badgeName    = document.getElementById('badgeName');
  const badgeYear    = document.getElementById('badgeYear');
  const sourceLabel  = document.getElementById('sourceLabel');
  const storyTitle   = document.getElementById('storyTitle');
  const progressBar  = document.getElementById('progressBar');
  const timeLabel    = document.getElementById('timeLabel');
  const loadScreen   = document.getElementById('loadingScreen');
  const loadText     = document.getElementById('loadingText');

  /* ── State ── */
  let currentSport = 'all';
  let currentStory = null;
  let isMuted      = false;
  let isPlaying    = false;

  /* ── Sport filter ── */
  sportBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sportBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSport = btn.dataset.sport;
    });
  });

  /* ── Progress ── */
  function setProgress(ratio, storyDurationSec) {
    progressBar.style.setProperty('--progress', (ratio * 100).toFixed(1) + '%');
    const elapsed = Math.round(ratio * storyDurationSec);
    const total   = Math.round(storyDurationSec);
    const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    timeLabel.textContent = `${fmt(elapsed)} / ${fmt(total)}`;
  }

  function clearProgress(storyDurationSec) {
    progressBar.style.setProperty('--progress', '0%');
    const total = Math.round(storyDurationSec || 60);
    const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    timeLabel.textContent = `0:00 / ${fmt(total)}`;
  }

  /* ── Loading screen ── */
  function showLoading(msg = 'Loading story…') {
    loadText.textContent = msg;
    loadScreen.classList.add('visible');
  }
  function hideLoading() {
    loadScreen.classList.remove('visible');
  }

  /* ── Apply sport theme ── */
  function applyTheme(sport) {
    document.body.dataset.sport = sport;
    const meta = getSportMeta(sport);
    if (badgeEmoji) badgeEmoji.textContent = meta.emoji;
    if (badgeName)  badgeName.textContent  = meta.name;
  }

  /* ── Estimate story read duration in seconds ── */
  function estimateDuration(text) {
    const wpm   = 145 * 1.05;          // rate 1.05 ≈ 152 wpm
    const words = text.trim().split(/\s+/).length;
    return Math.round((words / wpm) * 60);
  }

  /* ── Display story ── */
  function displayStory(story) {
    currentStory = story;
    applyTheme(story.sport);

    if (badgeYear)   badgeYear.textContent  = story.year ? '· ' + story.year : '';
    if (storyTitle)  storyTitle.textContent = story.title;
    if (sourceLabel) sourceLabel.textContent =
      (story.isLive ? '🔴 ESPN · ' : '📰 ') + (story.source || 'Sports History');

    const dur = estimateDuration(story.content);
    clearProgress(dur);
    TTS.clearCaption();
  }

  /* ── Play/pause state ── */
  function setPlaying(playing) {
    isPlaying = playing;
    playPauseBtn.textContent = playing ? '⏸' : '▶';
    playPauseBtn.disabled = false;
    replayBtn.disabled    = false;
    skipBtn.disabled      = false;
  }

  /* ── Play the current story ── */
  function playStory() {
    if (!currentStory) return;
    TTS.stop();
    setPlaying(true);

    const dur = estimateDuration(currentStory.content);

    TTS.speak(currentStory.content, {
      onProgress: ratio => setProgress(ratio, dur),
      onDone:     () => {
        setPlaying(false);
        setProgress(1, dur);
        // Auto-advance after 3 s
        setTimeout(() => { if (!isPlaying) generateStory(); }, 3000);
      },
    });
  }

  /* ── Generate a new story ── */
  async function generateStory() {
    TTS.stop();
    setPlaying(false);
    showLoading('Loading story…');

    try {
      const story = await getRandomStory(currentSport);
      displayStory(story);
      hideLoading();
      playStory();
    } catch (err) {
      console.error(err);
      hideLoading();
    }
  }

  /* ── Button handlers ── */
  generateBtn.addEventListener('click', generateStory);

  playPauseBtn.addEventListener('click', () => {
    if (!currentStory) return;
    if (isPlaying) {
      TTS.pause();
      setPlaying(false);
    } else {
      if (TTS.isPaused()) { TTS.resume(); setPlaying(true); }
      else                { playStory(); }
    }
  });

  replayBtn.addEventListener('click', () => { if (currentStory) playStory(); });

  muteBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    TTS.setMuted(isMuted);
    muteBtn.textContent = isMuted ? '🔇' : '🔊';
  });

  skipBtn.addEventListener('click', generateStory);

  /* ── Keyboard shortcuts ── */
  document.addEventListener('keydown', e => {
    // Don't fire when typing in inputs
    if (e.target.tagName === 'INPUT') return;
    switch (e.code) {
      case 'Space':      e.preventDefault(); playPauseBtn.click(); break;
      case 'ArrowRight':
      case 'KeyN':       skipBtn.click();    break;
      case 'KeyR':       replayBtn.click();  break;
      case 'KeyM':       muteBtn.click();    break;
      case 'Enter':      generateBtn.click();break;
    }
  });

  /* ── Init ── */
  function init() {
    applyTheme('all');
    clearProgress(90);   // default display: 0:00 / 1:30

    // Kick-start speech synthesis voice loading
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.addEventListener('voiceschanged', () => {}, { once: true });
    }

    storyTitle.textContent = 'Press ⚡ Generate to start your 1–2 minute sports story';
  }

  init();

})();
