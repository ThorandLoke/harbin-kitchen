/* ============================================================
   Discount Engine — Harbin Kitchen
   Rule: 10% off TAKEAWAY ONLY, for Hovedretter (main courses) and
         pre-order items ONLY.
         All other categories (appetizers, soups, dim sum, cold dishes,
         sauces, drinks) are NOT discounted.
         Dine-in: NO discount on anything
   ============================================================ */

const DISCOUNT_RATE = 0.10; // 10%
const NO_DISCOUNT_IDS = ['sauce', 'drikkekort', 'drikkekort_dinein', 'forretter', 'dagens_suppe', 'dum', 'kold_rette'];

// Order type: 'takeaway' or 'dinein'
let orderType = localStorage.getItem('harbin_order_type') || '';

function setOrderType(type) {
  orderType = type;
  localStorage.setItem('harbin_order_type', type);
}

function getOrderType() {
  return orderType;
}

/**
 * Check if a category qualifies for discount (given current order type)
 * @param {string} categoryId
 * @returns {boolean}
 */
function hasDiscount(categoryId) {
  if (orderType !== 'takeaway') return false;
  return !NO_DISCOUNT_IDS.includes(categoryId);
}

/**
 * Calculate the discounted price for an item
 * @param {number} originalPrice
 * @param {string} categoryId
 * @returns {{ finalPrice: number, discount: number, hasDiscount: boolean }}
 */
function calculatePrice(originalPrice, categoryId) {
  if (!originalPrice && originalPrice !== 0) {
    return { finalPrice: 0, discount: 0, hasDiscount: false };
  }
  const discounted = hasDiscount(categoryId);
  const discount = discounted ? Math.round(originalPrice * DISCOUNT_RATE) : 0;
  const finalPrice = originalPrice - discount;
  return { finalPrice, discount, hasDiscount: discounted };
}

/**
 * Resolve the effective base price of a cart line, taking the selected
 * option's price override into account (e.g. vegetar fried rice 128 kr).
 * @param {object} item — menu item
 * @param {string} selectedOption — selected option id (may be undefined)
 * @returns {number}
 */
function getLineBasePrice(item, selectedOption) {
  if (selectedOption && item && item.options) {
    const opt = item.options.find(o => o.id === selectedOption);
    if (opt && opt.price != null) return opt.price;
  }
  return item ? item.price : 0;
}

/**
 * Calculate cart totals
 * @param {Array} cartItems — [{item, categoryId, qty, selectedOption}]
 * @returns {{ subtotal: number, totalDiscount: number, total: number, discountItems: number }}
 */
function calculateCartTotals(cartItems) {
  let subtotal = 0;
  let totalDiscount = 0;
  let discountItems = 0;

  cartItems.forEach(({ item, categoryId, qty, selectedOption }) => {
    const basePrice = getLineBasePrice(item, selectedOption);
    const { finalPrice, discount, hasDiscount: discounted } = calculatePrice(basePrice, categoryId);
    subtotal += basePrice * qty;
    totalDiscount += discount * qty;
    if (discounted) discountItems += qty;
  });

  return {
    subtotal,
    totalDiscount,
    total: subtotal - totalDiscount,
    discountItems
  };
}

if (typeof module !== 'undefined') module.exports = { hasDiscount, calculatePrice, calculateCartTotals, getLineBasePrice, DISCOUNT_RATE, NO_DISCOUNT_IDS, setOrderType, getOrderType };
