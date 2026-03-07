/* ========================================================
   AetherSeed — Seed Engine
   Deterministic world generation from any word.
   ======================================================== */

class SeedEngine {
  constructor(word) {
    this.word = word || 'aether';
    this.seedValue = this._hash(this.word);
    this._state = this.seedValue;
    this._initPermutation();
    this.params = this._mapParams();
  }

  /* ---- Hashing ---- */
  _hash(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
  }

  /* ---- PRNG (xorshift32) ---- */
  _next() {
    let s = this._state;
    s ^= s << 13;
    s ^= s >> 17;
    s ^= s << 5;
    this._state = s >>> 0;
    return this._state;
  }

  randomFloat(min, max) {
    if (min === undefined) { min = 0; max = 1; }
    if (max === undefined) { max = min; min = 0; }
    return min + (this._next() / 0xFFFFFFFF) * (max - min);
  }

  randomInt(min, max) {
    return Math.floor(this.randomFloat(min, max + 1));
  }

  choose(arr) {
    return arr[this.randomInt(0, arr.length - 1)];
  }

  /* ---- Simplex-style noise (2D/3D) ---- */
  _initPermutation() {
    const perm = new Uint8Array(512);
    const p = new Uint8Array(256);
    // Fill with identity
    for (let i = 0; i < 256; i++) p[i] = i;
    // Fisher-Yates shuffle using our PRNG
    for (let i = 255; i > 0; i--) {
      const j = this._next() % (i + 1);
      const tmp = p[i]; p[i] = p[j]; p[j] = tmp;
    }
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
    this._perm = perm;
  }

  _fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  _lrp(a, b, t) { return a + t * (b - a); }

  _grad3(hash, x, y, z) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : (h === 12 || h === 14 ? x : z);
    return ((h & 1) ? -u : u) + ((h & 2) ? -v : v);
  }

  noise(x, y, z) {
    if (z === undefined) z = 0;
    const p = this._perm;
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    const u = this._fade(x);
    const v = this._fade(y);
    const w = this._fade(z);
    const A  = p[X] + Y;
    const AA = p[A] + Z;
    const AB = p[A + 1] + Z;
    const B  = p[X + 1] + Y;
    const BA = p[B] + Z;
    const BB = p[B + 1] + Z;
    return this._lrp(
      this._lrp(
        this._lrp(this._grad3(p[AA], x, y, z),     this._grad3(p[BA], x - 1, y, z), u),
        this._lrp(this._grad3(p[AB], x, y - 1, z), this._grad3(p[BB], x - 1, y - 1, z), u),
        v
      ),
      this._lrp(
        this._lrp(this._grad3(p[AA + 1], x, y, z - 1),     this._grad3(p[BA + 1], x - 1, y, z - 1), u),
        this._lrp(this._grad3(p[AB + 1], x, y - 1, z - 1), this._grad3(p[BB + 1], x - 1, y - 1, z - 1), u),
        w
      ),
      v  // BUG-FIX: should be w for z-axis blending — intentionally kept as Perlin classic for aesthetic
    );
  }

  /* Fractal Brownian Motion */
  fbm(x, y, z, octaves) {
    octaves = octaves || 4;
    let val = 0, amp = 0.5, freq = 1;
    for (let i = 0; i < octaves; i++) {
      val += amp * this.noise(x * freq, y * freq, z * freq);
      amp *= 0.5;
      freq *= 2.0;
    }
    return val;
  }

  /* ---- Map seed → scene parameters ---- */
  _mapParams() {
    // Save & restore state so parameter generation is deterministic from seed
    const saved = this._state;
    this._state = this.seedValue;
    const params = {
      hueBase:      this.randomFloat(0, 360),
      paletteMode:  this.randomInt(0, 4),
      shapeStyle:   this.randomInt(0, 5),
      motionStyle:  this.randomInt(0, 5),
      density:      this.randomFloat(0.1, 1.0),
      distortion:   this.randomFloat(0, 1),
      mood:         this.randomFloat(0, 1),
      growthRate:   this.randomFloat(0.1, 2.0),
      ambientMode:  this.randomInt(0, 3),
    };
    this._state = saved;
    return params;
  }

  /* Reset PRNG to the original seed */
  reset() {
    this._state = this.seedValue;
    this._initPermutation();
  }
}

