/* ============================================================
   Admin Dashboard — Harbin Kitchen Order Management
   ============================================================ */

// ── State ──
let supabaseClient = null;
let allOrders = [];
let currentFilter = 'all';
let soundEnabled = true;
let passwordVerified = true; // 密码已移除，后期再加

const ADMIN_PASSWORD = 'harbin2026'; // 保留常量，后期加密用
// ── Password Check ──
function checkPassword() {
  const input = document.getElementById('admin-password').value;
  if (input === ADMIN_PASSWORD) {
    passwordVerified = true;
    document.getElementById('password-screen').style.display = 'none';
    document.getElementById('admin-main').style.display = '';
    initSupabase();
  } else {
    document.getElementById('pwd-error').textContent = '密码错误，请重试';
    document.getElementById('admin-password').value = '';
  }
}

// ── Auto-init (password removed, will re-add later) ──
document.addEventListener('DOMContentLoaded', () => {
  initSupabase();
});

// ── Supabase Init ──
async function initSupabase() {
  if (typeof SUPABASE_URL === 'undefined' || !SUPABASE_URL || SUPABASE_URL.includes('YOUR_')) {
    showSupabaseSetupHelp();
    return;
  }

  try {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Load existing orders
    await loadOrders();

    // Subscribe to real-time changes
    subscribeToOrders();

    document.getElementById('live-dot').textContent = '● 实时连接中';
    document.getElementById('live-dot').style.color = 'var(--color-success)';
  } catch (err) {
    console.error('Supabase init failed:', err);
    document.getElementById('live-dot').textContent = '⚠ 连接失败';
    document.getElementById('live-dot').style.color = 'var(--color-danger)';
  }
}

function showSupabaseSetupHelp() {
  const list = document.getElementById('orders-list');
  list.innerHTML = `
    <div class="empty-state">
      <div class="empty-state__icon">⚠️</div>
      <div class="empty-state__text">Supabase 未配置</div>
      <div class="empty-state__sub" style="max-width:400px;text-align:left;margin:12px auto;">
        <p>请按以下步骤配置：</p>
        <ol style="text-align:left;font-size:var(--font-size-sm);line-height:1.8;">
          <li>访问 <a href="https://supabase.com" target="_blank">supabase.com</a> 注册免费账号</li>
          <li>创建新项目（Project）</li>
          <li>进入 <b>SQL Editor</b>，运行 <code>js/supabase-config.js</code> 注释中的建表 SQL</li>
          <li>进入 <b>Project Settings → API</b>，复制 Project URL 和 anon key</li>
          <li>粘贴到 <code>js/supabase-config.js</code> 中</li>
          <li>修改本页面 <code>ADMIN_PASSWORD</code> 为您自己的密码</li>
        </ol>
        <p style="margin-top:12px;font-size:var(--font-size-xs);color:var(--color-text-secondary);">
          配置完成后刷新本页面。
        </p>
      </div>
    </div>
  `;
}

// ── Load Orders ──
async function loadOrders() {
  const { data, error } = await supabaseClient
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load orders:', error);
    return;
  }

  allOrders = data || [];
  updateStats();
  renderOrders();
}

// ── Realtime Subscription ──
function subscribeToOrders() {
  supabaseClient
    .channel('orders-channel')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'orders' },
      (payload) => {
        const newOrder = payload.new;
        // Avoid duplicate if already loaded
        if (!allOrders.find(o => o.order_number === newOrder.order_number)) {
          allOrders.unshift(newOrder);
          updateStats();
          renderOrders();
          if (soundEnabled) playNotificationSound();
          // Auto-print receipt + kitchen ticket
          autoPrintOrder(formatOrderForPrinter(newOrder));
        }
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'orders' },
      (payload) => {
        const updated = payload.new;
        const idx = allOrders.findIndex(o => o.order_number === updated.order_number);
        if (idx !== -1) {
          allOrders[idx] = updated;
        } else {
          allOrders.unshift(updated);
        }
        updateStats();
        renderOrders();
      }
    )
    .subscribe();
}

// ── Update Stats ──
function updateStats() {
  const today = new Date().toISOString().slice(0, 10);
  const todayOrders = allOrders.filter(o => o.created_at && o.created_at.startsWith(today));

  document.getElementById('stat-new').textContent =
    allOrders.filter(o => o.status === 'new').length;
  document.getElementById('stat-preparing').textContent =
    allOrders.filter(o => o.status === 'preparing').length;
  document.getElementById('stat-ready').textContent =
    allOrders.filter(o => o.status === 'ready').length;
  document.getElementById('stat-completed').textContent =
    allOrders.filter(o => o.status === 'completed').length;
}

// ── Render Orders ──
function renderOrders() {
  const list = document.getElementById('orders-list');
  const filtered = currentFilter === 'all'
    ? allOrders
    : allOrders.filter(o => o.status === currentFilter);

  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">📋</div>
        <div class="empty-state__text">暂无订单</div>
        <div class="empty-state__sub">新订单将实时出现在这里</div>
      </div>
    `;
    return;
  }

  list.innerHTML = filtered.map(order => renderOrderCard(order)).join('');
}

function renderOrderCard(order) {
  const da = true; // Admin dashboard always shows Danish first, Chinese second
  const typeIcon = order.order_type === 'dinein' ? '🍽️' : order.order_type === 'takeaway' ? '🥡' : '⏰';
  const typeLabel = order.order_type === 'dinein' ? '堂食' : order.order_type === 'takeaway' ? '外卖' : '预约';

  const statusClass = `order-card__status order-card__status--${order.status}`;
  const statusLabel = { new: '🆕 新订单', preparing: '🍳 制作中', ready: '✅ 待取餐', completed: '✔ 已完成', cancelled: '❌ 已取消' }[order.status] || order.status;

  // Table & guest info (dine-in)
  let metaHTML = '';
  if (order.order_type === 'dinein') {
    if (order.table_number) {
      metaHTML += `<span class="order-card__meta-item">🪑 桌号: <b>${order.table_number}</b></span>`;
    }
    if (order.guest_count) {
      metaHTML += `<span class="order-card__meta-item">👤 人数: <b>${order.guest_count}</b></span>`;
    }
  }
  if (order.order_type === 'takeaway') {
    if (order.pickup_time) {
      metaHTML += `<span class="order-card__meta-item">⏰ 取餐: ${order.pickup_time}</span>`;
    }
  }

  // Time elapsed
  const elapsed = getTimeElapsed(order.created_at);

  // Items list
  const itemsHTML = (order.items || []).map(item => {
    const name = da ? item.name_da : item.name_zh;
    return `<div class="order-card__item"><span><span class="order-card__item-qty">${item.qty}x</span> ${name}</span><span>${item.lineTotal} kr.</span></div>`;
  }).join('');

  // Action buttons based on status
  let actionsHTML = '';
  if (order.status === 'new') {
    actionsHTML += `<button class="order-card__action-btn order-card__action-btn--next" onclick="updateStatus('${order.order_number}', 'preparing')">接单 · 开始制作</button>`;
    actionsHTML += `<button class="order-card__action-btn order-card__action-btn--cancel" onclick="updateStatus('${order.order_number}', 'cancelled')">取消订单</button>`;
  } else if (order.status === 'preparing') {
    actionsHTML += `<button class="order-card__action-btn order-card__action-btn--next" onclick="updateStatus('${order.order_number}', 'ready')">完成 · 待取餐</button>`;
  } else if (order.status === 'ready') {
    actionsHTML += `<button class="order-card__action-btn order-card__action-btn--next" onclick="updateStatus('${order.order_number}', 'completed')">已取餐 · 完成</button>`;
  }

  // Print buttons (always available)
  actionsHTML += `<button class="order-card__action-btn order-card__action-btn--print" onclick="reprintReceipt('${order.order_number}')" title="打印水单">🖨️ 水单</button>`;
  actionsHTML += `<button class="order-card__action-btn order-card__action-btn--print" onclick="reprintKitchen('${order.order_number}')" title="打印后厨单">🍳 后厨单</button>`;

  // Notes
  const notesHTML = order.notes
    ? `<div style="padding:6px 18px;font-size:var(--font-size-xs);color:var(--color-text-secondary);border-bottom:1px solid var(--color-border);">📝 ${escapeHTML(order.notes)}</div>`
    : '';

  return `
    <div class="order-card" id="order-${order.order_number}">
      <div class="order-card__header">
        <span class="order-card__id">${typeIcon} ${order.order_number} · ${typeLabel}</span>
        <span class="${statusClass}">${statusLabel}</span>
      </div>
      ${metaHTML ? `<div class="order-card__meta">${metaHTML}</div>` : ''}
      <div class="order-card__customer">
        <span class="order-card__customer-name">👤 ${escapeHTML(order.customer_name)}</span>
        ${order.customer_phone ? `<a class="order-card__customer-phone" href="tel:${order.customer_phone}">📞 ${order.customer_phone}</a>` : ''}
      </div>
      <div class="order-card__items">${itemsHTML}</div>
      ${notesHTML}
      <div class="order-card__total">合计: ${order.total} kr.</div>
      <div class="order-card__footer">
        <span class="order-card__time">${elapsed}</span>
        <div class="order-card__actions">${actionsHTML}</div>
      </div>
    </div>
  `;
}

// ── Update Order Status ──
async function updateStatus(orderNumber, newStatus) {
  if (!supabaseClient) return;

  const { error } = await supabaseClient
    .from('orders')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('order_number', orderNumber);

  if (error) {
    console.error('Failed to update status:', error);
    alert('状态更新失败，请重试');
  }
  // Realtime subscription will handle the UI update
}

// ── Filter ──
function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  renderOrders();
}

// ── Sound Notification ──
function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    // Play a two-tone notification
    [800, 1000].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.value = 0.3;
      osc.start(ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.3);
      osc.stop(ctx.currentTime + i * 0.15 + 0.3);
    });
  } catch (e) {
    // Audio not supported, fail silently
  }
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  const btn = document.getElementById('sound-btn');
  btn.textContent = soundEnabled ? '🔔 声音 ON' : '🔔 声音 OFF';
  btn.classList.toggle('muted', !soundEnabled);
}

// ── Helpers ──
function getTimeElapsed(isoString) {
  const now = new Date();
  const past = new Date(isoString);
  const diffSec = Math.floor((now - past) / 1000);

  if (diffSec < 60) return `${diffSec}秒前`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}分钟前`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}小时前`;
  return `${Math.floor(diffHr / 24)}天前`;
}

function escapeHTML(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ═══════════════════════════════════════════════════════
// PRINTER INTEGRATION
// ═══════════════════════════════════════════════════════

async function connectPrinter() {
  const btn = document.getElementById('printer-btn');
  btn.textContent = '⏳ 连接中...';
  btn.disabled = true;

  try {
    await Printer.connect();
    btn.style.display = 'none';
    document.getElementById('printer-bar').style.display = '';
    // Auto-print is on by default
    Printer.setAutoPrint(true);
  } catch (err) {
    btn.textContent = '🖨️ 连接打印机';
    btn.disabled = false;
    alert('打印机连接失败：' + err.message);
  }
}

async function disconnectPrinter() {
  await Printer.disconnect();
  document.getElementById('printer-bar').style.display = 'none';
  document.getElementById('printer-btn').style.display = '';
  document.getElementById('printer-btn').textContent = '🖨️ 连接打印机';
  document.getElementById('printer-btn').disabled = false;
}

// Auto-print when new order arrives
function autoPrintOrder(order) {
  if (!Printer.getIsConnected() || !Printer.getAutoPrint()) return;
  Printer.printBoth(order).catch(err => {
    console.error('Auto-print failed:', err);
  });
}

// Manual print buttons
async function reprintReceipt(orderNumber) {
  const order = allOrders.find(o => o.order_number === orderNumber);
  if (!order) return;
  const formattedOrder = formatOrderForPrinter(order);

  if (Printer.getIsConnected()) {
    try {
      await Printer.printReceipt(formattedOrder);
    } catch (err) {
      alert('打印失败：' + err.message);
    }
  } else {
    Printer.browserPrintReceipt(formattedOrder);
  }
}

async function reprintKitchen(orderNumber) {
  const order = allOrders.find(o => o.order_number === orderNumber);
  if (!order) return;
  const formattedOrder = formatOrderForPrinter(order);

  if (Printer.getIsConnected()) {
    try {
      await Printer.printKitchenTicket(formattedOrder);
    } catch (err) {
      alert('打印失败：' + err.message);
    }
  } else {
    Printer.browserPrintKitchenTicket(formattedOrder);
  }
}

// Convert Supabase order format → printer module format
function formatOrderForPrinter(order) {
  const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
  return {
    orderNumber: order.order_number || order.orderNumber,
    orderType: order.order_type || order.orderType || 'takeaway',
    table: order.table_number || order.table,
    guestCount: order.guest_count || order.guestCount,
    customer: {
      name: order.customer_name || '',
      phone: order.customer_phone || '',
      pickupTime: order.pickup_time || '',
      notes: order.notes || ''
    },
    items: items.map(i => ({
      qty: i.qty || 1,
      name_zh: i.name_zh || '',
      name_da: i.name_da || '',
      name: i.name_zh || i.name_da || '',
      unitPrice: i.unitPrice || 0,
      lineTotal: i.lineTotal || 0,
      notes: i.notes || '',
      lead_days: i.lead_days || 0
    })),
    totals: {
      subtotal: order.subtotal || 0,
      totalDiscount: order.discount || 0,
      total: order.total || 0
    },
    createdAt: order.created_at || order.createdAt || new Date().toISOString()
  };
}
