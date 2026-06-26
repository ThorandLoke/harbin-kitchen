# Shopbox POS 集成 — 部署指南

> **适用日期**：2026-06-26
> **状态**：已修复并重新部署，端点改为 `/takeaway/order`

---

## 概述

本指南包含 Shopbox POS 集成部署步骤。经过深度诊断，发现正确的 Shopbox API 端点是 `POST /takeaway/order`（不是 `/baskets`），且必须：

- 使用 `table` 字段传桌台 ID（不是 `table_number`）
- 菜品价格字段用 `selling_price`（不是 `amount`）
- 外卖/堂食统一用 `order_type: dinein`，这样订单才会出现在 POS 桌台视图里
- 外卖使用虚拟桌号 20→1 循环，堂食使用真实桌号

---

## 步骤 1：配置 Supabase Secrets

在终端中依次执行以下命令（假设你已登录 `supabase` CLI）：

```bash
supabase secrets set --project-ref glfmoqfevyeeuqbihjht SHOPBOX_EMAIL=susan@harbinkitchen.dk
supabase secrets set --project-ref glfmoqfevyeeuqbihjht SHOPBOX_PASSWORD=susanzhu129B8585
supabase secrets set --project-ref glfmoqfevyeeuqbihjht SHOPBOX_CLIENT_ID=11314
supabase secrets set --project-ref glfmoqfevyeeuqbihjht SHOPBOX_CASH_REGISTER=16701
# 可选：门店 Branch ID，未设置时默认使用 13444
supabase secrets set --project-ref glfmoqfevyeeuqbihjht SHOPBOX_BRANCH_ID=13444
```

> `SHOPBOX_CASH_REGISTER` 已有默认值 `16701`，但显式设置更安全。
> `SHOPBOX_BRANCH_ID` 可选，未设置时默认 `13444`（Harbin Kitchen）。

---

## 步骤 2：部署 Edge Function

```bash
supabase functions deploy sync-to-shopbox --project-ref glfmoqfevyeeuqbihjht
```

> 部署成功后，函数 URL 为：
> `https://glfmoqfevyeeuqbihjht.supabase.co/functions/v1/sync-to-shopbox`
>
> 本次修复后，函数内部调用 Shopbox 的 `POST /takeaway/order` 端点，并传入正确的 `table`（桌台 ID）和 `selling_price`。

---

## 步骤 3：运行数据库 Migration

1. 打开 Supabase Dashboard → SQL Editor
2. 新建一个查询，粘贴以下 SQL：

```sql
-- ============================================================
-- Shopbox POS 集成 — 数据库 Migration
-- 在 orders 表中添加 Shopbox 同步追踪字段
-- ============================================================

-- 1. 添加 shopbox 同步状态字段
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shopbox_basket_id TEXT,
  ADD COLUMN IF NOT EXISTS shopbox_sale_id TEXT,
  ADD COLUMN IF NOT EXISTS shopbox_sync_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS shopbox_sync_error TEXT,
  ADD COLUMN IF NOT EXISTS shopbox_synced_at TIMESTAMP WITH TIME ZONE;

-- 2. 创建索引加速查询
CREATE INDEX IF NOT EXISTS idx_orders_shopbox_status ON orders(shopbox_sync_status);
CREATE INDEX IF NOT EXISTS idx_orders_shopbox_basket_id ON orders(shopbox_basket_id);

-- 3. 同步状态说明：
--    pending     = 尚未同步到 Shopbox
--    syncing     = 正在同步中
--    synced      = 已成功同步
--    failed      = 同步失败
--    skipped     = 跳过（如手动取消）
--    finalized   = 已在 Shopbox 中结账
```

3. 点击 **Run** 执行

> 如果字段已存在（如之前运行过），`IF NOT EXISTS` 会安全跳过，不会报错。

---

## 步骤 4：验证前端部署

前端代码已 push 到 GitHub（commit `75cd6a3`），GitHub Pages 会自动构建。

等待约 2-3 分钟后，在浏览器（无痕模式）访问：
```
https://order.harbinkitchen.dk/admin.html
```

确认顶部能看到 **"🟢 Shopbox"** 状态和 **"Shopbox 自动同步"** 开关按钮。

> 如果看不到新按钮，强制刷新：
> - iPad Safari：长按刷新按钮 → 选择「请求桌面网站」或清除缓存
> - Chrome：Ctrl+Shift+R（或 Cmd+Shift+R）

---

## 步骤 5：测试推送

1. 在 PWA 点单系统下单一个测试订单（堂食或外卖均可）
2. 在 Admin 后台查看新订单
3. 点击订单卡片上的 **"🔄 推送到 Shopbox"** 按钮
4. 观察按钮状态变化：⏳ → 🔄同步中... → ✅已同步（或 ❌失败）
5. 到 Shopbox 收银台查看是否出现该订单

---

## 常见问题

### Q1: 部署 Edge Function 报错 "Unauthorized"
确保你已登录 Supabase CLI：
```bash
supabase login
```

### Q2: 推送显示 "❌ 同步失败：Cash register not found"

这是因为我们之前错误地调用了 `/baskets` 端点。请确认：
1. Edge Function 已重新部署（当前版本使用 `/takeaway/order`）
2. Supabase Secrets 中 `SHOPBOX_CASH_REGISTER=16701` 已设置

### Q3: 推送显示 "❌ 同步失败：No items could be mapped"

检查 `data/shopbox-mapping.json` 中对应菜品是否有正确的 `shopbox_id`。未映射的菜品不会被发送到 Shopbox。

### Q4: 已同步订单还能重复推送吗？

不能。订单状态为 "✅已同步" 时，推送按钮会自动隐藏。

### Q4: 如何开启自动同步？
在 Admin 后台顶部点击 **"Shopbox 自动同步：关"** 按钮，切换为 **"开"**。
开启后，每次点击"开始制作"（接单）时，会自动推送到 Shopbox。

---

## 文件清单

| 文件 | 说明 | 状态 |
|------|------|------|
| `supabase/functions/sync-to-shopbox/index.ts` | Edge Function 代码 | ✅ 已 push |
| `pwa-repo/data/shopbox-mapping.json` | 97 个菜品映射 | ✅ 已 push |
| `pwa-repo/js/admin.js` | Admin 后台同步逻辑 | ✅ 已 push |
| `pwa-repo/admin.html` | Admin 后台 UI | ✅ 已 push |
| `pwa-repo/data/menu.json` | 菜单数据（已删除 6 个过时菜品） | ✅ 已 push |
| `pwa-repo/js/menu-data.js` | 菜单数据（已删除 5 个过时菜品） | ✅ 已 push |
| `pwa-repo/service-worker.js` | 缓存 v25 | ✅ 已 push |
| `supabase/migrations/20260625_add_shopbox_sync.sql` | 数据库 migration | ✅ 已 push |

---

## 部署后检查清单

- [ ] Supabase Secrets 已设置 4 个环境变量（可选 `SHOPBOX_BRANCH_ID`）
- [ ] Edge Function `sync-to-shopbox` 已重新部署
- [ ] SQL Migration 已执行（orders 表新增 5 个字段）
- [ ] GitHub Pages 构建完成（无痕窗口访问确认 v25）
- [ ] Admin 后台能看到 🟢 Shopbox 状态和自动同步开关
- [ ] 测试订单成功推送到 Shopbox 收银台
