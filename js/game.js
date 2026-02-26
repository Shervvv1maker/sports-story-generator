/* ============================================================
   GAME.JS — Pseudo-3D Perspective Endless Runner
   ─────────────────────────────────────────────────────────
   Subway Surfers-style top-down 3/4 perspective view:
   • Vanishing point at centre-top
   • Three lanes converging at horizon
   • Character runs in the centre lane, swaps left/right
   • Obstacles grow from tiny (far) to large (near)
   • Coins float above track, collected as player passes
   • Parallax city silhouette in background
   • Neon-lit night aesthetic
   Controls: ←→ / A D = lane swap   Space / Up = jump
   ============================================================ */

'use strict';

(function () {

  /* ── Canvas ── */
  const canvas = document.getElementById('bgCanvas');
  const ctx    = canvas.getContext('2d');
  const CW = 540, CH = 960;   // canvas native resolution

  /* ── Perspective constants ── */
  const VP   = { x: CW / 2, y: CH * 0.34 };   // vanishing point
  const GND  = CH - 40;                         // ground baseline
  const LANE_SPREAD = CW * 0.28;                // half-width of all lanes at ground

  /* Lane centres at ground level */
  const LANES = [-1, 0, 1];
  function laneX(lane) { return VP.x + lane * LANE_SPREAD; }

  /* Project a world position to screen:
     lane  : -1 | 0 | 1
     depth : 0 (player, bottom) → 1 (horizon, top)  */
  function project(lane, depth) {
    const t  = 1 - depth;            // 0=horizon, 1=player
    const x  = VP.x + lane * LANE_SPREAD * t;
    const y  = VP.y + (GND - VP.y) * t;
    const sc = t;
    return { x, y, sc };
  }

  /* ── State ── */
  let frame       = 0;
  let speed       = 0.012;    // depth units consumed per frame
  let score       = 0;
  let running     = true;
  let playerLane  = 0;        // -1 | 0 | 1
  let playerJump  = 0;        // jump height above ground (0 = on ground)
  let jumpVel     = 0;
  let invincible  = 0;
  let lives       = 3;

  /* Track scrolling offset (0..1 repeating) */
  let trackOff = 0;

  /* City scroll */
  let cityOff = 0;

  const obstacles = [];
  const coins     = [];
  const particles = [];
  let spawnCD     = 60;

  /* ── Controls ── */
  document.addEventListener('keydown', e => {
    if (e.code === 'ArrowLeft'  || e.code === 'KeyA') moveLane(-1);
    if (e.code === 'ArrowRight' || e.code === 'KeyD') moveLane(1);
    if (e.code === 'Space' || e.code === 'ArrowUp')   { e.preventDefault(); doJump(); }
  });

  /* Touch swipe */
  let touchStartX = null;
  canvas.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  canvas.addEventListener('touchend',   e => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) < 20) { doJump(); }
    else if (dx < 0) moveLane(-1);
    else             moveLane(1);
    touchStartX = null;
  });
  canvas.addEventListener('click', doJump);

  function moveLane(dir) {
    playerLane = Math.max(-1, Math.min(1, playerLane + dir));
  }
  function doJump() {
    if (playerJump === 0) { jumpVel = -18; }
  }

  /* ── Spawn obstacles / coins ── */
  const OBS_SHAPES = [
    { color: '#e8002d', label: '🚧', h: 0.08 },
    { color: '#ff9900', label: '⚠', h: 0.05 },
    { color: '#00bfff', label: '🛑', h: 0.09 },
  ];
  const COIN_SPORTS = ['🏈','🏀','⚾','⚽','⛳','💰','⭐'];

  function spawnObstacle() {
    const lane  = LANES[Math.floor(Math.random() * 3)];
    const shape = OBS_SHAPES[Math.floor(Math.random() * OBS_SHAPES.length)];
    obstacles.push({ lane, depth: 0.98, shape, alive: true });
  }

  function spawnCoin() {
    const lane  = LANES[Math.floor(Math.random() * 3)];
    const emoji = COIN_SPORTS[Math.floor(Math.random() * COIN_SPORTS.length)];
    coins.push({ lane, depth: 0.96, emoji, alive: true, pts: emoji === '⭐' || emoji === '💰' ? 25 : 10 });
  }

  /* ── Particles ── */
  function burst(x, y, color, n = 12) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 2 + Math.random() * 5;
      particles.push({ x, y, vx: Math.cos(a)*s, vy: Math.sin(a)*s - 3,
        r: 3 + Math.random()*4, color, life: 1, dec: .03 + Math.random()*.02 });
    }
  }

  function scorePop(x, y, text) {
    const rect = canvas.getBoundingClientRect();
    const sx = rect.left + x * (rect.width / CW);
    const sy = rect.top  + y * (rect.height / CH);
    const el = document.createElement('div');
    el.className = 'scorePop';
    el.textContent = text;
    el.style.left = sx + 'px'; el.style.top = sy + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 920);
  }

  function updateHUD() {
    const sv = document.getElementById('scoreValue');
    if (sv) sv.textContent = score;
  }

  /* ── Background ── */
  function drawSky() {
    const g = ctx.createLinearGradient(0, 0, 0, VP.y + 60);
    g.addColorStop(0,   '#06060f');
    g.addColorStop(0.5, '#0b0b1e');
    g.addColorStop(1,   '#12122a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, CW, VP.y + 60);
  }

  /* Stars (stable) */
  const STARS = Array.from({ length: 60 }, (_, i) => ({
    x: (((i * 137 + 19) % 100) / 100) * CW,
    y: (((i * 97  + 37) % 40)  / 100) * CH,
    r: 0.8 + (i % 3) * 0.6,
  }));
  function drawStars() {
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    STARS.forEach(s => { ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill(); });
  }

  /* City silhouette (parallax layer) */
  const BUILDINGS = (() => {
    const arr = [];
    let x = 0;
    while (x < CW * 3) {
      const w = 40 + Math.random() * 80;
      const h = 60 + Math.random() * 180;
      const hasLights = Math.random() > 0.5;
      arr.push({ x, w, h, hasLights,
        windowR: Math.random() > .5 ? '#ffee88' : '#88ccff' });
      x += w + 4 + Math.random() * 20;
    }
    return arr;
  })();

  function drawCity() {
    cityOff = (cityOff - speed * 30) % (CW * 1.5);
    const baseY = VP.y + 20;
    BUILDINGS.forEach(b => {
      const bx = ((b.x + cityOff) % (CW * 3)) - CW * 0.5;
      if (bx > CW + 20 || bx + b.w < -20) return;
      /* building body */
      ctx.fillStyle = '#15152a';
      ctx.fillRect(bx, baseY - b.h, b.w, b.h);
      /* windows */
      if (b.hasLights) {
        ctx.fillStyle = b.windowR;
        ctx.globalAlpha = .3 + .2 * Math.sin(frame * .02 + b.x);
        for (let wy = baseY - b.h + 8; wy < baseY - 6; wy += 16) {
          for (let wx = bx + 6; wx < bx + b.w - 6; wx += 14) {
            ctx.fillRect(wx, wy, 6, 8);
          }
        }
        ctx.globalAlpha = 1;
      }
    });
  }

  /* Ground */
  function drawGround() {
    /* ground fill */
    const gg = ctx.createLinearGradient(0, VP.y, 0, GND);
    gg.addColorStop(0, '#0a1810');
    gg.addColorStop(1, '#0e2018');
    ctx.fillStyle = gg;
    ctx.beginPath();
    ctx.moveTo(0, VP.y);
    ctx.lineTo(CW, VP.y);
    ctx.lineTo(CW, GND);
    ctx.lineTo(0, GND);
    ctx.closePath();
    ctx.fill();

    /* horizon glow */
    const hg = ctx.createLinearGradient(0, VP.y - 10, 0, VP.y + 40);
    hg.addColorStop(0, 'rgba(0,200,100,0)');
    hg.addColorStop(0.5,'rgba(0,200,100,.12)');
    hg.addColorStop(1, 'rgba(0,200,100,0)');
    ctx.fillStyle = hg;
    ctx.fillRect(0, VP.y - 10, CW, 50);

    /* Lane dividers — converge to VP */
    const laneEdges = [-1.5, -0.5, 0.5, 1.5];
    laneEdges.forEach(le => {
      const bx = VP.x + le * LANE_SPREAD;
      ctx.beginPath();
      ctx.moveTo(VP.x, VP.y);
      ctx.lineTo(bx, GND);
      ctx.strokeStyle = 'rgba(0,255,120,.18)';
      ctx.lineWidth = (le === -0.5 || le === 0.5) ? 2 : 3;
      ctx.stroke();
    });

    /* Horizontal track lines (scrolling toward player) */
    trackOff = (trackOff + speed) % 0.08;
    for (let d = trackOff; d < 1; d += 0.08) {
      const l = project(-1.5, d);
      const r = project(1.5,  d);
      ctx.beginPath();
      ctx.moveTo(l.x, l.y);
      ctx.lineTo(r.x, r.y);
      const alpha = (1 - d) * 0.15;
      ctx.strokeStyle = `rgba(0,255,120,${alpha})`;
      ctx.lineWidth = (1 - d) * 3;
      ctx.stroke();
    }

    /* Neon trim at ground level */
    ctx.beginPath();
    ctx.moveTo(0, GND); ctx.lineTo(CW, GND);
    ctx.strokeStyle = 'rgba(0,255,120,.5)';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#00ff7a'; ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  /* ── Draw character ── */
  const RUN_FRAMES = ['🏃', '🏃'];
  function drawCharacter() {
    const pos   = project(playerLane, 0.0);
    const scale = 1.1;
    const w     = 60 * scale;
    const jump  = playerJump;
    const cx    = pos.x;
    const cy    = GND - 10 - jump;
    const flash = invincible > 0 && Math.floor(invincible / 4) % 2 === 0;
    if (flash) return;

    /* Shadow */
    ctx.save();
    ctx.globalAlpha = 0.3 - jump * 0.003;
    ctx.fillStyle = 'rgba(0,0,0,.5)';
    ctx.beginPath();
    ctx.ellipse(cx, GND - 5, w * 0.5, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    /* Character emoji — bounce legs */
    ctx.save();
    ctx.font = `${w}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.shadowColor  = '#00ff7a';
    ctx.shadowBlur   = 16;
    const legBounce = playerJump > 0 ? 0 : Math.sin(frame * 0.25) * 3;
    ctx.fillText('🏃', cx, cy + legBounce);
    ctx.restore();

    /* Speed trail */
    if (speed > 0.016) {
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.font = `${w}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText('🏃', cx - 20, cy + legBounce + 4);
      ctx.globalAlpha = 0.06;
      ctx.fillText('🏃', cx - 38, cy + legBounce + 8);
      ctx.restore();
    }
  }

  /* ── Draw obstacles ── */
  function drawObstacle(ob) {
    const pos  = project(ob.lane, ob.depth);
    const size = pos.sc * 80;
    if (size < 4) return;
    /* box */
    ctx.save();
    ctx.shadowColor = ob.shape.color;
    ctx.shadowBlur  = 10 * pos.sc;
    ctx.fillStyle   = ob.shape.color;
    ctx.fillRect(pos.x - size * 0.4, pos.y - size * ob.shape.h * 8, size * 0.8, size * ob.shape.h * 8);
    /* warning stripe */
    ctx.globalAlpha = .7;
    ctx.fillStyle = '#fff';
    ctx.font = `${size * 0.5}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(ob.shape.label, pos.x, pos.y);
    ctx.restore();
  }

  /* ── Draw coins ── */
  function drawCoin(c) {
    const pos  = project(c.lane, c.depth);
    const size = pos.sc * 52;
    if (size < 4) return;
    const bobY = pos.y - size * 1.2 + Math.sin(frame * .08 + c.lane) * 5 * pos.sc;
    ctx.save();
    ctx.shadowColor = '#ffe500';
    ctx.shadowBlur  = 14 * pos.sc;
    ctx.font = `${size}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(c.emoji, pos.x, bobY);
    ctx.restore();
  }

  /* ── Draw particles ── */
  function drawParticles() {
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  /* ── Lives display (inside canvas) ── */
  function drawLives() {
    ctx.save();
    ctx.font = '28px serif';
    ctx.textBaseline = 'top';
    for (let i = 0; i < 3; i++) {
      ctx.globalAlpha = i < lives ? 1 : 0.2;
      ctx.fillText('❤️', 16 + i * 34, 150);
    }
    ctx.restore();
  }

  /* ── Collision detection ── */
  function checkCollisions() {
    obstacles.forEach(ob => {
      if (!ob.alive) return;
      if (ob.depth > 0.05) return;
      if (ob.lane !== playerLane) return;
      if (playerJump > 20) return; // jumped over
      ob.alive = false;
      if (invincible === 0) {
        lives = Math.max(0, lives - 1);
        invincible = 80;
        if (lives === 0) { lives = 3; score = Math.max(0, score - 50); }
        updateHUD();
        const pos = project(playerLane, 0);
        burst(pos.x, GND - 20, '#ff4444');
      }
    });

    coins.forEach(c => {
      if (!c.alive) return;
      if (c.depth > 0.05) return;
      if (c.lane !== playerLane) return;
      c.alive = false;
      score += c.pts;
      updateHUD();
      const pos = project(c.lane, 0);
      burst(pos.x, GND - 60, '#ffe500', 8);
      scorePop(pos.x, GND - 80, '+' + c.pts);
    });
  }

  /* ── Main loop ── */
  function loop() {
    if (!running) return;
    requestAnimationFrame(loop);
    frame++;

    /* Speed ramp */
    speed = 0.012 + Math.min(frame / 8000, 0.010);

    /* Physics */
    if (playerJump > 0 || jumpVel < 0) {
      jumpVel += 1.1;
      playerJump = Math.max(0, playerJump - jumpVel);
      if (playerJump === 0) jumpVel = 0;
    }
    if (invincible > 0) invincible--;

    /* Spawn */
    spawnCD--;
    if (spawnCD <= 0) {
      if (Math.random() < 0.55) spawnObstacle(); else spawnCoin();
      spawnCD = Math.max(35, 70 - Math.floor(frame / 300));
    }

    /* Move */
    obstacles.forEach(ob => { ob.depth -= speed; });
    coins.forEach(c     => { c.depth  -= speed; });

    /* Particles */
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.2;
      p.life -= p.dec;
      if (p.life <= 0) particles.splice(i, 1);
    }

    /* Remove dead */
    for (let i = obstacles.length - 1; i >= 0; i--)
      if (!obstacles[i].alive || obstacles[i].depth < -0.02) obstacles.splice(i, 1);
    for (let i = coins.length - 1; i >= 0; i--)
      if (!coins[i].alive || coins[i].depth < -0.02) coins.splice(i, 1);

    /* Auto score */
    if (frame % 5 === 0) { score++; if (frame % 60 === 0) updateHUD(); }

    /* Collisions */
    checkCollisions();

    /* ── DRAW ── */
    ctx.clearRect(0, 0, CW, CH);
    drawSky();
    drawStars();
    drawCity();
    drawGround();

    /* Coins (far first) */
    coins.slice().sort((a,b) => b.depth - a.depth).forEach(drawCoin);

    /* Obstacles (far first) */
    obstacles.slice().sort((a,b) => b.depth - a.depth).forEach(drawObstacle);

    drawCharacter();
    drawParticles();
    drawLives();
  }

  /* ── Inject score HUD into viewport ── */
  const vp = document.getElementById('videoViewport');
  if (vp && !document.getElementById('scoreHUD')) {
    vp.insertAdjacentHTML('beforeend',
      `<div id="scoreHUD"><div id="scoreLabel">SCORE</div><div id="scoreValue">0</div></div>`);
  }

  /* ── Public API ── */
  window.BallGame = {
    start()    { running = true; loop(); },
    stop()     { running = false; },
    reset()    { score = 0; lives = 3; frame = 0; speed = 0.012;
                 obstacles.length = 0; coins.length = 0; particles.length = 0;
                 playerLane = 0; playerJump = 0; jumpVel = 0; invincible = 0;
                 spawnCD = 60; updateHUD(); },
    getScore() { return score; },
  };

  window.BallGame.start();

})();
