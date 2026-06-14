/* ============================================================
   App Controller — Harbin Kitchen PWA
   Supports: Dine-in / Takeaway / Preorder items
   ============================================================ */

// ── State ──
let menuData = [];
let currentLang = localStorage.getItem('harbin_lang') || 'da';
let currentCategory = 'all';
let currentPage = 'welcome'; // 'welcome' | 'menu' | 'cart' | 'checkout' | 'confirm'
let pendingPreorderItem = null; // { itemId, categoryId }
let currentOrderId   = null;   // null = 新订单；非null = 合并到已有订单 (Supabase id)
let currentOrderNumber = null;   // 合并时保留原订单号，避免重复生成
let pendingMergeOrder = null; // 弹窗时暂存已有订单信息

// ── Real-time Shared Cart (Draft Order) ──
let currentDraftOrderId = null; // Supabase id of the draft order
let realtimeChannel = null;      // Supabase Realtime channel
let isApplyingRealtime = false; // prevent infinite loop
let syncCartTimer = null;        // debounce timer for syncing

// ── Init ──
document.addEventListener('DOMContentLoaded', async () => {
  await loadMenuData();

  // Check URL params for QR code scan (e.g. ?type=dinein&table=5)
  const params = new URLSearchParams(window.location.search);
  const urlType = params.get('type');
  const urlTable = params.get('table');

  // Try to rejoin saved draft order (page refresh without QR scan)
  const savedDraftId = localStorage.getItem('harbin_draft_order_id');
  const savedDraftTable = localStorage.getItem('harbin_draft_table');
  if (savedDraftId && savedDraftTable && !urlType) {
    console.log('[App] Rejoining saved draft for table', savedDraftTable);
    await joinOrCreateDraftOrder(savedDraftTable);
    const existing = await checkExistingOrderForTable(savedDraftTable);
    if (existing) {
      pendingMergeOrder = existing;
      showMergeModal(savedDraftTable);
    } else {
      selectOrderType('dinein', true);
    }
    window.history.replaceState({}, '', window.location.pathname);
    registerSW();
    return;
  }

  if (urlType === 'dinein' && urlTable) {
    // QR scan: first join or create a draft order (shared cart)
    document.getElementById('table-number').value = urlTable;
    await joinOrCreateDraftOrder(urlTable);

    // Also check if there's an existing "new/preparing/ready" order (for 加菜)
    const existing = await checkExistingOrderForTable(urlTable);
    if (existing) {
      pendingMergeOrder = existing;
      showMergeModal(urlTable);
    } else {
      // No existing order — enter menu page directly
      selectOrderType('dinein', true);
    }
    window.history.replaceState({}, '', window.location.pathname);
  } else if (urlType === 'takeaway') {
    selectOrderType('takeaway', true);
    window.history.replaceState({}, '', window.location.pathname);
  } else {
    // Normal flow: restore or show welcome
    const savedType = getOrderType();
    if (savedType) {
      selectOrderType(savedType, true);
    } else {
      updateWelcomeText();
    }
  }
  registerSW();
});

async function loadMenuData() {
  if (typeof MENU_DATA !== 'undefined') {
    // Filter out preorder category from normal menu — only shown via welcome page
    menuData = MENU_DATA.filter(c => !c.preorder);
    return;
  }
  try {
    const resp = await fetch('data/menu.json');
    const data = await resp.json();
    menuData = data.categories.filter(c => !c.preorder);

  } catch (err) {
    console.error('Failed to load menu:', err);
  }
}

function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
  }
}

// ═══════════════════════════════════════
// Welcome Page — Order Type Selection
// ═══════════════════════════════════════

function updateWelcomeText() {
  const da = currentLang === 'da';
  document.getElementById('welcome-logo').textContent = da ? 'Harbin Kitchen' : '东北小炒';
  document.getElementById('welcome-sub').textContent = da ? 'Hvordan vil du spise?' : '您想怎么用餐？';
  document.getElementById('welcome-dinein-title').textContent = da ? 'Spis her' : '堂食';
  document.getElementById('welcome-dinein-desc').textContent = da ? 'Sid i restauranten og bestil fra din telefon · Betal ved kassen' : '在餐厅就座，用手机点餐 · 吧台付款';
  document.getElementById('welcome-takeaway-title').textContent = da ? 'Afhentning' : '外卖';
  document.getElementById('welcome-takeaway-desc').textContent = da ? 'Bestil til afhentning – betal i butikken' : '点外卖到店取餐付款';
  document.getElementById('welcome-takeaway-badge').textContent = da ? '🌱 10% rabat på alle retter (undtagen drikkevarer & saucer)' : '🌱 全场菜品10%折扣（酒水和酱料除外）';
  document.getElementById('welcome-preorder-title').textContent = da ? 'Forud bestilling' : '需预约';
  document.getElementById('welcome-preorder-desc').textContent = da ? 'Retter der skal bestilles 1–3 dage i forvejen · Betal ved afhentning' : '需要提前1-3天预约的菜品 · 取餐时付款';
  document.getElementById('welcome-preorder-badge').textContent = da ? '🐟 Hongshao fisk · 🍖 Lu-kød' : '🐟 红烧全鱼 · 🍖 卤味拼盘';
  // Update welcome page lang toggle active state
  document.querySelectorAll('.welcome-page__lang .lang-toggle__btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.wlang === currentLang);
  });
}

// Toggle language from welcome page
function toggleWelcomeLang(lang) {
  currentLang = lang;
  localStorage.setItem('harbin_lang', lang);
  updateWelcomeText();
}

function selectOrderType(type, silent) {
  // 'preorder' → directly enter preorder mode (no dine-in/takeaway choice needed)
  if (type === 'preorder') {
    setOrderType('preorder');
    selectOrderTypeAndJump('preorder', 'forud_bestilling', silent);
    return;
  }

  setOrderType(type);
  currentPage = 'menu';

  // Hide welcome, show main UI
  document.getElementById('page-welcome').classList.remove('active');
  document.getElementById('main-header').style.display = '';
  document.getElementById('category-nav').style.display = '';
  document.getElementById('page-menu').classList.add('active');

  // Show/hide table row
  const tableRow = document.getElementById('table-row');
  if (type === 'dinein') {
    tableRow.style.display = '';
  } else {
    tableRow.style.display = 'none';
  }

  updateOrderTypeIndicator();
  updateCheckoutForm();
  renderApp();

  if (!silent) {
    clearCart();
    updateCartBar();
  }
}

function selectOrderTypeAndJump(type, categoryId, silent) {
  setOrderType(type);
  currentPage = 'menu';
  currentCategory = categoryId;

  // Temporarily add preorder category if jumping to it
  if (categoryId === 'forud_bestilling' && typeof MENU_DATA !== 'undefined') {
    const preorderCat = MENU_DATA.find(c => c.preorder);
    if (preorderCat && !menuData.find(c => c.id === preorderCat.id)) {
      menuData.push(preorderCat);
    }
  }

  document.getElementById('page-welcome').classList.remove('active');
  document.getElementById('main-header').style.display = '';
  document.getElementById('category-nav').style.display = '';
  document.getElementById('page-menu').classList.add('active');

  const tableRow = document.getElementById('table-row');
  tableRow.style.display = type === 'dinein' ? '' : 'none';

  updateOrderTypeIndicator();
  updateCheckoutForm();
  renderApp();

  if (!silent) {
    clearCart();
    updateCartBar();
  }

  // Scroll to preorder section
  setTimeout(() => {
    const el = document.getElementById('cat-forud_bestilling');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 300);
}

function updateOrderTypeIndicator() {
  const homeBtn = document.getElementById('header-home-btn');
  homeBtn.innerHTML = '🏠';
  homeBtn.title = currentLang === 'zh' ? '返回主页' : 'Tilbage til start';

  const modeTag = document.getElementById('header-mode-tag');
  const type = getOrderType();
  if (type === 'dinein') {
    modeTag.textContent = currentLang === 'zh' ? '🍽️ 堂食' : '🍽️ Spis her';
  } else if (type === 'takeaway') {
    modeTag.textContent = currentLang === 'zh' ? '🥡 外卖 -10%' : '🥡 Afhentning -10%';
  } else if (type === 'preorder') {
    modeTag.textContent = currentLang === 'zh' ? '⏰ 预约' : '⏰ Forud bestilling';
  }
}

function updateCheckoutForm() {
  const type = getOrderType();
  const nameGroup = document.getElementById('name-group');
  const phoneGroup = document.getElementById('phone-group');
  const pickupGroup = document.getElementById('pickup-time-group');
  const guestCountGroup = document.getElementById('guest-count-group');
  const paymentHint = document.getElementById('checkout-payment-hint');
  const da = currentLang === 'da';

  if (type === 'dinein') {
    // Dine-in: no name/phone, no pickup time, show guest count
    nameGroup.style.display = 'none';
    document.getElementById('cust-name').removeAttribute('required');
    document.getElementById('cust-name').value = '';
    phoneGroup.style.display = 'none';
    document.getElementById('cust-phone').removeAttribute('required');
    document.getElementById('cust-phone').value = '';
    pickupGroup.style.display = 'none';
    guestCountGroup.style.display = '';
    paymentHint.innerHTML = da
      ? '💳 Betaling sker ved kassen — ikke online'
      : '💳 请到收银台付款 — 本页面不支持在线支付';
  } else if (type === 'preorder') {
    // Preorder: name & phone required, show pickup date/time, no guest count, no discount
    nameGroup.style.display = '';
    document.getElementById('cust-name').setAttribute('required', '');
    phoneGroup.style.display = '';
    phoneGroup.querySelector('.order-form__label').textContent = currentLang === 'zh' ? '电话 *' : 'Telefon *';
    document.getElementById('cust-phone').setAttribute('required', '');
    pickupGroup.style.display = '';
    pickupGroup.querySelector('.order-form__label').textContent = currentLang === 'zh' ? '预约日期' : 'Dato for afhentning';
    document.getElementById('pickup-time').type = 'date';
    guestCountGroup.style.display = 'none';
    paymentHint.innerHTML = da
      ? '💳 Betal ved kassen når du afhenter — ikke online'
      : '💳 取餐时在收银台付款 — 本页面不支持在线支付';
  } else {
    // Takeaway: name & phone required, pickup time shown, hide guest count
    nameGroup.style.display = '';
    document.getElementById('cust-name').setAttribute('required', '');
    phoneGroup.style.display = '';
    phoneGroup.querySelector('.order-form__label').textContent = currentLang === 'zh' ? '电话 *' : 'Telefon *';
    document.getElementById('cust-phone').setAttribute('required', '');
    pickupGroup.style.display = '';
    pickupGroup.querySelector('.order-form__label').textContent = currentLang === 'zh' ? '取餐时间' : 'Afhentningstid';
    document.getElementById('pickup-time').type = 'time';
    guestCountGroup.style.display = 'none';
    paymentHint.innerHTML = da
      ? '💳 Betal ved kassen når du afhenter — ikke online<br>⏱️ Forventet tilberedningstid: 20-30 minutter'
      : '💳 取餐时在收银台付款 — 本页面不支持在线支付<br>⏱️ 本单预计制作时间 20-30 分钟';

// ═══════════════════════════════════════
// Render
// ═══════════════════════════════════════

function renderApp() {
  renderCategoryNav(menuData, currentCategory, currentLang);
  renderMenu(menuData, currentCategory, currentLang);
  updateLangToggle();
  updateHeader();
  updateOrderTypeIndicator();
  updateWelcomeText();
  updateCheckoutForm();
}

// ── Language ──
function toggleLang(lang) {
  currentLang = lang;
  localStorage.setItem('harbin_lang', lang);
  renderApp();
}

function updateLangToggle() {
  document.querySelectorAll('.lang-toggle__btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });
}

// ── Category ──
function selectCategory(catId) {
  currentCategory = catId;
  renderCategoryNav(menuData, currentCategory, currentLang);
  renderMenu(menuData, currentCategory, currentLang);

  if (catId !== 'all') {
    const el = document.getElementById('cat-' + catId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ═══════════════════════════════════════
// Add to Cart (with preorder check)
// ═══════════════════════════════════════

function handleAddToCart(itemId, categoryId) {
  const cat = menuData.find((c) => c.id === categoryId);
  const item = cat ? cat.items.find((i) => i.id === itemId) : null;
  if (!item) return;

  // Check if this is a preorder item
  if (item.lead_days && item.lead_days > 0) {
    pendingPreorderItem = { itemId, categoryId };
    showPreorderModal(item);
    return;
  }

  // Check if item has options (e.g. starch choice)
  if (item.options && item.options.length > 0) {
    showOptionModal(item, categoryId);
    return;
  }

  addToCart(item, categoryId);
  updateCartBar();
  syncCartToDraft();

  // Visual feedback
  const el = document.querySelector(`[data-item-id="${itemId}"] .add-btn`);
  if (el) {
    el.style.transform = 'scale(1.3)';
    setTimeout(() => { el.style.transform = ''; }, 150);
  }
}

// ── Preorder Modal ──
function showPreorderModal(item) {
  const da = currentLang === 'da';
  const modal = document.getElementById('preorder-modal');
  document.getElementById('modal-title').textContent = da ? 'Forud bestilling påkrævet' : '需要提前预约';
  document.getElementById('modal-text').innerHTML = da
    ? `<strong>${item.name_da}</strong> skal bestilles <strong>${item.lead_days} dag${item.lead_days > 1 ? 'e' : ''}</strong> i forvejen.<br>Er du sikker på, at du vil tilføje denne ret?`
    : `<strong>${item.name_zh}</strong> 需要提前 <strong>${item.lead_days}</strong> 天预约。<br>确定要加入吗？`;
  document.getElementById('modal-cancel').textContent = da ? 'Annuller' : '取消';
  document.getElementById('modal-confirm').textContent = da ? 'Forstået, tilføj' : '了解，加入';
  modal.style.display = '';
}

function cancelPreorder() {
  pendingPreorderItem = null;
  document.getElementById('preorder-modal').style.display = 'none';
}

function confirmPreorder() {
  if (pendingPreorderItem) {
    const cat = menuData.find((c) => c.id === pendingPreorderItem.categoryId);
    const item = cat ? cat.items.find((i) => i.id === pendingPreorderItem.itemId) : null;
    if (item) addToCart(item, pendingPreorderItem.categoryId);
    updateCartBar();
  }
  pendingPreorderItem = null;
  document.getElementById('preorder-modal').style.display = 'none';
}

// ═════════════════════════════
// Option Select Modal
// ═════════════════════════════
let pendingOptionItem = null;
let pendingOptionCategoryId = null;
let selectedOptionId = null;
let optionQty = 1;

function showOptionModal(item, categoryId) {
  pendingOptionItem = item;
  pendingOptionCategoryId = categoryId;
  selectedOptionId = item.options && item.options.length > 0 ? item.options[0].id : null;
  optionQty = 1;

  const da = currentLang === 'da';

  // Image
  const imgEl = document.getElementById('option-modal-img');
  if (item.image) {
    imgEl.innerHTML = `<img src="${item.image}" alt="${da ? item.name_da : item.name_zh}" style="width:100%;border-radius:8px;">`;
    imgEl.style.display = '';
  } else {
    imgEl.style.display = 'none';
  }

  // Title
  document.getElementById('option-modal-title').textContent = da ? item.name_da : item.name_zh;

  // Description
  const desc = da ? (item.description_da || '') : (item.description_zh || '');
  document.getElementById('option-modal-desc').textContent = desc;

  // Options
  const choicesEl = document.getElementById('option-choices');
  choicesEl.innerHTML = item.options.map(opt => `
    <button class="option-choice ${opt.id === selectedOptionId ? 'option-choice--selected' : ''}"
            onclick="selectOption('${opt.id}')">
      ${da ? opt.name_da : opt.name_zh}
    </button>
  `).join('');

  // Qty
  document.getElementById('option-qty-num').textContent = optionQty;

  // Button texts
  const cancelBtn = document.querySelector('#option-modal .modal-box__btn--cancel');
  const confirmBtn = document.querySelector('#option-modal .modal-box__btn--confirm');
  cancelBtn.textContent = da ? 'Annuller' : '取消';
  confirmBtn.textContent = da ? 'Tilføj' : '加入购物车';

  // Show
  document.getElementById('option-modal').style.display = '';
}

function selectOption(optionId) {
  selectedOptionId = optionId;
  const item = pendingOptionItem;
  if (!item || !item.options) return;
  const da = currentLang === 'da';
  const choicesEl = document.getElementById('option-choices');
  choicesEl.innerHTML = item.options.map(opt => `
    <button class="option-choice ${opt.id === selectedOptionId ? 'option-choice--selected' : ''}"
            onclick="selectOption('${opt.id}')">
      ${da ? opt.name_da : opt.name_zh}
    </button>
  `).join('');
}

function optionQtyChange(delta) {
  optionQty = Math.max(1, optionQty + delta);
  document.getElementById('option-qty-num').textContent = optionQty;
}

function confirmOptionAndAddToCart() {
  if (!pendingOptionItem || !selectedOptionId) return;

  // Check if same item + same option already in cart
  const existingIdx = cart.findIndex(c =>
    c.itemId === pendingOptionItem.id && c.selectedOption === selectedOptionId
  );

  if (existingIdx >= 0) {
    cart[existingIdx].qty += optionQty;
  } else {
    cart.push({
      itemId: pendingOptionItem.id,
      categoryId: pendingOptionCategoryId,
      selectedOption: selectedOptionId,
      qty: optionQty
    });
  }

  saveCart();
  updateCartBar();
  syncCartToDraft();

  // Visual feedback
  const el = document.querySelector(`[data-item-id="${pendingOptionItem.id}"] .add-btn`);
  if (el) {
    el.style.transform = 'scale(1.3)';
    setTimeout(() => { el.style.transform = ''; }, 150);
  }

  cancelOptionModal();
}

function cancelOptionModal() {
  pendingOptionItem = null;
  pendingOptionCategoryId = null;
  selectedOptionId = null;
  optionQty = 1;
  document.getElementById('option-modal').style.display = 'none';
}


// ═══════════════════════════════════════
// Cart Bar
// ═══════════════════════════════════════

function updateCartBar() {
  const bar = document.getElementById('cart-bar');
  const count = getCartCount();
  const enriched = getEnrichedCart(menuData);
  const totals = calculateCartTotals(enriched);

  if (count === 0) {
    bar.classList.add('hidden');
    return;
  }

  bar.classList.remove('hidden');
  document.getElementById('cart-count').textContent = count;
  document.getElementById('cart-total').textContent = totals.total + ' kr.';
}

// ═══════════════════════════════════════
// Page Navigation
// ═══════════════════════════════════════

function showPage(page) {
  currentPage = page;
  document.querySelectorAll('.page').forEach((p) => p.classList.remove('active'));

  const target = document.getElementById('page-' + page);
  if (target) target.classList.add('active');

  window.scrollTo(0, 0);

  const bar = document.getElementById('cart-bar');
  if (page === 'checkout' || page === 'confirm' || page === 'welcome') {
    bar.classList.add('hidden');
  } else {
    updateCartBar();
  }

  // Show/hide header & nav for welcome
  const header = document.getElementById('main-header');
  const nav = document.getElementById('category-nav');
  const tableRow = document.getElementById('table-row');
  if (page === 'welcome') {
    header.style.display = 'none';
    nav.style.display = 'none';
    tableRow.style.display = 'none';
  } else {
    header.style.display = '';
    nav.style.display = '';
    tableRow.style.display = getOrderType() === 'dinein' ? '' : 'none';
  }

  if (page === 'cart') renderCartPage();
  if (page === 'checkout') renderCheckoutPage();
}

function openCart() {
  showPage('cart');
}

function goBack() {
  if (currentPage === 'checkout') showPage('cart');
  else if (currentPage === 'cart') showPage('menu');
  else if (currentPage === 'confirm') showPage('menu');
}

function goToWelcome() {
  const da = currentLang === 'da';
  const type = getOrderType();
  const typeLabel = type === 'dinein'
    ? (da ? 'Spis her' : '堂食')
    : type === 'preorder'
      ? (da ? 'Forud bestilling' : '预约')
      : (da ? 'Afhentning' : '外卖');

  const count = getCartCount();
  if (count > 0) {
    if (!confirm(da
      ? `Du har ${count} vare${count > 1 ? 'r' : ''} i kurven (${typeLabel}). Skift spisemåde vil tømme kurven. Fortsæt?`
      : `购物车有 ${count} 个商品（${typeLabel}），切换用餐方式会清空购物车。确定？`
    )) return;
  }

  // Clear cart and order type
  clearCart();
  currentOrderId = null;
  currentOrderNumber = null;
  pendingMergeOrder = null;
  localStorage.removeItem('harbin_order_type');

  // Cleanup Realtime subscription and draft order
  if (realtimeChannel) {
    if (typeof supabase !== 'undefined') {
      const { createClient } = supabase;
      const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      client.removeChannel(realtimeChannel);
    }
    realtimeChannel = null;
  }
  currentDraftOrderId = null;
  localStorage.removeItem('harbin_draft_order_id');
  localStorage.removeItem('harbin_draft_table');
  document.getElementById('table-number').value = '';

  // Show welcome page
  currentPage = 'welcome';

  // Remove preorder category from menuData when going back to welcome
  menuData = menuData.filter(c => !c.preorder);

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-welcome').classList.add('active');
  document.getElementById('main-header').style.display = 'none';
  document.getElementById('category-nav').style.display = 'none';
  document.getElementById('table-row').style.display = 'none';
  document.getElementById('cart-bar').classList.add('hidden');

  updateWelcomeText();
  window.scrollTo(0, 0);
}

// ═══════════════════════════════════════
// Cart Page
// ═══════════════════════════════════════

function renderCartItem(c, idx = -1) {
  const { finalPrice, discounted } = calculatePrice(c.item.price, c.categoryId);
  const name = currentLang === 'zh' ? c.item.name_zh : c.item.name_da;
  const nameAlt = currentLang === 'zh' ? c.item.name_da : c.item.name_zh;
  const lineTotal = finalPrice * c.qty;

  // Show selected option (e.g. noodle/rice/udon/hefen)
  let optionTag = '';
  if (c.selectedOption && c.item.options) {
    const opt = c.item.options.find(o => o.id === c.selectedOption);
    if (opt) {
      const optName = currentLang === 'zh' ? opt.name_zh : opt.name_da;
      optionTag = `<span class="cart-item__option">(${optName})</span>`;
    }
  }

  const preorderTag = c.item.lead_days ? `<span class="menu-item__preorder-badge">⏰ ${c.item.lead_days}d</span> ` : '';
  const cartImg = c.item.image
    ? `<div class="cart-item__img-wrap"><img class="cart-item__img" src="${c.item.image}" alt="${name}" loading="lazy" onerror="this.parentElement.style.display=\'none\'"></div>`
    : '';
  const codeTag = c.item.code ? `<span class="cart-item__code">${c.item.code}</span> ` : '';

  // Choose qty change handler
  const qtyHandler = (idx >= 0)
    ? `handleQtyChangeByIndex(${idx},`
    : `handleQtyChange('${c.itemId}', ${c.selectedOption ? `'${c.selectedOption}'` : 'null'},`;

  return `
    <div class="cart-item">
      ${cartImg}
      <div class="cart-item__info">
        <div class="cart-item__name">${codeTag}${preorderTag}${name} ${optionTag}</div>
        <div class="cart-item__name-zh">${nameAlt}</div>
        <div>
          ${discounted
              ? `<span class="cart-item__price">${finalPrice} kr.</span><span class="cart-item__price-original">${c.item.price} kr.</span>`
              : `<span class="cart-item__price">${c.item.price} kr.</span>`
            }
        </div>
      </div>
      <div class="cart-item__qty">
        <button class="qty-btn qty-btn--minus" onclick="${qtyHandler}-1)">−</button>
        <span class="cart-item__qty-num">${c.qty}</span>
        <button class="qty-btn qty-btn--plus" onclick="${qtyHandler}+1)">+</button>
      </div>
      <div class="cart-item__line-total">${lineTotal} kr.</div>
    </div>
  `;
}

function renderCartPage() {
  const container = document.getElementById('cart-items');
  const enriched = getEnrichedCart(menuData);
  const totals = calculateCartTotals(enriched);

  if (enriched.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">🛒</div>
        <div class="empty-state__text">${currentLang === 'zh' ? '购物车是空的' : 'Din kurv er tom'}</div>
      </div>`;
    document.getElementById('cart-summary').innerHTML = '';
    document.getElementById('cart-checkout-btn').style.display = 'none';
    const cartHint = document.getElementById('cart-payment-hint');
    if (cartHint) cartHint.style.display = 'none';
    return;
  }

  document.getElementById('cart-checkout-btn').style.display = '';

  // Separate dishes and drinks
  const dishes = [];
  const drinks = [];
  enriched.forEach(c => {
    const cat = c.category;
    if (cat && cat.categoryType === "drink") {
      drinks.push(c);
    } else {
      dishes.push(c);
    }
  });

  // Render dishes section
  let html = "";
  let globalIdx = 0;
  if (dishes.length > 0) {
    html += `<div class="cart-section-title">${currentLang === "zh" ? "🍽️ 菜品" : "🍽️ Retter"}</div>`;
    html += dishes.map((c, i) => renderCartItem(c, globalIdx + i)).join("");
    globalIdx += dishes.length;
  }

  // Render drinks section
  if (drinks.length > 0) {
    html += `<div class="cart-section-title">${currentLang === "zh" ? "🥤 饮品" : "🥤 Drikkevarer"}</div>`;
    html += drinks.map((c, i) => renderCartItem(c, globalIdx + i)).join("");
    globalIdx += drinks.length;
  }

  container.innerHTML = html;

  // Summary
  const type = getOrderType();
  const summaryEl = document.getElementById('cart-summary');
  summaryEl.innerHTML = `
    <div class="cart-summary">
      <div class="cart-summary__row">
        <span>${currentLang === 'zh' ? '小计' : 'Subtotal'}</span>
        <span>${totals.subtotal} kr.</span>
      </div>
      ${totals.totalDiscount > 0 ? `
        <div class="cart-summary__row cart-summary__row--discount">
          <span>🌱 ${currentLang === 'zh' ? '外卖折扣 -10%' : 'Afhentningsrabat -10%'}</span>
          <span>-${totals.totalDiscount} kr.</span>
        </div>
      ` : ''}
      <div class="cart-summary__row cart-summary__row--total">
        <span>${currentLang === 'zh' ? '合计' : 'Total'}</span>
        <span>${totals.total} kr.</span>
      </div>
      ${type === 'dinein' ? `<div style="text-align:center;font-size:var(--font-size-xs);color:var(--color-text-secondary);margin-top:8px;">${currentLang === 'zh' ? '堂食无折扣' : 'Ingen rabat ved spisested'}</div>` : ''}
    </div>
  `;

  // Cart payment hint
  const cartHint = document.getElementById('cart-payment-hint');
  if (cartHint) {
    cartHint.style.display = '';
    if (type === 'dinein') {
      cartHint.innerHTML = currentLang === 'zh'
        ? '💳 请到收银台付款 — 暂不支持在线支付'
        : '💳 Betaling ved kassen — ingen online betaling';
    } else {
      cartHint.innerHTML = currentLang === 'zh'
        ? '💳 取餐时在收银台付款 — 暂不支持在线支付<br>⏱️ 本单预计制作时间 20-30 分钟'
        : '💳 Betal ved kassen ved afhentning — ingen online betaling<br>⏱️ Forventet tilberedningstid: 20-30 minutter';
    }
  }
}

function handleQtyChange(itemId, delta) {
  if (delta > 0) {
    const cart = loadCart();
    const entry = cart.find((c) => c.itemId === itemId);
    if (entry) {
      const cat = menuData.find((c) => c.id === entry.categoryId);
      const item = cat ? cat.items.find((i) => i.id === itemId) : null;
      if (item) addToCart(item, entry.categoryId);
    }
  } else {
    decreaseFromCart(itemId);
  }
  updateCartBar();
  renderCartPage();
  syncCartToDraft();
}

function handleQtyChangeByIndex(idx, delta) {
  if (idx < 0 || idx >= cart.length) return;
  if (delta > 0) {
    cart[idx].qty += 1;
  } else {
    cart[idx].qty -= 1;
    if (cart[idx].qty <= 0) {
      cart.splice(idx, 1);
    }
  }
  saveCart();
  updateCartBar();
  renderCartPage();
  syncCartToDraft();
}

// ═══════════════════════════════════════
// Checkout
// ═══════════════════════════════════════

function renderCheckoutPage() {
  const form = document.getElementById('checkout-form');
  if (form) form.reset();
  document.getElementById('checkout-error').textContent = '';
  updateCheckoutForm();
}

async function submitOrder(e) {
  e.preventDefault();

  const name = document.getElementById('cust-name').value.trim();
  const phone = document.getElementById('cust-phone').value.trim();
  const pickupTime = document.getElementById('pickup-time').value;
  const notes = document.getElementById('cust-notes').value.trim();
  const tableNum = document.getElementById('table-number').value.trim();
  const guestCount = document.getElementById('guest-count').value.trim();
  const type = getOrderType();

  if (type === 'takeaway' && !name) {
    document.getElementById('checkout-error').textContent =
      currentLang === 'zh' ? '请填写姓名' : 'Udfyld venligst navn';
    return;
  }
  if (type === 'takeaway' && !phone) {
    document.getElementById('checkout-error').textContent =
      currentLang === 'zh' ? '外卖请填写电话' : 'Telefon er påkrævet ved afhentning';
    return;
  }

  const enriched = getEnrichedCart(menuData);
  const totals = calculateCartTotals(enriched);
  const orderNumber = currentOrderNumber || ('HK-' + Date.now().toString(36).toUpperCase());

  const order = {
    orderNumber,
    orderType: type,
    table_number: type === 'dinein' ? tableNum : null,
    guestCount: type === 'dinein' && guestCount ? parseInt(guestCount) : null,
    customer: { name, phone, pickupTime, notes },
    items: enriched.map((c) => {
      const opt = c.selectedOption && c.item && c.item.options 
        ? c.item.options.find(o => o.id === c.selectedOption) 
        : null;
      return {
        id: c.itemId,
        code: c.item.code || '',
        name_da: c.item.name_da,
        name_zh: c.item.name_zh,
        qty: c.qty,
        unitPrice: calculatePrice(c.item.price, c.categoryId).finalPrice,
        lineTotal: calculatePrice(c.item.price, c.categoryId).finalPrice * c.qty,
        lead_days: c.item.lead_days || 0,
        categoryType: c.category ? c.category.categoryType || 'dish' : 'dish',
        selectedOption: c.selectedOption || null,
        optionName_da: opt ? opt.name_da : null,
        optionName_zh: opt ? opt.name_zh : null,
      };
    }),
    totals,
    status: 'new',
    createdAt: new Date().toISOString()
  };

  // Save to localStorage (customer history)
  const orders = JSON.parse(localStorage.getItem('harbin_orders') || '[]');
  orders.push(order);
  localStorage.setItem('harbin_orders', JSON.stringify(orders));

  // Submit to Supabase (if configured)
  await submitOrderToSupabase(order);

  clearCart();
  currentOrderId = null;
  currentOrderNumber = null;

  // Cleanup Realtime subscription and draft order
  if (realtimeChannel) {
    if (typeof supabase !== 'undefined') {
      const { createClient } = supabase;
      const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      client.removeChannel(realtimeChannel);
    }
    realtimeChannel = null;
  }
  currentDraftOrderId = null;
  localStorage.removeItem('harbin_draft_order_id');
  localStorage.removeItem('harbin_draft_table');

  showOrderConfirmation(order);
}

function showOrderConfirmation(order) {
  const page = document.getElementById('page-confirm');
  const da = currentLang === 'da';
  const type = order.orderType;
  const typeLabel = type === 'dinein'
    ? (da ? 'Spis her' : '堂食')
    : type === 'preorder'
      ? (da ? 'Forud bestilling' : '预约')
      : (da ? 'Afhentning' : '外卖');

  let details = '';
  if (type === 'dinein' && order.table_number) {
    details += (da ? `Bord: ${order.table_number}` : `桌号：${order.table_number}`) + '<br>';
  }
  if (type === 'dinein' && order.guestCount) {
    details += (da ? `Antal gæster: ${order.guestCount}` : `人数：${order.guestCount}`) + '<br>';
  }
  if (type === 'takeaway') {
    const pickupVal = order.customer.pickupTime || (da ? 'Så hurtigt som muligt' : '尽快');
    details += (da ? `Afhentningstid: ${pickupVal}` : `取餐时间：${pickupVal}`) + '<br>';
  }
  if (type === 'preorder' && order.customer.pickupTime) {
    details += (da ? `Afhentningsdato: ${order.customer.pickupTime}` : `预约日期：${order.customer.pickupTime}`) + '<br>';
  }

  // Check for preorder items
  const preorderItems = order.items.filter(i => i.lead_days > 0);
  if (preorderItems.length > 0) {
    details += '<br><strong>' + (da ? '⏰ Forud bestilling:' : '⏰ 预约菜品：') + '</strong><br>';
    preorderItems.forEach(i => {
      details += (da ? i.name_da : i.name_zh) + ' — ' + (da ? `${i.lead_days} dag${i.lead_days > 1 ? 'e' : ''} i forvejen` : `需提前${i.lead_days}天`) + '<br>';
    });
  }

  page.innerHTML = `
    <div class="order-confirm">
      <div class="order-confirm__icon">✅</div>
      <div class="order-confirm__title">${da ? 'Bestilling modtaget!' : '订单已提交！'}</div>
      <div class="order-confirm__number">${order.orderNumber}</div>
      <div class="order-confirm__desc">
        ${order.customer.name ? (da ? `Tak, ${order.customer.name}!` : `感谢您，${order.customer.name}！`) : (da ? 'Tak for din bestilling!' : '感谢您的点餐！')}<br>
        ${da ? `Type: ${typeLabel}` : `用餐方式：${typeLabel}`}<br>
        ${details}<br>
        ${type === 'dinein'
          ? (da ? `💳 Betaling: Venligst betal ved kassen. Total: <strong>${order.totals.total} kr.</strong>` : `💳 付款方式：请到收银台付款。合计：<strong>${order.totals.total} kr.</strong>`)
          : type === 'takeaway'
            ? (da ? `💳 Betaling: Betal ved kassen når du afhenter. Total: <strong>${order.totals.total} kr.</strong>` : `💳 付款方式：取餐时在收银台付款。合计：<strong>${order.totals.total} kr.</strong>`)
            : (da ? `💳 Betaling: Betal ved kassen når du afhenter. Total: <strong>${order.totals.total} kr.</strong>` : `💳 付款方式：取餐时在收银台付款。合计：<strong>${order.totals.total} kr.</strong>`)
        }
      </div>
      <button class="order-confirm__btn" onclick="backToMenu()">
        ${da ? 'Tilbage til menu' : '返回菜单'}
      </button>
      <button class="order-confirm__btn order-confirm__btn--secondary" onclick="goToWelcome()" style="margin-top:10px;background:transparent;color:var(--color-primary);border:1.5px solid var(--color-border);">
        ${da ? '🔄 Skift spisemåde' : '🔄 切换用餐方式'}
      </button>
    </div>
  `;

  showPage('confirm');
}

function backToMenu() {
  showPage('menu');
  renderApp();
}

// ═══════════════════════════════════════
// Supabase Order Submission
// ═══════════════════════════════════════

async function submitOrderToSupabase(order) {
  if (typeof SUPABASE_URL === 'undefined' || !SUPABASE_URL || SUPABASE_URL.includes('YOUR_')) {
    return; // Supabase not configured, skip
  }

  const { createClient } = supabase;
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Priority 1: Merge mode (加菜 to existing submitted order)
  if (currentOrderId) {
    const { error } = await client
      .from('orders')
      .update({
        items: order.items,
        subtotal: order.totals.subtotal,
        discount: order.totals.totalDiscount,
        total: order.totals.total,
        updated_at: new Date().toISOString()
      })
      .eq('id', currentOrderId);
    if (error) throw error;
    return;
  }

  // Priority 2: Draft mode (shared cart → submit)
  if (currentDraftOrderId) {
    const { error } = await client
      .from('orders')
      .update({
        order_number: order.orderNumber,
        order_type: order.orderType,
        table_number: order.table_number || null,
        guest_count: order.guestCount,
        customer_name: order.customer.name || ('Bord ' + (order.table_number || '')),
        customer_phone: order.customer.phone || null,
        pickup_time: order.customer.pickupTime || null,
        notes: order.customer.notes || null,
        items: order.items,
        subtotal: order.totals.subtotal,
        discount: order.totals.totalDiscount,
        total: order.totals.total,
        status: 'new',
        updated_at: new Date().toISOString()
      })
      .eq('id', currentDraftOrderId);
    if (error) throw error;
    return;
  }

  // Priority 3: Normal mode (no draft, no merge) — INSERT new order
  const payload = {
    order_number: order.orderNumber,
    order_type: order.orderType,
    table_number: order.table_number || null,
    guest_count: order.guestCount,
    customer_name: order.customer.name || ('Bord ' + (order.table_number || '')),
    customer_phone: order.customer.phone || null,
    pickup_time: order.customer.pickupTime || null,
    notes: order.customer.notes || null,
    items: order.items,
    subtotal: order.totals.subtotal,
    discount: order.totals.totalDiscount,
    total: order.totals.total,
    status: 'new'
  };
  const { error } = await client.from('orders').insert(payload);
  if (error) throw error;
}

function updateHeader() {
  const titleEl = document.getElementById('header-title');
  if (titleEl) {
    titleEl.textContent = currentLang === 'zh' ? '东北小炒' : 'Harbin Kitchen';
  }
}

// ── Merge Order: check for existing "new" order for a table ──
async function checkExistingOrderForTable(tableNumber) {
  if (typeof SUPABASE_URL === 'undefined' || !SUPABASE_URL || SUPABASE_URL.includes('YOUR_')) return null;
  if (typeof supabase === 'undefined') return null;
  try {
    const { createClient } = supabase;
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    // 查找该桌所有"未结账"状态的订单
    // new=未开始, preparing=制作中, ready=待取餐, completed=已完成的未结账订单也可加菜
    // 只有老板在 admin 页面点"已完成"后才会不出现（实际上 completed 仍然可以加酒水等，所以这里保留）
    const { data, error } = await client
      .from('orders')
      .select('id, order_number, items, customer_name, table_number, status')
      .eq('table_number', String(tableNumber))
      .in('status', ['new', 'preparing', 'ready'])
      .order('created_at', { ascending: false })
      .limit(1);
    if (error) {
      console.error('[checkExistingOrderForTable] Supabase error:', error);
      return null;
    }
    if (!data || data.length === 0) {
      console.log('[checkExistingOrderForTable] No existing order found for table', tableNumber);
      return null;
    }
    console.log('[checkExistingOrderForTable] Found existing order:', data[0].order_number, data[0].status);
    return data[0];
  } catch (e) { console.error('[checkExistingOrderForTable] Exception:', e); return null; }
}

function showMergeModal(tableNumber) {
  const da = currentLang === 'da';
  const existing = pendingMergeOrder;

  // Build items preview HTML
  let itemsHtml = '';
  if (existing.items && Array.isArray(existing.items)) {
    itemsHtml = '<div class="merge-modal__items-preview">';
    existing.items.forEach(function(it) {
      // Find item name
      let name = it.id;
      for (const cat of menuData) {
        const m = cat.items.find(function(i) { return i.id === it.id; });
        if (m) { name = da ? (m.name_da || m.name) : (m.name || m.name_da); break; }
      }
      itemsHtml += '<div class="merge-modal__item-row">'
        + '<span>' + name + '</span>'
        + '<span class="merge-modal__item-qty">x' + it.qty + '</span>'
        + '</div>';
    });
    itemsHtml += '</div>';
  }

  document.getElementById('merge-modal-title').textContent = da
    ? 'Eksisterende bestilling' : '已有订单';
  document.getElementById('merge-modal-text').innerHTML = da
    ? `Bord ${tableNumber} har ale en bestilling (<strong>${existing.order_number}</strong>).<br>Vil du tilføje retter?`
    : `第 ${tableNumber} 桌已有订单（<strong>${existing.order_number}</strong>）<br>是否加菜？`;
  // Show items preview
  const previewEl = document.getElementById('merge-modal-preview');
  if (previewEl) previewEl.innerHTML = itemsHtml;

  document.getElementById('merge-modal-new').textContent = da ? 'Ny bestilling' : '新订单';
  document.getElementById('merge-modal-add').textContent = da ? 'Tilføj retter (加菜)' : '加菜';
  document.getElementById('merge-modal').style.display = '';
}

function mergeChooseAdd() {
  document.getElementById('merge-modal').style.display = 'none';
  clearCart();
  const existing = pendingMergeOrder;
  currentOrderId = existing.id;
  currentOrderNumber = existing.order_number;
  document.getElementById('table-number').value = existing.table_number || '';
  loadExistingOrderIntoCart(existing);
  selectOrderType('dinein', true);
  updateCartBar();
  syncCartToDraft();
}

function mergeChooseNew() {
  document.getElementById('merge-modal').style.display = 'none';
  clearCart();
  syncCartToDraft();
  pendingMergeOrder = null;
  currentOrderId = null;
  currentOrderNumber = null;
  const params = new URLSearchParams(window.location.search);
  const urlTable = params.get('table');
  document.getElementById('table-number').value = urlTable || '';
  selectOrderType('dinein', true);
  window.history.replaceState({}, '', window.location.pathname);
}

function loadExistingOrderIntoCart(existingOrder) {
  if (!existingOrder.items || !Array.isArray(existingOrder.items)) return;
  existingOrder.items.forEach(orderItem => {
    for (const cat of menuData) {
      const menuItem = cat.items.find(i => i.id === orderItem.id);
      if (menuItem) {
        for (let i = 0; i < orderItem.qty; i++) {
          addToCart(menuItem, cat.id);
        }
        break;
      }
    }
  });
}


// ═════════════════════════════════════
// Real-time Shared Cart (Draft Order)
// ═════════════════════════════════════

/**
 * Join existing draft order or create a new one for this table.
 * Sets up Realtime subscription for cart sync.
 */
async function joinOrCreateDraftOrder(tableNumber) {
  if (typeof SUPABASE_URL === 'undefined' || !SUPABASE_URL || SUPABASE_URL.includes('YOUR_')) {
    // Supabase not configured, skip draft (use local cart only)
    selectOrderType('dinein', true);
    return;
  }
  if (typeof supabase === 'undefined') {
    selectOrderType('dinein', true);
    return;
  }

  try {
    const { createClient } = supabase;
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Try to find existing draft order for this table
    // Only join drafts updated within 1 hour (abandoned carts timeout)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data, error } = await client
      .from('orders')
      .select('id, order_number, items')
      .eq('table_number', String(tableNumber))
      .eq('status', 'draft')
      .gte('updated_at', oneHourAgo)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('[joinOrCreateDraft] Supabase error:', error);
      selectOrderType('dinein', true);
      return;
    }

    if (data && data.length > 0) {
      // Draft exists — join it
      currentDraftOrderId = data[0].id;
      currentOrderNumber = data[0].order_number;
      localStorage.setItem('harbin_draft_order_id', currentDraftOrderId);
      localStorage.setItem('harbin_draft_table', tableNumber);
      console.log('[joinOrCreateDraft] Joined existing draft:', data[0].order_number, 'draft ID:', data[0].id, 'updated_at:', data[0].updated_at);

      // Load draft items into local cart
      clearCart();
      if (data[0].items && Array.isArray(data[0].items)) {
        data[0].items.forEach(orderItem => {
          for (const cat of menuData) {
            const menuItem = cat.items.find(i => i.id === orderItem.id);
            if (menuItem) {
              for (let i = 0; i < orderItem.qty; i++) {
                addToCart(menuItem, cat.id);
              }
              break;
            }
          }
        });
      }
      updateCartBar();
    } else {
      // No draft — create a new one
      clearCart();
      const newOrderNumber = 'HK-' + Date.now().toString(36).toUpperCase();
      const { data: insertData, error: insertError } = await client
        .from('orders')
        .insert({
          order_number: newOrderNumber,
          order_type: 'dinein',
          table_number: String(tableNumber),
          guest_count: null,
          customer_name: '',
          customer_phone: null,
          pickup_time: null,
          notes: null,
          items: [],
          subtotal: 0,
          discount: 0,
          total: 0,
          status: 'draft'
        })
        .select('id, order_number');
      
      if (insertError) {
        console.error('[joinOrCreateDraft] Failed to create draft:', insertError);
      } else if (insertData && insertData.length > 0) {
        currentDraftOrderId = insertData[0].id;
        currentOrderNumber = insertData[0].order_number;
        localStorage.setItem('harbin_draft_order_id', currentDraftOrderId);
        localStorage.setItem('harbin_draft_table', tableNumber);
        console.log('[joinOrCreateDraft] Created new draft:', newOrderNumber, 'draft ID:', insertData[0].id);
      }
    }

    // Enter dine-in mode (with cart loaded)
    selectOrderType('dinein', true);

    // Setup Realtime subscription
    setupRealtimeSubscription(client);
    console.log('[joinOrCreateDraft] Realtime setup done for draft:', currentDraftOrderId);

  } catch (e) {
    console.error('[joinOrCreateDraft] Exception:', e);
    selectOrderType('dinein', true);
  }
}

/**
 * Setup Supabase Realtime subscription to sync cart across devices.
 */
function setupRealtimeSubscription(supabaseClient) {
  // Clean up existing channel first
  if (realtimeChannel) {
    supabaseClient.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }

  if (!currentDraftOrderId) return;

  realtimeChannel = supabaseClient
    .channel('draft-order-' + currentDraftOrderId)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'orders',
      filter: 'id=eq.' + currentDraftOrderId
    }, (payload) => {
      // Ignore our own updates
      if (isApplyingRealtime) return;

      const newItems = payload.new && payload.new.items;
      if (!newItems || !Array.isArray(newItems)) return;

      console.log('[Realtime] Received cart update:', newItems);

      // Apply to local cart
      isApplyingRealtime = true;
      applyDraftItemsToCart(newItems);
      isApplyingRealtime = false;
    })
    .subscribe((status, err) => {
      console.log('[Realtime] Subscription status:', status, err || '');
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error('[Realtime] Subscription FAILED:', status, err);
      }
    });
}

/**
 * Apply draft items (from Realtime or initial load) to local cart.
 * Rebuilds the entire cart from the items array.
 */
function applyDraftItemsToCart(items) {
  // Rebuild cart from items
  const newCart = [];
  items.forEach(orderItem => {
    // Verify this item exists in menu
    for (const cat of menuData) {
      const menuItem = cat.items.find(i => i.id === orderItem.id);
      if (menuItem) {
        newCart.push({ itemId: orderItem.id, categoryId: cat.id, qty: orderItem.qty });
        break;
      }
    }
  });
  
  // Save directly to localStorage (bypass saveCart to avoid loop)
  try {
    localStorage.setItem('harbin_cart', JSON.stringify(newCart));
  } catch (e) {}

  updateCartBar();
  if (currentPage === 'cart') renderCartPage();
}

/**
 * Sync local cart to Supabase draft order (debounced).
 */
function syncCartToDraft() {
  if (!currentDraftOrderId) { console.log('[syncCartToDraft] SKIP: no draft ID'); return; }
  if (isApplyingRealtime) return; // don't sync while applying Realtime changes
  if (typeof SUPABASE_URL === 'undefined' || !SUPABASE_URL || SUPABASE_URL.includes('YOUR_')) return;
  if (typeof supabase === 'undefined') return;

  // Debounce: only sync at most once per 800ms
  if (syncCartTimer) clearTimeout(syncCartTimer);
  syncCartTimer = setTimeout(async () => {
    try {
      const { createClient } = supabase;
      const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      const enriched = getEnrichedCart(menuData);
      const totals = calculateCartTotals(enriched);
      const itemsForSupabase = enriched.map(c => {
        const opt = c.selectedOption && c.item && c.item.options 
          ? c.item.options.find(o => o.id === c.selectedOption) 
          : null;
        return {
          id: c.itemId,
          code: c.item.code || '',
          name_da: c.item.name_da,
          name_zh: c.item.name_zh,
          qty: c.qty,
          unitPrice: c.finalPrice,
          lineTotal: c.finalPrice * c.qty,
          lead_days: c.item.lead_days || 0,
          categoryType: c.category ? c.category.categoryType || 'dish' : 'dish',
          selectedOption: c.selectedOption || null,
          optionName_da: opt ? opt.name_da : null,
          optionName_zh: opt ? opt.name_zh : null,
        };
      });

      const { error } = await client
        .from('orders')
        .update({
          items: itemsForSupabase,
          subtotal: totals.subtotal,
          discount: totals.totalDiscount,
          total: totals.total,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentDraftOrderId);

      if (error) console.error('[syncCartToDraft] Update error:', error);
      else console.log('[syncCartToDraft] Synced', itemsForSupabase.length, 'item types');
    } catch (e) {
      console.error('[syncCartToDraft] Exception:', e);
    }
  }, 800);
}

// Also export for cart.js to call
window.syncCartToDraft = syncCartToDraft;

