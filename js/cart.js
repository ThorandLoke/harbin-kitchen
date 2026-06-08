/* ============================================================
   Cart Manager — Harbin Kitchen
   Persisted in localStorage
   ============================================================ */

const CART_KEY = 'harbin_cart';

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

/**
 * Add item to cart (or increment qty if already there)
 * @param {Object} item — menu item object
 * @param {string} categoryId
 */
function addToCart(item, categoryId) {
  const cart = loadCart();
  const existing = cart.find((c) => c.itemId === item.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ itemId: item.id, categoryId, qty: 1 });
  }
  saveCart(cart);
  return cart;
}

/**
 * Remove one qty from cart item (or remove entirely)
 * @param {string} itemId
 */
function decreaseFromCart(itemId) {
  let cart = loadCart();
  const idx = cart.findIndex((c) => c.itemId === itemId);
  if (idx === -1) return cart;
  cart[idx].qty -= 1;
  if (cart[idx].qty <= 0) {
    cart = cart.filter((c) => c.itemId !== itemId);
  }
  saveCart(cart);
  return cart;
}

/**
 * Remove item entirely from cart
 * @param {string} itemId
 */
function removeFromCart(itemId) {
  let cart = loadCart();
  cart = cart.filter((c) => c.itemId !== itemId);
  saveCart(cart);
  return cart;
}

/**
 * Clear the entire cart
 */
function clearCart() {
  localStorage.removeItem(CART_KEY);
  return [];
}

/**
 * Get total number of items in cart
 */
function getCartCount() {
  const cart = loadCart();
  return cart.reduce((sum, c) => sum + c.qty, 0);
}

/**
 * Get enriched cart items (with full item data)
 * @param {Array} menuCategories — full menu data
 */
function getEnrichedCart(menuCategories) {
  const cart = loadCart();
  return cart.map((c) => {
    const cat = menuCategories.find((cat) => cat.id === c.categoryId);
    const item = cat ? cat.items.find((i) => i.id === c.itemId) : null;
    return { ...c, item, category: cat };
  }).filter((c) => c.item);
}

if (typeof module !== 'undefined') module.exports = { loadCart, saveCart, addToCart, decreaseFromCart, removeFromCart, clearCart, getCartCount, getEnrichedCart };
