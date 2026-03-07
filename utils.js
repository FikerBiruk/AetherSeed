/* AetherSeed - Utility Functions */
const Utils = {
  lerp(a, b, t) { return a + (b - a) * t; },
  mapRange(value, inMin, inMax, outMin, outMax) {
    return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
  },
  clamp(value, min, max) { return Math.max(min, Math.min(max, value)); },
  hsvToRgb(h, s, v) {
    h = ((h % 360) + 360) % 360;
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    let r, g, b;
    if (h < 60)       { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else              { r = c; g = 0; b = x; }
    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255),
    };
  },
  createPaletteFromHue(hueBase, paletteMode, count) {
    count = count || 6;
    const hues = [];
    switch (paletteMode) {
      case 0: for (let i = 0; i < count; i++) hues.push(hueBase + (i * 8 - count * 4)); break;
      case 1: for (let i = 0; i < count; i++) hues.push(hueBase + (i * 30 - 45)); break;
      case 2: for (let i = 0; i < count; i++) hues.push(i % 2 === 0 ? hueBase + i * 5 : hueBase + 180 + i * 5); break;
      case 3: for (let i = 0; i < count; i++) hues.push(hueBase + (i % 3) * 120 + Math.floor(i / 3) * 10); break;
      case 4: {
        const offsets = [0, 150, 210];
        for (let i = 0; i < count; i++) hues.push(hueBase + offsets[i % 3] + Math.floor(i / 3) * 8);
      } break;
      default: for (let i = 0; i < count; i++) hues.push(hueBase + i * 60);
    }
    return hues.map(function(h, i) {
      const sat = Utils.clamp(0.5 + (i % 3) * 0.15, 0.4, 1.0);
      const val = Utils.clamp(0.7 + (i % 2) * 0.2, 0.5, 1.0);
      const rgb = Utils.hsvToRgb(h, sat, val);
      return 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',';
    });
  },
  dist(x1, y1, x2, y2) {
    const dx = x2 - x1; const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  },
  smoothstep(edge0, edge1, x) {
    const t = Utils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  },
  rgbaString(r, g, b, a) { a = a !== undefined ? a : 1; return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')'; }
};
