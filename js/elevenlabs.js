/* ============================================================
   ELEVENLABS.JS — Human British AI Voice + Word Timestamps
   ─────────────────────────────────────────────────────────
   Uses ElevenLabs REST API (/with-timestamps endpoint) to:
     1. Fetch high-quality British-sounding AI audio
     2. Get exact word-level timing for caption sync
   Falls back gracefully to Web Speech API if no key is set.
   ============================================================ */

'use strict';

window.ElevenLabs = (function () {

  const API_BASE = 'https://api.elevenlabs.io/v1';
  const LS_KEY   = 'el_api_key';

  /* ── Key management ── */
  function getKey()        { return localStorage.getItem(LS_KEY) || ''; }
  function setKey(k)       { localStorage.setItem(LS_KEY, k.trim()); }
  function clearKey()      { localStorage.removeItem(LS_KEY); }
  function hasKey()        { return !!getKey(); }

  /* ── Voice settings ── */
  const VOICE_SETTINGS = {
    stability:          0.55,
    similarity_boost:   0.80,
    style:              0.20,
    use_speaker_boost:  true,
  };

  /* ── Fetch audio + word timestamps from ElevenLabs ──
     Returns: { audioBuffer: AudioBuffer, words: [{word, start, end}] }
  ── */
  async function fetchWithTimestamps(text, voiceId, audioCtx) {
    const key = getKey();
    if (!key) throw new Error('NO_KEY');

    const resp = await fetch(`${API_BASE}/text-to-speech/${voiceId}/with-timestamps`, {
      method:  'POST',
      headers: {
        'xi-api-key':   key,
        'Content-Type': 'application/json',
        'Accept':       'application/json',
      },
      body: JSON.stringify({
        text,
        model_id:         'eleven_turbo_v2_5',   // fast, high-quality
        voice_settings:    VOICE_SETTINGS,
        output_format:    'mp3_44100_128',
      }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err?.detail?.message || `ElevenLabs error ${resp.status}`);
    }

    const data = await resp.json();

    /* Decode audio */
    const raw  = atob(data.audio_base64);
    const buf  = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i);
    const audioBuffer = await audioCtx.decodeAudioData(buf.buffer);

    /* Build word timestamps from character alignment */
    const align = data.alignment || data.normalized_alignment;
    const words = buildWordTimings(text, align);

    return { audioBuffer, words };
  }

  /* ── Map character-level alignment → word timing ──
     align: { characters[], character_start_times_seconds[], character_end_times_seconds[] }
  ── */
  function buildWordTimings(text, align) {
    if (!align?.characters) return [];

    const chars      = align.characters;
    const starts     = align.character_start_times_seconds;
    const ends       = align.character_end_times_seconds;

    const words = [];
    let   wordBuf = '';
    let   wordStart = 0;

    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i];
      if (ch === ' ' || ch === '\n') {
        if (wordBuf.length > 0) {
          words.push({ word: wordBuf, start: wordStart, end: ends[i - 1] || ends[i] });
          wordBuf = '';
        }
      } else {
        if (wordBuf === '') wordStart = starts[i];
        wordBuf += ch;
      }
    }
    if (wordBuf.length > 0) {
      words.push({ word: wordBuf, start: wordStart, end: ends[ends.length - 1] });
    }
    return words;
  }

  /* ── Browser TTS fallback (returns promise) ──
     Uses the best available en-GB voice.
     Wraps SpeechSynthesisUtterance into a
     { audioBuffer: null, words: estimatedWordTimings } object
     so the caller can handle both paths uniformly.
  ── */
  function estimateBrowserWords(text) {
    const wordList = text.split(/\s+/).filter(Boolean);
    const wpm = 140;
    const secPerWord = 60 / wpm;
    let t = 0;
    return wordList.map(w => {
      const dur = secPerWord * (0.8 + w.length * 0.05);
      const entry = { word: w, start: t, end: t + dur };
      t += dur + 0.04;
      return entry;
    });
  }

  function getBestBritishVoice() {
    const voices = speechSynthesis.getVoices();
    const pref = [
      'Google UK English Male',
      'Google UK English Female',
      'Microsoft George',
      'Microsoft Hazel',
      'Daniel',
      'en-GB',
    ];
    for (const p of pref) {
      const v = voices.find(v => v.name.includes(p) || v.lang === p);
      if (v) return v;
    }
    return voices.find(v => v.lang.startsWith('en-GB')) ||
           voices.find(v => v.lang.startsWith('en'))    ||
           voices[0] || null;
  }

  /* Chunk text into ≤200-char sentences to avoid mobile TTS cutoff */
  function chunkText(text) {
    const sentences = text.match(/[^.!?]+[.!?]+[\s]*/g) || [text];
    const chunks = []; let buf = '';
    for (const s of sentences) {
      if ((buf + s).length > 250 && buf) { chunks.push(buf.trim()); buf = s; }
      else buf += s;
    }
    if (buf.trim()) chunks.push(buf.trim());
    return chunks.length ? chunks : [text];
  }

  /* ── Public API ── */
  return {
    getKey, setKey, clearKey, hasKey,

    /* Main speak function.
       opts: { voiceId, onWord(idx,word,start,end), onProgress(0-1), onDone, audioCtx }
       Returns a controller: { stop() }
    */
    async speak(text, opts = {}) {
      const { voiceId, onWord, onProgress, onDone, audioCtx } = opts;
      let stopped = false;
      const ctrl  = { stop() { stopped = true; } };

      /* ── ElevenLabs path ── */
      if (hasKey() && voiceId && voiceId !== 'browser' && audioCtx) {
        try {
          const { audioBuffer, words } = await fetchWithTimestamps(text, voiceId, audioCtx);
          if (stopped) return ctrl;

          const source = audioCtx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioCtx.destination);

          const duration = audioBuffer.duration;
          const startAt  = audioCtx.currentTime;

          /* Word callbacks via setTimeout */
          words.forEach((w, i) => {
            const delay = w.start * 1000;
            const id    = setTimeout(() => {
              if (!stopped && onWord) onWord(i, w.word, w.start, w.end);
            }, delay);
            ctrl['_t' + i] = id;
          });

          /* Progress poller */
          const poller = setInterval(() => {
            if (stopped) { clearInterval(poller); return; }
            const elapsed = audioCtx.currentTime - startAt;
            if (onProgress) onProgress(Math.min(elapsed / duration, 1));
            if (elapsed >= duration) clearInterval(poller);
          }, 120);
          ctrl._poller = poller;

          source.onended = () => {
            clearInterval(poller);
            if (!stopped && onDone) onDone();
          };

          ctrl.stop = () => {
            stopped = true;
            clearInterval(poller);
            try { source.stop(); } catch {}
          };

          source.start();
          return ctrl;

        } catch (err) {
          if (stopped) return ctrl;
          if (err.message !== 'NO_KEY') {
            console.warn('[ElevenLabs] API error, falling back to browser TTS:', err.message);
          }
          /* Fall through to browser TTS */
        }
      }

      /* ── Browser TTS fallback ── */
      ctrl.stop = () => { stopped = true; speechSynthesis.cancel(); };

      const chunks     = chunkText(text);
      const wordTimings = estimateBrowserWords(text);
      let   chunkIdx   = 0;
      let   startTime  = Date.now();
      const totalDurMs = (wordTimings.at(-1)?.end || 90) * 1000;

      /* Word dispatch via setTimeout */
      wordTimings.forEach((w, i) => {
        const id = setTimeout(() => {
          if (!stopped && onWord) onWord(i, w.word, w.start, w.end);
        }, w.start * 1000);
        ctrl['_b' + i] = id;
      });

      /* Progress poller */
      const pp = setInterval(() => {
        if (stopped) { clearInterval(pp); return; }
        const r = Math.min((Date.now() - startTime) / totalDurMs, 1);
        if (onProgress) onProgress(r);
      }, 120);
      ctrl._pp = pp;

      function speakChunk(idx) {
        if (stopped || idx >= chunks.length) {
          clearInterval(pp);
          if (!stopped && onDone) onDone();
          return;
        }
        const utt    = new SpeechSynthesisUtterance(chunks[idx]);
        utt.rate     = 1.0;
        utt.pitch    = 0.92;
        utt.volume   = 1;
        const v = getBestBritishVoice();
        if (v) utt.voice = v;
        utt.onend    = () => { if (!stopped) speakChunk(idx + 1); };
        utt.onerror  = e => { if (e.error !== 'interrupted' && !stopped) speakChunk(idx + 1); };
        speechSynthesis.speak(utt);
      }

      if (speechSynthesis.getVoices().length) {
        speakChunk(0);
      } else {
        speechSynthesis.addEventListener('voiceschanged', () => speakChunk(0), { once: true });
      }

      ctrl.stop = () => {
        stopped = true;
        clearInterval(pp);
        speechSynthesis.cancel();
        /* clear all word timers */
        wordTimings.forEach((_, i) => clearTimeout(ctrl['_b' + i]));
      };

      return ctrl;
    },

    /* Validate key with a lightweight API call */
    async validateKey(key) {
      try {
        const r = await fetch(`${API_BASE}/user`, {
          headers: { 'xi-api-key': key },
          signal: AbortSignal.timeout(5000),
        });
        if (!r.ok) return false;
        const d = await r.json();
        return !!d.subscription;
      } catch { return false; }
    },
  };

})();
