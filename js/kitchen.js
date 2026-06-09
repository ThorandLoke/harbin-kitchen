// ============================================
// KITCHEN DISPLAY SYSTEM - 后厨出单逻辑
// ============================================

// ── Config ──
const KITCHEN_PASSWORD = 'harbin2026';  // 与 admin 同密码，可单独修改
const KITCHEN_ALERT_SOUND = true;

// ── State ──
let kitchenOrders = [];
let kitchenFilter = 'all';
let kitchenUser = null;
let kitchenRealtime = null;
let soundEnabled = true;
let lastOrderIds = new Set();

// ── Login ──
function kitchenLogin() {
  const pwd = document.getElementById('kit-password-input').value;
  if (pwd !== KITCHEN_PASSWORD) {
    document.getElementById('kit-login-error').textContent = '密码错误 / Forkert kode';
    return;
  }
  localStorage.setItem('kitchen_auth', '1');
  document.getElementById('kit-login-overlay').style.display = 'none';
  initKitchen();
}

function kitchenLogout() {
  localStorage.removeItem('kitchen_auth');
  location.reload();
}

// ── Init ──
function initKitchen() {
  updateClock();
  setInterval(updateClock, 1000);
  initSupabaseKitchen();
}

function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const date = now.toLocaleDateString('da-DK', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  document.getElementById('kit-clock').textContent = time;
  document.getElementById('kit-date').textContent = date;
}

// ── Supabase ──
function initSupabaseKitchen() {
  if (typeof SUPABASE_URL === 'undefined' || !SUPABASE_URL || SUPABASE_URL.includes('YOUR_')) {
    showKitchenOffline();
    loadKitchenFromLocal();
    return;
  }

  try {
    const { createClient } = supabase;
    kitchenUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Test connection
    kitchenUser.from('orders').select('id', { count: 'exact', head: true })
      .then(({ error }) => {
        if (error) { showKitchenOffline(); loadKitchenFromLocal(); }
        else { showKitchenOnline(); loadKitchenOrders(); subscribeKitchenOrders(); }
      })
      .catch(() => { showKitchenOffline(); loadKitchenFromLocal(); });
  } catch (e) {
    showKitchenOffline();
    loadKitchenFromLocal();
  }
}

function showKitchenOnline() {
  document.getElementById('kit-conn-dot').className = 'kit-header__dot kit-header__dot--online';
  document.getElementById('kit-conn-text').textContent = '在线 / Online';
}

function showKitchenOffline() {
  document.getElementById('kit-conn-dot').className = 'kit-header__dot kit-header__dot--offline';
  document.getElementById('kit-conn-text').textContent = '离线 / Offline';
}

// ── Load Orders ──
async function loadKitchenOrders() {
  if (!kitchenUser) return;

  const { data, error } = await kitchenUser
    .from('orders')
    .select('*')
    .in('status', ['new', 'preparing', 'ready'])
    .order('created_at', { ascending: true });

  if (error) { showKitchenOffline(); return; }

  const newIds = new Set(data.map(o => o.id));
  // Detect truly new orders for sound alert
  if (lastOrderIds.size > 0) {
    data.forEach(o => {
      if (!lastOrderIds.has(o.id) && o.status === 'new') {
        playKitchenSound();
        showKitchenNotification(o);
      }
    });
  }
  lastOrderIds = newIds;

  kitchenOrders = data;
  renderKitchenStats();
  renderKitchenGrid();
}

// ── Realtime Subscription ──
function subscribeKitchenOrders() {
  if (!kitchenUser) return;

  kitchenRealtime = kitchenUser
    .channel('kitchen-orders')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'orders'
    }, (payload) => {
      loadKitchenOrders();
    })
    .subscribe();
}

// ── Local Fallback ──
function loadKitchenFromLocal() {
  const orders = JSON.parse(localStorage.getItem('harbin_orders') || '[]');
  // Only show recent orders (last 4 hours)
  const cutoff = Date.now() - 4 * 3600 * 1000;
  kitchenOrders = orders.filter(o => {
    const t = new Date(o.createdAt || o.created_at).getTime();
    return t > cutoff && ['new', 'preparing', 'ready'].includes(o.status || 'new');
  });
  renderKitchenStats();
  renderKitchenGrid();

  // Auto-refresh every 15s in offline mode
  setTimeout(loadKitchenFromLocal, 15000);
}

// ── Stats ──
function renderKitchenStats() {
  const stats = { new: 0, preparing: 0, ready: 0, waiting: 0 };
  kitchenOrders.forEach(o => {
    const s = o.status || 'new';
    if (stats.hasOwnProperty(s)) stats[s]++;
  });

  document.getElementById('kit-stat-new').textContent = stats.new;
  document.getElementById('kit-stat-cooking').textContent = stats.preparing;
  document.getElementById('kit-stat-ready').textContent = stats.ready;
  document.getElementById('kit-stat-empty').textContent = stats.waiting || 0;

  // Filter counts
  document.getElementById('kit-filter-all').textContent = kitchenOrders.length;
  document.getElementById('kit-filter-new').textContent = stats.new;
  document.getElementById('kit-filter-preparing').textContent = stats.preparing;
  document.getElementById('kit-filter-ready').textContent = stats.ready;
}

// ── Filter ──
function kitchenFilter(type, btn) {
  kitchenFilter = type;
  document.querySelectorAll('.kit-filter').forEach(b => b.classList.remove('kit-filter--active'));
  if (btn) btn.classList.add('kit-filter--active');
  renderKitchenGrid();
}

// ── Render Grid ──
function renderKitchenGrid() {
  const grid = document.getElementById('kit-grid');
  const empty = document.getElementById('kit-empty');

  let filtered = kitchenOrders;
  if (kitchenFilter !== 'all') {
    filtered = filtered.filter(o => (o.status || 'new') === kitchenFilter);
  }

  if (filtered.length === 0) {
    grid.innerHTML = '';
    grid.appendChild(empty);
    empty.style.display = '';
    return;
  }

  empty.style.display = 'none';
  grid.innerHTML = '';

  filtered.forEach(order => {
    const card = buildKitchenCard(order);
    grid.appendChild(card);
  });
}

function buildKitchenCard(order) {
  const status = order.status || 'new';
  const card = document.createElement('div');
  card.className = `kit-card kit-card--${status === 'new' ? 'new' : status === 'preparing' ? 'preparing' : 'ready'}`;
  card.dataset.orderId = order.id;

  const created = new Date(order.created_at || order.createdAt);
  const now = new Date();
  const waitSec = Math.floor((now - created) / 1000);
  const waitMin = Math.floor(waitSec / 60);

  const orderNum = order.order_number || order.orderNumber || `#${order.id}`;
  const orderType = order.order_type || order.orderType || 'takeaway';
  const tableNum = order.table_number || order.table;
  const guestCount = order.guest_count || order.guestCount;
  const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
  const customerName = order.customer_name || (order.customer && order.customer.name) || '';

  // Timer color
  let timerClass = 'kit-card__timer--ok';
  if (waitMin >= 15) timerClass = 'kit-card__timer--urgent';
  else if (waitMin >= 8) timerClass = 'kit-card__timer--warning';

  // Type badge
  const typeLabel = orderType === 'dinein'
    ? (currentLang === 'da' ? '🪑 Spis her' : '🪑 堂食')
    : (currentLang === 'da' ? '🥡 Afhentning' : '🥡 外卖');

  // Group items by category for kitchen
  const grouped = {};
  items.forEach(item => {
    const cat = item.category_name_da || item.category || 'Andet';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  });

  // Build items HTML
  let itemsHtml = '';
  Object.entries(grouped).forEach(([cat, catItems]) => {
    itemsHtml += `<div class="kit-category-divider">${cat}</div>`;
    catItems.forEach(item => {
      const name = currentLang === 'da' ? (item.name_da || item.name) : (item.name_zh || item.name_da || item.name);
      const qty = item.qty || 1;
      const notes = item.notes || '';
      const code = item.code ? `<span class="kit-item__code">${item.code}</span> ` : '';
      itemsHtml += `
        <div class="kit-item">
          <div class="kit-item__qty">${qty}x</div>
          <div class="kit-item__name">
            ${code}${name}
            ${notes ? `<div class="kit-item__notes">📝 ${notes}</div>` : ''}
            ${item.lead_days ? `<div class="kit-item__lead">⏰ ${currentLang === 'da' ? `Bestil ${item.lead_days} dag${item.lead_days>1?'e':''} i forvejen` : `需提前${item.lead_days}天预约`}</div>` : ''}
          </div>
        </div>`;
    });
  });

  // Actions based on status
  let actionsHtml = '';
  if (status === 'new') {
    actionsHtml = `
      <button class="kit-btn kit-btn--start" onclick="updateKitchenOrderStatus('${order.id}','preparing',this)">
        🍳 ${currentLang === 'da' ? 'Start Tilberedning' : '开始制作'}
      </button>
      <button class="kit-btn kit-btn--view" onclick="openKitModal('${order.id}')">
        👁️ ${currentLang === 'da' ? 'Detaljer' : '详情'}
      </button>`;
  } else if (status === 'preparing') {
    actionsHtml = `
      <button class="kit-btn kit-btn--ready" onclick="updateKitchenOrderStatus('${order.id}','ready',this)">
        ✅ ${currentLang === 'da' ? 'Klar til Servering' : '已完成 · 可上菜'}
      </button>
      <button class="kit-btn kit-btn--view" onclick="openKitModal('${order.id}')">
        👁️ ${currentLang === 'da' ? 'Detaljer' : '详情'}
      </button>`;
  } else if (status === 'ready') {
    actionsHtml = `
      <button class="kit-btn kit-btn--done" disabled>
        ⏳ ${currentLang === 'da' ? 'Venter på Gæst' : '待取/待上菜'}
      </button>
      <button class="kit-btn kit-btn--view" onclick="openKitModal('${order.id}')">
        👁️ ${currentLang === 'da' ? 'Detaljer' : '详情'}
      </button>`;
  }

  card.innerHTML = `
    <div class="kit-card__header">
      <div>
        <div class="kit-card__order-num">${orderNum}</div>
      </div>
      <span class="kit-card__type-badge kit-card__type-badge--${orderType}">${typeLabel}</span>
    </div>
    <div class="kit-card__meta">
      ${tableNum ? `<span class="kit-card__meta-item">🪑 ${currentLang === 'da' ? 'Bord' : '桌'}: ${tableNum}</span>` : ''}
      ${guestCount ? `<span class="kit-card__meta-item">👤 ${guestCount} ${currentLang === 'da' ? 'gæster' : '人'}</span>` : ''}
      ${customerName ? `<span class="kit-card__meta-item">👤 ${customerName}</span>` : ''}
      <span class="kit-card__meta-item" style="margin-left:auto;">
        <span class="${timerClass}">⏱️ ${waitMin} ${currentLang === 'da' ? 'min' : '分钟'}</span>
      </span>
    </div>
    <div class="kit-card__items">${itemsHtml}</div>
    <div class="kit-card__actions">${actionsHtml}</div>
  `;

  return card;
}

// ── Update Status ──
async function updateKitchenOrderStatus(orderId, newStatus, btn) {
  // Optimistic UI
  if (btn) {
    btn.disabled = true;
    btn.textContent = currentLang === 'da' ? 'Opdaterer...' : '更新中...';
  }

  if (kitchenUser) {
    const { error } = await kitchenUser
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId);
    if (error && btn) { btn.disabled = false; btn.textContent = '❌ Fejl'; return; }
  }

  // Update local
  const order = kitchenOrders.find(o => o.id == orderId || o.id === orderId);
  if (order) order.status = newStatus;

  renderKitchenStats();
  renderKitchenGrid();
}

// ── Modal ──
function openKitModal(orderId) {
  const order = kitchenOrders.find(o => o.id == orderId || o.id === orderId);
  if (!order) return;

  const orderNum = order.order_number || order.orderNumber || `#${order.id}`;
  const orderType = order.order_type || order.orderType || 'takeaway';
  const tableNum = order.table_number || order.table;
  const guestCount = order.guest_count || order.guestCount;
  const customerName = order.customer_name || (order.customer && order.customer.name) || '';
  const customerPhone = order.customer_phone || (order.customer && order.customer.phone) || '';
  const notes = order.notes || (order.customer && order.customer.notes) || '';
  const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
  const status = order.status || 'new';
  const created = new Date(order.created_at || order.createdAt);

  const statusLabels = {
    new: (currentLang === 'da' ? 'Ny' : '新订单'),
    preparing: (currentLang === 'da' ? 'Tilberedes' : '制作中'),
    ready: (currentLang === 'da' ? 'Klar' : '待取餐')
  };

  let metaHtml = '';
  if (tableNum) metaHtml += `🪑 ${currentLang === 'da' ? 'Bord' : '桌号'}: <b>${tableNum}</b> &nbsp; `;
  if (guestCount) metaHtml += `👤 ${guestCount} ${currentLang === 'da' ? 'gæster' : '人'} &nbsp; `;
  if (customerName) metaHtml += `👤 ${customerName}`;
  if (customerPhone) metaHtml += ` &nbsp; 📞 ${customerPhone}`;

  let itemsHtml = '';
  items.forEach(item => {
    const name = currentLang === 'da' ? (item.name_da || item.name) : (item.name_zh || item.name_da || item.name);
    const code = item.code ? `<span class="kit-modal__item-code">${item.code}</span> ` : '';
    itemsHtml += `<div class="kit-modal__item-row"><span class="kit-modal__item-qty">${item.qty}x</span> ${code}${name} — ${(item.unitPrice||0).toFixed(2)} kr.</div>`;
    if (item.notes) itemsHtml += `<div style="font-size:12px;color:#F5A623;margin-left:28px;">📝 ${item.notes}</div>`;
  });

  let actionsHtml = '';
  if (status === 'new') {
    actionsHtml = `<button class="kit-btn kit-btn--start" onclick="updateKitchenOrderStatus('${order.id}','preparing');closeKitModal();">🍳 ${currentLang === 'da' ? 'Start Tilberedning' : '开始制作'}</button>`;
  } else if (status === 'preparing') {
    actionsHtml = `<button class="kit-btn kit-btn--ready" onclick="updateKitchenOrderStatus('${order.id}','ready');closeKitModal();">✅ ${currentLang === 'da' ? 'Klar' : '标记完成'}</button>`;
  } else {
    actionsHtml = `<span style="color:#8BC34A;font-weight:600;">✅ ${statusLabels[status]}</span>`;
  }
  actionsHtml += `<button class="kit-btn kit-btn--view" onclick="closeKitModal()">${currentLang === 'da' ? 'Luk' : '关闭'}</button>`;

  document.getElementById('kit-modal-header').style.background =
    status === 'new' ? '#2a3a5c' : status === 'preparing' ? '#3a3020' : '#1a3a1a';
  document.getElementById('kit-modal-order-num').textContent = orderNum + ' · ' + statusLabels[status];
  document.getElementById('kit-modal-meta').innerHTML = metaHtml + `<br><small>${created.toLocaleString('da-DK')}</small>`;
  document.getElementById('kit-modal-body').innerHTML = `
    <div class="kit-modal__section">
      <div class="kit-modal__section-title">${currentLang === 'da' ? 'Retter' : '菜品'}</div>
      ${itemsHtml}
    </div>
    ${notes ? `<div class="kit-modal__section"><div class="kit-modal__section-title">${currentLang === 'da' ? 'Noter' : '备注'}</div><div style="color:#F5A623;font-size:14px;">${notes}</div></div>` : ''}
  `;
  document.getElementById('kit-modal-actions').innerHTML = actionsHtml;
  document.getElementById('kit-modal-overlay').classList.add('active');
}

function closeKitModal() {
  document.getElementById('kit-modal-overlay').classList.remove('active');
}

function closeKitModalOutside(e) {
  if (e.target === document.getElementById('kit-modal-overlay')) closeKitModal();
}

// ── Sound ──
function playKitchenSound() {
  if (!soundEnabled) return;
  const audio = document.getElementById('kit-sound-new');
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

function showKitchenNotification(order) {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    new Notification('🔔 Harbin Kitchen - Ny Ordre', {
      body: `${order.order_number}\n${order.order_type === 'dinein' ? '🪑 Spis her' : '🥡 Afhentning'}${order.table_number ? ' · Bord ' + order.table_number : ''}`,
      icon: '/icons/icon-192.png'
    });
  }
}

// ── Sound Toggle ──
function toggleKitchenSound() {
  soundEnabled = !soundEnabled;
  let btn = document.getElementById('kit-sound-toggle');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'kit-sound-toggle';
    btn.className = 'kit-sound-toggle';
    btn.onclick = toggleKitchenSound;
    document.body.appendChild(btn);
  }
  btn.textContent = soundEnabled ? '🔔' : '🔇';
  btn.classList.toggle('muted', !soundEnabled);
}

// ── Auto-init on load (password removed, will re-add later) ──
(function() {
  // No login required — direct init
  initKitchen();
  // Add sound toggle button
  let btn = document.createElement('button');
  btn.id = 'kit-sound-toggle';
  btn.className = 'kit-sound-toggle';
  btn.textContent = '🔔';
  btn.onclick = toggleKitchenSound;
  document.body.appendChild(btn);

  // Request notification permission
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
})();
