/* ============================================================
   SOCIAL.JS — Social Media Posting Helpers + Scheduler
   ─────────────────────────────────────────────────────────
   Strategy (client-side only — no server needed):
   • TikTok / YouTube / Instagram:
       Download video → open platform upload page → user posts manually
       (Direct API upload requires server-side client_secret on TikTok/IG;
        YouTube supports PKCE OAuth but still needs a registered app)
   • Scheduling:
       Store { platform, time, storyTitle } in localStorage.
       Poll via setInterval to fire at the right time.
       Notification API used if permission granted.
   ============================================================ */

'use strict';

window.Social = (function () {

  const LS_KEY = 'ssg_schedules_v2';

  const PLATFORMS = {
    tiktok:    { name: 'TikTok',    url: 'https://www.tiktok.com/upload',                 emoji: '📱' },
    youtube:   { name: 'YouTube',   url: 'https://studio.youtube.com/channel/UC/videos/upload', emoji: '▶' },
    instagram: { name: 'Instagram', url: 'https://www.instagram.com/create/style/',        emoji: '📸' },
  };

  /* ── Persistence helpers ── */
  function loadSchedules() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
    catch { return []; }
  }

  function saveSchedules(arr) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(arr)); } catch {}
  }

  function genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  /* ── Active timer map ── */
  const timers = {};

  /* ── Public API ── */
  return {

    PLATFORMS,

    /* Download video + open platform upload page */
    postNow(platform, filename) {
      const p = PLATFORMS[platform];
      if (!p) return;

      /* Download the current recording */
      if (window.VideoRecorder && VideoRecorder.hasVideo()) {
        VideoRecorder.download(filename || `sports-story-${platform}-${Date.now()}.webm`);
      }

      /* Small delay so download dialog appears first, then open upload page */
      setTimeout(() => {
        window.open(p.url, '_blank', 'noopener,noreferrer');
      }, 600);
    },

    /* Copy a ready-to-paste caption to the clipboard.
       Returns true on success, false if clipboard access is denied. */
    async copyCaption(title, content) {
      const hashtags = '#sports #history #viral #shorts #fyp #sportsstory';
      const preview  = content ? content.slice(0, 220).trimEnd() + '…' : '';
      const text     = `${title}\n\n${preview}\n\n${hashtags}`;
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        /* Fallback: execCommand (deprecated but still works in some contexts) */
        try {
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed'; ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          ta.remove();
          return true;
        } catch { return false; }
      }
    },

    /* Schedule a post for a future time.
       Returns the scheduled item object. */
    schedule(platform, scheduledAtMs, storyTitle, filename) {
      const item = {
        id:          genId(),
        platform,
        scheduledAt: scheduledAtMs,
        storyTitle:  storyTitle || 'Sports Story',
        filename:    filename   || `sports-story-${Date.now()}.webm`,
        created:     Date.now(),
      };

      const list = loadSchedules();
      list.push(item);
      saveSchedules(list);

      this._arm(item);
      return item;
    },

    /* Retrieve all scheduled items (sorted by time) */
    getSchedules() {
      return loadSchedules().sort((a, b) => a.scheduledAt - b.scheduledAt);
    },

    /* Cancel a scheduled item by id */
    cancel(id) {
      saveSchedules(loadSchedules().filter(s => s.id !== id));
      if (timers[id]) { clearTimeout(timers[id]); delete timers[id]; }
    },

    /* ── Internal: arm the setTimeout for one item ── */
    _arm(item) {
      const delay = item.scheduledAt - Date.now();
      if (delay <= 0) return; /* already past */

      timers[item.id] = setTimeout(() => {
        this._fire(item);
      }, Math.min(delay, 2_147_483_647)); /* setTimeout max safe int */
    },

    /* ── Internal: fire a scheduled post ── */
    _fire(item) {
      /* Remove from storage & timers */
      this.cancel(item.id);

      /* Attempt download + open */
      this.postNow(item.platform, item.filename);

      /* Browser notification */
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(
          `🎬 Posting to ${PLATFORMS[item.platform]?.name || item.platform}`,
          {
            body: item.storyTitle,
            tag:  'ssg-schedule-' + item.id,
          }
        );
      }

      /* Let the UI know */
      window.dispatchEvent(new CustomEvent('ssg:scheduleFired', { detail: item }));
    },

    /* ── Init: restore existing schedules + request notification permission ── */
    init() {
      /* Prune expired schedules */
      const now  = Date.now();
      const live = loadSchedules().filter(s => s.scheduledAt > now);
      saveSchedules(live);

      /* Re-arm live timers */
      live.forEach(s => this._arm(s));

      /* Request notification permission (non-blocking) */
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }

      /* Set min attribute on schedule input to now + 1 min */
      const inp = document.getElementById('scheduleInput');
      if (inp) {
        const min = new Date(Date.now() + 60_000);
        inp.min = min.toISOString().slice(0, 16);
      }
    },
  };

})();
