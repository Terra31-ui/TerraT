import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

// CONFIG: Map product IDs to remote image URLs if you want to auto-download
const remoteImageSources = {
  // Example:
  // 'hi-vis-vest': 'https://example.com/images/hi-vis-vest.png',
  // Add your mappings here
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const productsPath = path.resolve(__dirname, '../src/data/products.js');
const productImagesPath = path.resolve(__dirname, '../src/data/productImages.js');
const imagesDir = path.resolve(__dirname, '../public/products/');
const placeholder = 'placeholder.svg';

// Load productImages.js
const productImagesRaw = fs.readFileSync(productImagesPath, 'utf-8');
const imgMatch = productImagesRaw.match(/export const productImages = \{([\s\S]*?)\};/);
const imgObj = {};
if (imgMatch) {
  imgMatch[1].split('\n').forEach(line => {
    const m = line.match(/^ *'([^']+)': *'([^']+)'/);
    if (m) imgObj[m[1]] = m[2];
  });
}

// Load products.js
const productsRaw = fs.readFileSync(productsPath, 'utf-8');
const prodMatches = [...productsRaw.matchAll(/id: ['"]([^'"]+)['"]/g)];
const productIds = prodMatches.map(m => m[1]);

// Helper to download an image
function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, response => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', err => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

// 1. Ensure every referenced image exists, download or copy placeholder if missing
let missing = [];
let downloadPromises = [];
for (const id of productIds) {
  const filename = imgObj[id] ? path.basename(imgObj[id]) : null;
  if (!filename) {
    missing.push({ id, reason: 'No image mapping in productImages.js' });
    continue;
  }
  const imagePath = path.join(imagesDir, filename);
  if (!fs.existsSync(imagePath)) {
    if (remoteImageSources[id]) {
      // Download from remote source
      console.log(`Downloading image for ${id} from ${remoteImageSources[id]}...`);
      downloadPromises.push(
        downloadImage(remoteImageSources[id], imagePath)
          .then(() => console.log(`Downloaded: ${filename}`))
          .catch(err => {
            console.error(`Failed to download ${filename}:`, err.message);
            // Fallback to placeholder if download fails
            const placeholderPath = path.join(imagesDir, placeholder);
            if (fs.existsSync(placeholderPath)) {
              fs.copyFileSync(placeholderPath, imagePath);
              console.log(`Copied placeholder for ${filename}`);
            } else {
              missing.push({ id, filename, reason: 'Missing image and no placeholder' });
            }
          })
      );
    } else {
      // Copy placeholder if available
      const placeholderPath = path.join(imagesDir, placeholder);
      if (fs.existsSync(placeholderPath)) {
        fs.copyFileSync(placeholderPath, imagePath);
        console.log(`Copied placeholder for missing image: ${filename}`);
      } else {
        missing.push({ id, filename, reason: 'Missing image and no placeholder' });
      }
    }
  }
}

// 2. Optionally, remove unused images
const usedFilenames = new Set(Object.values(imgObj).map(f => path.basename(f)));
const allFiles = fs.readdirSync(imagesDir);
for (const file of allFiles) {
  if (file === placeholder) continue;
  if (!usedFilenames.has(file)) {
    // Uncomment to actually delete:
    // fs.unlinkSync(path.join(imagesDir, file));
    console.log(`Unused image in /public/products/: ${file}`);
  }
}

// Wait for all downloads to finish
Promise.all(downloadPromises).then(() => {
  if (missing.length) {
    console.log('\nMissing images or mappings:');
    missing.forEach(m => console.log(m));
  } else {
    console.log('\nAll product images are present, downloaded, or have a placeholder.');
  }
});
