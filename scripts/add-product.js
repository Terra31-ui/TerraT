// add-product.js
// Node.js script to automate product addition for TerraT
// Prompts for product details, updates products.js, and generates a product page

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => rl.question(question, answer => resolve(answer.trim())));
}

async function main() {
  console.log('--- Add New Product ---');
  const name = await ask('Product Name: ');
  const slug = await ask('Product Slug (e.g. tac-hoodie): ');
  const price = await ask('Price (number only): ');
  const description = await ask('Description: ');
  const image = await ask('Image filename (in public/products/): ');

  // 1. Update products.js
  const productsPath = path.join(__dirname, 'src/data/products.js');
  let productsData = fs.readFileSync(productsPath, 'utf8');
  // Find the array and insert before the closing bracket
  const newProduct = `  {
    name: "${name}",
    slug: "${slug}",
    price: ${price},
    description: "${description}",
    image: "/products/${image}"
  },\n`;
  productsData = productsData.replace(/(\[)([\s\S]*?)(\][^\]]*$)/m, (match, open, body, close) => {
    // Insert before the last closing bracket
    return open + body + newProduct + close;
  });
  fs.writeFileSync(productsPath, productsData, 'utf8');
  console.log('✓ Product added to products.js');

  // 2. Generate product page
  const pageDir = path.join(__dirname, 'src/pages/products');
  const pagePath = path.join(pageDir, `${slug}.astro`);
  if (fs.existsSync(pagePath)) {
    console.log('! Product page already exists, skipping page creation.');
  } else {
    const pageContent = `---\nimport products from '../../data/products.js';\nconst product = products.find(p => p.slug === '${slug}');\n---\n\n<Layout title={product.name}>\n  <div class="container mx-auto py-8">\n    <img src={product.image} alt={product.name} class="w-64 mx-auto mb-4" />\n    <h1 class="text-3xl font-bold mb-2">{product.name}</h1>\n    <p class="mb-4">{product.description}</p>\n    <div class="text-xl font-semibold mb-4">£{product.price}</div>\n    <button onclick="window.history.back()" class="bg-gray-200 px-4 py-2 rounded">Back</button>\n  </div>\n</Layout>\n`;
    fs.writeFileSync(pagePath, pageContent, 'utf8');
    console.log('✓ Product page created:', pagePath);
  }

  rl.close();
}

main();
