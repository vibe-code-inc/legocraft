// Game configuration settings
export default {
  // World settings
  world: {
    size: {
      width: 32,
      height: 32,
      depth: 32
    },
    gravity: -9.8,
    chunkSize: 16
  },
  
  // Player settings
  player: {
    height: 1.8,
    speed: 5,
    jumpForce: 7,
    reach: 5
  },
  
  // Block settings
  blocks: {
    size: 1,
    types: [
      { id: 'grass', color: '#7CFC00', solid: true },
      { id: 'dirt', color: '#8B4513', solid: true },
      { id: 'stone', color: '#808080', solid: true },
      { id: 'water', color: '#1E90FF', solid: false, transparent: true },
      { id: 'wood', color: '#A0522D', solid: true },
      { id: 'leaves', color: '#228B22', solid: true, transparent: true },
      { id: 'sand', color: '#F4A460', solid: true },
      { id: 'glass', color: '#87CEEB', solid: true, transparent: true },
      { id: 'brick_red', color: '#B22222', solid: true },
      { id: 'brick_blue', color: '#4169E1', solid: true },
      { id: 'brick_yellow', color: '#FFD700', solid: true },
      { id: 'brick_green', color: '#006400', solid: true },
      { id: 'brick_white', color: '#FFFFFF', solid: true },
      { id: 'brick_black', color: '#000000', solid: true }
    ]
  },
  
  // Game settings
  game: {
    dayNightCycle: true,
    dayLength: 600, // in seconds
    ambientLight: 0.5,
    fogDistance: 100,
    renderDistance: 8 // in chunks
  },
  
  // Controls
  controls: {
    mouse: {
      sensitivity: 0.3
    },
    touch: {
      sensitivity: 0.5
    }
  }
};
