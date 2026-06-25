// ============================================================
// Shopbox 产品列表同步脚本
// 用法：在浏览器控制台或 Node.js 中运行
// 功能：从 Shopbox API 获取所有产品，生成映射表 JSON
// ============================================================

// 配置（老板填入后运行）
const SHOPBOX_EMAIL = 'xxx@xxx.dk';      // 替换为 Shopbox 登录邮箱
const SHOPBOX_PASSWORD = 'password';     // 替换为 Shopbox 密码
const SHOPBOX_API_BASE = 'https://api.shopbox.com/v1';

async function fetchShopboxProducts() {
  console.log('🔐 认证 Shopbox...');

  // 1. 认证获取 token
  const authRes = await fetch(`${SHOPBOX_API_BASE}/authenticate/credentials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: SHOPBOX_EMAIL, password: SHOPBOX_PASSWORD }),
  });

  if (!authRes.ok) {
    throw new Error('认证失败: ' + await authRes.text());
  }

  const authData = await authRes.json();
  const token = authData.token || authData.access_token || authData.jwt;
  console.log('✅ 认证成功，token 获取成功');

  // 2. 获取产品列表
  console.log('📦 获取产品列表...');
  const productsRes = await fetch(`${SHOPBOX_API_BASE}/products`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!productsRes.ok) {
    throw new Error('获取产品列表失败: ' + await productsRes.text());
  }

  const productsData = await productsRes.json();
  const products = productsData.products || productsData.data || productsData;

  console.log(`✅ 获取到 ${products.length} 个产品`);

  // 3. 生成映射表
  const mapping = {};
  products.forEach(p => {
    mapping[p.id] = {
      shopbox_id: p.id,
      name_da: p.name || p.name_da || '',
      name_zh: p.name_zh || '',
      price: p.price / 100, // Shopbox 价格是 øre，转换为 DKK
    };
  });

  console.log('\n📋 产品映射表预览：');
  console.log(JSON.stringify(mapping, null, 2).substring(0, 2000) + '...');

  // 4. 下载为 JSON 文件
  const blob = new Blob([JSON.stringify({ _meta: { source: 'shopbox', date: new Date().toISOString() }, products: mapping }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'shopbox-products.json';
  a.click();
  URL.revokeObjectURL(url);

  console.log('✅ 已下载 shopbox-products.json');
  console.log('📌 下一步：将此文件中的 shopbox_id 复制到 data/shopbox-mapping.json 中');
}

// 运行（取消下面一行的注释）
// fetchShopboxProducts().catch(e => console.error(e));

// ============================================================
// 如果无法直接获取产品列表，也可以使用以下方式手动匹配：
// ============================================================

// 打印所有 PWA 菜品名称，方便在 Shopbox 中搜索对应产品
function printPwaMenuItems() {
  // 这个函数需要加载 menu.json 数据
  // 在浏览器中运行：
  fetch('data/menu.json')
    .then(r => r.json())
    .then(data => {
      const items = [];
      data.categories.forEach(cat => {
        cat.items.forEach(item => {
          items.push({
            id: item.id,
            name_da: item.name_da,
            name_zh: item.name_zh,
            price: item.price
          });
        });
      });
      console.log('📋 PWA 菜单列表（共 ' + items.length + ' 个菜品）：');
      console.table(items);
    });
}

// 在浏览器控制台运行：printPwaMenuItems()
