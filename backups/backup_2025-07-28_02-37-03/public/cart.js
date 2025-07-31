// cart.js - reusable cart logic for product pages

// Product map for id -> name (define only once, always use window.productMap)
if (!window.productMap) {
  window.productMap = {
    "hi-vis-vest": { name: "Hi-Vis Vest" },
    "tac-hoodie": { name: "Tactical Hoodie" },
    "basic-boots": { name: "Covert Boots" },
    "tac-trousers": { name: "TAC Trousers" },
    "tac-mid-layer": { name: "TAC Mid-Layer" },
    "tac-gloves": { name: "Team TAC Gloves" },
    "field-boots": { name: "Field Boots" },
    "elite-tac-boots": { name: "TAC Elite Boots" },
    "pro-tac-jacket": { name: "TAC Jacket" },
    "pro-tac-gloves": { name: "TAC Gloves" },
    "value-tac-gloves": { name: "Entry TAC Gloves" },
    "stab-vest": { name: "Stab Vest" },
    "multi-tool": { name: "Multi-Tool" },
    "tactical-pen": { name: "Tactical Defense Pen" },
    "survival-knife": { name: "Survival Tactical Knife" },
    "pro-multi-tool": { name: "TAC Multi-Tool" },
    "basic-field-knife": { name: "Field Knife" },
    "personal-security-spray": { name: "Personal Security Spray" },
    "tac-headlamp": { name: "TAC Headlamp" },
    "compact-backpack": { name: "Compact Tactical Backpack" },
    "night-vision": { name: "Night Vision" },
    "ballistic-helmet": { name: "TAC Ballistic Helmet" },
    "tac-rangefinder": { name: "TAC Rangefinder" },
    "tac-thermal-scope": { name: "TAC Thermal Scope" },
    "starter-backpack": { name: "Covert Backpack" }
  };
}


function addToCart(productId, quantity = 1, price = null) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existingItem = cart.find(item => item.id === productId);
  const name = window.productMap[productId]?.name || productId;
  if (existingItem) {
    existingItem.qty += quantity;
    if (price) existingItem.price = price;
    if (name) existingItem.name = name;
  } else {
    cart.push({ id: productId, qty: quantity, price, name });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent('cartUpdated'));
  alert('Product added to cart!');
}

window.addToCart = addToCart;
