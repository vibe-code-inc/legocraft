// Texture loader utility for LEGO blocks
import * as THREE from 'three';
import { TextureLoader } from 'three';

// Create a texture loader
const textureLoader = new TextureLoader();

// Function to create a basic colored texture with LEGO surface pattern
export const createLegoTexture = (color, bumpStrength = 0.02) => {
  // Create a canvas to draw the texture
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  
  // Fill background with base color
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 256, 256);
  
  // Add subtle noise pattern for plastic look
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  for (let i = 0; i < 1000; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const size = Math.random() * 2;
    ctx.fillRect(x, y, size, size);
  }
  
  // Add subtle grid pattern for plastic molding lines
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.lineWidth = 1;
  
  // Horizontal lines
  for (let y = 16; y < 256; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
  }
  
  // Vertical lines
  for (let x = 16; x < 256; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 256);
    ctx.stroke();
  }
  
  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  
  // Create normal map for bump effect
  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = 256;
  normalCanvas.height = 256;
  const normalCtx = normalCanvas.getContext('2d');
  
  // Fill with neutral normal color (128, 128, 255)
  normalCtx.fillStyle = 'rgb(128, 128, 255)';
  normalCtx.fillRect(0, 0, 256, 256);
  
  // Add bump mapping for grid lines
  normalCtx.strokeStyle = 'rgb(100, 100, 200)';
  normalCtx.lineWidth = 2;
  
  // Horizontal lines
  for (let y = 16; y < 256; y += 32) {
    normalCtx.beginPath();
    normalCtx.moveTo(0, y);
    normalCtx.lineTo(256, y);
    normalCtx.stroke();
  }
  
  // Vertical lines
  for (let x = 16; x < 256; x += 32) {
    normalCtx.beginPath();
    normalCtx.moveTo(x, 0);
    normalCtx.lineTo(x, 256);
    normalCtx.stroke();
  }
  
  // Create normal map texture
  const normalMap = new THREE.CanvasTexture(normalCanvas);
  normalMap.wrapS = THREE.RepeatWrapping;
  normalMap.wrapT = THREE.RepeatWrapping;
  
  return {
    map: texture,
    normalMap: normalMap,
    bumpMap: normalMap,
    bumpScale: bumpStrength,
    roughnessMap: texture,
    roughness: 0.3,
    metalness: 0.1
  };
};

// Specialized textures for different block types
export const createBlockTextures = () => {
  const textures = {};
  
  // Grass block textures
  textures.grass_top = createLegoTexture('#7CFC00');
  textures.grass_side = (() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Draw dirt for bottom part
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 0, 256, 256);
    
    // Draw grass for top part
    ctx.fillStyle = '#7CFC00';
    ctx.fillRect(0, 0, 256, 128);
    
    // Add texture pattern
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    for (let y = 16; y < 256; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }
    for (let x = 16; x < 256; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 256);
      ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return {
      map: texture,
      roughness: 0.3,
      metalness: 0.1
    };
  })();
  
  // Dirt texture
  textures.dirt = createLegoTexture('#8B4513');
  
  // Stone texture
  textures.stone = createLegoTexture('#808080', 0.05);
  
  // Water texture with animation properties
  textures.water = (() => {
    const baseTexture = createLegoTexture('#1E90FF');
    baseTexture.transparent = true;
    baseTexture.opacity = 0.8;
    return baseTexture;
  })();
  
  // Wood textures
  textures.wood_top = createLegoTexture('#A0522D', 0.03);
  textures.wood_side = (() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Base wood color
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(0, 0, 256, 256);
    
    // Add wood grain
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 4;
    for (let y = 16; y < 256; y += 24) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return {
      map: texture,
      roughness: 0.4,
      metalness: 0.1
    };
  })();
  
  // Leaves texture
  textures.leaves = createLegoTexture('#228B22', 0.04);
  
  // Sand texture
  textures.sand = createLegoTexture('#F4A460', 0.02);
  
  // Glass texture
  textures.glass = (() => {
    const baseTexture = createLegoTexture('#87CEEB', 0.01);
    baseTexture.transparent = true;
    baseTexture.opacity = 0.5;
    return baseTexture;
  })();
  
  // Colored brick textures
  textures.brick_red = createLegoTexture('#B22222');
  textures.brick_blue = createLegoTexture('#4169E1');
  textures.brick_yellow = createLegoTexture('#FFD700');
  textures.brick_green = createLegoTexture('#006400');
  textures.brick_white = createLegoTexture('#FFFFFF');
  textures.brick_black = createLegoTexture('#000000');
  
  return textures;
};

// Export a function to load all textures
export const loadAllTextures = () => {
  return createBlockTextures();
};
