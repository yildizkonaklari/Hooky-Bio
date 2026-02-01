// Icon Generator Script for Hooky Bio
// Run this with Node.js: node generate-icons.js

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SOURCE_ICON = './icons/bio-logo.png';
const OUTPUT_DIR = './icons';

// All required sizes for PWA and Android Play Store
const sizes = [
    16, 32, 48, 72, 96, 128, 144, 152, 180, 192, 256, 384, 512
];

async function generateIcons() {
    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    console.log('Generating icons from:', SOURCE_ICON);

    for (const size of sizes) {
        const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);

        await sharp(SOURCE_ICON)
            .resize(size, size, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 0 }
            })
            .png()
            .toFile(outputPath);

        console.log(`✓ Generated: ${outputPath}`);
    }

    // Generate maskable icon (with padding for safe zone)
    const maskableSize = 512;
    const padding = Math.floor(maskableSize * 0.1); // 10% padding for safe zone

    await sharp(SOURCE_ICON)
        .resize(maskableSize - (padding * 2), maskableSize - (padding * 2), {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .extend({
            top: padding,
            bottom: padding,
            left: padding,
            right: padding,
            background: { r: 13, g: 13, b: 15, alpha: 1 } // #0d0d0f
        })
        .png()
        .toFile(path.join(OUTPUT_DIR, 'maskable-512x512.png'));

    console.log('✓ Generated: maskable-512x512.png');
    console.log('\n✅ All icons generated successfully!');
}

generateIcons().catch(console.error);
