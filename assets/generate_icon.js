// Create a simple icon for the app using canvas
const canvas = document.createElement('canvas');
canvas.width = 1024;
canvas.height = 1024;
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

// Export as PNG
const dataUrl = canvas.toDataURL('image/png');
