/* =============================================
   GAME.JS — Subway Surfers-Style Endless Runner
   ─────────────────────────────────────────────
   A full parallax endless runner with:
   • 3 scrolling background layers (sky/stands, field, ground)
   • Running athlete character with jump + slide
   • Obstacles scrolling from right (hurdles, barriers, cones)
   • Collectible coins/balls that boost score
   • Increasing speed over time
   • Space / click / tap = jump; Down / swipe down = slide
   Lives system (3 lives — hits make char flash, not game over)
   so it never interrupts the story narration.
   ============================================= */

'use strict';

(function () {

  const canvas = document.getElementById('bgCanvas');
  const ctx    = canvas.getContext('2d');
  let W, H, GROUND_Y;

  function resize() {
    const app = document.getElementById('app');
    W = canvas.width  = app.clientWidth  || 390;
    H = canvas.height = app.clientHeight || 844;
    GROUND_Y = H * 0.72;
  }
  window.addEventListener('resize', resize);
  resize();

  /* ─────────────────── CONSTANTS ─────────────── */
  const GRAVITY    = 0.55;
  const JUMP_VY    = -13;
  const BASE_SPEED = 4;
  const CHAR_X     = 80;
  const CHAR_W     = 34;
  const CHAR_H     = 50;

  /* ─────────────────── STATE ─────────────────── */
  let speed       = BASE_SPEED;
  let frameCount  = 0;
  let score       = 0;
  let lives       = 3;
  let invincible  = 0;   // frames of invincibility after hit
  let running     = true;

  /* ─────────────────── CHAR ───────────────────── */
  const char = {
    y:       GROUND_Y - CHAR_H,
    vy:      0,
    isJump:  false,
    isSlide: false,
    slideT:  0,
    animT:   0,
  };
  function resetCharY() { char.y = GROUND_Y - CHAR_H; char.vy = 0; char.isJump = false; }

  /* ─────────────────── JUMP / SLIDE ──────────── */
  function tryJump() {
    if (!char.isJump) {
      char.vy     = JUMP_VY;
      char.isJump = true;
      char.isSlide= false;
    }
  }
  function trySlide() {
    if (!char.isJump) {
      char.isSlide = true;
      char.slideT  = 28;
    }
  }

  canvas.addEventListener('click',     tryJump);
  canvas.addEventListener('touchstart', e => { e.preventDefault(); tryJump(); }, { passive: false });
  document.addEventListener('keydown', e => {
    if (e.code === 'Space' || e.code === 'ArrowUp')   { e.preventDefault(); tryJump();  }
    if (e.code === 'ArrowDown' || e.code === 'KeyS')  { e.preventDefault(); trySlide(); }
  });

  /* ─────────────────── PARALLAX LAYERS ────────── */
  /* Each layer has tiles that scroll at a different speed */

  // Layer 0 — Sky gradient + stadium crowd silhouette
  // Layer 1 — Midground: field stripes
  // Layer 2 — Foreground: ground track

  const layers = [
    { speed: 0.3, x: 0 },   // sky
    { speed: 1.0, x: 0 },   // mid
    { speed: 2.5, x: 0 },   // near ground detail
  ];

  /* ─────────────────── OBSTACLES ─────────────── */
  const OBS_TYPES = [
    { key: 'hurdle',   emoji: '🚧', w: 22, h: 40, gy: 0,  points: 0,  safe: false },
    { key: 'cone',     emoji: '🔺', w: 24, h: 30, gy: 0,  points: 0,  safe: false },
    { key: 'barrier',  emoji: '🛑', w: 26, h: 44, gy: 0,  points: 0,  safe: false },
    { key: 'low_bar',  emoji: '━━', w: 50, h: 16, gy: -14,points: 0,  safe: false },  // slide under
  ];
  const COIN_TYPES = [
    { emoji: '🏈', points: 15 },
    { emoji: '🏀', points: 15 },
    { emoji: '⚽', points: 15 },
    { emoji: '⭐', points: 25 },
    { emoji: '💰', points: 30 },
  ];

  let obstacles = [];
  let coins     = [];
  let particles = [];
  let spawnCD   = 80;

  /* ─────────────────── SPAWN ──────────────────── */
  function spawnNext() {
    if (Math.random() < 0.6) {
      // obstacle
      const t  = OBS_TYPES[Math.floor(Math.random() * OBS_TYPES.length)];
      obstacles.push({
        x: W + 20,
        y: GROUND_Y - t.h + (t.gy || 0),
        w: t.w, h: t.h,
        emoji: t.emoji,
        safe: t.safe,
        low: t.gy < 0,   // must slide under
      });
    } else {
      // coin
      const c = COIN_TYPES[Math.floor(Math.random() * COIN_TYPES.length)];
      const floatH = 20 + Math.random() * 60;
      coins.push({
        x: W + 20,
        y: GROUND_Y - CHAR_H - floatH,
        emoji: c.emoji,
        points: c.points,
        r: 16,
        bob: Math.random() * Math.PI * 2,
      });
    }
  }

  /* ─────────────────── HIT FLASH ─────────────── */
  function takeHit() {
    if (invincible > 0) return;
    lives = Math.max(0, lives - 1);
    invincible = 80;
    if (lives === 0) {
      lives = 3;   // respawn — never end, just penalise
      score = Math.max(0, score - 50);
      updateHUD();
    }
    updateHUD();
  }

  /* ─────────────────── PARTICLES ─────────────── */
  function burst(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 2 + Math.random() * 4;
      particles.push({ x, y, vx: Math.cos(a)*s, vy: Math.sin(a)*s - 2,
                        life: 1, decay: .04, r: 3 + Math.random()*3, color });
    }
  }

  /* ─────────────────── HUD ────────────────────── */
  function updateHUD() {
    const sv = document.getElementById('scoreValue');
    if (sv) sv.textContent = score;
  }

  /* ─────────────────── SCORE POP ─────────────── */
  function scorePop(x, y, text) {
    const rect = canvas.getBoundingClientRect();
    const sx = rect.left + x * (rect.width / W);
    const sy = rect.top  + y * (rect.height / H);
    const el = document.createElement('div');
    el.className  = 'scorePop';
    el.textContent = text;
    el.style.left = sx + 'px';
    el.style.top  = sy + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 920);
  }

  /* ─────────────────── DRAW BACKGROUND ───────── */
  const NEON_COLORS = ['#ff6b35','#00e5ff','#ffe500','#00ff9d','#ff4dff'];
  let neonT = 0;

  function drawBG() {
    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.65);
    sky.addColorStop(0,   '#0b0b1e');
    sky.addColorStop(0.5, '#12122e');
    sky.addColorStop(1,   '#0e1a2b');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // Stars (static)
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    for (let i = 0; i < 40; i++) {
      // deterministic positions using index as seed
      const sx = (((i * 137 + 17) % 100) / 100) * W;
      const sy = (((i * 97  + 31) % 60)  / 100) * H;
      ctx.fillRect(sx, sy, 1.5, 1.5);
    }

    // Neon pulsing circles (stadium flood lights vibe)
    neonT += 0.015;
    for (let i = 0; i < 3; i++) {
      const col  = NEON_COLORS[i % NEON_COLORS.length];
      const px   = W * (0.2 + i * 0.3);
      const py   = H * 0.08;
      const glow = ctx.createRadialGradient(px, py, 0, px, py, 120);
      const alp  = 0.04 + 0.025 * Math.sin(neonT + i * 2);
      glow.addColorStop(0, col.replace(')', `,${alp})`).replace('rgb', 'rgba').replace('#', 'rgba(') );
      // simpler alpha color:
      ctx.save();
      ctx.globalAlpha = alp;
      ctx.fillStyle   = col;
      ctx.beginPath();
      ctx.arc(px, py, 100, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Stadium crowd silhouette (layer 0 parallax)
    layers[0].x -= speed * 0.3;
    const TILE_W = 160;
    if (layers[0].x < -TILE_W) layers[0].x += TILE_W;
    drawCrowdLayer(layers[0].x);

    // Scrolling field stripes (mid)
    layers[1].x -= speed * 1.0;
    if (layers[1].x < -80) layers[1].x += 80;
    drawFieldStripes(layers[1].x);

    // Ground
    drawGround();
  }

  function drawCrowdLayer(offsetX) {
    // Simple crowd silhouette shapes
    ctx.save();
    ctx.fillStyle = 'rgba(30,30,60,0.7)';
    const tile = 160;
    for (let tx = offsetX; tx < W + tile; tx += tile) {
      // stadium bleacher row
      ctx.beginPath();
      ctx.moveTo(tx, H * 0.32);
      for (let i = 0; i < 20; i++) {
        const hx = tx + i * 8;
        const hy = H * 0.32 - 8 - (i % 3) * 4 - Math.sin(i * 1.1) * 5;
        ctx.lineTo(hx, hy);
        ctx.lineTo(hx + 4, H * 0.32);
      }
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function drawFieldStripes(offsetX) {
    // Horizontal field colour bands
    const stripeH = H * 0.38;
    const y0      = H * 0.62 - stripeH;
    const grad = ctx.createLinearGradient(0, y0, 0, y0 + stripeH);
    grad.addColorStop(0, 'rgba(0,60,20,0)');
    grad.addColorStop(1, 'rgba(0,90,30,0.18)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, y0, W, stripeH);

    // Vertical yard lines (scrolling)
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth   = 1;
    const lineSpacing = 80;
    for (let lx = offsetX % lineSpacing; lx < W; lx += lineSpacing) {
      ctx.beginPath();
      ctx.moveTo(lx, y0);
      ctx.lineTo(lx, GROUND_Y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawGround() {
    // Track surface
    const grd = ctx.createLinearGradient(0, GROUND_Y, 0, H);
    grd.addColorStop(0, '#1a3020');
    grd.addColorStop(0.08, '#13261a');
    grd.addColorStop(1, '#0a1410');
    ctx.fillStyle = grd;
    ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);

    // Ground line (neon trim)
    ctx.save();
    ctx.shadowColor = '#00ff9d';
    ctx.shadowBlur  = 10;
    ctx.strokeStyle = '#00e87a';
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(W, GROUND_Y);
    ctx.stroke();
    ctx.restore();

    // Fast lane dashes scrolling
    layers[2].x -= speed * 2.5;
    if (layers[2].x < -60) layers[2].x += 60;
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth   = 2;
    ctx.setLineDash([30, 30]);
    ctx.lineDashOffset = layers[2].x;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y + 20);
    ctx.lineTo(W, GROUND_Y + 20);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  /* ─────────────────── DRAW CHARACTER ─────────── */
  const SPRITES = ['🏃','🏃‍♂️'];
  function drawChar() {
    const isFlash = invincible > 0 && Math.floor(invincible / 5) % 2 === 0;
    if (isFlash) return;

    const cw = CHAR_W;
    const ch = char.isSlide ? CHAR_H * 0.5 : CHAR_H;
    const cy = char.isSlide ? GROUND_Y - ch : char.y;

    char.animT += 0.25;

    ctx.save();
    ctx.font = `${cw + 10}px serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'bottom';

    // Neon glow around runner
    ctx.shadowColor  = '#00ff9d';
    ctx.shadowBlur   = 16;

    // Bounce legs animation when on ground
    const bounce = char.isJump ? 0 : Math.sin(char.animT * 3) * 2;
    ctx.fillText(char.isSlide ? '🤸' : '🏃', CHAR_X, cy + ch + bounce);
    ctx.restore();

    // Shadow under char
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle   = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.ellipse(CHAR_X, GROUND_Y + 4, 18, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /* ─────────────────── DRAW OBSTACLES ─────────── */
  function drawObstacles() {
    obstacles.forEach(ob => {
      ctx.save();
      ctx.font = `${ob.w + 8}px serif`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'bottom';
      ctx.shadowColor  = '#ff4444';
      ctx.shadowBlur   = 8;
      ctx.fillText(ob.emoji, ob.x + ob.w / 2, ob.y + ob.h);
      ctx.restore();
    });
  }

  /* ─────────────────── DRAW COINS ─────────────── */
  function drawCoins() {
    const t = Date.now() / 600;
    coins.forEach(c => {
      const bobY = c.y + Math.sin(t + c.bob) * 6;
      ctx.save();
      ctx.font = '26px serif';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor  = '#ffe500';
      ctx.shadowBlur   = 14;
      ctx.fillText(c.emoji, c.x, bobY);
      ctx.restore();
    });
  }

  /* ─────────────────── DRAW PARTICLES ─────────── */
  function drawParticles() {
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle   = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  /* ─────────────────── COLLISION ─────────────── */
  function collides(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx &&
           ay < by + bh && ay + ah > by;
  }

  function checkCollisions() {
    const cx  = CHAR_X - CHAR_W / 2 + 6;
    const ch  = char.isSlide ? CHAR_H * 0.5 : CHAR_H;
    const cy  = char.isSlide ? GROUND_Y - ch : char.y;

    // vs obstacles
    obstacles = obstacles.filter(ob => {
      if (ob.x + ob.w < -20) return false;
      // If it's a low bar, player must slide
      if (ob.low && !char.isSlide && !char.isJump) {
        if (collides(cx, cy, CHAR_W - 12, ch - 8, ob.x, ob.y, ob.w, ob.h)) {
          takeHit();
          burst(cx + CHAR_W / 2, cy + ch / 2, '#ff4444');
          return false;
        }
      } else if (!ob.low) {
        if (collides(cx, cy + 10, CHAR_W - 12, ch - 12, ob.x, ob.y, ob.w, ob.h)) {
          takeHit();
          burst(cx + CHAR_W / 2, cy + ch / 2, '#ff4444');
          return false;
        }
      }
      return true;
    });

    // vs coins
    coins = coins.filter(c => {
      const t = Date.now() / 600;
      const bobY = c.y + Math.sin(t + c.bob) * 6;
      if (collides(cx, cy, CHAR_W, ch, c.x - c.r, bobY - c.r, c.r * 2, c.r * 2)) {
        score += c.points;
        updateHUD();
        burst(c.x, bobY, '#ffe500', 8);
        scorePop(c.x, bobY, '+' + c.points);
        return false;
      }
      return c.x + c.r > -10;
    });
  }

  /* ─────────────────── DRAW LIVES HUD ─────────── */
  function drawLives() {
    ctx.save();
    ctx.font = '14px serif';
    for (let i = 0; i < 3; i++) {
      ctx.globalAlpha = i < lives ? 1 : 0.25;
      ctx.fillText('❤️', 14 + i * 20, 96);
    }
    ctx.restore();
  }

  /* ─────────────────── DISTANCE SCORE ─────────── */
  function drawDistanceTick() {
    if (frameCount % 6 === 0) {
      score++;
      if (frameCount % 60 === 0) updateHUD();
    }
  }

  /* ─────────────────── MAIN LOOP ─────────────── */
  function loop() {
    if (!running) return;
    requestAnimationFrame(loop);
    frameCount++;

    // Ramp speed gently
    speed = BASE_SPEED + Math.min(frameCount / 1200, 3.5);

    // ── Physics ──
    if (char.isJump) {
      char.y  += char.vy;
      char.vy += GRAVITY;
      if (char.y >= GROUND_Y - CHAR_H) {
        resetCharY();
      }
    }
    if (char.isSlide) {
      char.slideT--;
      if (char.slideT <= 0) char.isSlide = false;
    }
    if (invincible > 0) invincible--;

    // ── Spawn ──
    spawnCD--;
    if (spawnCD <= 0) {
      spawnNext();
      spawnCD = Math.max(38, 80 - Math.floor(frameCount / 200));
    }

    // ── Move obstacles + coins ──
    obstacles.forEach(ob => { ob.x -= speed; });
    coins.forEach(c     => { c.x  -= speed; });

    // ── Particles ──
    particles = particles.filter(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.18;
      p.life -= p.decay;
      return p.life > 0;
    });

    // ── Collisions ──
    checkCollisions();
    drawDistanceTick();

    // ── Draw everything ──
    drawBG();
    drawCoins();
    drawObstacles();
    drawChar();
    drawParticles();
    drawLives();
  }

  /* ─────────────────── PUBLIC API ─────────────── */
  window.BallGame = {
    start()    { running = true;  loop(); },
    stop()     { running = false; },
    reset()    { score = 0; lives = 3; frameCount = 0; obstacles = []; coins = []; particles = [];
                 speed = BASE_SPEED; resetCharY(); updateHUD(); },
    getScore() { return score; },
  };

  // hint text overlay (first 4 seconds)
  setTimeout(() => {
    const h = document.createElement('div');
    h.style.cssText = `position:absolute;bottom:${(H - GROUND_Y + 30)}px;left:50%;
      transform:translateX(-50%);color:rgba(255,255,255,.55);font-size:11px;
      font-weight:700;z-index:6;pointer-events:none;letter-spacing:1px;
      text-shadow:0 1px 4px #000;white-space:nowrap`;
    h.textContent = 'TAP / SPACE to jump  •  ↓ to slide';
    document.getElementById('app')?.appendChild(h);
    setTimeout(() => h.remove(), 4000);
  }, 800);

  window.BallGame.start();

})();
