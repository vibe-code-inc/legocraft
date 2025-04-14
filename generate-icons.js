const fs = require('fs');
const { createCanvas } = require('canvas');

// Create a canvas for the icon
const canvas = createCanvas(1024, 1024);
const ctx = canvas.getContext('2d');

// Background
ctx.fillStyle = '#4a90e2';
ctx.fillRect(0, 0, 1024, 1024);

// LEGO brick
ctx.fillStyle = '#f5a623';
ctx.fillRect(212, 362, 600, 300);

// LEGO studs
ctx.fillStyle = '#e09600';
for (let x = 0; x < 4; x++) {
  for (let y = 0; y < 2; y++) {
    ctx.beginPath();
    ctx.arc(312 + x * 150, 412 + y * 150, 50, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Border
ctx.strokeStyle = '#ffffff';
ctx.lineWidth = 20;
ctx.strokeRect(112, 262, 800, 500);

// Text
ctx.fillStyle = '#ffffff';
ctx.font = 'bold 80px Arial';
ctx.textAlign = 'center';
ctx.fillText('LEGO', 512, 200);
ctx.fillText('MINECRAFT', 512, 850);

// Save the image
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('./assets/icon.png', buffer);

// Create a copy for adaptive icon
fs.writeFileSync('./assets/adaptive-icon.png', buffer);

// Create a smaller version for favicon
const faviconCanvas = createCanvas(192, 192);
const faviconCtx = faviconCanvas.getContext('2d');

// Draw the icon scaled down
faviconCtx.drawImage(canvas, 0, 0, 192, 192);

// Save the favicon
const faviconBuffer = faviconCanvas.toBuffer('image/png');
fs.writeFileSync('./assets/favicon.png', faviconBuffer);

// Create splash screen
const splashCanvas = createCanvas(2048, 1536);
const splashCtx = splashCanvas.getContext('2d');

// Background
splashCtx.fillStyle = '#4a90e2';
splashCtx.fillRect(0, 0, 2048, 1536);

// LEGO brick (larger)
splashCtx.fillStyle = '#f5a623';
splashCtx.fillRect(624, 568, 800, 400);

// LEGO studs
splashCtx.fillStyle = '#e09600';
for (let x = 0; x < 4; x++) {
  for (let y = 0; y < 2; y++) {
    splashCtx.beginPath();
    splashCtx.arc(724 + x * 200, 618 + y * 200, 70, 0, Math.PI * 2);
    splashCtx.fill();
  }
}

// Border
splashCtx.strokeStyle = '#ffffff';
splashCtx.lineWidth = 30;
splashCtx.strokeRect(524, 468, 1000, 600);

// Text
splashCtx.fillStyle = '#ffffff';
splashCtx.font = 'bold 120px Arial';
splashCtx.textAlign = 'center';
splashCtx.fillText('LEGO MINECRAFT', 1024, 300);
splashCtx.font = 'bold 60px Arial';
splashCtx.fillText('Build your world with LEGO blocks', 1024, 1200);

// Save the splash screen
const splashBuffer = splashCanvas.toBuffer('image/png');
fs.writeFileSync('./assets/splash.png', splashBuffer);

console.log('All app icons and splash screen generated successfully!');
