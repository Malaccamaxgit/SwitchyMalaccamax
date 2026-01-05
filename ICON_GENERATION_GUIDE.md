# Icon Generation Guide

I've created a professional network/proxy-themed icon design with:
- Blue gradient background (matching your brand colors)
- Network node visualization (proxy routing concept)
- Bidirectional arrows (showing traffic switching)
- Modern, clean look

## ✅ SVG Icons Created

- `public/icons/icon.svg` (128x128, scalable)
- `public/icons/icon-128.svg` (128x128, scalable)

## 📋 Generate PNG Files (Choose One Method)

### Method 1: Online Converter (Easiest - 2 minutes)

1. **Go to**: https://svgtopng.com or https://cloudconvert.com/svg-to-png
2. **Upload**: `public/icons/icon.svg`
3. **Convert at these sizes**:
   - 16x16 → Save as `icon-16.png`
   - 48x48 → Save as `icon-48.png`
   - 128x128 → Save as `icon-128.png`
4. **Save all three files** to `public/icons/` folder
5. **Rebuild**: `npm run build`

### Method 2: ImageMagick (Command Line)

```powershell
# Install ImageMagick
winget install ImageMagick.ImageMagick

# Then run:
magick public/icons/icon.svg -resize 16x16 public/icons/icon-16.png
magick public/icons/icon.svg -resize 48x48 public/icons/icon-48.png
magick public/icons/icon.svg -resize 128x128 public/icons/icon-128.png
```

### Method 3: Sharp (Node.js - Best Quality)

```bash
# Install sharp
npm install --save-dev sharp

# Run generator script
node scripts/generate-icons.js
```

Then edit `scripts/generate-icons.js` and uncomment the Sharp section.

## 🎨 Icon Design Details

**Theme**: Network routing / Proxy switching
**Colors**: 
- Primary: Blue (#3b82f6)
- Accent: Light blue (#60a5fa)
- Background: Blue gradient (#3b82f6 → #1e40af)

**Symbolism**:
- Central hub: Active proxy connection
- Side nodes: Alternative proxy servers
- Arrows: Traffic routing/switching
- Vertical branches: Multiple connection paths

## 🔄 Alternative: Use Existing Icon Template

If you prefer a simpler approach, you can use the current placeholder and just need the PNGs generated.

## ✅ Quick Test After Generation

```bash
npm run build
# Load dist/ in Chrome to see the new icons
```

The icons will appear in:
- Chrome toolbar (16x16)
- Extension management page (48x48)
- Chrome Web Store listing (128x128)
