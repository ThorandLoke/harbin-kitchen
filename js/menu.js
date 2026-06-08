/* ============================================================
   Menu Renderer — Harbin Kitchen
   Supports: discount display, preorder badges
   ============================================================ */

function renderMenu(categories, activeCategory, lang) {
  const container = document.getElementById('menu-container');
  if (!container) return;

  const filtered = activeCategory === 'all'
    ? categories
    : categories.filter((c) => c.id === activeCategory);

  container.innerHTML = filtered.map((cat) => renderCategory(cat, lang)).join('');
}

function renderCategory(cat, lang) {
  const type = getOrderType();
  const hasDiscountCategory = cat.discount && type === 'takeaway';
  const discountTag = hasDiscountCategory
    ? `<span class="menu-section__discount-tag">🌱 -10% afhentning</span>`
    : (cat.discount && type === 'dinein')
      ? `<span class="menu-section__no-discount-tag">${lang === 'zh' ? '堂食无折扣' : 'Ingen rabat'}</span>`
      : (!cat.discount)
        ? `<span class="menu-section__no-discount-tag">${lang === 'zh' ? '无折扣' : 'Ingen rabat'}</span>`
        : '';

  const name = lang === 'zh' ? cat.name_zh : cat.name_da;
  const subtitle = lang === 'zh' ? cat.name_da : cat.name_zh;

  const items = cat.items.map((item) => renderMenuItem(item, cat, lang)).join('');

  return `
    <div class="menu-section" id="cat-${cat.id}">
      <div class="menu-section__title">${name} ${discountTag}</div>
      <div class="menu-section__subtitle">${subtitle}</div>
      ${items}
    </div>
  `;
}

function renderMenuItem(item, cat, lang) {
  const { finalPrice, discount, hasDiscount: discounted } = calculatePrice(item.price, cat.id);

  const name = lang === 'zh' ? item.name_zh : item.name_da;
  const nameAlt = lang === 'zh' ? item.name_da : item.name_zh;
  const desc = lang === 'zh' ? (item.description_zh || item.description_da) : (item.description_da || '');

  // Preorder badge
  const preorderBadge = item.lead_days
    ? `<div class="menu-item__preorder-badge">⏰ ${lang === 'zh' ? '需提前' + item.lead_days + '天' : item.lead_days + ' dag' + (item.lead_days > 1 ? 'e' : '') + ' i forvejen'}</div>`
    : '';

  const priceHtml = discounted
    ? `<span class="menu-item__price">${finalPrice} kr.</span>
       <span class="menu-item__price-original">${item.price} kr.</span>
       <span class="menu-item__discount-badge">-${discount} kr</span>`
    : `<span class="menu-item__price">${item.price} kr.</span>`;

  const btnClass = discounted ? 'add-btn' : 'add-btn add-btn--outline';

  return `
    <div class="menu-item" data-item-id="${item.id}" data-category-id="${cat.id}">
      <div class="menu-item__info">
        ${preorderBadge}
        <div class="menu-item__name">${name}</div>
        <div class="menu-item__name-zh">${nameAlt}</div>
        ${desc ? `<div class="menu-item__desc">${desc}</div>` : ''}
        <div class="menu-item__prices">${priceHtml}</div>
      </div>
      <button class="${btnClass}" onclick="handleAddToCart('${item.id}','${cat.id}')" aria-label="Tilføj ${name}">
        +
      </button>
    </div>
  `;
}

/**
 * Render category navigation pills
 */
function renderCategoryNav(categories, activeCategory, lang) {
  const nav = document.getElementById('category-nav');
  if (!nav) return;

  const allPill = `<button class="category-nav__pill ${activeCategory === 'all' ? 'active' : ''}" onclick="selectCategory('all')">${lang === 'zh' ? '全部' : 'Alle'}</button>`;

  const pills = categories.map((cat) => {
    const label = lang === 'zh' ? cat.name_zh : cat.name_da;
    const icon = cat.preorder ? '⏰ ' : '';
    return `<button class="category-nav__pill ${activeCategory === cat.id ? 'active' : ''}" onclick="selectCategory('${cat.id}')">${icon}${label}</button>`;
  }).join('');

  nav.innerHTML = allPill + pills;
}

if (typeof module !== 'undefined') module.exports = { renderMenu, renderCategoryNav };
