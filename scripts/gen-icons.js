const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'public', 'icons');
fs.mkdirSync(outDir, { recursive: true });

// Brand icon: indigo rounded square with a flame
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#4F6BED"/>
  <path d="M256 120c-8 40-56 72-56 132 0 44 25 68 56 68s56-24 56-68c0-28-14-52-30-72 6 20-6 44-26 56 0-40-14-92 0-116z"
    fill="#FFFFFF"/>
  <path d="M256 320c-16 12-20 20-20 32 0 18 9 28 20 28s20-10 20-28c0-10-4-18-12-26-2 8-4 16-8 24 0-16-4-30 0-30z"
    fill="#FFD166" opacity="0.9"/>
</svg>
`;

sharp(Buffer.from(svg))
  .resize(512, 512)
  .png()
  .toFile(path.join(outDir, 'icon-512.png'))
  .then(() => console.log('icon-512.png created'))
  .catch(console.error);

sharp(Buffer.from(svg))
  .resize(192, 192)
  .png()
  .toFile(path.join(outDir, 'icon-192.png'))
  .then(() => console.log('icon-192.png created'))
  .catch(console.error);
