/* ========================================================
   AetherSeed — Scene Generator
   ======================================================== */

class SceneGenerator {
  constructor(seed, width, height) {
    this.seed = seed;
    this.params = seed.params;
    this.w = width;
    this.h = height;
    this.entities = [];
    this.time = 0;
    this.wind = { x: 0, y: 0 };
    this.burstQueue = [];
    this.distortionBoost = 0;
    this.palette = Utils.createPaletteFromHue(this.params.hueBase, this.params.paletteMode, 8);

    // NEW: Attractors and layers
    this.attractors = [];
    this.layers = 3; // depth layers
    this.colorShiftSpeed = 0;
    this.performanceMode = false;

    this._spawnInitial();
  }

  /* ---- Spawning ---- */
  _spawnInitial() {
    const count = Math.floor(30 + this.params.density * 120);
    for (let i = 0; i < count; i++) {
      this._spawnEntity();
    }
  }

  _spawnEntity(x, y, burst) {
    const p = this.params;
    const s = this.seed;

    // Position with depth
    const px = x !== undefined ? x : s.randomFloat(0, this.w);
    const py = y !== undefined ? y : s.randomFloat(0, this.h);
    const pz = s.randomFloat(0, this.layers); // depth layer

    // Velocity based on motionStyle
    let vx = 0, vy = 0;
    const speed = 10 + p.mood * 40;
    switch (p.motionStyle) {
      case 0: // drift down
        vx = s.randomFloat(-8, 8);
        vy = s.randomFloat(5, speed);
        break;
      case 1: // orbit center
        { const angle = s.randomFloat(0, Math.PI * 2);
          vx = Math.cos(angle) * speed * 0.5;
          vy = Math.sin(angle) * speed * 0.5;
        } break;
      case 2: // swirl
        vx = s.randomFloat(-speed, speed);
        vy = s.randomFloat(-speed, speed);
        break;
      case 3: // rise
        vx = s.randomFloat(-10, 10);
        vy = s.randomFloat(-speed, -5);
        break;
      case 4: // scatter from center
        { const a2 = Math.atan2(py - this.h / 2, px - this.w / 2);
          vx = Math.cos(a2) * speed * 0.4;
          vy = Math.sin(a2) * speed * 0.4;
        } break;
      case 5: // slow float
        vx = s.randomFloat(-3, 3);
        vy = s.randomFloat(-3, 3);
        break;
    }

    if (burst) {
      const a = s.randomFloat(0, Math.PI * 2);
      const sp = s.randomFloat(60, 200);
      vx = Math.cos(a) * sp;
      vy = Math.sin(a) * sp;
    }

    // Enhanced shape selection with new types
    const baseShape = burst ? s.randomInt(0, 10) : (p.shapeStyle > 5 ? s.randomInt(0, 10) : p.shapeStyle);
    const size = s.randomFloat(3, 18 + p.density * 30);

    // Depth-based scaling
    const depthScale = 0.3 + (pz / this.layers) * 0.7;
    const actualSize = size * depthScale;

    // Random color with hue
    const colorIndex = s.randomInt(0, this.palette.length - 1);
    const rgb = this.palette[colorIndex].match(/\d+/g);
    const hue = rgb ? Utils.rgbToHsv(parseInt(rgb[0]), parseInt(rgb[1]), parseInt(rgb[2])).h : s.randomFloat(0, 360);

    const entity = new VisualElement({
      x: px,
      y: py,
      z: pz,
      vx: vx,
      vy: vy,
      vz: 0,
      size: actualSize,
      color: s.choose(this.palette),
      shapeType: baseShape,
      alpha: s.randomFloat(0.15, 0.7) * depthScale,
      distortionFactor: p.distortion + this.distortionBoost,
      growthFactor: p.growthRate,
      rotation: s.randomFloat(0, Math.PI * 2),
      rotationSpeed: s.randomFloat(-1.5, 1.5),
      maxAge: burst ? s.randomFloat(1.5, 4) : Infinity,
      phase: s.randomFloat(0, 100),
      mass: size * 0.1,
      enableTrail: baseShape === 10 || (p.mood > 0.7 && s.randomFloat(0, 1) > 0.7),
      hue: hue,
      hueShift: this.colorShiftSpeed,
    });

    this.entities.push(entity);
    return entity;
  }

  /* ---- Update ---- */
  setWind(x, y) {
    this.wind.x = Utils.lerp(this.wind.x, x, 0.08);
    this.wind.y = Utils.lerp(this.wind.y, y, 0.08);
  }

  setDistortionBoost(val) {
    this.distortionBoost = val;
  }

  // NEW: Attractor management
  addAttractor(x, y, strength) {
    this.attractors.push({ x, y, strength, life: 3.0 });
  }

  setColorShift(speed) {
    this.colorShiftSpeed = speed;
    this.entities.forEach(e => e.hueShift = speed);
  }

  setPerformanceMode(enabled) {
    this.performanceMode = enabled;
  }

  burst(x, y) {
    const count = this.performanceMode ? 5 : 8 + Math.floor(this.params.mood * 20);
    for (let i = 0; i < count; i++) {
      this._spawnEntity(x, y, true);
    }
    // Add temporary attractor at burst point
    this.addAttractor(x, y, -2000);
  }

  update(dt) {
    this.time += dt;
    const p = this.params;

    // Update attractors
    for (let i = this.attractors.length - 1; i >= 0; i--) {
      this.attractors[i].life -= dt;
      this.attractors[i].strength *= 0.98; // decay
      if (this.attractors[i].life <= 0) {
        this.attractors.splice(i, 1);
      }
    }

    // Motion style: orbit needs special handling
    for (let i = this.entities.length - 1; i >= 0; i--) {
      const e = this.entities[i];

      // Additional motion-style forces
      if (p.motionStyle === 1) {
        // Gentle attraction to center
        const dx = this.w / 2 - e.x;
        const dy = this.h / 2 - e.y;
        const dist = Math.sqrt(dx * dx + dy * dy) + 1;
        e.vx += (dx / dist) * 8 * dt;
        e.vy += (dy / dist) * 8 * dt;
        // Tangential
        e.vx += (-dy / dist) * 15 * dt;
        e.vy += (dx / dist) * 15 * dt;
      }

      if (p.motionStyle === 2) {
        // Swirl: curl noise
        const n = this.seed.noise(e.x * 0.002, e.y * 0.002, this.time * 0.15);
        e.vx += Math.cos(n * Math.PI * 4) * 20 * dt;
        e.vy += Math.sin(n * Math.PI * 4) * 20 * dt;
        // Damping
        e.vx *= 0.995;
        e.vy *= 0.995;
      }

      // Update distortion factor to include boost
      e.distortionFactor = p.distortion + this.distortionBoost;

      e.update(dt, this.seed, this.time, this.wind, this.attractors);

      // Wrap around edges
      if (e.maxAge === Infinity) {
        if (e.x < -80) e.x += this.w + 160;
        if (e.x > this.w + 80) e.x -= this.w + 160;
        if (e.y < -80) e.y += this.h + 160;
        if (e.y > this.h + 80) e.y -= this.h + 160;
      }

      // Remove dead
      if (!e.alive) {
        this.entities.splice(i, 1);
      }
    }

    // Sort by depth for proper layering
    this.entities.sort((a, b) => a.z - b.z);

    // Mood-based spawn/despawn
    const targetCount = this.performanceMode ? 50 : Math.floor(30 + p.density * 120);
    if (this.entities.length < targetCount * 0.8 && Math.random() < 0.1) {
      this._spawnEntity();
    }
  }

  /* ---- Draw ---- */
  draw(ctx) {
    const p = this.params;
    const glow = 0.3 + p.mood * 0.7;

    // Blending mode based on mood
    if (p.mood > 0.6) {
      ctx.globalCompositeOperation = 'lighter';
    } else if (p.mood > 0.3) {
      ctx.globalCompositeOperation = 'screen';
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }

    for (const e of this.entities) {
      drawEntity(ctx, e, glow, this.seed, this.time);
    }

    ctx.globalCompositeOperation = 'source-over';
  }

  resize(w, h) {
    this.w = w;
    this.h = h;
  }
}

