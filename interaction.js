/* ========================================================
   AetherSeed - Interaction Manager
   ======================================================== */
class InteractionManager {
  constructor(canvas, app) {
    this.canvas = canvas;
    this.app = app;
    this.mouseX = 0;
    this.mouseY = 0;
    this.prevMouseX = 0;
    this.prevMouseY = 0;
    this.mouseDown = false;
    this.holdTime = 0;
    this._bind();
  }
  _bind() {
    var c = this.canvas;
    var self = this;
    c.addEventListener('mousemove', function(e) {
      self.prevMouseX = self.mouseX;
      self.prevMouseY = self.mouseY;
      self.mouseX = e.clientX;
      self.mouseY = e.clientY;
    });
    c.addEventListener('mousedown', function(e) {
      self.mouseDown = true;
      self.holdTime = 0;
      if (self.app.scene) {
        self.app.scene.burst(e.clientX, e.clientY);
      }
    });
    c.addEventListener('mouseup', function() {
      self.mouseDown = false;
      self.holdTime = 0;
    });
    c.addEventListener('touchstart', function(e) {
      e.preventDefault();
      var t = e.touches[0];
      self.mouseDown = true;
      self.mouseX = t.clientX;
      self.mouseY = t.clientY;
      if (self.app.scene) {
        self.app.scene.burst(t.clientX, t.clientY);
      }
    }, { passive: false });
    c.addEventListener('touchmove', function(e) {
      e.preventDefault();
      var t = e.touches[0];
      self.prevMouseX = self.mouseX;
      self.prevMouseY = self.mouseY;
      self.mouseX = t.clientX;
      self.mouseY = t.clientY;
    }, { passive: false });
    c.addEventListener('touchend', function() {
      self.mouseDown = false;
      self.holdTime = 0;
    });
    window.addEventListener('keydown', function(e) {
      if (document.activeElement && document.activeElement.id === 'seed-input') return;
      switch (e.key) {
        case ' ':
          e.preventDefault();
          self.app.mutate();
          break;
        case 'r':
        case 'R':
          self.app.randomize();
          break;
        case 's':
        case 'S':
          self.app.screenshot();
          break;
      }
    });
  }
  update(dt) {
    if (!this.app.scene) return;
    var dx = (this.mouseX - this.prevMouseX) * 0.01;
    var dy = (this.mouseY - this.prevMouseY) * 0.01;
    this.app.scene.setWind(dx, dy);
    if (this.mouseDown) {
      this.holdTime += dt;
      this.app.scene.setDistortionBoost(Math.min(this.holdTime * 0.5, 1.5));
    } else {
      this.app.scene.setDistortionBoost(
        Utils.lerp(this.app.scene.distortionBoost, 0, 0.05)
      );
    }
    this.prevMouseX = this.mouseX;
    this.prevMouseY = this.mouseY;
  }
}
