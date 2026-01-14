/**
 * Icon generation script
 * Converts SVG to PNG files at different sizes
 * 
 * Usage: node scripts/generate-icons.js
 */

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [16, 48, 128];
const inputPath = join(__dirname, '../public/icons/icon.svg');

console.log('🎨 Generating PNG icons from SVG...\n');

for (const size of sizes) {
  await sharp(inputPath)
    .resize(size, size)
    .png()
    .toFile(join(__dirname, `../public/icons/icon-${size}.png`));
  console.log(`✅ Generated icon-${size}.png`);
}

console.log('\n✅ All icon sizes generated successfully!');
console.log('Run `npm run build` to see the new icons in your extension.');
