/* ========================================================
   AetherSeed — Main Application
   ======================================================== */

(function () {
  'use strict';

  /* ---- DOM refs ---- */
  const canvas = document.getElementById('aether-canvas');
  const ctx = canvas.getContext('2d');
  const overlay = document.getElementById('ui-overlay');
  const seedForm = document.getElementById('seed-form');
  const seedInput = document.getElementById('seed-input');
  const seedDisplay = document.getElementById('seed-display');
  const seedLabel = document.getElementById('current-seed-label');
  const audioToggle = document.getElementById('audio-toggle');
  const audioOnIcon = document.getElementById('audio-on-icon');
  const audioOffIcon = document.getElementById('audio-off-icon');

  /* ---- App state ---- */
  const app = {
    seed: null,
    scene: null,
    audio: new AudioEngine(),
    interaction: null,
    running: false,
    currentWord: '',
    mutationIndex: 0,
    lastTime: 0,
    bgColor: { r: 8, g: 8, b: 12 },
  };

  /* ---- Canvas sizing ---- */
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (app.scene) app.scene.resize(canvas.width, canvas.height);
  }
  window.addEventListener('resize', resize);
  resize();

  /* ---- Interaction ---- */
  app.interaction = new InteractionManager(canvas, app);

  /* ---- Idle background animation ---- */
  let idleSeed = new SeedEngine('aether');
  let idleTime = 0;

  function drawIdleBackground(time) {
    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = 'rgba(8,8,12,1)';
    ctx.fillRect(0, 0, w, h);

    // Subtle floating particles on the landing screen
    ctx.globalCompositeOperation = 'lighter';
    const count = 40;
    for (let i = 0; i < count; i++) {
      const phase = i * 1.618;
      const x = (w * 0.5) + Math.sin(time * 0.15 + phase) * w * 0.35;
      const y = (h * 0.5) + Math.cos(time * 0.12 + phase * 0.7) * h * 0.35;
      const n = idleSeed.noise(i * 0.3, time * 0.1, 0);
      const r = 2 + Math.abs(n) * 6;
      const alpha = 0.05 + Math.abs(n) * 0.1;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      const hue = (time * 10 + i * 20) % 360;
      const { r: cr, g: cg, b: cb } = Utils.hsvToRgb(hue, 0.4, 0.7);
      ctx.fillStyle = `rgba(${cr},${cg},${cb},${alpha})`;
      ctx.shadowColor = `rgba(${cr},${cg},${cb},0.3)`;
      ctx.shadowBlur = 15;
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.shadowBlur = 0;
  }

  /* ---- Start scene from word ---- */
  function startScene(word) {
    app.currentWord = word;
    app.mutationIndex = 0;
    app.seed = new SeedEngine(word);
    app.scene = new SceneGenerator(app.seed, canvas.width, canvas.height);

    // Derive background color from palette
    const p = app.seed.params;
    const bg = Utils.hsvToRgb(p.hueBase + 180, 0.15, 0.06);
    app.bgColor = bg;

    // Show seed label
    seedLabel.textContent = word;
    seedDisplay.classList.remove('hidden');

    // Hide overlay
    overlay.classList.add('hidden');

    // Audio
    audioToggle.classList.remove('hidden');
    app.audio.stop();
    app.audio = new AudioEngine();
    app.audio.init(app.seed.params);
    app.audio.fadeIn(4);
    audioOnIcon.classList.remove('hidden');
    audioOffIcon.classList.add('hidden');

    if (!app.running) {
      app.running = true;
      app.lastTime = performance.now();
      requestAnimationFrame(loop);
    }
  }

  /* ---- Animation loop ---- */
  function loop(now) {
    const dt = Math.min((now - app.lastTime) / 1000, 0.1);
    app.lastTime = now;

    if (app.scene) {
      // Fade trail
      const bg = app.bgColor;
      ctx.fillStyle = `rgba(${bg.r},${bg.g},${bg.b},0.08)`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      app.interaction.update(dt);
      app.scene.update(dt);
      app.scene.draw(ctx);
      app.audio.update(dt);
    }

    requestAnimationFrame(loop);
  }

  /* ---- Idle loop (before first word) ---- */
  function idleLoop(now) {
    if (app.running) return;
    idleTime = now / 1000;
    drawIdleBackground(idleTime);
    requestAnimationFrame(idleLoop);
  }
  requestAnimationFrame(idleLoop);

  /* ---- Public methods for interaction ---- */
  app.mutate = function () {
    if (!app.currentWord) return;
    app.mutationIndex++;
    const mutatedWord = app.currentWord + '#' + app.mutationIndex;
    app.seed = new SeedEngine(mutatedWord);
    app.scene = new SceneGenerator(app.seed, canvas.width, canvas.height);
    const p = app.seed.params;
    app.bgColor = Utils.hsvToRgb(p.hueBase + 180, 0.15, 0.06);
    seedLabel.textContent = app.currentWord + ' ×' + app.mutationIndex;
  };

  app.randomize = function () {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    let word = '';
    for (let i = 0; i < 4 + Math.floor(Math.random() * 5); i++) {
      word += chars[Math.floor(Math.random() * chars.length)];
    }
    seedInput.value = word;
    startScene(word);
  };

  app.screenshot = function () {
    const link = document.createElement('a');
    link.download = 'aetherseed-' + (app.currentWord || 'idle') + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  /* ---- Form submit ---- */
  seedForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const word = seedInput.value.trim();
    if (!word) return;
    startScene(word);
    seedInput.blur();
  });

  /* ---- Seed display click → show overlay ---- */
  seedDisplay.addEventListener('click', function () {
    overlay.classList.remove('hidden');
    seedInput.focus();
    seedInput.select();
  });

  /* ---- Audio toggle ---- */
  audioToggle.addEventListener('click', function () {
    app.audio.toggle();
    audioOnIcon.classList.toggle('hidden');
    audioOffIcon.classList.toggle('hidden');
  });

})();

