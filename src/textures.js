/**
 * Procedural particle texture generator
 * Creates high-quality textures on canvas — no external image files needed
 */

/**
 * Create a radial gradient glow texture (for luminous core)
 */
export function createGlowTexture(size = 128) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const center = size / 2;

  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
  gradient.addColorStop(0, 'rgba(255, 255, 240, 1.0)');
  gradient.addColorStop(0.15, 'rgba(255, 245, 200, 0.95)');
  gradient.addColorStop(0.35, 'rgba(255, 200, 80, 0.7)');
  gradient.addColorStop(0.6, 'rgba(255, 120, 20, 0.3)');
  gradient.addColorStop(0.85, 'rgba(255, 60, 10, 0.08)');
  gradient.addColorStop(1, 'rgba(255, 30, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return canvas.toDataURL('image/png');
}

/**
 * Create a fire particle texture with organic noise
 */
export function createFireTexture(size = 128) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const center = size / 2;
  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (x - center) / center;
      const dy = (y - center) / center;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Organic noise for fire look
      const noise = (Math.sin(x * 0.3 + y * 0.5) * 0.5 + 0.5) *
                    (Math.cos(x * 0.7 - y * 0.3) * 0.5 + 0.5);
      const noiseScale = 0.3 + noise * 0.7;

      // Radial falloff with noise
      let alpha = Math.max(0, 1 - dist) * noiseScale;
      alpha = Math.pow(alpha, 1.5);

      // Color: white center → yellow → orange → red edge
      let r, g, b;
      if (dist < 0.2) {
        r = 255; g = 250; b = 230;
      } else if (dist < 0.45) {
        const t = (dist - 0.2) / 0.25;
        r = 255; g = 250 - t * 80; b = 230 - t * 180;
      } else if (dist < 0.7) {
        const t = (dist - 0.45) / 0.25;
        r = 255; g = 170 - t * 100; b = 50 - t * 40;
      } else {
        const t = (dist - 0.7) / 0.3;
        r = 255 - t * 60; g = 70 - t * 50; b = 10;
      }

      const idx = (y * size + x) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = Math.round(alpha * 255);
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}

/**
 * Create a smoke/cloud texture with soft edges
 */
export function createSmokeTexture(size = 128) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const center = size / 2;

  // Draw multiple overlapping soft circles for billowy look
  const circles = [
    { x: 0, y: 0, r: 0.8, a: 0.3 },
    { x: -0.15, y: -0.1, r: 0.5, a: 0.25 },
    { x: 0.12, y: 0.08, r: 0.55, a: 0.25 },
    { x: -0.08, y: 0.15, r: 0.45, a: 0.2 },
    { x: 0.1, y: -0.12, r: 0.4, a: 0.2 },
  ];

  for (const c of circles) {
    const cx = center + c.x * center;
    const cy = center + c.y * center;
    const cr = c.r * center;

    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr);
    gradient.addColorStop(0, `rgba(200, 200, 200, ${c.a})`);
    gradient.addColorStop(0.5, `rgba(180, 180, 180, ${c.a * 0.5})`);
    gradient.addColorStop(1, 'rgba(160, 160, 160, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }

  return canvas.toDataURL('image/png');
}

/**
 * Create a shock diamond bright sprite
 */
export function createShockDiamondTexture(size = 64) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const center = size / 2;

  // Diamond shape with bright core
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center * 0.8);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
  gradient.addColorStop(0.2, 'rgba(200, 220, 255, 0.9)');
  gradient.addColorStop(0.5, 'rgba(150, 180, 255, 0.4)');
  gradient.addColorStop(1, 'rgba(100, 150, 255, 0)');

  // Draw a diamond/rhombus shape
  ctx.save();
  ctx.translate(center, center);
  ctx.rotate(Math.PI / 4);
  ctx.scale(0.6, 1.2);
  ctx.translate(-center, -center);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  ctx.restore();

  return canvas.toDataURL('image/png');
}

/**
 * Create an intense hot core texture (for engine nozzle)
 */
export function createHotCoreTexture(size = 64) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const center = size / 2;

  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
  gradient.addColorStop(0, 'rgba(220, 230, 255, 1.0)');    // blue-white core
  gradient.addColorStop(0.3, 'rgba(255, 255, 240, 0.95)');  // white
  gradient.addColorStop(0.6, 'rgba(255, 220, 150, 0.5)');
  gradient.addColorStop(1, 'rgba(255, 180, 80, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return canvas.toDataURL('image/png');
}
