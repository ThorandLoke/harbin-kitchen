/**
 * 营业时间工具函数 - Harbin Kitchen
 * 供 book-bord.html 和 app.js 共用
 */

/**
 * 获取某日期的营业时间
 * 周一-周二: 16:00-21:30
 * 周三-周日: 12:00-21:30
 * @param {Date|string} date - 日期对象或 "YYYY-MM-DD" 字符串
 * @returns {{ open: string, close: string, openMinutes: number, closeMinutes: number }}
 */
function getOpeningHours(date) {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  const isMonOrTue = (day === 1 || day === 2);
  if (isMonOrTue) {
    return { open: '16:00', close: '21:30', openMinutes: 16 * 60, closeMinutes: 21 * 60 + 30 };
  } else {
    return { open: '12:00', close: '21:30', openMinutes: 12 * 60, closeMinutes: 21 * 60 + 30 };
  }
}

/**
 * 生成时间槽列表（每30分钟一档）
 * @param {string} dateStr - "YYYY-MM-DD"
 * @param {number} [bufferMinutes=30] - 当前时间缓冲区（客人需要时间看菜单）
 * @returns {Array<{value: string, label: string, disabled: boolean}>}
 */
function generateTimeSlots(dateStr, bufferMinutes) {
  if (bufferMinutes === undefined) bufferMinutes = 30;
  const hours = getOpeningHours(dateStr);
  const slots = [];
  const now = new Date();
  const isToday = dateStr === now.toISOString().split('T')[0];
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  let current = hours.openMinutes;
  const close = hours.closeMinutes;

  while (current <= close) {
    const hh = String(Math.floor(current / 60)).padStart(2, '0');
    const mm = String(current % 60).padStart(2, '0');
    const timeStr = hh + ':' + mm;
    const timeMinutes = current;

    // 如果是今天，禁用早于（当前时间 + buffer）的时间槽
    const disabled = isToday && (timeMinutes < nowMinutes + bufferMinutes);
    // 最后一个时间槽：取餐时间要能在关门前取，给至少30分钟
    const tooLate = isToday && (timeMinutes > close - 30);

    slots.push({
      value: timeStr,
      label: timeStr,
      disabled: disabled || tooLate
    });

    current += 30;
  }

  return slots;
}

/**
 * 生成日期选择器的最小/最大日期
 * @returns {{ min: string, max: string }}
 */
function getDateRange() {
  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 30);
  return {
    min: today.toISOString().split('T')[0],
    max: maxDate.toISOString().split('T')[0]
  };
}
