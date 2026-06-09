# Harbin Kitchen 东北小炒 — 点单系统技术文档

> 本文档记录了 Harbin Kitchen 点单系统所用到的全部服务、账号、网址和关键配置。  
> 如需交接给其他技术人员，或自行续费/更新，请参考本文档。  
> 最后更新：2026年6月9日

---

## 一、系统概览

| 项目 | 说明 |
|:-----|:-----|
| 系统名称 | Harbin Kitchen 在线点单系统 |
| 系统类型 | PWA（Progressive Web App），无需 App Store |
| 顾客入口 | https://order.harbinkitchen.dk/ |
| 设计风格 | 北欧极简 Hygge 风（深棕灰 #2D2A26 + 奶油色 #FAFAF7） |
| 菜品数量 | 126 道菜品（含外卖饮品 14 道 + 堂食饮品甜品 25 道） |
| 折扣规则 | 外卖自动 10% off，饮品和酱汁不打折 |
| 支付方式 | 暂无在线支付，到店收银台付款 |

---

## 二、技术栈说明

本章节详细列出系统前后端使用的所有技术、框架和第三方服务，供后续技术人员接手参考。

### 前端技术栈

| 技术 | 用途 | 说明 |
|:-----|:-----|:-----|
| **HTML5** | 页面结构 | 语义化标签，PWA 兼容 |
| **CSS3 + CSS Variables** | 样式布局 | 主题变量集中管理（theme.css），支持北欧极简风格 |
| **Vanilla JavaScript（ES6+）** | 核心逻辑 | 无框架依赖，原生 JS，易维护 |
| **PWA（Progressive Web App）** | 移动端体验 | manifest.json + service-worker.js，支持「添加到主屏幕」、离线缓存 |
| **Font Awesome 6** | 图标库 | CDN 引入，用于按钮和状态图标 |
| **Google Fonts（Noto Sans SC）** | 中文字体 | 免费 CDN，覆盖简体中文 |
| **qrcodejs** | 二维码生成 | CDN：`cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js` |
| **localStorage** | 本地存储 | 购物车数据、语言偏好、订单草稿本地保存 |
| **Fetch API** | 网络请求 | 向 Supabase REST API 发送订单数据 |

**前端文件说明：**

| 文件 | 技术细节 |
|:-----|:---------|
| `manifest.json` | PWA 配置：应用名称、图标、启动方式、显示模式（standalone） |
| `service-worker.js` | 离线缓存策略：缓存 CSS/JS/图片/HTML，支持离线点餐 |
| `css/theme.css` | CSS 变量定义：颜色（`--color-primary: #6B8E23`）、字体、间距 |
| `js/discount.js` | 折扣引擎：分类级折扣规则，外卖 10% off（酱汁/饮品除外） |
| `js/printer.js` | 热敏打印：Web Serial API，ESC/POS 指令集，支持 USB 打印机 |

---

### 后端与云服务技术栈

本系统采用 **BaaS（Backend as a Service）** 架构，**无传统后端服务器**，所有后端能力由云服务提供。

| 服务 | 技术 | 用途 | 费用 |
|:-----|:-----|:-----|:-----|
| **Supabase** | PostgreSQL + Realtime + REST API | 数据库、订单实时推送、无服务器函数 | 免费（Free Plan） |
| **Supabase Realtime** | WebSocket | 管理页/后厨页实时接收新订单（无需轮询） | 免费 |
| **Supabase REST API** | PostgREST | 前端直接通过 HTTPS 读写数据库（JWT 鉴权） | 免费 |
| **GitHub Pages** | 静态网站托管 | 托管所有前端 HTML/CSS/JS，全球 CDN 加速 | 免费 |
| **GitHub Actions** | CI/CD | 每次 push 到 main 分支自动部署 | 免费 |
| **Let's Encrypt** | SSL 证书 | HTTPS 加密，GitHub Pages 自动签发续期 | 免费 |
| **one.com DNS** | 域名解析 | `order.harbinkitchen.dk` A 记录指向 GitHub Pages | 约 100-150 DKK/年 |

**为什么选 BaaS 架构？**
- ✅ **零服务器维护**：无 Linux 服务器、无 Nginx、无 Docker，不依赖任何运维
- ✅ **成本极低**：每年只花域名费，其他全免费
- ✅ **自动扩展**：GitHub Pages + Supabase Free Plan 可支撑每日数百订单
- ✅ **数据安全**：Supabase 自动每日备份（Free Plan 保留 1 天）

---

### 第三方服务与 CDN 依赖

| 服务 | 用途 | 链接 | 风险 |
|:-----|:-----|:-----|:-----|
| Cloudflare CDN | qrcodejs 库加载 | `cdnjs.cloudflare.com` | 低（可下载到本地备用）|
| Google Fonts | 中文字体 | `fonts.googleapis.com` | 低（可自托管）|
| Font Awesome | 图标 | `cdnjs.cloudflare.com` | 低（可用 Unicode 替代）|
| Supabase CDN | supabase-js SDK | `cdn.jsdelivr.net` | 低（已打包到 supabase-config.js）|

> ⚠️ **如果某天 CDN 失效**：可以将 qrcodejs、Font Awesome 下载到 `libs/` 目录本地引用，不依赖任何外部 CDN。

---

### 数据库结构（Supabase）

**`orders` 表（订单主表）：**

| 列名 | 类型 | 说明 |
|:-----|:-----|:-----|
| `id` | `bigserial` | 自增主键 |
| `order_number` | `text` | 订单号（格式：`HK-XXXXXX`） |
| `order_type` | `text` | `dinein` / `takeaway` / `preorder` |
| `table_number` | `text` | 桌号（堂食用） |
| `customer_name` | `text` | 顾客姓名 |
| `customer_phone` | `text` | 顾客电话 |
| `items` | `jsonb` | 菜品明细（含编号、名称、数量、单价） |
| `total` | `integer` | 总价（单位：Øre，即分） |
| `status` | `text` | `new` → `preparing` → `ready` → `completed` |
| `created_at` | `timestamptz` | 订单创建时间 |
| `updated_at` | `timestamptz` | 状态最后更新时间 |

**`profiles` 表（可选，未启用）：** 用于未来扩展员工登录功能。

---

### 系统架构图

```
顾客手机（扫码）
      │
      ▼
🌐 GitHub Pages（静态前端）
  index.html / admin.html / kitchen.html
      │
      │ Fetch API + JWT
      ▼
🗄️ Supabase（PostgreSQL）
  orders 表
      │
      │ Realtime WebSocket
      ▼
🖥️ 管理页 + 后厨页（实时刷新）
```

> 整个系统**没有**传统后端服务器（Node.js / Python / Java），所有数据库操作通过 Supabase REST API 完成，前端直接调用。

---

## 三、所有网址

### 顾客端

| 网址 | 用途 |
|:-----|:-----|
| https://order.harbinkitchen.dk/ | 顾客点餐主页（扫码进入） |
| https://order.harbinkitchen.dk/?type=dinein&table=1 | 堂食 1 号桌直达链接 |
| https://order.harbinkitchen.dk/?type=takeaway | 外卖直达链接 |
| https://order.harbinkitchen.dk/?type=preorder | 预约直达链接 |

### 管理端

| 网址 | 用途 |
|:-----|:-----|
| https://order.harbinkitchen.dk/admin.html | 老板/前台管理页面（查看新单、接单、改状态） |
| https://order.harbinkitchen.dk/kitchen.html | 后厨出单页面 |
| https://order.harbinkitchen.dk/qrcodes.html | 二维码生成页面（打印用） |

### 餐厅官网（非点单系统）

| 网址 | 用途 |
|:-----|:-----|
| https://www.harbinkitchen.dk/ | 餐厅官网（WordPress + Elementor 搭建） |

---

## 四、服务与账号

### 1. 域名 — one.com

| 项目 | 详情 |
|:-----|:-----|
| 服务商 | one.com |
| 域名 | harbinkitchen.dk |
| 到期 | 2027 年（需关注续费） |
| 管理后台 | https://www.one.com/admin/ → 用注册邮箱登录 |
| DNS 设置 | 在 one.com 控制面板 → DNS 设置 中管理 |
| 关键 DNS 记录 | 子域名 `order` 配置了 4 条 A 记录，指向 GitHub Pages 服务器 |

**order.harbinkitchen.dk 的 DNS 记录：**

| 类型 | 主机 | 值 |
|:-----|:-----|:---|
| A | order | 185.199.108.153 |
| A | order | 185.199.109.153 |
| A | order | 185.199.110.153 |
| A | order | 185.199.111.153 |

> ⚠️ 不要改这 4 条 A 记录，否则点单系统将无法访问。

---

### 2. 代码托管与网站部署 — GitHub

| 项目 | 详情 |
|:-----|:-----|
| 服务商 | GitHub |
| 仓库地址 | https://github.com/ThorandLoke/harbin-kitchen |
| 仓库可见性 | Public（公开仓库） |
| 部署方式 | GitHub Pages（从 main 分支自动部署） |
| GitHub 账号 | ThorandLoke |
| 费用 | 免费 |

**GitHub Pages 设置：**

| 设置项 | 值 |
|:-------|:---|
| Source | Deploy from a branch |
| Branch | main / root |
| Custom domain | order.harbinkitchen.dk |
| Enforce HTTPS | 建议开启（SSL 证书生效后） |

> 💡 每次向 main 分支 push 代码，GitHub Pages 会自动重新部署，约 1-2 分钟生效。

---

### 3. 数据库 — Supabase

| 项目 | 详情 |
|:-----|:-----|
| 服务商 | Supabase |
| 项目名称 | harbin-kitchen |
| 管理后台 | https://supabase.com/dashboard/project/glfmoqfevyeeuqbihjht |
| 项目 URL | https://glfmoqfevyeeuqbihjht.supabase.co |
| 免费额度 | 500 MB 数据库 + 1 GB 文件存储 + 50,000 月活用户 |
| 费用 | 免费（Free Plan） |
| 数据表 | `orders`（订单表） |

**orders 表结构：**

| 列名 | 类型 | 说明 |
|:-----|:-----|:-----|
| id | BIGSERIAL | 自增主键 |
| order_number | TEXT | 订单号（如 HK-M5X9K3） |
| order_type | TEXT | 订单类型：dinein / takeaway / preorder |
| table_number | TEXT | 桌号（堂食） |
| guest_count | INTEGER | 人数 |
| customer_name | TEXT | 客户姓名 |
| customer_phone | TEXT | 电话 |
| pickup_time | TEXT | 取餐时间 |
| notes | TEXT | 备注 |
| items | JSONB | 菜品列表（JSON） |
| subtotal | INTEGER | 小计（Øre） |
| discount | INTEGER | 折扣金额 |
| total | INTEGER | 总价 |
| status | TEXT | 状态：new → preparing → ready → completed / cancelled |
| created_at | TIMESTAMPTZ | 创建时间 |
| updated_at | TIMESTAMPTZ | 更新时间 |

**Supabase 账号信息：**
- 登录邮箱：创建项目时使用的邮箱
- 如果忘记密码：在 https://supabase.com 点 "Forgot Password" 重置
- 项目 ID：`glfmoqfevyeeuqbihjht`

> ⚠️ Supabase 免费版会在 **7 天无活动** 后暂停项目（Pause），暂停后管理页和后厨页将无法收到新订单。  
> 暂停后需要登录 Supabase 后台手动点击 **Restore** 恢复。

---

### 4. SSL 证书 — GitHub Pages 自动签发

| 项目 | 详情 |
|:-----|:-----|
| 签发方 | GitHub Pages（通过 Let's Encrypt） |
| 覆盖域名 | order.harbinkitchen.dk |
| 有效期 | 90 天，GitHub 自动续期 |
| 费用 | 免费 |

> 在 GitHub 仓库 → Settings → Pages → 勾选 "Enforce HTTPS"

---

## 五、项目文件结构

代码仓库 https://github.com/ThorandLoke/harbin-kitchen 的文件结构：

```
harbin-kitchen/
├── CNAME                    ← 自定义域名配置（order.harbinkitchen.dk）
├── index.html               ← 顾客点餐主页面
├── admin.html               ← 老板管理页面
├── kitchen.html             ← 后厨出单页面
├── qrcodes.html             ← 二维码打印页面
├── manifest.json            ← PWA 配置
├── service-worker.js        ← 离线缓存服务
├── css/
│   ├── theme.css            ← 主题变量（颜色/字体/间距）
│   ├── app.css              ← 顾客端样式
│   ├── admin.css            ← 管理页样式
│   └── kitchen.css          ← 后厨页样式
├── js/
│   ├── menu-data.js         ← ★ 菜品数据（名称/价格/编号/图片）——改菜单就改这个
│   ├── supabase-config.js   ← ★ 数据库连接配置
│   ├── app.js               ← 主逻辑（购物车/下单/确认）
│   ├── menu.js              ← 菜单渲染
│   ├── cart.js              ← 购物车逻辑
│   ├── discount.js          ← 折扣引擎
│   ├── admin.js             ← 管理页逻辑
│   ├── kitchen.js           ← 后厨页逻辑
│   └── printer.js           ← 热敏打印模块
├── images/                  ← 菜品图片（90 张）
└── icons/                   ← PWA 图标（192/512）
```

---

## 六、常见操作指南

### 🍽️ 更新菜品/价格

1. 打开 GitHub 仓库：https://github.com/ThorandLoke/harbin-kitchen
2. 进入 `js/menu-data.js`
3. 点击右上角 ✏️ 编辑按钮
4. 找到要修改的菜品，改 `name_da`（丹麦语名）、`name_zh`（中文名）、`price`（价格，单位 DKK）
5. 点击 "Commit changes"
6. 等 1-2 分钟刷新网页即可生效

**新增菜品示例：**
```json
{
  "code": "H55",
  "id": "hoved_55",
  "name_da": "Ny ret navn",
  "name_zh": "新菜名称",
  "price": 128,
  "image": "images/hoved_55.jpg"
}
```

### 🔇 Supabase 项目被暂停

1. 登录 https://supabase.com
2. 进入项目 harbin-kitchen
3. 看到黄色 "Paused" 标签，点击 **Restore project**
4. 等待约 1 分钟恢复
5. 刷新管理页和后厨页

### 🔄 域名续费

1. 登录 one.com 管理后台
2. 进入 "My Products" → harbinkitchen.dk
3. 查看到期时间，提前续费
4. DNS 记录一般不会丢失

### 🖨️ 重新打印二维码

1. 打开 https://order.harbinkitchen.dk/qrcodes.html
2. 浏览器 Ctrl+P（或 ⌘+P）打印
3. 每个二维码对应一个桌子号

---

## 七、费用汇总

| 服务 | 费用 | 续费周期 |
|:-----|:-----|:---------|
| 域名 harbinkitchen.dk (one.com) | 约 100-150 DKK/年 | 年付 |
| GitHub (ThorandLoke 账号) | 免费 | — |
| GitHub Pages 部署 | 免费 | — |
| Supabase 数据库 | 免费（Free Plan） | — |
| SSL 证书 | 免费（GitHub 自动） | — |
| **总计** | **约 100-150 DKK/年** | 仅域名 |

> 💡 目前系统年费用仅为域名续费。所有技术设施（代码托管、数据库、SSL）全部使用免费方案。

---

## 八、技术对接人

| 角色 | 姓名 | 联系方式 |
|:-----|:-----|:---------|
| 开发与维护 | Thor（李薇） | GitHub: ThorandLoke |

如需联系其他技术人员接手，请将本文档及 GitHub 仓库访问权一并移交。

---

## 九、故障排查

| 问题 | 可能原因 | 解决方法 |
|:-----|:---------|:---------|
| 点餐页面打不开 | 域名过期 or DNS 被改 | 检查 one.com 域名续费 + DNS 的 4 条 A 记录 |
| 管理页看不到新订单 | Supabase 项目被暂停 | 登录 supabase.com → Restore project |
| 菜品图片显示不出来 | 图片文件被删除 | 检查 GitHub 仓库 images/ 目录 |
| 二维码扫不了 | 链接错误 | 确认二维码指向 order.harbinkitchen.dk |
| 网页显示旧内容 | 浏览器缓存 | 强制刷新：Ctrl+Shift+R / ⌘+Shift+R |
| 不显示桌号 | 顾客未选堂食模式 | 确认扫码链接含 ?type=dinein&table=N |
