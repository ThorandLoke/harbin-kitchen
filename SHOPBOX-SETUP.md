# Shopbox POS 集成 — 配置指南

> **状态：2026-06-25 已自动匹配 97/97 个菜品，全部菜品均已同步到 Shopbox**

## 1. 需要老板提供的信息

已获取：
- ✅ **Shopbox 登录邮箱**: `susan@harbinkitchen.dk`
- ✅ **Shopbox 密码**: `susanzhu129B8585`
- ✅ **Shopbox Client ID**: `11314`（Harbin Kitchen / Egami Sushi ApS）
- ✅ **产品列表**: 已自动从 API 获取 104 个产品

## 2. Supabase 环境变量配置

登录 Supabase Dashboard → Project Settings → Edge Functions → 添加以下 Secrets：

```bash
supabase secrets set SHOPBOX_EMAIL=susan@harbinkitchen.dk
supabase secrets set SHOPBOX_PASSWORD=susanzhu129B8585
supabase secrets set SHOPBOX_CLIENT_ID=11314
```

> **注意**：Shopbox API v3 使用 `username`（即邮箱）+ `password` 认证，返回 `accessToken`。
> 所有 API 调用都需要通过 query 参数传递 `accessToken` 和 `client`（门店 ID）。

## 3. 菜单映射表

文件位置：`data/shopbox-mapping.json`

**匹配结果：97/97 个菜品已自动匹配成功。**

> 之前未匹配的 6 个菜品（K7 柠檬鸡、H22 椒盐猪柳、H34 清炒虾仁、S4 辣味蛋黄酱、S5 标准蛋黄酱、V2 碳酸饮料）已确认为过时菜单，已从点餐系统删除。Shopbox 映射表中现有 97 个菜品，全部完成自动匹配。

映射格式：
```json
{
  "forretter_1": { "shopbox_id": "11694252", "name_da": "Snackkurv", "name_zh": "前餐拼盘", "price": 128 },
  ...
}
```

## 4. 部署步骤

### 4.1 部署 Edge Function
```bash
supabase functions deploy sync-to-shopbox
```

### 4.2 设置环境变量
```bash
supabase secrets set SHOPBOX_EMAIL=susan@harbinkitchen.dk
supabase secrets set SHOPBOX_PASSWORD=susanzhu129B8585
supabase secrets set SHOPBOX_CLIENT_ID=11314
```

### 4.3 运行数据库 Migration
在 Supabase SQL Editor 中运行 `supabase/migrations/20260625_add_shopbox_sync.sql`

### 4.4 部署前端（升级 Service Worker 版本号）
编辑 `service-worker.js`，将 `CACHE_NAME` 从 `v21` 改为 `v22`：
```javascript
const CACHE_NAME = 'harbin-kitchen-v22';
```

然后 push 到 GitHub Pages。

## 5. 功能说明

### 5.1 Admin 后台
- **自动同步开关**: 顶部按钮，开启后接单（点击"开始制作"）时自动推送到 Shopbox
- **手动推送**: 每个订单卡片中有"🔄 推送到 Shopbox"按钮
- **同步状态**: 订单卡片上显示 ⏳未同步 / 🔄同步中... / ✅已同步 / ❌同步失败

### 5.2 订单推送时机
- **自动**: 接单时（new → preparing）如果开启了自动同步
- **手动**: 点击订单卡片上的"推送到 Shopbox"按钮

### 5.3 推送到 Shopbox 的数据
```
reference:     PWA 订单号（如：W-20260625-001）
customer_name: 客人姓名
customer_phone: 客人电话
notes:         订单备注
items:         每个菜品的 shopbox_id + 数量 + 单价
total:         订单总价
table_number:  堂食桌号（如果是堂食）
pickup_time:   取餐时间（如果是外卖）
type:          dine_in 或 takeaway
```

## 6. 注意事项

- 如果某个菜品未映射到 Shopbox，推送时会显示警告，但其他已映射的菜品仍会推送
- 已同步的订单（显示 ✅已同步）不会重复推送
- 如果 Shopbox 返回错误，Admin 后台会显示错误详情
- 映射表修改后需要重新部署前端才能生效（需升级 service-worker.js 版本号）

## 7. 测试流程

1. 部署 Edge Function 和设置 Secrets（见上方步骤 4.1 和 4.2）
2. 在 Supabase SQL Editor 运行 Migration SQL（见上方步骤 4.3）
3. 在 PWA 下测试一个订单
4. 在 Admin 后台点击"🔄 推送到 Shopbox"
5. 检查 Shopbox 收银台是否出现该订单
6. 如一切正常，可开启"自动同步"开关，以后接单自动推送
