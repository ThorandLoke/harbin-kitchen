/* ============================================================
   Smart Prep Time Engine — Harbin Kitchen
   根据菜品复杂度动态计算预计制作时间

   公式: 预计时间 = 基础时间(10min) + 瓶颈菜品时间 + ceil(其余菜品数/2) x 4min
   规则: 最低 20 分钟, 最高 50 分钟, 超过 35 分钟建议电话确认
   ============================================================ */

const PREP_BASE_TIME = 10;
const PREP_INCREMENTAL_TIME = 4;
const PREP_MIN_TIME = 20;
const PREP_MAX_TIME = 50;
const PREP_PHONE_CONFIRM_THRESHOLD = 35;

const COMPLEXITY_FAST = 5;
const COMPLEXITY_NORMAL = 8;
const COMPLEXITY_SLOW = 12;

// 慢菜关键词匹配（中文名和丹麦名都检查）
const SLOW_DISH_KEYWORDS_ZH = [
  '水煮', '金汤', '干锅', '烤鱼', '毛血旺',
  '红烧肉', '坛子', '锅包肉', '香酥鸭', '松鼠鱼',
  '酸菜鱼', '沸腾鱼'
];

// 按 category ID 的默认复杂度
const CATEGORY_COMPLEXITY = {
  'forretter': COMPLEXITY_FAST,
  'dagens_suppe': COMPLEXITY_FAST,
  'dum': COMPLEXITY_FAST,
  'kold_rette': COMPLEXITY_FAST,
  'sauce': COMPLEXITY_FAST,
  'hovedretter_nudler': COMPLEXITY_FAST,
  'hovedretter_groentsager': COMPLEXITY_NORMAL,
  'hovedretter_kylling': COMPLEXITY_NORMAL,
  'hovedretter_oksekoed': COMPLEXITY_NORMAL,
  'hovedretter_svinekoed': COMPLEXITY_NORMAL,
  'hovedretter_lammekoed': COMPLEXITY_NORMAL,
  'hovedretter_and': COMPLEXITY_NORMAL,
  'hovedretter_rejer': COMPLEXITY_NORMAL,
  'hovedretter_fisk': COMPLEXITY_NORMAL,
  'drikkekort': COMPLEXITY_FAST,
  'drikkekort_dinein': COMPLEXITY_FAST,
  'forud_bestilling': COMPLEXITY_SLOW,
};

/**
 * 获取单个菜品的制作复杂度（分钟）
 * @param {Object} item - 菜品对象
 * @param {string} categoryId - 分类 ID
 * @returns {number} 制作时间（分钟）
 */
function getDishPrepTime(item, categoryId) {
  if (!item) return COMPLEXITY_NORMAL;

  var nameZh = item.name_zh || '';
  var nameDa = item.name_da || '';

  for (var i = 0; i < SLOW_DISH_KEYWORDS_ZH.length; i++) {
    if (nameZh.indexOf(SLOW_DISH_KEYWORDS_ZH[i]) !== -1) {
      return COMPLEXITY_SLOW;
    }
  }

  if (CATEGORY_COMPLEXITY[categoryId]) {
    return CATEGORY_COMPLEXITY[categoryId];
  }

  return COMPLEXITY_NORMAL;
}

/**
 * 计算购物车的预计制作时间
 * @param {Array} enrichedCart - getEnrichedCart() 的返回值
 * @returns {Object} { minutes: number, needsPhoneConfirm: boolean, breakdown: string }
 */
function calculatePrepTime(enrichedCart) {
  if (!enrichedCart || enrichedCart.length === 0) {
    return {
      minutes: PREP_MIN_TIME,
      needsPhoneConfirm: false,
      breakdown: '无菜品',
      dishCount: 0,
      hasSlowDish: false
    };
  }

  var dishTimes = [];
  var hasSlowDish = false;
  var totalDishCount = 0;

  enrichedCart.forEach(function(c) {
    if (!c.item) return;
    if (c.category && c.category.categoryType === 'drink') return;
    if (c.category && c.category.id === 'sauce') return;

    var time = getDishPrepTime(c.item, c.categoryId);
    if (time === COMPLEXITY_SLOW) hasSlowDish = true;

    for (var i = 0; i < c.qty; i++) {
      dishTimes.push(time);
      totalDishCount++;
    }
  });

  if (dishTimes.length === 0) {
    return {
      minutes: PREP_MIN_TIME,
      needsPhoneConfirm: false,
      breakdown: '仅饮品/酱汁',
      dishCount: 0,
      hasSlowDish: false
    };
  }

  dishTimes.sort(function(a, b) { return b - a; });

  var maxDishTime = dishTimes[0];
  var remainingDishes = dishTimes.length - 1;
  var parallelIncrement = Math.ceil(remainingDishes / 2) * PREP_INCREMENTAL_TIME;

  var rawTime = PREP_BASE_TIME + maxDishTime + parallelIncrement;
  var minutes = Math.max(PREP_MIN_TIME, Math.min(PREP_MAX_TIME, rawTime));
  minutes = Math.round(minutes / 5) * 5;

  var needsPhoneConfirm = minutes > PREP_PHONE_CONFIRM_THRESHOLD;

  var breakdown = PREP_BASE_TIME + '(基础) + ' + maxDishTime + '(瓶颈) + ' + parallelIncrement + '(并行' + dishTimes.length + '菜) = ' + rawTime + 'min → ' + minutes + 'min';

  return {
    minutes: minutes,
    needsPhoneConfirm: needsPhoneConfirm,
    breakdown: breakdown,
    dishCount: totalDishCount,
    hasSlowDish: hasSlowDish,
    maxDishTime: maxDishTime
  };
}

if (typeof module !== 'undefined') module.exports = {
  calculatePrepTime: calculatePrepTime,
  getDishPrepTime: getDishPrepTime,
  PREP_PHONE_CONFIRM_THRESHOLD: PREP_PHONE_CONFIRM_THRESHOLD
};
