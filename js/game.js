/* ============================================================
   GAME.JS — Authentic Minecraft Parkour Background
   ─────────────────────────────────────────────────────────
   Side-scrolling Minecraft-style parkour exactly like the
   viral TikTok "reddit story + Minecraft background" format.

   Visuals:
   • Minecraft sky blue (#7EC8E3) with blocky white clouds
   • Floating grass/dirt/stone platforms at varied heights
   • Oak trees on some platforms
   • Steve-like character that auto-runs and auto-jumps
   • Tap/click = early jump
   • Particle effects (dust puffs on landing)

   Canvas native resolution: 540 × 960
   ============================================================ */

'use strict';

(function () {

  const canvas = document.getElementById('bgCanvas');
  const ctx    = canvas.getContext('2d');
  const CW = 540, CH = 960;
  const B = 32;          // pixels per block
  const GRAVITY  = 0.68;
  const JUMP_VY  = -14.5;
  const PLAYER_VX = 3.4;

  /* ── Colour palette (authentic Minecraft) ── */
  const C = {
    skyTop:    '#6AB4E0',
    skyBot:    '#C8E8F0',
    cloud:     '#FFFFFF',
    cloudShad: '#DEDEDE',
    grassTop:  '#5D9931',
    grassSide: '#8B5E3C',
    dirt:      '#7A4F2F',
    dirtDark:  '#6A3F22',
    stone:     '#8B8B8B',
    stoneDark: '#6F6F6F',
    logSide:   '#6B4A1C',
    logTop:    '#BCB070',
    leaves:    '#3A6B24',
    leavesDk:  '#2E5418',
    steve_skin:'#C68642',
    steve_hair:'#3E2810',
    steve_shirt:'#3869BF',
    steve_pant:'#4A4A4A',
    steve_boot:'#2A1A0A',
    steve_eye: '#1A1A1A',
  };

  /* ── World & camera ── */
  let worldX = 0;   // camera left edge in world pixels
  function toScreen(wx, wy) { return { x: wx - worldX, y: wy }; }

  /* ── Platforms ── */
  const platforms = [];
  let   genHead   = 0;   // world x of rightmost generated edge

  function generatePlatforms(untilX) {
    if (platforms.length === 0) {
      // Starting platform
      platforms.push({ x: 0, y: CH * 0.62, w: B * 7, type: 'grass', tree: false });
      genHead = B * 7;
    }
    while (genHead < untilX) {
      const last = platforms[platforms.length - 1];
      const gap  = B * (1.4 + Math.random() * 1.8);
      const dH   = (Math.random() - 0.48) * B * 3.5;
      const newY = Math.max(CH * 0.33, Math.min(CH * 0.72, last.y + dH));
      const newW = B * (3 + Math.floor(Math.random() * 6));
      const type = Math.random() < 0.15 ? 'stone' : 'grass';
      const tree = type === 'grass' && newW > B * 4 && Math.random() < 0.35;
      platforms.push({ x: last.x + last.w + gap, y: newY, w: newW, type, tree });
      genHead = last.x + last.w + gap + newW;
    }
  }

  /* ── Player ── */
  const player = {
    x:     B * 2,                // world x (centre of player)
    y:     0,                    // world y (feet)
    vy:    0,
    onGround: false,
    stepT:    0,
    jumpUsed: false,
    currentPlatIdx: 0,
  };

  /* Place player on first platform */
  function resetPlayer() {
    generatePlatforms(CW * 2);
    const p   = platforms[0];
    player.x  = p.x + p.w * 0.35;
    player.y  = p.y;
    player.vy = 0;
    player.onGround = true;
    player.currentPlatIdx = 0;
  }

  /* ── Tap/click = jump ── */
  canvas.addEventListener('click',     () => { if (player.onGround) doJump(); });
  canvas.addEventListener('touchstart', e => { e.preventDefault(); if (player.onGround) doJump(); }, { passive: false });
  document.addEventListener('keydown',  e => { if ((e.code==='Space'||e.code==='ArrowUp') && player.onGround) { e.preventDefault(); doJump(); } });

  function doJump() { player.vy = JUMP_VY; player.onGround = false; }

  /* ── Clouds (world space) ── */
  const clouds = Array.from({ length: 7 }, (_, i) => ({
    x: i * 220 + Math.random() * 120,
    y: CH * 0.04 + Math.random() * CH * 0.14,
    w: B * (4 + Math.floor(Math.random() * 5)),
    h: B * (1 + Math.floor(Math.random() * 2)),
    spd: 0.18 + Math.random() * 0.22,
  }));

  /* ── Particles ── */
  const particles = [];
  function dustBurst(x, y) {
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI * 0.5 + (Math.random() - 0.5) * 1.8;
      particles.push({
        x, y, vx: Math.cos(a)*2, vy: Math.sin(a)*2 - 1,
        life: 1, dec: .07, r: 3 + Math.random()*3, color: C.dirt,
      });
    }
  }

  /* ══════════════════════════════════════════
     DRAW FUNCTIONS
  ══════════════════════════════════════════ */

  function drawSky() {
    const g = ctx.createLinearGradient(0, 0, 0, CH * 0.72);
    g.addColorStop(0, C.skyTop);
    g.addColorStop(1, C.skyBot);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, CW, CH * 0.72);
  }

  function drawCloud(c) {
    const sx = c.x - worldX * 0.15; // parallax
    if (sx + c.w < 0 || sx > CW) return;
    /* shadow */
    ctx.fillStyle = C.cloudShad;
    ctx.fillRect(sx + 4, c.y + 4, c.w, c.h);
    /* main */
    ctx.fillStyle = C.cloud;
    ctx.fillRect(sx, c.y, c.w, c.h);
    /* bumps on top */
    const bw = Math.floor(c.w / (B * 1.5)) + 1;
    for (let i = 0; i < bw; i++) {
      ctx.fillRect(sx + i * B * 1.2, c.y - B * 0.7, B * 1.4, B * 0.75);
    }
  }

  /* Single block at screen coords */
  function drawBlock(sx, sy, type) {
    if (sx + B < 0 || sx > CW || sy + B < 0 || sy > CH) return;
    if (type === 'grassTop') {
      ctx.fillStyle = C.grassTop;
      ctx.fillRect(sx, sy, B, B);
      /* subtle grid lines */
      ctx.strokeStyle = 'rgba(0,0,0,0.12)';
      ctx.lineWidth = .5;
      ctx.strokeRect(sx, sy, B, B);
      /* highlight */
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(sx+1, sy+1, B*0.5, B*0.5);
    } else if (type === 'dirt' || type === 'grass') {
      ctx.fillStyle = C.dirt;
      ctx.fillRect(sx, sy, B, B);
      ctx.fillStyle = C.dirtDark;
      /* dirt patches */
      ctx.fillRect(sx+4, sy+4, 6, 5);
      ctx.fillRect(sx+B-12, sy+8, 5, 5);
      ctx.fillRect(sx+8, sy+B-10, 6, 4);
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = .5;
      ctx.strokeRect(sx, sy, B, B);
    } else if (type === 'stone') {
      ctx.fillStyle = C.stone;
      ctx.fillRect(sx, sy, B, B);
      ctx.fillStyle = C.stoneDark;
      /* stone cross-hatch */
      ctx.fillRect(sx, sy+B*0.5-1, B, 2);
      ctx.fillRect(sx+B*0.5-1, sy, 2, B*0.5);
      ctx.fillRect(sx, sy+B*0.5, 2, B*0.5);
      ctx.fillRect(sx+B*0.5-1, sy+B*0.5, 2, B*0.5);
      ctx.strokeStyle = 'rgba(0,0,0,0.18)';
      ctx.lineWidth = .5;
      ctx.strokeRect(sx, sy, B, B);
    }
  }

  function drawPlatform(p) {
    const { x: sx, y: sy } = toScreen(p.x, p.y);
    if (sx + p.w < -B || sx > CW + B) return;

    const blocks = Math.ceil(p.w / B);
    const depthBlocks = p.type === 'grass' ? 3 : 2;

    for (let bx = 0; bx < blocks; bx++) {
      const bsx = sx + bx * B;
      /* top block */
      if (p.type === 'grass') {
        drawBlock(bsx, sy, 'grassTop');
      } else {
        drawBlock(bsx, sy, 'stone');
      }
      /* depth blocks */
      for (let d = 1; d <= depthBlocks; d++) {
        drawBlock(bsx, sy + d * B, d < depthBlocks ? 'dirt' : 'stone');
      }
    }

    if (p.tree) drawTree(sx + p.w * 0.5 - B * 0.5, sy);
  }

  function drawTree(sx, sy) {
    /* Trunk */
    const tw = B * 0.5;
    const trunkH = B * 2.5;
    sx += B * 0.25;
    ctx.fillStyle = C.logSide;
    ctx.fillRect(sx, sy - trunkH, tw, trunkH);
    /* ring lines on log */
    ctx.fillStyle = C.logTop;
    ctx.fillRect(sx, sy - trunkH, tw, 3);
    ctx.fillRect(sx, sy - trunkH + B, tw, 3);
    /* Leaves (3x3 blocky cluster) */
    const lx = sx - B;
    const ly = sy - trunkH - B * 2;
    const lw = B * 3, lh = B * 2.5;
    ctx.fillStyle = C.leaves;
    ctx.fillRect(lx, ly, lw, lh);
    ctx.fillStyle = C.leavesDk;
    /* dark patches */
    ctx.fillRect(lx + 4, ly + 4, B, B);
    ctx.fillRect(lx + lw - B - 4, ly + lh - B - 2, B, B * 0.75);
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = .5;
    ctx.strokeRect(lx, ly, lw, lh);
  }

  /* ── Draw Steve ── */
  function drawSteve(sx, sy, onGround, stepT, jumping) {
    const W = 22, H = 48;
    const hW = W, hH = 16;      // head
    const bW = W, bH = 18;      // body
    const lW = 10, lH = 18;     // leg
    const aW = 8,  aH = 16;     // arm

    const headY = sy - H;
    const bodyY = headY + hH;
    const legsY = bodyY + bH;

    /* Leg animation */
    const legOff = onGround ? Math.sin(stepT * 0.25) * 5 : 0;
    const armOff = onGround ? -Math.sin(stepT * 0.25) * 5 : 0;

    ctx.save();
    ctx.translate(sx, 0);

    /* Shadow */
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(W/2, sy+2, W*0.6, 4, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.globalAlpha = 1;

    /* LEFT SHOE */
    ctx.fillStyle = C.steve_boot;
    ctx.fillRect(0, legsY + lH, lW, 3);

    /* RIGHT SHOE */
    ctx.fillRect(lW + 2, legsY + lH, lW, 3);

    /* LEFT LEG */
    ctx.fillStyle = C.steve_pant;
    ctx.fillRect(0, legsY + legOff, lW, lH);
    /* RIGHT LEG */
    ctx.fillRect(lW + 2, legsY - legOff, lW, lH);

    /* LEFT ARM */
    ctx.fillStyle = C.steve_shirt;
    ctx.fillRect(-aW + 2, bodyY + armOff, aW, aH);

    /* RIGHT ARM */
    ctx.fillRect(bW - 2, bodyY - armOff, aW, aH);

    /* BODY */
    ctx.fillStyle = C.steve_shirt;
    ctx.fillRect(0, bodyY, bW, bH);
    /* shirt shading */
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(0, bodyY, bW * 0.4, bH);

    /* HEAD */
    ctx.fillStyle = C.steve_skin;
    ctx.fillRect(0, headY, hW, hH);
    /* Hair */
    ctx.fillStyle = C.steve_hair;
    ctx.fillRect(0, headY, hW, 5);
    ctx.fillRect(0, headY, 3, hH);

    /* EYE */
    ctx.fillStyle = C.steve_eye;
    ctx.fillRect(hW*0.55, headY + 5, 3, 4);

    /* Head outline */
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, headY, hW, hH);

    ctx.restore();
  }

  /* ── Particles ── */
  function drawParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.2;
      p.life -= p.dec;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.r, p.r);
      ctx.restore();
    }
  }

  /* ── Grass ground strip at bottom of screen ── */
  function drawGroundStrip() {
    ctx.fillStyle = C.grassTop;
    ctx.fillRect(0, CH - B * 0.5, CW, B * 0.5);
  }

  /* ══════════════════════════════════════════
     PHYSICS & LOGIC
  ══════════════════════════════════════════ */

  let frame = 0;
  let wasOnGround = false;

  function findPlatformUnder(wx, wy) {
    for (let i = 0; i < platforms.length; i++) {
      const p = platforms[i];
      if (wx >= p.x - 8 && wx + 22 <= p.x + p.w + 8) {
        if (wy >= p.y - 4 && wy <= p.y + 18) {
          return p;
        }
      }
    }
    return null;
  }

  function autoJump() {
    if (!player.onGround) return;
    // Find which platform we're on
    const pIdx = platforms.findIndex(p =>
      player.x + 22 >= p.x && player.x <= p.x + p.w &&
      Math.abs(player.y - p.y) < 20
    );
    if (pIdx < 0) return;
    const p = platforms[pIdx];
    // Jump when within 1.5 blocks of the right edge
    const rightEdge = p.x + p.w;
    if (player.x + 22 >= rightEdge - B * 1.2) {
      doJump();
    }
  }

  /* ══════════════════════════════════════════
     MAIN LOOP
  ══════════════════════════════════════════ */

  let running = true;

  function loop() {
    if (!running) return;
    requestAnimationFrame(loop);
    frame++;

    /* Advance player */
    player.x += PLAYER_VX;
    player.vy += GRAVITY;
    player.y  += player.vy;
    if (player.onGround) player.stepT++;

    /* Platform collision */
    player.onGround = false;
    const plat = findPlatformUnder(player.x, player.y);
    if (plat && player.vy >= 0) {
      player.y  = plat.y;
      player.vy = 0;
      if (!wasOnGround) dustBurst(player.x + 11, player.y);
      player.onGround = true;
    }
    wasOnGround = player.onGround;

    /* Fall off screen → respawn on next platform */
    if (player.y > CH + B * 4) {
      const ahead = platforms.find(p => p.x > player.x);
      if (ahead) { player.x = ahead.x + ahead.w * 0.3; player.y = ahead.y; player.vy = 0; player.onGround = true; }
    }

    /* Auto jump */
    autoJump();

    /* Camera: keep player at ~28% from left */
    const targetCamX = player.x - CW * 0.28;
    worldX += (targetCamX - worldX) * 0.12;

    /* Cloud drift */
    clouds.forEach(c => { c.x += c.spd; if (c.x - worldX * 0.15 > CW + c.w + 50) c.x -= CW * 3; });

    /* Generate more platforms */
    generatePlatforms(worldX + CW * 2.5);

    /* Prune old platforms */
    while (platforms.length > 0 && platforms[0].x + platforms[0].w < worldX - CW) {
      platforms.shift();
    }

    /* ── DRAW ── */
    ctx.clearRect(0, 0, CW, CH);
    drawSky();
    clouds.forEach(drawCloud);
    platforms.forEach(drawPlatform);
    drawGroundStrip();
    drawSteve(
      toScreen(player.x, 0).x,
      player.y,
      player.onGround,
      player.stepT,
      !player.onGround,
    );
    drawParticles();

    /* Canvas video overlay (Reddit card, captions, progress) */
    if (typeof window.renderVideoOverlay === 'function') {
      window.renderVideoOverlay(ctx, CW, CH);
    }
  }

  /* ── Public API ── */
  window.BallGame = {
    start() { running = true; resetPlayer(); loop(); },
    stop()  { running = false; },
    reset() { platforms.length = 0; particles.length = 0; genHead = 0; frame = 0; worldX = 0; resetPlayer(); },
  };

  window.BallGame.start();

})();
