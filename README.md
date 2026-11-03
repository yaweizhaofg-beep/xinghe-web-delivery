# 星核耀火 · 网页版（前端交付）

> AI 视频创作平台前端原型 —— 面向短剧 / 漫剧创作者的团队协作式创作平台

本仓库是**唯一交付版本**，从独立仓库整理而来，只保留最终代码、运行所需配置与交付文档。所有旧目录与旧仓库保持原样，未做任何修改。

---

## 一、这个项目是什么

星核耀火是面向短剧 / 漫剧创作者的 AI 视频创作平台。本网页版覆盖从落地页获客、注册引导、剧目拆分、团队与资产管理、批量生成任务，到费用确认、结果查看、交付下载、积分充值与套餐升级的完整前端流程：

```
落地页 → 注册/引导 → 新建剧目（目标分镜数）→ 团队资产（导入资产/新建资产）
      → 批量生成 → 费用确认 → 结果详情 → 下载交付
      → 账单 / 套餐升级 / 积分充值
```

包含团队与资产协作能力：团队成员管理、**分团队钱包与额度分配**、**资产导入与 AI 解析新建**（生成尺寸 / 统一前置提示词 / 生成数量）、服装版本与声音配置、画布工作流。

> ⚠️ **当前是前端交互原型**，详见下文「三、哪些功能仍是模拟」。

---

## 二、如何启动

### 环境要求

| 项 | 版本 | 说明 |
| --- | --- | --- |
| Node.js | **20 或以上** | 已在 Node 24.21.0 验证；CI 使用 20 |
| npm | 10 或以上 | 使用 `npm`，**不要改用 pnpm/yarn**（会破坏 `package-lock.json`） |
| 操作系统 | macOS / Linux / Windows | 仅开发环境，无平台相关代码 |
| 浏览器 | 任意现代浏览器 | Chrome / Edge / Safari / Firefox |

### 安装与运行

```bash
git clone https://github.com/yaweizhaofg-beep/xinghe-web-delivery.git
cd xinghe-web-delivery

npm ci          # 安装依赖（严格按 package-lock.json）
npm run dev     # → http://127.0.0.1:9091/
```

### 全部命令

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 启动开发服务器（端口 9091，被占用时自动顺延，以终端输出为准） |
| `npm run typecheck` | TypeScript 类型检查（`tsc --noEmit`） |
| `npm run build` | 类型检查 + 生产构建，产物输出到 `dist/` |
| `npm run preview` | 本地预览生产产物 |

**无需任何环境变量。** 接入后端时建议新增 `.env.example`（`VITE_` 前缀变量会被内联进产物，切勿放密钥）。

> `http://127.0.0.1:9091/` 是**开发者本机回环地址，非对外演示地址**，其他人无法访问。

### 路由深链

路由使用自研 `?page=xxx` 深链（未使用 React Router），支持前进后退。常用页面：

| 深链 | 页面 |
| --- | --- |
| `?page=landing` | 落地页 |
| `?page=new-project` | 新建剧目 |
| `?page=team-assets` | 团队资产（导入 / 新建） |
| `?page=batch` | 批量生成 |
| `?page=cost-confirm` | 费用确认 |
| `?page=result` | 结果详情 |
| `?page=delivery` | 交付下载 |
| `?page=billing` | 账单与积分充值 |
| `?page=upgrade` | 套餐升级 |
| `?page=team` | 团队管理与分团队钱包 |
| `?page=canvas` | 画布工作流 |
| `?page=user-center` | 用户中心 |

---

## 三、哪些功能仍是模拟

**没有后端服务、没有真实支付、没有模型调用、没有登录鉴权。** 全部业务数据为前端内存模拟，**刷新页面即丢失**。

| 能力 | 当前状态 | 说明 |
| --- | --- | --- |
| 页面布局与路由跳转 | ✅ 真实 | 可点击的完整前端流程 |
| 表单校验、参数联动、计费试算 | ✅ 真实 | 纯前端计算，逻辑可复用 |
| 团队钱包额度分配与超分配保护 | ✅ 真实 | 逻辑在 `src/billing.ts`，状态在内存 |
| 资产导入 / 新建的双流程区分 | ✅ 真实 | 两套独立界面与状态 |
| 目标分镜数 1–5000 校验与费用联动 | ✅ 真实 | — |
| 用户数据持久化 | ❌ 模拟 | 刷新即丢失，接入后端后由接口提供 |
| 登录 / 注册 / 引导 | ❌ 模拟 | 无鉴权，任何输入都可"通过" |
| 积分充值 / 套餐购买 | ❌ 模拟 | **不接真实支付**，仅前端试算与余额展示 |
| AI 生成（图片 / 视频 / 语言） | ❌ 模拟 | 用固定延时与占位数据模拟任务状态 |
| 文件上传 | ❌ 模拟 | 仅记录文件名，未上传到任何服务 |

---

## 四、主要代码位置

```
xinghe-web-delivery/
├── docs/
│   ├── frontend-handoff/README.md   # ← 交付文档唯一入口（完整版）
│   └── ui-implementation.md         # 视觉还原历史归档（部分内容已过时）
├── src/
│   ├── App.tsx                # 路由 + 应用外壳 + 侧边栏/顶栏（1021 行）
│   ├── shared.ts              # PageId 类型、mock 数据、设计 token
│   ├── billing.ts             # 套餐/充值/升级试算/存储/团队钱包额度（唯一数据源）
│   ├── main.tsx               # React 挂载入口
│   ├── styles/globals.css     # 全局工具类与动画
│   ├── components/
│   │   ├── SharedComponents.tsx
│   │   └── ui/input.tsx
│   └── pages/                 # 16 个页面组件
├── index.html                 # Vite 入口 HTML
├── package.json / package-lock.json
├── tsconfig.json / tsconfig.node.json
├── vite.config.ts             # base: "./"，支持任意子路径部署
└── .github/workflows/deploy.yml
```

### 核心模块速览

| 模块 | 说明 | 代码位置 |
| --- | --- | --- |
| **分团队钱包** | 团队钱包向成员分配/回收额度，含超分配保护与状态判定 | `src/billing.ts` + `src/pages/TeamPage.tsx` |
| **资产双流程** | 「导入资产」（上传已有图片）与「新建资产」（文案→AI解析→批量生成）为两套独立界面 | `src/pages/TeamAssetsPage.tsx` |
| **新建资产参数** | 生成尺寸（6 种比例）、统一前置提示词（风格）、生成数量（全局 + 单资产） | `src/pages/TeamAssetsPage.tsx` |
| **目标分镜数** | 范围 1–5000，费用随分镜数动态计算 | `src/pages/NewProjectPage.tsx` |
| **统一计费配置** | 套餐价格、充值档位、升级试算、存储扩容的唯一数据源 | `src/billing.ts` |

---

## 五、交付文档入口

**完整交付资料见 [`docs/frontend-handoff/README.md`](docs/frontend-handoff/README.md)**，这是本项目唯一的交付入口文档，包含：

| 章节 | 内容 |
| --- | --- |
| §1 交付入口 | 仓库、分支、基准提交、文档地图 |
| §2 如何运行 | 环境、安装、启动、构建、环境配置、干净目录验证记录 |
| §3 页面与功能清单 | 按用户流程分类的页面表 + **已删除页面记录** |
| §4 核心交互与业务规则 | 流程、跳转、校验、状态处理 |
| §5 真实功能与演示功能 | 实现边界、数据存放、接口接入建议 |
| §6 视觉与代码维护 | 布局/颜色/字体/组件/响应式、目录职责 |
| §7 验收与后续工作 | 已执行检查、已知问题、优先级清单 |

`docs/frontend-handoff/screenshots/` 内含关键页面截图（基于交付基准提交，1440×900 视口实测采集）。

---

## 六、已删除页面（请勿恢复）

以下页面已按产品要求删除，**前端请勿恢复或重新挂载路由**：

| 页面 | 替代路径 |
| --- | --- |
| 改编结果页（AI 分集规划 + 剧本编辑） | `?page=team-assets` / `?page=batch` |
| 剧情解析页 | `?page=new-project` |
| 分镜工作台 | `?page=canvas` |
| Electron 桌面壳 | 不适用（改为纯网页版） |

---

## 七、技术栈

| 项 | 版本 / 说明 |
| --- | --- |
| 框架 | React 18 + TypeScript 5（`strict` + `noUnusedLocals`） |
| 构建 | Vite 5（`base: "./"`，支持任意子路径部署） |
| 路由 | 自研 `?page=xxx` 深链 + `popstate` 同步 |
| 图标 | lucide-react 0.344 |
| 状态 | 局部 `useState` + `billing.ts` 模块级 store（**无持久化**） |
| 样式 | 内联 CSS-in-JS + `src/styles/globals.css` 工具类 |
| 包管理 | **仅 npm**（已提交 `package-lock.json`） |

---

## 八、完成度与上线阻塞项

| 维度 | 状态 |
| --- | --- |
| 工程可构建（干净目录可独立安装/构建/运行） | ✅ 已达成 |
| 前端功能完整性（布局、路由、交互、计费试算） | ⚠️ 部分达成 |
| 业务可正式上线 | ❌ 未达成（无后端/持久化/支付/鉴权） |

**构建通过 ≠ 可正式上线。** 完整阻塞项清单见交付文档 §7.2。

---

有任何疑问请先读 [`docs/frontend-handoff/README.md`](docs/frontend-handoff/README.md)。
