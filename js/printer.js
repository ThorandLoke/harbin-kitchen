// ============================================
// ESC/POS THERMAL PRINTER MODULE
// 热敏小票打印机模块
// Supports: 58mm & 80mm paper, USB serial
// ============================================

const Printer = (function () {
  // ── ESC/POS Commands ──
  const CMD = {
    INIT:       [0x1B, 0x40],         // Initialize printer
    FEED:       (n=1) => [0x1B, 0x64, n],  // Feed n lines
    ALIGN_L:    [0x1B, 0x61, 0x00],   // Left align
    ALIGN_C:    [0x1B, 0x61, 0x01],   // Center align
    ALIGN_R:    [0x1B, 0x61, 0x02],   // Right align
    BOLD_ON:    [0x1B, 0x45, 0x01],   // Bold on
    BOLD_OFF:   [0x1B, 0x45, 0x00],   // Bold off
    UNDER_ON:   [0x1B, 0x2D, 0x01],   // Underline on
    UNDER_OFF:  [0x1B, 0x2D, 0x00],   // Underline off
    SIZE_NORMAL:[0x1D, 0x21, 0x00],   // Normal size
    SIZE_W:     [0x1D, 0x21, 0x10],   // Double width
    SIZE_H:     [0x1D, 0x21, 0x01],   // Double height
    SIZE_WH:    [0x1D, 0x21, 0x11],   // Double width + height
    CHARSET:    (n=0) => [0x1B, 0x52, n], // Character set (0=USA)
    CUT:        [0x1D, 0x56, 0x01],   // Full cut
    PART_CUT:   [0x1D, 0x56, 0x02],   // Partial cut
  };

  // ── Paper Width ──
  let paperChars = 32;  // 58mm = 32 chars, 80mm = 48 chars

  // ── Serial Port ──
  let port = null;
  let writer = null;
  let isConnected = false;

  // ── Auto-print setting ──
  let autoPrint = true;

  // ── Connect via Web Serial API ──
  async function connect() {
    if (!('serial' in navigator)) {
      throw new Error('此浏览器不支持串口打印。请使用 Chrome 或 Edge 浏览器。');
    }

    try {
      port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });
      const info = port.getInfo();
      isConnected = true;
      return true;
    } catch (err) {
      if (err.name === 'NotFoundError') {
        throw new Error('未选择打印机');
      }
      throw err;
    }
  }

  async function disconnect() {
    try {
      if (writer) { writer.releaseLock(); writer = null; }
      if (port) { await port.close(); port = null; }
    } catch (e) { /* ignore */ }
    isConnected = false;
  }

  // ── Raw write to printer ──
  async function write(data) {
    if (!port || !port.writable) throw new Error('打印机未连接');
    writer = port.writable.getWriter();
    try {
      await writer.write(data);
    } finally {
      writer.releaseLock();
      writer = null;
    }
  }

  // ── Encode text with codepage for Danish/Chinese ──
  // Most thermal printers support PC437 (default) for basic ASCII
  // For Chinese characters, we use the printer's built-in Chinese mode
  function encodeText(text) {
    // Try to encode as UTF-8, fall back to individual bytes
    const encoder = new TextEncoder();
    return encoder.encode(text);
  }

  // ── Build receipt buffer ──
  function buildReceipt(order) {
    const buf = [];
    const push = (bytes) => bytes.forEach(b => buf.push(b));
    const pushText = (text) => encodeText(text).forEach(b => buf.push(b));
    const pushLine = (text = '') => { pushText(text); push([0x0A]); };

    // Initialize
    push(CMD.INIT);

    // ── Header ──
    push(CMD.ALIGN_C);
    push(CMD.SIZE_WH);
    push(CMD.BOLD_ON);
    pushLine('东北小炒');
    push(CMD.SIZE_NORMAL);
    push(CMD.BOLD_OFF);
    pushLine('Harbin Kitchen');
    pushLine(divider());

    // ── Order type badge ──
    push(CMD.BOLD_ON);
    push(CMD.SIZE_W);
    const typeMap = {
      dinein:  '🪑 堂食 SPIS HER',
      takeaway: '🥡 外卖 AFHENTNING',
      preorder: '⏰ 预约 FORUD BESTILLING'
    };
    pushLine(typeMap[order.orderType] || order.orderType);
    push(CMD.SIZE_NORMAL);
    push(CMD.BOLD_OFF);

    // ── Table & Guest ──
    push(CMD.ALIGN_L);
    if (order.orderType === 'dinein' && order.table) {
      push(CMD.BOLD_ON);
      pushLine(`  桌号/Bord: ${order.table}`);
      push(CMD.BOLD_OFF);
    }
    if (order.guestCount) {
      pushLine(`  人数/Gæster: ${order.guestCount}`);
    }

    pushLine(divider());

    // ── Items ──
    push(CMD.BOLD_ON);
    pushLine('  #  菜名             价格');
    push(CMD.BOLD_OFF);
    pushLine(dividerThin());

    const items = order.items || [];
    items.forEach((item, i) => {
      const qty = item.qty || 1;
      const name = item.name_zh || item.name_da || item.name;
      const nameDa = item.name_da || '';
      const price = (item.lineTotal || (item.unitPrice * qty) || 0).toFixed(2);

      // Line 1: qty + Chinese name + price
      const qtyStr = `${qty}x`;
      const line1 = `  ${qtyStr.padEnd(3)} ${name}`;
      pushLine(line1);

      // Line 2: Danish name (if different from Chinese)
      if (nameDa && nameDa !== name) {
        pushLine(`      ${nameDa}`);
      }

      // Notes
      if (item.notes) {
        push(CMD.BOLD_ON);
        pushLine(`      >> ${item.notes}`);
        push(CMD.BOLD_OFF);
      }

      // Lead days
      if (item.lead_days) {
        pushLine(`      ⏰ 需提前${item.lead_days}天`);
      }
    });

    pushLine(divider());

    // ── Totals ──
    const totals = order.totals || {};
    push(CMD.ALIGN_R);
    pushLine(`小计/Subtotal:    ${padPrice(totals.subtotal || 0)}`);
    if (totals.totalDiscount > 0) {
      push(CMD.BOLD_ON);
      pushLine(`折扣/Rabat -10%:  -${padPrice(totals.totalDiscount)}`);
      push(CMD.BOLD_OFF);
    }
    pushLine(dividerThin());
    push(CMD.SIZE_WH);
    push(CMD.BOLD_ON);
    pushLine(`合计/Total: ${padPrice(totals.total || 0)} kr.`);
    push(CMD.SIZE_NORMAL);
    push(CMD.BOLD_OFF);

    // ── Payment method ──
    push(CMD.ALIGN_C);
    pushLine('');
    if (order.orderType === 'dinein') {
      pushLine('到桌付款 / Betaling ved bordet');
    } else {
      pushLine('到店取餐时付款 / Betal ved afhentning');
    }

    // ── Order number ──
    pushLine('');
    push(CMD.BOLD_ON);
    push(CMD.SIZE_W);
    pushLine(`#${order.orderNumber}`);
    push(CMD.SIZE_NORMAL);
    push(CMD.BOLD_OFF);

    // ── Timestamp ──
    const created = new Date(order.createdAt);
    pushLine(created.toLocaleString('da-DK'));

    // ── Customer info ──
    if (order.customer) {
      if (order.customer.name) pushLine(`${order.customer.name}`);
      if (order.customer.phone) pushLine(`📞 ${order.customer.phone}`);
      if (order.customer.pickupTime && order.orderType !== 'dinein') {
        pushLine(`⏰ ${order.customer.pickupTime}`);
      }
    }

    pushLine('');
    pushLine(divider());
    push(CMD.SIZE_NORMAL);
    pushLine('');

    // ── Feed & Cut ──
    push(CMD.FEED(4));
    push(CMD.CUT);

    return new Uint8Array(buf);
  }

  // ── Build kitchen ticket (simplified, for kitchen use) ──
  function buildKitchenTicket(order) {
    const buf = [];
    const push = (bytes) => bytes.forEach(b => buf.push(b));
    const pushText = (text) => encodeText(text).forEach(b => buf.push(b));
    const pushLine = (text = '') => { pushText(text); push([0x0A]); };

    push(CMD.INIT);

    // ── Header ──
    push(CMD.ALIGN_C);
    push(CMD.SIZE_WH);
    push(CMD.BOLD_ON);
    pushLine('后厨出单');
    push(CMD.SIZE_NORMAL);
    push(CMD.BOLD_OFF);

    // Order type
    const typeMap = {
      dinein:  '堂食 SPIS HER',
      takeaway: '外卖 AFHENTNING',
      preorder: '预约 FORUD'
    };
    push(CMD.SIZE_W);
    pushLine(typeMap[order.orderType] || order.orderType);
    push(CMD.SIZE_NORMAL);

    // Table number - big and bold
    if (order.orderType === 'dinein' && order.table) {
      push(CMD.SIZE_WH);
      push(CMD.BOLD_ON);
      pushLine(`桌 ${order.table}`);
      push(CMD.SIZE_NORMAL);
      push(CMD.BOLD_OFF);
    }

    if (order.guestCount) {
      pushLine(`${order.guestCount}人`);
    }

    pushLine(divider());
    push(CMD.ALIGN_L);

    // ── Items grouped by category ──
    const items = order.items || [];
    items.forEach((item, i) => {
      const qty = item.qty || 1;
      const name = item.name_zh || item.name_da || item.name;
      push(CMD.BOLD_ON);
      pushLine(`  ${qty}x  ${name}`);
      push(CMD.BOLD_OFF);

      if (item.notes) {
        pushLine(`      >> ${item.notes}`);
      }
    });

    pushLine(divider());

    // Order number & time
    push(CMD.ALIGN_C);
    push(CMD.BOLD_ON);
    pushLine(`#${order.orderNumber}`);
    push(CMD.BOLD_OFF);
    const created = new Date(order.createdAt);
    pushLine(created.toLocaleString('da-DK'));

    if (order.customer && order.customer.name) {
      pushLine(order.customer.name);
    }

    push(CMD.FEED(3));
    push(CMD.PART_CUT);

    return new Uint8Array(buf);
  }

  // ── Print receipt ──
  async function printReceipt(order) {
    const data = buildReceipt(order);
    await write(data);
  }

  // ── Print kitchen ticket ──
  async function printKitchenTicket(order) {
    const data = buildKitchenTicket(order);
    await write(data);
  }

  // ── Print both (customer receipt + kitchen ticket) ──
  async function printBoth(order) {
    await printReceipt(order);
    // Small delay between receipts
    await new Promise(r => setTimeout(r, 500));
    await printKitchenTicket(order);
  }

  // ── Test print ──
  async function testPrint() {
    const buf = [];
    const push = (bytes) => bytes.forEach(b => buf.push(b));
    const pushText = (text) => encodeText(text).forEach(b => buf.push(b));
    const pushLine = (text = '') => { pushText(text); push([0x0A]); };

    push(CMD.INIT);
    push(CMD.ALIGN_C);
    push(CMD.SIZE_WH);
    push(CMD.BOLD_ON);
    pushLine('TEST PRINT');
    push(CMD.SIZE_NORMAL);
    push(CMD.BOLD_OFF);
    pushLine(divider());
    push(CMD.ALIGN_L);
    pushLine('Printer connected successfully!');
    pushLine('打印机连接成功！');
    pushLine(divider());
    push(CMD.FEED(3));
    push(CMD.CUT);

    await write(new Uint8Array(buf));
  }

  // ── Helpers ──
  function divider() {
    return '─'.repeat(paperChars);
  }

  function dividerThin() {
    return '-'.repeat(paperChars);
  }

  function padPrice(num) {
    return Number(num).toFixed(2).padStart(8);
  }

  function setPaperSize(mm) {
    paperChars = mm === 80 ? 48 : 32;
  }

  // ── Browser Print Fallback ──
  // Generates a receipt as HTML and opens print dialog
  function browserPrintReceipt(order) {
    const html = generateReceiptHTML(order);
    const win = window.open('', '_blank', 'width=320,height=600');
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 300);
  }

  function browserPrintKitchenTicket(order) {
    const html = generateKitchenTicketHTML(order);
    const win = window.open('', '_blank', 'width=320,height=600');
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 300);
  }

  // ── Generate Receipt HTML ──
  function generateReceiptHTML(order) {
    const totals = order.totals || {};
    const items = order.items || [];
    const created = new Date(order.createdAt);
    const typeLabel = { dinein: '堂食 Spis Her', takeaway: '外卖 Afhentning', preorder: '预约 Forud Bestilling' }[order.orderType] || order.orderType;

    let itemsHtml = '';
    items.forEach(item => {
      const qty = item.qty || 1;
      const nameZh = item.name_zh || '';
      const nameDa = item.name_da || '';
      const price = (item.lineTotal || (item.unitPrice * qty) || 0).toFixed(2);
      itemsHtml += `
        <tr>
          <td class="qty">${qty}x</td>
          <td class="name">
            ${nameZh}${nameDa && nameDa !== nameZh ? `<br><small>${nameDa}</small>` : ''}
            ${item.notes ? `<br><em class="note">>> ${item.notes}</em>` : ''}
            ${item.lead_days ? `<br><em class="lead">⏰ 需提前${item.lead_days}天</em>` : ''}
          </td>
          <td class="price">${price}</td>
        </tr>`;
    });

    return `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Receipt ${order.orderNumber}</title>
<style>
  @page { size: 80mm auto; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Courier New', 'Noto Sans SC', monospace;
    font-size: 12px; line-height: 1.5; color: #000;
    width: 72mm; padding: 4mm;
  }
  .header { text-align: center; margin-bottom: 8px; }
  .header h1 { font-size: 18px; }
  .header h2 { font-size: 11px; font-weight: normal; }
  .type { font-size: 16px; font-weight: bold; text-align: center; margin: 6px 0; padding: 4px; border: 2px solid #000; }
  .meta { margin: 4px 0; font-size: 12px; }
  .meta b { font-size: 14px; }
  .divider { border-top: 1px dashed #000; margin: 6px 0; }
  table { width: 100%; border-collapse: collapse; }
  td.qty { width: 28px; text-align: right; padding-right: 4px; font-weight: bold; }
  td.name { font-size: 12px; }
  td.name small { font-size: 10px; color: #555; }
  td.name .note { color: #c00; font-style: normal; font-size: 10px; }
  td.name .lead { color: #c60; font-style: normal; font-size: 10px; }
  td.price { text-align: right; white-space: nowrap; }
  .totals { margin-top: 6px; }
  .totals .row { display: flex; justify-content: space-between; }
  .totals .total-row { font-size: 16px; font-weight: bold; margin-top: 4px; }
  .footer { text-align: center; margin-top: 8px; font-size: 11px; }
  .footer .order-num { font-size: 14px; font-weight: bold; }
</style></head><body>
  <div class="header">
    <h1>东北小炒</h1>
    <h2>Harbin Kitchen</h2>
  </div>
  <div class="divider"></div>
  <div class="type">${typeLabel}</div>
  ${order.orderType === 'dinein' && order.table ? `<div class="meta">桌号/Bord: <b>${order.table}</b></div>` : ''}
  ${order.guestCount ? `<div class="meta">人数/Gæster: <b>${order.guestCount}</b></div>` : ''}
  <div class="divider"></div>
  <table>${itemsHtml}</table>
  <div class="divider"></div>
  <div class="totals">
    <div class="row"><span>小计 Subtotal</span><span>${Number(totals.subtotal || 0).toFixed(2)} kr.</span></div>
    ${totals.totalDiscount > 0 ? `<div class="row"><span>折扣 Rabat -10%</span><span>-${Number(totals.totalDiscount).toFixed(2)} kr.</span></div>` : ''}
    <div class="divider"></div>
    <div class="total-row row"><span>合计 Total</span><span>${Number(totals.total || 0).toFixed(2)} kr.</span></div>
  </div>
  <div class="divider"></div>
  <div class="footer">
    ${order.orderType === 'dinein' ? '到桌付款 / Betaling ved bordet' : '到店付款 / Betal ved afhentning'}
    <br><br>
    <span class="order-num">#${order.orderNumber}</span>
    <br>${created.toLocaleString('da-DK')}
    ${order.customer ? `<br>${order.customer.name || ''}${order.customer.phone ? ' · ' + order.customer.phone : ''}` : ''}
  </div>
</body></html>`;
  }

  // ── Generate Kitchen Ticket HTML ──
  function generateKitchenTicketHTML(order) {
    const items = order.items || [];
    const created = new Date(order.createdAt);
    const typeLabel = { dinein: '堂食', takeaway: '外卖', preorder: '预约' }[order.orderType] || order.orderType;

    let itemsHtml = '';
    items.forEach(item => {
      const qty = item.qty || 1;
      const name = item.name_zh || item.name_da || item.name;
      itemsHtml += `
        <tr>
          <td class="qty">${qty}x</td>
          <td class="name">${name}${item.notes ? `<br><em class="note">>> ${item.notes}</em>` : ''}</td>
        </tr>`;
    });

    return `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Kitchen ${order.orderNumber}</title>
<style>
  @page { size: 80mm auto; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Courier New', 'Noto Sans SC', monospace;
    font-size: 14px; line-height: 1.6; color: #000;
    width: 72mm; padding: 4mm;
  }
  .header { text-align: center; margin-bottom: 8px; }
  .header h1 { font-size: 22px; }
  .type { font-size: 18px; font-weight: bold; text-align: center; margin: 6px 0; }
  .table-num { font-size: 28px; font-weight: bold; text-align: center; margin: 4px 0; }
  .guests { text-align: center; font-size: 14px; }
  .divider { border-top: 1px dashed #000; margin: 6px 0; }
  table { width: 100%; border-collapse: collapse; }
  td.qty { width: 36px; text-align: right; padding-right: 6px; font-size: 16px; font-weight: bold; }
  td.name { font-size: 15px; font-weight: bold; }
  td.name .note { color: #c00; font-style: normal; font-size: 12px; font-weight: normal; }
  .footer { text-align: center; margin-top: 10px; font-size: 12px; }
  .footer .order-num { font-size: 16px; font-weight: bold; }
</style></head><body>
  <div class="header"><h1>🍳 后厨出单</h1></div>
  <div class="type">${typeLabel}</div>
  ${order.orderType === 'dinein' && order.table ? `<div class="table-num">桌 ${order.table}</div>` : ''}
  ${order.guestCount ? `<div class="guests">${order.guestCount}人</div>` : ''}
  <div class="divider"></div>
  <table>${itemsHtml}</table>
  <div class="divider"></div>
  <div class="footer">
    <span class="order-num">#${order.orderNumber}</span><br>
    ${created.toLocaleString('da-DK')}
    ${order.customer && order.customer.name ? `<br>${order.customer.name}` : ''}
  </div>
</body></html>`;
  }

  // ── Public API ──
  return {
    connect,
    disconnect,
    printReceipt,
    printKitchenTicket,
    printBoth,
    testPrint,
    browserPrintReceipt,
    browserPrintKitchenTicket,
    setPaperSize,
    getIsConnected: () => isConnected,
    getAutoPrint: () => autoPrint,
    setAutoPrint: (v) => { autoPrint = v; },
    // Expose for admin.js
    buildReceipt,
    buildKitchenTicket,
  };
})();
