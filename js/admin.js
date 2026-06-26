/* ============================================================
   Admin Dashboard — Harbin Kitchen Order Management
   ============================================================ */

// ── State ──
let supabaseClient = null;
let allOrders = [];
let currentFilter = 'all';
let soundEnabled = true;
let passwordVerified = true; // 密码已移除，后期再加
let audioCtx = null; // AudioContext，需要用户交互后才能初始化
let notificationPermission = 'default'; // 桌面通知权限
let titleFlashInterval = null; // 标题闪烁定时器
let shopboxAutoSync = false; // 是否自动推送到 Shopbox
let shopboxMapping = {}; // PWA id → Shopbox id 映射表
let shopboxEnabled = false; // Shopbox 功能是否启用（有映射时自动启用）
let shopboxEmergencyStop = false; // 紧急停用开关（默认关闭）

const ADMIN_PASSWORD = 'harbin2026'; // 保留常量，后期加密用

// ── 初始化音频上下文（需要用户交互） ──
function initAudioContext() {
  if (audioCtx) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) {
    console.warn('AudioContext not supported');
  }
}

// ── 请求桌面通知权限 ──
function requestNotificationPermission() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    notificationPermission = 'granted';
    return;
  }
  if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(perm => {
      notificationPermission = perm;
    });
  }
}

// ── 显示桌面通知 ──
function showDesktopNotification(order) {
  if (notificationPermission !== 'granted') return;
  try {
    const notif = new Notification('🔔 新订单！', {
      body: `${order.order_number} · ${order.customer_name} · ${order.total} kr.`,
      icon: '/icon-192.png',
      tag: order.order_number,
      requireInteraction: true
    });
    notif.onclick = () => {
      window.focus();
      notif.close();
    };
  } catch (e) {
    console.warn('Desktop notification failed:', e);
  }
}

// ── 新订单通知横幅 ──
function showNewOrderAlert() {
  const alertEl = document.getElementById('new-order-alert');
  const countEl = document.getElementById('alert-count');
  const textEl = document.getElementById('alert-text');
  if (!alertEl) return;
  const newCount = allOrders.filter(o => o.status === 'new').length;
  if (newCount > 0) {
    countEl.textContent = newCount;
    textEl.textContent = newCount > 1 ? '个新订单待处理！' : '新订单待处理！';
    alertEl.classList.add('show');
  } else {
    alertEl.classList.remove('show');
  }
}

function hideNewOrderAlert() {
  const alertEl = document.getElementById('new-order-alert');
  if (alertEl) alertEl.classList.remove('show');
}

// ── 页面标题闪烁 ──
let flashingOrderNumbers = new Set();
let titleFlashOriginalTitle = '东北小炒 · 管理后台';

function startTitleFlash(orderNumber) {
  if (orderNumber) flashingOrderNumbers.add(orderNumber);
  showNewOrderAlert();
  if (titleFlashInterval) return;
  titleFlashOriginalTitle = document.title;
  let flashing = false;
  titleFlashInterval = setInterval(() => {
    const count = flashingOrderNumbers.size;
    const prefix = count > 1 ? `🔔 ${count}个新订单` : '🔔 新订单';
    document.title = flashing ? titleFlashOriginalTitle : prefix + '！';
    flashing = !flashing;
  }, 800);
}

function stopTitleFlash(orderNumber) {
  if (orderNumber) flashingOrderNumbers.delete(orderNumber);
  // 只有所有新订单都被处理后才停止闪烁
  const hasNewOrders = allOrders.some(o => o.status === 'new');
  if (!hasNewOrders) hideNewOrderAlert();
  else showNewOrderAlert();
  if (hasNewOrders || flashingOrderNumbers.size > 0) return;
  
  if (titleFlashInterval) {
    clearInterval(titleFlashInterval);
    titleFlashInterval = null;
  }
  document.title = titleFlashOriginalTitle || '东北小炒 · 管理后台';
}

function stopAllTitleFlash() {
  flashingOrderNumbers.clear();
  hideNewOrderAlert();
  if (titleFlashInterval) {
    clearInterval(titleFlashInterval);
    titleFlashInterval = null;
  }
  document.title = titleFlashOriginalTitle || '东北小炒 · 管理后台';
}
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
  // 请求桌面通知权限
  requestNotificationPermission();

  // 用户首次点击页面时初始化 AudioContext（绕过浏览器自动播放限制）
  const initAudioOnClick = () => {
    initAudioContext();
    // 播放一个静音来"激活"音频上下文
    if (audioCtx) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      gain.gain.value = 0; // 静音
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.01);
    }
    document.removeEventListener('click', initAudioOnClick);
    document.removeEventListener('touchstart', initAudioOnClick);
  };
  document.addEventListener('click', initAudioOnClick);
  document.addEventListener('touchstart', initAudioOnClick);

  loadShopboxMapping();
  initSupabase();
});

// ── Supabase Init ──
async function initSupabase() {
  if (typeof SUPABASE_URL === 'undefined' || !SUPABASE_URL || SUPABASE_URL.includes('YOUR_')) {
    showSupabaseSetupHelp();
    return;
  }

  try {
    const { createClient } = supabase;
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

// ── 加载 Shopbox 菜单映射表 ──
async function loadShopboxMapping() {
  try {
    const res = await fetch('data/shopbox-mapping.json');
    if (!res.ok) throw new Error('Failed to load mapping');
    const data = await res.json();
    shopboxMapping = data.mapping || {};
    const hasMappings = Object.values(shopboxMapping).some(m => m.shopbox_id && m.shopbox_id.trim());
    shopboxEnabled = hasMappings;
    console.log('[Shopbox] Mapping loaded:', Object.keys(shopboxMapping).length, 'items, enabled:', shopboxEnabled);
  } catch (e) {
    console.warn('[Shopbox] Failed to load mapping:', e);
    shopboxEnabled = false;
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
  updateShopboxUI();
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

          // 新订单提示（声音 + 视觉）
          if (soundEnabled) playNotificationSound();
          startTitleFlash(newOrder.order_number);
          showDesktopNotification(newOrder);

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
        const oldRecord = payload.old || {};
        const idx = allOrders.findIndex(o => o.order_number === updated.order_number);

        // 检测 draft → new 转换（堂食共享购物车提交时）
        var wasDraft = (oldRecord.status === 'draft') || (idx !== -1 && allOrders[idx].status === 'draft');
        var isNowNew = (updated.status === 'new');

        if (idx !== -1) {
          allOrders[idx] = updated;
        } else {
          allOrders.unshift(updated);
        }
        updateStats();
        renderOrders();

        // draft → new: 触发新订单提示（和 INSERT 一样）
        if (wasDraft && isNowNew) {
          if (soundEnabled) playNotificationSound();
          startTitleFlash(updated.order_number);
          showDesktopNotification(updated);
          autoPrintOrder(formatOrderForPrinter(updated));
        }
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
  const shopboxBadge = getShopboxBadgeHTML(order);

  // Table number for dine-in (check both possible field names)
  const tableNum = order.table_number || order.table || '';
  const tableBadge = (order.order_type === 'dinein' && tableNum)
    ? `<span style="background:#2D2A26;color:#D4A574;padding:2px 8px;border-radius:4px;font-size:14px;font-weight:700;margin-left:6px;">🪑 桌${tableNum}</span>`
    : '';

  // Table & guest info (dine-in)
  let metaHTML = '';
  if (order.order_type === 'dinein') {
    if (tableNum) {
      metaHTML += `<span class="order-card__meta-item">🪑 桌号: <b>${tableNum}</b></span>`;
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

  // Items list - separate dishes and drinks
  const items = order.items || [];
  const dishItems = items.filter(item => item.categoryType !== 'drink');
  const drinkItems = items.filter(item => item.categoryType === 'drink');
  
  let itemsHTML = '';
  if (dishItems.length > 0) {
    itemsHTML += `<div style="font-size:12px;color:var(--color-text-secondary);margin:4px 18px 2px;">${da ? '🍽️ Retter' : '🍽️ 菜品'}</div>`;
    itemsHTML += dishItems.map(item => {
      const name = da ? item.name_da : item.name_zh;
      const code = item.code ? `<span class="order-card__item-code">${item.code}</span> ` : '';
      const option = item.optionName_da || item.optionName_zh
        ? ` <span style="color:var(--color-primary);font-size:12px;">(${da ? item.optionName_da : item.optionName_zh})</span>`
        : '';
      return `<div class="order-card__item"><span><span class="order-card__item-qty">${item.qty}x</span> ${code}${name}${option}</span><span>${item.lineTotal} kr.</span></div>`;
    }).join('');
  }
  if (drinkItems.length > 0) {
    itemsHTML += `<div style="font-size:12px;color:var(--color-text-secondary);margin:4px 18px 2px;">${da ? '🥤 Drikkevarer' : '🥤 饮品'}</div>`;
    itemsHTML += drinkItems.map(item => {
      const name = da ? item.name_da : item.name_zh;
      const code = item.code ? `<span class="order-card__item-code">${item.code}</span> ` : '';
      const option = item.optionName_da || item.optionName_zh
        ? ` <span style="color:var(--color-primary);font-size:12px;">(${da ? item.optionName_da : item.optionName_zh})</span>`
        : '';
      return `<div class="order-card__item"><span><span class="order-card__item-qty">${item.qty}x</span> ${code}${name}${option}</span><span>${item.lineTotal} kr.</span></div>`;
    }).join('');
  }

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

  // Shopbox sync button
  actionsHTML += getShopboxButtonHTML(order);

  // Notes
  const notesHTML = order.notes
    ? `<div style="padding:6px 18px;font-size:var(--font-size-xs);color:var(--color-text-secondary);border-bottom:1px solid var(--color-border);">📝 ${escapeHTML(order.notes)}</div>`
    : '';

  return `
    <div class="order-card" id="order-${order.order_number}">
      <div class="order-card__header">
        <span class="order-card__id">${typeIcon} ${order.order_number} · ${typeLabel}${tableBadge}</span>
        <span style="display:flex;align-items:center;gap:8px;">
          ${shopboxBadge}
          <span class="${statusClass}">${statusLabel}</span>
        </span>
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
    return;
  }
  // 如果接单（new → preparing）且开启了自动同步，推送到 Shopbox
  if (newStatus === 'preparing' && shopboxAutoSync) {
    syncToShopbox(orderNumber);
  }
  // 如果该订单之前在新订单闪烁列表中，移除它
  stopTitleFlash(orderNumber);
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
async function playNotificationSound() {
  if (!soundEnabled) return;
  console.log('[Sound] Attempting to play notification sound...');

  // 方法 1：使用预初始化的 AudioContext
  if (audioCtx) {
    try {
      // 如果音频上下文被挂起，先恢复（resume 是异步的）
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
        console.log('[Sound] AudioContext resumed');
      }
      if (audioCtx.state !== 'running') {
        console.warn('[Sound] AudioContext not running, state:', audioCtx.state);
        throw new Error('AudioContext not running');
      }

      [880, 1100, 880].forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.value = 0.4;
        const startTime = audioCtx.currentTime + i * 0.2;
        osc.start(startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);
        osc.stop(startTime + 0.35);
      });
      console.log('[Sound] WebAudio (Method 1) played successfully');
      return;
    } catch (e) {
      console.warn('AudioContext play failed:', e);
    }
  }

  // 方法 2：降级方案 - 新建 AudioContext
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    if (ctx.state !== 'running') {
      throw new Error('New AudioContext not running');
    }
    [880, 1100, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.value = 0.4;
      const startTime = ctx.currentTime + i * 0.2;
      osc.start(startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);
      osc.stop(startTime + 0.35);
    });
    audioCtx = ctx;
    console.log('[Sound] WebAudio (Method 2) played successfully');
    return;
  } catch (e) {
    console.warn('AudioContext fallback failed:', e);
  }

  // 方法 3：HTML5 Audio beep (有效 WAV 数据) + 震动
  try {
    const BEEP_DATA = 'data:audio/wav;base64,UklGRkQDAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YSADAACAqL64l2xKQVV8pb65m3BNQVJ4ory7n3RPQU90n7u8onhSQU1wm7m+pXxVQUpsl7i+qIBYQkhplLa/q4RbQkdlkLO/roheREVhjLHAsYxhRUReiK6/s5BlR0JbhKu/tpRpSEJYgKi+uJdsSkFVfKW+uZtwTUFSeKK8u590T0FPdJ+7vKJ4UkFNcJu5vqV8VUFKbJe4vqiAWEJIaZS2v6uEW0JHZZCzv66IXkRFYYyxwLGMYUVEXoiuv7OQZUdCW4Srv7aUaUhCWICovriXbEpBVXylvrmbcE1BUniivLufdE9BT3Sfu7yieFJBTXCbub6lfFVBSmyXuL6ogFhCSGmUtr+rhFtCR2WQs7+uiF5ERWGMscCxjGFFRF6Irr+zkGVHQluEq7+2lGlIQliAqL64l2xKQVV8pb65m3BNQVJ4ory7n3RPQU90n7u8onhSQU1wm7m+pXxVQUpsl7i+qIBYQkhplLa/q4RbQkdlkLO/roheREVhjLHAsYxhRUReiK6/s5BlR0JbhKu/tpRpSEJYgKi+uJdsSkFVfKW+uZtwTUFSeKK8u590T0FPdJ+7vKJ4UkFNcJu5vqV8VUFKbJe4vqiAWEJIaZS2v6uEW0JHZZCzv66IXkRFYYyxwLGMYUVEXoiuv7OQZUdCW4Srv7aUaUhCWICovriXbEpBVXylvrmbcE1BUniivLufdE9BT3Sfu7yieFJBTXCbub6lfFVBSmyXuL6ogFhCSGmUtr+rhFtCR2WQs7+uiF5ERWGMscCxjGFFRF6Irr+zkGVHQluEq7+2lGlIQliAqL64l2xKQVV8pb65m3BNQVJ4ory7n3RPQU90n7u8onhSQU1wm7m+pXxVQUpsl7i+qIBYQkhplLa/q4RbQkdlkLO/roheREVhjLHAsYxhRUReiK6/s5BlR0JbhKu/tpRpSEJYgKi+uJdsSkFVfKW+uZtwTUFSeKK8u590T0FPdJ+7vKJ4UkFNcJu5vqV8VUFKbJe4vqiAWEJIaZS2v6uEW0JHZZCzv66IXkRFYYyxwLGMYUVEXoiuv7OQZUdCW4Srv7aUaUhCWA==';
    const beep = new Audio(BEEP_DATA);
    beep.volume = 0.8;
    beep.play().catch(function() {});
    console.log('[Sound] HTML5 Audio beep played');
  } catch (e) {
    console.warn('Audio beep failed:', e);
  }

  // 方法 4：设备震动（iPad/iPhone 支持）
  try {
    if (navigator.vibrate) {
      navigator.vibrate([300, 100, 300, 100, 300]);
      console.log('[Sound] Vibration triggered');
    }
  } catch (e) {
    console.warn('Vibration failed:', e);
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
      lead_days: i.lead_days || 0,
      optionName_da: i.optionName_da || '',
      optionName_zh: i.optionName_zh || ''
    })),
    totals: {
      subtotal: order.subtotal || 0,
      totalDiscount: order.discount || 0,
      total: order.total || 0
    },
    createdAt: order.created_at || order.createdAt || new Date().toISOString()
  };
}

// ═══════════════════════════════════════════════════════
// SHOPBOX POS INTEGRATION
// ═══════════════════════════════════════════════════════

// ── 更新 Shopbox 顶部 UI 状态 ──
function updateShopboxUI() {
  const statusEl = document.getElementById('shopbox-status');
  const autoBtnEl = document.getElementById('shopbox-auto-btn');
  const bannerEl = document.getElementById('emergency-banner');
  if (!statusEl || !autoBtnEl) return;

  // 紧急停用状态
  if (shopboxEmergencyStop) {
    if (bannerEl) bannerEl.style.display = 'block';
    statusEl.style.display = 'inline';
    autoBtnEl.style.display = 'none';
    statusEl.textContent = '🚫 Shopbox 已停用';
    statusEl.style.color = '#DC3545';
    return;
  }

  if (bannerEl) bannerEl.style.display = 'none';
  if (shopboxEnabled) {
    statusEl.style.display = 'inline';
    autoBtnEl.style.display = 'inline-block';
    statusEl.textContent = '🟢 Shopbox';
    statusEl.style.color = '#28a745';
  } else {
    statusEl.style.display = 'none';
    autoBtnEl.style.display = 'none';
  }
}

// ── 推送到 Shopbox ──
async function syncToShopbox(orderNumber) {
  // 紧急停用检查
  if (shopboxEmergencyStop) {
    alert('⚠️ Shopbox 同步已紧急停用\n\n原因：收银机被锁定，正在排查中。\n请不要点击推送按钮，等待修复通知。');
    return;
  }

  const order = allOrders.find(o => o.order_number === orderNumber);
  if (!order) {
    console.error('[Shopbox] Order not found:', orderNumber);
    return;
  }

  // 检查是否已有 shopbox_basket_id（避免重复推送）
  if (order.shopbox_basket_id) {
    alert('该订单已同步到 Shopbox（Basket ID: ' + order.shopbox_basket_id + '）');
    return;
  }

  // 准备 items（添加 shopbox_id）
  console.log('[Shopbox] order.items type:', typeof order.items, 'value:', order.items ? order.items.toString().substring(0, 100) : 'null');
  let items = [];
  if (typeof order.items === 'string') {
    try {
      items = order.items.trim() ? JSON.parse(order.items) : [];
    } catch (e) {
      console.error('[Shopbox] JSON.parse items failed:', e);
      items = [];
    }
  } else if (Array.isArray(order.items)) {
    items = order.items;
  } else {
    items = order.items || [];
  }
  console.log('[Shopbox] Parsed items:', items.length, items);
  const itemsWithShopboxId = items.map(item => {
    const mapping = shopboxMapping[item.id];
    return {
      ...item,
      shopbox_id: mapping ? mapping.shopbox_id : null,
    };
  });

  // 检查未映射的菜品
  const unmapped = itemsWithShopboxId.filter(item => !item.shopbox_id);
  if (unmapped.length > 0) {
    const names = unmapped.map(i => i.name_da || i.name_zh || i.id).join(', ');
    if (!confirm(`以下 ${unmapped.length} 个菜品未映射到 Shopbox：\n${names}\n\n仍要推送吗？（未映射的菜品将以 PWA 编号发送，Shopbox 可能无法识别）`)) {
      return;
    }
  }

  // 更新 UI 状态为同步中
  updateShopboxBadge(orderNumber, 'syncing');

  try {
    const resp = await fetch(
      `${SUPABASE_URL}/functions/v1/sync-to-shopbox`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_number: order.order_number,
          order_type: order.order_type,
          customer_name: order.customer_name,
          customer_phone: order.customer_phone,
          table_number: order.table_number || order.table,
          guest_count: order.guest_count || order.guestCount,
          pickup_time: order.pickup_time,
          notes: order.notes,
          total: order.total,
          discount: order.discount || 0,
          items: itemsWithShopboxId,
        }),
      }
    );

    const result = await resp.json();

    if (!resp.ok) {
      console.error('[Shopbox] Sync failed:', result);
      updateShopboxBadge(orderNumber, 'failed', result.error || '同步失败');
      alert(`❌ Shopbox 同步失败：${result.error || '未知错误'}\n${result.detail || ''}`);
    } else {
      console.log('[Shopbox] Synced successfully:', result);
      updateShopboxBadge(orderNumber, 'synced', result.shopbox_basket_id);
      // 更新本地缓存
      order.shopbox_basket_id = result.shopbox_basket_id;
      order.shopbox_sale_id = result.shopbox_sale_id;
      order.shopbox_sync_status = 'synced';
      alert(`✅ 已同步到 Shopbox！\nBasket ID: ${result.shopbox_basket_id || 'N/A'}\nSale ID: ${result.shopbox_sale_id || 'N/A'}`);
    }
  } catch (error) {
    console.error('[Shopbox] Network error:', error);
    updateShopboxBadge(orderNumber, 'failed', error.message);
    alert('❌ Shopbox 同步网络错误：' + error.message);
  }
}

// ── 更新 Shopbox 状态 Badge（UI 反馈）───
function updateShopboxBadge(orderNumber, status, detail) {
  const badge = document.getElementById(`shopbox-badge-${orderNumber}`);
  if (!badge) return;

  const styles = {
    pending:  { bg: '#E0E0E0', color: '#666', text: '⏳ 未同步' },
    syncing:  { bg: '#FFF3CD', color: '#856404', text: '⏳ 同步中...' },
    synced:   { bg: '#D4EDDA', color: '#155724', text: `✅ 已同步${detail ? ' (' + detail + ')' : ''}` },
    failed:   { bg: '#F8D7DA', color: '#721C24', text: `❌ 失败${detail ? ': ' + detail : ''}` },
  };

  const style = styles[status] || styles.pending;
  badge.style.background = style.bg;
  badge.style.color = style.color;
  badge.textContent = style.text;
}

// ── 切换自动同步 ──
function toggleShopboxAutoSync() {
  shopboxAutoSync = !shopboxAutoSync;
  const btn = document.getElementById('shopbox-auto-btn');
  if (btn) {
    btn.textContent = shopboxAutoSync ? '✅ 自动同步 ON' : '⏸️ 自动同步 OFF';
    btn.classList.toggle('active', shopboxAutoSync);
  }
}

// ── 获取 Shopbox 同步状态 HTML（用于订单卡片）───
function getShopboxBadgeHTML(order) {
  if (!shopboxEnabled) return ''; // 未启用时不显示

  const status = order.shopbox_sync_status || 'pending';
  const basketId = order.shopbox_basket_id || '';

  const styles = {
    pending:  { bg: '#E0E0E0', color: '#666', text: '⏳ 未同步' },
    syncing:  { bg: '#FFF3CD', color: '#856404', text: '⏳ 同步中...' },
    synced:   { bg: '#D4EDDA', color: '#155724', text: '✅ 已同步' },
    failed:   { bg: '#F8D7DA', color: '#721C24', text: '❌ 同步失败' },
    skipped:  { bg: '#E2E3E5', color: '#383D41', text: '⏭️ 已跳过' },
  };

  const style = styles[status] || styles.pending;
  const tooltip = basketId ? `Shopbox Basket: ${basketId}` : '点击"推送到 Shopbox"按钮同步';

  return `<span id="shopbox-badge-${order.order_number}" class="shopbox-badge" style="background:${style.bg};color:${style.color};padding:2px 8px;border-radius:4px;font-size:12px;font-weight:600;cursor:help;" title="${tooltip}">${style.text}</span>`;
}

// ── 生成"推送到 Shopbox"按钮 HTML ──
function getShopboxButtonHTML(order) {
  if (!shopboxEnabled) return '';
  if (order.shopbox_sync_status === 'synced' && order.shopbox_basket_id) return '';

  // 紧急停用：按钮显示为禁用状态
  if (shopboxEmergencyStop) {
    return `<button class="order-card__action-btn order-card__action-btn--shopbox" disabled style="opacity:0.5;cursor:not-allowed;" title="Shopbox 同步已紧急停用">🚫 Shopbox 已停用</button>`;
  }

  return `<button class="order-card__action-btn order-card__action-btn--shopbox" onclick="syncToShopbox('${order.order_number}')">🔄 推送到 Shopbox</button>`;
}

