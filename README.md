# 🌟 AetherSeed

> **Type a word. Grow a dream.**

An interactive generative art experience that transforms any word into a unique, mesmerizing visual universe. Each word creates a deterministic seed that generates its own particle system, color palette, motion physics, and ambient soundscape.

## ✨ Features

### 🎨 Generative Art
- **Deterministic Generation**: Same word = same stunning visual every time
- **11 Unique Shapes**: Circles, shards, blobs, lines, triangles, orbits, spirals, hexagons, stars, helixes, and flowing ribbons
- **Dynamic Color Palettes**: 6 different palette modes with 8 colors each
- **3D Depth Layers**: Parallax particle system with depth-based scaling
- **Physics Simulation**: Realistic particle motion with gravity wells and attractors

### 🎮 Interactive Controls

#### Keyboard Shortcuts
- **`R`** - Generate random seed word
- **`Space`** - Mutate current seed (same word, new variation)
- **`S`** - Screenshot (downloads as PNG)
- **`A`** - Create gravity attractor at center
- **`C`** - Toggle color shift animation
- **`P`** - Toggle performance mode (fewer particles)
- **`↑/↓`** - Add/remove particles manually
- **`Click/Tap`** - Create particle burst with repulsion

#### Mouse/Touch
- **Move**: Create wind that pushes particles
- **Click & Hold**: Increase distortion field
- **Drag**: Paint with particle trails

### 🎵 Audio
- Procedural ambient soundscape
- Each seed generates unique tones
- Toggle on/off with audio button
- Adaptive frequency based on visual mood

### 📊 Real-time Stats
- FPS counter
- Active particle count
- Performance monitoring

### 🔗 Shareable
- URL parameters automatically update
- Share `?seed=yourword` links
- Bookmark your favorite creations

## 🎯 Motion Styles

Each seed generates one of 6 motion patterns:
1. **Drift Down** - Gentle downward flow
2. **Orbit Center** - Circular attraction to center
3. **Swirl** - Curl noise turbulence
4. **Rise** - Upward ascension
5. **Scatter** - Radial expansion
6. **Slow Float** - Minimal drift

## 🌈 Visual Modes

### Shape Types
- **Circle**: Classic soft particles
- **Shard**: Angular crystalline forms
- **Blob**: Organic noise-warped shapes
- **Line**: Flowing streaks
- **Triangle**: Geometric pyramids
- **Orbit Ring**: Planetary systems
- **Spiral**: Fibonacci curves
- **Hexagon**: Sacred geometry
- **Star**: Five-pointed stars
- **Helix**: DNA-inspired double helixes
- **Ribbon**: Trail-based flow visualization

### Palette Modes
- **Monochromatic**: Subtle hue variations
- **Analogous**: Harmonious neighbor colors
- **Complementary**: High-contrast opposites
- **Triadic**: Balanced three-color harmony
- **Split Complementary**: Advanced color theory
- **Random**: Chaotic rainbow

## 🚀 Performance

- **Adaptive particle count**: 30-150 particles based on density seed
- **Performance mode**: Reduces to 50 particles for low-end devices
- **Depth sorting**: Proper layering for 3D effect
- **Trail system**: Optional ribbon rendering
- **60 FPS target**: Optimized rendering loop

## 🎨 Try These Seeds

- `cosmos` - Swirling galactic patterns
- `ocean` - Deep blue flowing ribbons
- `fire` - Chaotic orange bursts
- `aurora` - Northern lights shimmer
- `crystal` - Geometric precision
- `dream` - Soft pastel floating
- `void` - Dark minimal elegance
- `prism` - Rainbow refraction
- `pulse` - Rhythmic breathing
- `nebula` - Cosmic gas clouds

## 🛠️ Technology

- Pure vanilla JavaScript (no frameworks)
- HTML5 Canvas for rendering
- Web Audio API for sound
- Simplex noise for organic patterns
- Deterministic PRNG (xorshift32)
- Custom physics engine
- Particle system with trails

## 📱 Compatibility

- **Desktop**: Chrome, Firefox, Safari, Edge
- **Mobile**: iOS Safari, Chrome Android
- **Touch**: Full touch event support
- **Audio**: Optional (works without)

## 🎓 How It Works

1. **Seed Hashing**: Your word is hashed to a 32-bit integer
2. **PRNG Initialization**: Deterministic random generator seeded
3. **Parameter Mapping**: Seed bits mapped to visual parameters
4. **Palette Generation**: Colors derived from hue/saturation/value
5. **Particle Spawning**: Entities created with seed-based properties
6. **Physics Simulation**: Forces, attractors, and noise applied
7. **Rendering**: Depth-sorted drawing with blend modes
8. **Audio Synthesis**: Frequency/filter values from seed

## 🌐 Live Demo

Visit: **[https://fikerbiruk.github.io/AetherSeed/](https://fikerbiruk.github.io/AetherSeed/)**

## 📄 License

MIT License - Free to use, modify, and share!

---

**Created with ✨ by [FikerBiruk](https://github.com/FikerBiruk)**

*Let your imagination flow through the aether...*

