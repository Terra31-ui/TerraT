// Script to generate image-checklist.js from productImages.js

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const productImagesPath = path.resolve(
  __dirname,
  "../src/data/productImages.js",
);
const checklistPath = path.resolve(__dirname, "../src/data/image-checklist.js");
const imagesDir = path.resolve(__dirname, "../public/products/");

// Read productImages.js as text
const productImagesRaw = fs.readFileSync(productImagesPath, "utf-8");

// Extract the productImages object using regex
const match = productImagesRaw.match(
  /export const productImages = \{([\s\S]*?)\};/,
);
if (!match) {
  console.error("Could not find productImages object in productImages.js");
  process.exit(1);
}

const objectBody = match[1];

// Parse each line to get id and filename
const lines = objectBody
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith("//"));
const checklist = [];

for (const line of lines) {
  // Match: 'id': 'filename',
  const m = line.match(/^'([^']+)':\s*'([^']+)'/);
  if (m) {
    // Remove leading slash for fs.existsSync
    const filename = m[2].replace(/^\//, "");
    const imagePath = path.join(imagesDir, path.basename(filename));
    const status = fs.existsSync(imagePath) ? "complete" : "needed";
    checklist.push({
      id: m[1],
      filename: m[2],
      status,
    });
  }
}

// Generate JS file content
const fileContent = `// Image generation checklist for TerraTAC products
const imageChecklist = [
${checklist.map((item) => `  { id: '${item.id}', filename: '${item.filename}', status: '${item.status}' },`).join("\n")}
];

export default imageChecklist;
`;

// Write to image-checklist.js
fs.writeFileSync(checklistPath, fileContent, "utf-8");
console.log("image-checklist.js has been updated!");
