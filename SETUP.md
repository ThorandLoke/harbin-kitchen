# 东北小炒 · 老板端订单管理 — 配置指南

## 功能说明

客人下单后，老板/厨房可以在管理面板实时看到新订单，包含：
- 🪑 **桌号**（堂食）
- 👥 **人数**（堂食）
- 📞 **客人电话**
- 🍽️ **完整菜品清单**
- 💰 **金额明细**
- 🔔 **声音提醒**（新订单自动响铃）

---

## 第一步：创建 Supabase 账号（免费）

1. 打开 [supabase.com](https://supabase.com) → 点右上角 **"Start your project"**
2. 用 GitHub 或 Email 注册/登录（免费）
3. 登录后点 **"New Project"**
4. 填写：
   - **Name**: `harbin-kitchen`
   - **Database Password**: 记下来（后面用不到，随便设一个）
   - **Region**: 选 **West EU (Ireland)** 或 **North EU (Stockholm)**（离丹麦最近）
5. 点 **"Create new project"**，等 1-2 分钟

---

## 第二步：建数据表（复制粘贴即可）

1. 在项目后台，左侧菜单点 **"SQL Editor"**
2. 点 **"New query"**
3. 把下面整段 SQL **完整复制** 粘贴进去：

```sql
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  order_type TEXT NOT NULL CHECK (order_type IN ('dinein', 'takeaway', 'preorder')),
  table_number TEXT,
  guest_count INTEGER,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  pickup_time TEXT,
  notes TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal INTEGER NOT NULL DEFAULT 0,
  discount INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'preparing', 'ready', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 开启行级安全（允许网页直接读写）
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 允许任何人插入订单（客人下单）
CREATE POLICY "Allow anonymous inserts" ON orders FOR INSERT WITH CHECK (true);

-- 允许任何人读取订单（管理面板查看）
CREATE POLICY "Allow anonymous selects" ON orders FOR SELECT USING (true);

-- 允许任何人更新订单状态（管理面板操作）
CREATE POLICY "Allow anonymous updates" ON orders FOR UPDATE USING (true);

-- 开启用实时推送（管理面板秒级刷新）
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
```

4. 点 **"RUN"** 按钮（绿色）→ 看到 `Success. No rows returned.` 就是成功了

---

## 第三步：获取 API 密钥

1. 左侧菜单点 **"Project Settings"**（齿轮图标）
2. 点 **"API"**
3. 找到这两行，**分别复制**：

| 字段 | 复制内容 | 粘贴到 |
|------|----------|--------|
| **Project URL** | `https://xxxxx.supabase.co` | `js/supabase-config.js` 第 4 行 |
| **anon/public** | `eyJhbGc...` 一长串 | `js/supabase-config.js` 第 5 行 |

---

## 第四步：填写配置文件

在电脑上打开这个文件（在 WorkBuddy 里可以直接编辑）：

**文件**: `/Users/weili/WorkBuddy/2026-06-07-15-30-48/pwa/js/supabase-config.js`

把这两行改掉：

```javascript
// 改之前：
const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';

// 改之后（举例）：
const SUPABASE_URL = 'https://abcdefghijklm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp...';
```

改完 **保存**，然后推送到 GitHub（可以让 WorkBuddy 帮你推）。

---

## 第五步：设置管理密码

打开这个文件：

**文件**: `/Users/weili/WorkBuddy/2026-06-07-15-30-48/pwa/js/admin.js`

找到第 1 行附近的：

```javascript
const ADMIN_PASSWORD = 'harbin2024'; // 改成你自己的密码
```

把 `harbin2024` 改成只有你和员工知道的密码，保存并推送。

---

## 第六步：访问管理面板

配置完成后，在手机/iPad/电脑浏览器打开：

```
https://thorandloke.github.io/harbin-kitchen/admin.html
```

输入密码 → 进入管理面板 → 新订单会**实时弹出 + 响铃** 🔔

---

## 管理面板使用说明

| 状态 | 含义 | 操作按钮 |
|------|------|----------|
| 🆕 新订单 | 客人刚下单 | 「接单·开始制作」→ 进入"制作中" |
| 🍳 制作中 | 厨房正在做 | 「完成·待取餐」→ 进入"待取餐" |
| ✅ 待取餐 | 做好了，等客人 | 「已取餐·完成」→ 归档 |
| ✔ 已完成 | 订单结束 | — |

- 点 **🔔 声音 ON/OFF** 可以开关提示音
- 顶部数字卡片实时显示各状态订单数量
- 可以按状态筛选订单

---

## 常见问题

**Q: Supabase 免费吗？**
A: 免费版足够用——500MB 数据库、50K 月活用户、无限 API 请求。小餐厅完全够用。

**Q: 客人下单后老板多久能看到？**
A: 实时推送，1 秒内出现在管理面板，同时响铃。

**Q: 没有网络怎么办？**
A: 客人仍可以下单（存在浏览器本地），但老板端看不到，直到网络恢复。

**Q: 可以多人同时用管理面板吗？**
A: 可以，老板和厨房各开一个平板电脑，实时同步。

---

## 配置完成后测试流程

1. 手机打开 `https://thorandloke.github.io/harbin-kitchen/`
2. 选择「堂食」→ 输入桌号 `1`、人数 `2`
3. 点几个菜 → 去购物车 → 填姓名提交
4. 另一台设备打开 `admin.html` → 输入密码
5. 应该看到新订单弹出 + 听到提示音 ✅
