// Generate simple SVG-based PNG icons for PWA
const { createCanvas } = (() => {
  try { return require('canvas'); } catch { return { createCanvas: null }; }
})();

// If canvas not available, we'll use a simple SVG approach instead
const fs = require('fs');
const path = require('path');

// Create a simple SVG icon
function createIconSVG(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size*0.18)}" fill="#2D2A26"/>
  <text x="50%" y="42%" text-anchor="middle" dominant-baseline="central" fill="#FAFAF7" font-family="sans-serif" font-size="${Math.round(size*0.22)}" font-weight="700">HK</text>
  <text x="50%" y="68%" text-anchor="middle" dominant-baseline="central" fill="#6B8E23" font-family="sans-serif" font-size="${Math.round(size*0.09)}" font-weight="600">-10%</text>
</svg>`;
}

const iconsDir = __dirname;
fs.writeFileSync(path.join(iconsDir, 'icon-192.svg'), createIconSVG(192));
fs.writeFileSync(path.join(iconsDir, 'icon-512.svg'), createIconSVG(512));
console.log('SVG icons created');

// Also try to create PNG versions using puppeteer-core
(async () => {
  try {
    const puppeteer = require('puppeteer-core');
    const browser = await puppeteer.launch({
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    for (const size of [192, 512]) {
      const page = await browser.newPage();
      await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
      const svgPath = path.join(iconsDir, `icon-${size}.svg`);
      await page.goto('file://' + svgPath, { waitUntil: 'networkidle0' });
      await page.screenshot({ path: path.join(iconsDir, `icon-${size}.png`), type: 'png' });
      await page.close();
    }
    
    await browser.close();
    console.log('PNG icons created');
  } catch (err) {
    console.log('PNG creation skipped:', err.message);
    console.log('SVG icons are still available as fallback');
  }
})();
