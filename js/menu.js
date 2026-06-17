/* ============================================================
   Menu Renderer — Harbin Kitchen
   Supports: discount display, preorder badges
   ============================================================ */

function renderMenu(categories, activeCategory, lang) {
  const container = document.getElementById('menu-container');
  if (!container) return;

  const type = getOrderType();
  const filteredByType = categories.filter((c) => {
    if (!c.orderTypes) return true;
    return c.orderTypes.includes(type);
  });

  const filtered = activeCategory === 'all'
    ? filteredByType
    : filteredByType.filter((c) => c.id === activeCategory);

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

  const items = cat.items.map((item) => renderMenuItem(item, cat, lang)).join('');

  return `
    <div class="menu-section" id="cat-${cat.id}">
      <div class="menu-section__title">${name} ${discountTag}</div>
      ${items}
    </div>
  `;
}

function renderMenuItem(item, cat, lang) {
  const { finalPrice, discount, hasDiscount: discounted } = calculatePrice(item.price, cat.id);

  const name = lang === 'zh' ? item.name_zh : item.name_da;
  const desc = lang === 'zh' 
    ? (item.description_zh || item.description_da || '') 
    : (item.description_da || item.description_zh || '');
  const code = item.code ? `<span class="menu-item__code">${item.code}</span>` : '';

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

  // Image thumbnail
  const imageHtml = item.image
    ? `<div class="menu-item__img-wrap"><img class="menu-item__img" src="${item.image}" alt="${name}" loading="lazy" onerror="this.parentElement.style.display='none'" onclick="openImageModal(this.src, '${lang}')"></div>`
    : '';

  return `
    <div class="menu-item${item.image ? ' menu-item--has-img' : ''}" data-item-id="${item.id}" data-category-id="${cat.id}">
      ${imageHtml}
      <div class="menu-item__info">
        ${preorderBadge}
        <div class="menu-item__name">${code}${name}</div>
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

  const type = getOrderType();
  const filteredByType = categories.filter((c) => {
    if (!c.orderTypes) return true;
    return c.orderTypes.includes(type);
  });

  const allPill = `<button class="category-nav__pill ${activeCategory === 'all' ? 'active' : ''}" onclick="selectCategory('all')">${lang === 'zh' ? '全部' : 'Alle'}</button>`;

  const pills = filteredByType.map((cat) => {
    const label = lang === 'zh' ? cat.name_zh : cat.name_da;
    const icon = cat.preorder ? '⏰ ' : '';
    return `<button class="category-nav__pill ${activeCategory === cat.id ? 'active' : ''}" onclick="selectCategory('${cat.id}')">${icon}${label}</button>`;
  }).join('');

  nav.innerHTML = allPill + pills;
}

if (typeof module !== 'undefined') module.exports = { renderMenu, renderCategoryNav };
