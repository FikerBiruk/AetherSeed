/* ========================================================
   AetherSeed — Audio Engine (Optional ambient sound)
   ======================================================== */

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = false;
    this.nodes = {};
    this.params = null;
    this.time = 0;
  }

  init(params) {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio not supported');
      return;
    }
    this.params = params;
    this._buildGraph();
    this.enabled = true;
  }

  _buildGraph() {
    const ctx = this.ctx;
    const p = this.params;

    // Master gain
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    this.nodes.master = master;

    // Low-pass filter
    const lpf = ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = 400 + p.mood * 1200;
    lpf.Q.value = 0.7;
    lpf.connect(master);
    this.nodes.lpf = lpf;

    // Reverb via convolver (simple impulse)
    const convolver = ctx.createConvolver();
    convolver.buffer = this._createReverb(2.5 + p.mood * 3);
    convolver.connect(lpf);
    this.nodes.reverb = convolver;

    // Dry path
    const dryGain = ctx.createGain();
    dryGain.gain.value = 0.3;
    dryGain.connect(lpf);
    this.nodes.dry = dryGain;

    // Wet path
    const wetGain = ctx.createGain();
    wetGain.gain.value = 0.7;
    wetGain.connect(convolver);
    this.nodes.wet = wetGain;

    // Oscillators based on ambientMode
    this._createPads();
  }

  _createReverb(duration) {
    const ctx = this.ctx;
    const sr = ctx.sampleRate;
    const len = sr * duration;
    const buf = ctx.createBuffer(2, len, sr);
    for (let ch = 0; ch < 2; ch++) {
      const data = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
      }
    }
    return buf;
  }

  _createPads() {
    const ctx = this.ctx;
    const p = this.params;
    const baseFreq = 60 + p.hueBase * 0.5;

    // Create 3 detuned oscillators
    const oscTypes = ['sine', 'triangle', 'sine'];
    const detunes = [0, 7, -5];
    this.nodes.oscs = [];

    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      osc.type = oscTypes[i];
      osc.frequency.value = baseFreq * (i === 0 ? 1 : i === 1 ? 1.5 : 2.01);
      osc.detune.value = detunes[i] + p.mood * 10;

      const gain = ctx.createGain();
      gain.gain.value = 0.08 - i * 0.02;

      osc.connect(gain);
      gain.connect(this.nodes.dry);
      gain.connect(this.nodes.wet);

      osc.start();
      this.nodes.oscs.push({ osc, gain });
    }

    // LFO for slow modulation
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.05 + p.density * 0.1;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 10 + p.distortion * 20;
    lfo.connect(lfoGain);
    lfoGain.connect(this.nodes.oscs[0].osc.frequency);
    lfo.start();
    this.nodes.lfo = lfo;
  }

  fadeIn(duration) {
    if (!this.ctx || !this.enabled) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const now = this.ctx.currentTime;
    this.nodes.master.gain.cancelScheduledValues(now);
    this.nodes.master.gain.setValueAtTime(this.nodes.master.gain.value, now);
    this.nodes.master.gain.linearRampToValueAtTime(0.25, now + (duration || 3));
  }

  fadeOut(duration) {
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime;
    this.nodes.master.gain.cancelScheduledValues(now);
    this.nodes.master.gain.setValueAtTime(this.nodes.master.gain.value, now);
    this.nodes.master.gain.linearRampToValueAtTime(0, now + (duration || 2));
  }

  toggle() {
    if (!this.enabled) return;
    if (this.nodes.master.gain.value > 0.01) {
      this.fadeOut(1.5);
    } else {
      this.fadeIn(2);
    }
  }

  stop() {
    if (!this.ctx) return;
    this.fadeOut(1);
    setTimeout(() => {
      if (this.nodes.oscs) {
        this.nodes.oscs.forEach(o => { try { o.osc.stop(); } catch(e) {} });
      }
      if (this.nodes.lfo) { try { this.nodes.lfo.stop(); } catch(e) {} }
      this.enabled = false;
    }, 1500);
  }

  update(dt) {
    this.time += dt;
    // Slowly evolve filter
    if (this.ctx && this.enabled && this.params) {
      const mod = Math.sin(this.time * 0.1) * 200;
      this.nodes.lpf.frequency.value = 400 + this.params.mood * 1200 + mod;
    }
  }
}

