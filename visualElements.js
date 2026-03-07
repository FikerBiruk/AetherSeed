/* ========================================================
   AetherSeed — Visual Elements (shape renderers)
   ======================================================== */

class VisualElement {
  constructor(opts) {
    this.x = opts.x || 0;
    this.y = opts.y || 0;
    this.vx = opts.vx || 0;
    this.vy = opts.vy || 0;
    this.size = opts.size || 20;
    this.baseSize = this.size;
    this.color = opts.color || 'rgba(180,160,255,';
    this.alpha = opts.alpha || 0.6;
    this.shapeType = opts.shapeType || 0;
    this.distortionFactor = opts.distortionFactor || 0;
    this.growthFactor = opts.growthFactor || 1;
    this.rotation = opts.rotation || 0;
    this.rotationSpeed = opts.rotationSpeed || 0;
    this.age = 0;
    this.maxAge = opts.maxAge || Infinity;
    this.alive = true;
    this.phase = opts.phase || 0;
  }

  update(dt, seed, time, wind) {
    this.age += dt;
    if (this.age > this.maxAge) { this.alive = false; return; }

    // Growth
    this.size = this.baseSize * (1 + Math.sin(this.age * this.growthFactor * 0.5) * 0.3);

    // Rotation
    this.rotation += this.rotationSpeed * dt;

    // Noise-based jitter
    const jx = seed.noise(this.x * 0.003, this.y * 0.003, time * 0.2) * this.distortionFactor * 60;
    const jy = seed.noise(this.x * 0.003 + 100, this.y * 0.003 + 100, time * 0.2) * this.distortionFactor * 60;

    // Wind influence
    const wx = wind ? wind.x * 30 : 0;
    const wy = wind ? wind.y * 30 : 0;

    this.x += (this.vx + jx + wx) * dt;
    this.y += (this.vy + jy + wy) * dt;
  }
}

/* ---- Shape Renderers ---- */

const ShapeRenderers = {
  drawCircle(ctx, e, glow) {
    ctx.save();
    ctx.globalAlpha = e.alpha;
    ctx.translate(e.x, e.y);
    if (glow > 0) {
      ctx.shadowColor = e.color + '0.6)';
      ctx.shadowBlur = 20 + glow * 40;
    }
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(1, e.size), 0, Math.PI * 2);
    ctx.fillStyle = e.color + e.alpha + ')';
    ctx.fill();
    ctx.restore();
  },

  drawShard(ctx, e, glow) {
    ctx.save();
    ctx.globalAlpha = e.alpha;
    ctx.translate(e.x, e.y);
    ctx.rotate(e.rotation);
    if (glow > 0) {
      ctx.shadowColor = e.color + '0.5)';
      ctx.shadowBlur = 12 + glow * 30;
    }
    const s = Math.max(1, e.size);
    ctx.beginPath();
    ctx.moveTo(0, -s * 1.6);
    ctx.lineTo(s * 0.4, 0);
    ctx.lineTo(0, s * 0.6);
    ctx.lineTo(-s * 0.4, 0);
    ctx.closePath();
    ctx.fillStyle = e.color + e.alpha + ')';
    ctx.fill();
    ctx.restore();
  },

  drawBlob(ctx, e, glow, seed, time) {
    ctx.save();
    ctx.globalAlpha = e.alpha;
    ctx.translate(e.x, e.y);
    ctx.rotate(e.rotation);
    if (glow > 0) {
      ctx.shadowColor = e.color + '0.4)';
      ctx.shadowBlur = 18 + glow * 35;
    }
    const s = Math.max(2, e.size);
    const pts = 8;
    ctx.beginPath();
    for (let i = 0; i <= pts; i++) {
      const angle = (i / pts) * Math.PI * 2;
      const n = seed.noise(
        Math.cos(angle) * 2 + e.phase,
        Math.sin(angle) * 2 + e.phase,
        time * 0.4
      );
      const r = s * (1 + n * 0.4 * e.distortionFactor);
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = e.color + e.alpha + ')';
    ctx.fill();
    ctx.restore();
  },

  drawLine(ctx, e, glow) {
    ctx.save();
    ctx.globalAlpha = e.alpha;
    ctx.translate(e.x, e.y);
    ctx.rotate(e.rotation);
    if (glow > 0) {
      ctx.shadowColor = e.color + '0.5)';
      ctx.shadowBlur = 10 + glow * 25;
    }
    const s = Math.max(2, e.size);
    ctx.beginPath();
    ctx.moveTo(-s, 0);
    ctx.lineTo(s, 0);
    ctx.strokeStyle = e.color + e.alpha + ')';
    ctx.lineWidth = 1.5 + e.size * 0.08;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();
  },

  drawTriangle(ctx, e, glow) {
    ctx.save();
    ctx.globalAlpha = e.alpha;
    ctx.translate(e.x, e.y);
    ctx.rotate(e.rotation);
    if (glow > 0) {
      ctx.shadowColor = e.color + '0.5)';
      ctx.shadowBlur = 14 + glow * 30;
    }
    const s = Math.max(2, e.size);
    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2 - Math.PI / 2;
      const px = Math.cos(angle) * s;
      const py = Math.sin(angle) * s;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = e.color + e.alpha + ')';
    ctx.fill();
    ctx.restore();
  },

  drawOrbitRing(ctx, e, glow, seed, time) {
    ctx.save();
    ctx.globalAlpha = e.alpha * 0.7;
    ctx.translate(e.x, e.y);
    ctx.rotate(e.rotation);
    if (glow > 0) {
      ctx.shadowColor = e.color + '0.3)';
      ctx.shadowBlur = 20 + glow * 40;
    }
    const s = Math.max(4, e.size);
    ctx.beginPath();
    ctx.arc(0, 0, s, 0, Math.PI * 2);
    ctx.strokeStyle = e.color + (e.alpha * 0.5) + ')';
    ctx.lineWidth = 1 + e.size * 0.04;
    ctx.stroke();

    // orbiting dot
    const dotAngle = time * 0.8 + e.phase;
    const dx = Math.cos(dotAngle) * s;
    const dy = Math.sin(dotAngle) * s;
    ctx.beginPath();
    ctx.arc(dx, dy, 2 + e.size * 0.06, 0, Math.PI * 2);
    ctx.fillStyle = e.color + e.alpha + ')';
    ctx.fill();
    ctx.restore();
  },
};

/* Shape dispatch */
function drawEntity(ctx, entity, glow, seed, time) {
  switch (entity.shapeType) {
    case 0: ShapeRenderers.drawCircle(ctx, entity, glow); break;
    case 1: ShapeRenderers.drawShard(ctx, entity, glow); break;
    case 2: ShapeRenderers.drawBlob(ctx, entity, glow, seed, time); break;
    case 3: ShapeRenderers.drawLine(ctx, entity, glow); break;
    case 4: ShapeRenderers.drawTriangle(ctx, entity, glow); break;
    case 5: ShapeRenderers.drawOrbitRing(ctx, entity, glow, seed, time); break;
    default: ShapeRenderers.drawCircle(ctx, entity, glow); break;
  }
}

