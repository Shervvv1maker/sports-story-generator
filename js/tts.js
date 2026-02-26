/* =============================================
   TTS.JS — AI Voice Narration + Caption Sync
   ─────────────────────────────────────────────
   Web Speech API wrapper for 1–2 minute stories.
   Breaks content into ~40-word sentence chunks
   and chains utterances to avoid browser
   30-second speech timeout bugs in Chrome/Edge.
   Word-by-word captions sync via boundary events
   + a polled fallback timer.
   ============================================= */

'use strict';

(function () {

  const synth = window.speechSynthesis;

  /* ── State ── */
  let chunks       = [];      // array of sentence-chunk strings
  let chunkIdx     = 0;       // current chunk being spoken
  let allWords     = [];      // flat word array for captions
  let wordPtr      = 0;       // global word pointer across chunks
  let chunkWordOff = [];      // word offset per chunk

  let onProgressCB = null;
  let onDoneCB     = null;
  let isMuted      = false;
  let startTime    = 0;
  let totalWords   = 0;
  let totalDurMs   = 0;
  let poller       = null;
  let stopped      = false;

  const captionEl = document.getElementById('captionText');

  /* ── Voice selection ── */
  function getBestVoice() {
    const all = synth.getVoices();
    const pref = [
      'Google US English',
      'Microsoft David Desktop',
      'Microsoft Mark Desktop',
      'Microsoft David',
      'Microsoft Mark',
      'Alex',
      'Daniel',
    ];
    for (const name of pref) {
      const v = all.find(v => v.name.includes(name));
      if (v) return v;
    }
    return all.find(v => v.lang.startsWith('en')) || all[0] || null;
  }

  /* ── Split long text into ~40-word chunks at sentence boundaries ── */
  function splitChunks(text) {
    // Normalise whitespace
    text = text.replace(/\s+/g, ' ').trim();
    // Split on sentence-ending punctuation
    const sentences = text.match(/[^.!?]+[.!?]+[\s]*/g) || [text];
    const out = [];
    let buf = '';
    for (const s of sentences) {
      if ((buf + s).trim().split(/\s+/).length > 40 && buf.trim()) {
        out.push(buf.trim());
        buf = s;
      } else {
        buf += s;
      }
    }
    if (buf.trim()) out.push(buf.trim());
    return out.length ? out : [text];
  }

  /* ── Build caption spans ── */
  function buildCaption(text) {
    if (!captionEl) return;
    captionEl.innerHTML = '';
    allWords = text.split(/\s+/).filter(Boolean);
    totalWords = allWords.length;
    allWords.forEach((w, i) => {
      const sp = document.createElement('span');
      sp.className  = 'cw';
      sp.dataset.wi = i;
      sp.textContent = w + ' ';
      captionEl.appendChild(sp);
    });
    wordPtr = 0;
  }

  /* ── Show caption window around current word ── */
  const WIN = 14;
  function showWindow(idx) {
    if (!captionEl) return;
    const spans = captionEl.querySelectorAll('.cw');
    const start = Math.max(0, idx - 1);
    const end   = start + WIN;
    spans.forEach((s, i) => {
      s.style.display = (i >= start && i < end) ? '' : 'none';
      s.classList.toggle('cw-active', i === idx);
    });
  }

  /* ── Progress-based word polling (fallback) ── */
  function startPoller() {
    clearInterval(poller);
    poller = setInterval(() => {
      if (stopped) { clearInterval(poller); return; }
      const elapsed = Date.now() - startTime;
      const ratio   = Math.min(elapsed / totalDurMs, 1);
      const estIdx  = Math.min(Math.floor(ratio * totalWords), totalWords - 1);
      if (estIdx !== wordPtr) {
        wordPtr = estIdx;
        showWindow(wordPtr);
      }
      if (onProgressCB) onProgressCB(ratio);
    }, 100);
  }

  /* ── Speak one chunk ── */
  function speakChunk(idx) {
    if (stopped || idx >= chunks.length) {
      clearInterval(poller);
      if (!stopped) {
        showWindow(-1);
        if (onProgressCB) onProgressCB(1);
        if (onDoneCB) onDoneCB();
      }
      return;
    }

    const text = chunks[idx];
    const utt  = new SpeechSynthesisUtterance(text);
    utt.rate   = 1.05;
    utt.pitch  = 0.90;
    utt.volume = isMuted ? 0 : 1;

    const assignV = () => {
      const v = getBestVoice();
      if (v) utt.voice = v;
    };
    if (synth.getVoices().length) assignV();
    else synth.addEventListener('voiceschanged', assignV, { once: true });

    /* word offset for this chunk in allWords */
    const baseOffset = chunkWordOff[idx] || 0;

    utt.onboundary = e => {
      if (e.name !== 'word' || stopped) return;
      // Map charIndex within chunk to word index
      const chunkText   = chunks[idx];
      const chunkWords  = chunkText.split(/\s+/).filter(Boolean);
      let pos = 0, wi = 0;
      while (pos < e.charIndex && wi < chunkWords.length - 1) {
        pos += chunkWords[wi].length + 1;
        wi++;
      }
      const globalIdx = baseOffset + wi;
      if (globalIdx !== wordPtr) {
        wordPtr = globalIdx;
        showWindow(wordPtr);
      }
      const ratio = Math.min((Date.now() - startTime) / totalDurMs, 1);
      if (onProgressCB) onProgressCB(ratio);
    };

    utt.onend = () => {
      if (stopped) return;
      chunkIdx = idx + 1;
      speakChunk(chunkIdx);
    };

    utt.onerror = e => {
      if (e.error === 'interrupted' || e.error === 'canceled') return;
      console.warn('TTS chunk error:', e.error);
      // skip to next chunk
      if (!stopped) { chunkIdx = idx + 1; speakChunk(chunkIdx); }
    };

    synth.speak(utt);
  }

  /* ─────────────────────────────────────
     PUBLIC API
  ──────────────────────────────────── */
  window.TTS = {

    speak(text, { onProgress, onDone } = {}) {
      TTS.stop();
      stopped = false;

      onProgressCB = onProgress || null;
      onDoneCB     = onDone     || null;

      buildCaption(text);

      chunks = splitChunks(text);

      // Precompute word offsets per chunk
      chunkWordOff = [];
      let off = 0;
      chunks.forEach(c => {
        chunkWordOff.push(off);
        off += c.split(/\s+/).filter(Boolean).length;
      });

      // Estimate total duration: ~152 wpm
      totalDurMs = Math.round((totalWords / (145 * 1.05)) * 60 * 1000);

      startTime = Date.now();
      chunkIdx  = 0;
      wordPtr   = 0;

      startPoller();
      speakChunk(0);
    },

    pause() { synth.pause(); },
    resume(){ synth.resume(); },

    stop() {
      stopped = true;
      clearInterval(poller);
      synth.cancel();
      chunks = []; allWords = []; wordPtr = 0; chunkIdx = 0;
    },

    setMuted(m) {
      isMuted = m;
      // Volume change takes effect on next chunk start
    },

    isSpeaking() { return synth.speaking; },
    isPaused()   { return synth.paused; },

    clearCaption() {
      if (captionEl) captionEl.innerHTML = '';
    },
  };

})();
