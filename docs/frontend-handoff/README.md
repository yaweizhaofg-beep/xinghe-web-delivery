# 星核耀火 · 网页版（xinghe-web-delivery）前端交付说明

> **交付日期**：2026-11-02
> **交付仓库**：https://github.com/yaweizhaofg-beep/xinghe-web-delivery
> **交付分支**：`main`
> **基准提交**：`本次交付提交（见 `git log -1`）`（短号 `本次交付提交`）
> **接收方**：前端研发

本文件是本项目**唯一的交付入口文档**，涵盖运行方式、页面清单、业务规则、真实/演示功能边界、视觉规范、验收结论与后续工作。

**本轮交付边界**：本轮为「交付资料整理」轮次，**未改动任何产品功能与视觉**。仓库代码状态与 `本次交付提交` 完全一致。

---

## 目录

| # | 章节 | 说明 |
| --- | --- | --- |
| 1 | [交付入口](#1-交付入口) | 仓库、分支、基准提交、文档地图 |
| 2 | [如何运行](#2-如何运行) | 环境、安装、启动、构建、环境配置 |
| 3 | [页面与功能清单](#3-页面与功能清单) | 按用户流程分类的页面表 + 已删除页面记录 |
| 4 | [核心交互与业务规则](#4-核心交互与业务规则) | 流程、跳转、校验、状态处理 |
| 5 | [真实功能与演示功能](#5-真实功能与演示功能) | 实现边界、数据存放、接口接入建议 |
| 6 | [视觉与代码维护](#6-视觉与代码维护) | 布局/颜色/字体/组件/响应式、目录职责 |
| 7 | [验收与后续工作](#7-验收与后续工作) | 已执行检查、已知问题、优先级清单 |

---

## 1. 交付入口

### 1.1 仓库与分支

```bash
git clone https://github.com/yaweizhaofg-beep/xinghe-web-delivery.git
cd xinghe-web-delivery
git checkout main
```

| 项 | 值 |
| --- | --- |
| 仓库 | `https://github.com/yaweizhaofg-beep/xinghe-web-delivery` |
| 交付分支 | `main` |
| 基准提交 | `本次交付提交（见 `git log -1`）` |
| 提交标题 | `feat(web): 优化团队资产/计费/剧目流程并移除已废弃页面` |
| 提交时间 | 2026-11-02 11:07:52 +0800 |

> ⚠️ 该仓库同时存在 **本仓库仅有 `main` 一个分支，即完整交付内容，无历史分支混用风险。**

### 1.2 文档地图

| 文档 | 路径 | 作用 |
| --- | --- | --- |
| **本文件** | `docs/frontend-handoff/README.md` | **唯一交付入口**，覆盖全部交付信息 |
| 视觉还原记录 | `docs/ui-implementation.md` | 设计还原历史、可用性优化轮次记录（历史归档，内容已部分过时） |

> **文档一致性说明**：`docs/ui-implementation.md` 属历史归档，其中关于 Electron、剧情解析页、分镜工作台、AI 章节页的描述**已随本轮删除失效**，请以本文件为准。

### 1.3 项目用途

星核耀火是面向**短剧/漫剧创作者**的 AI 视频创作平台。本网页版覆盖从落地页获客、注册引导、剧目拆分、团队与资产管理、批量生成任务，到费用确认、结果查看、交付下载、积分充值与套餐升级的完整前端流程。

当前为**前端交互原型**：所有业务数据均为前端模拟，无后端服务、无真实支付、无模型调用。

---

## 2. 如何运行

### 2.1 环境要求

| 项 | 版本 | 说明 |
| --- | --- | --- |
| Node.js | **20 或以上** | 已在 Node 24.21.0 验证；CI 使用 20 |
| npm | 10 或以上 | 使用 `npm`，**不要改用 pnpm/yarn**（会破坏 `package-lock.json`） |
| 操作系统 | macOS / Linux / Windows | 仅开发环境，无平台相关代码 |
| 浏览器 | 任意现代浏览器 | Chrome / Edge / Safari / Firefox |
| 端口 | 9091（默认） | `vite.config.ts` 设 `strictPort: false`，被占用时自动顺延，看终端输出 |

### 2.2 安装与启动

```bash
# 1. 克隆并切换到交付分支
git clone https://github.com/yaweizhaofg-beep/xinghe-web-delivery.git
cd xinghe-web-delivery
git checkout main

# 2. 安装依赖（使用 lockfile，保证可复现）
npm ci          # 推荐
# 或 npm install（lockfile 兼容时等价）

# 3. 类型检查
npm run typecheck        # tsc --noEmit

# 4. 启动开发服务器
npm run dev
# → http://127.0.0.1:9091/   （端口被占用会自动顺延）

# 5. 生产构建（typecheck + 打包）
npm run build            # tsc && vite build
# 产物输出到 dist/，可直接静态托管

# 6. 本地预览生产产物
npm run preview
```

### 2.3 环境配置

**当前无需任何环境变量。** 项目中不存在 `.env` / `.env.local`，源码内无密钥、Token、后端地址。

接入真实后端时建议新增 `.env.example` 并在 `.gitignore` 中保留 `.env*`（当前 `.gitignore` 已覆盖该规则），例如：

```
VITE_API_BASE_URL=https://api.example.com
```

> `VITE_` 前缀变量会被 Vite 在构建时内联进产物，**切勿放入任何密钥**。

### 2.4 关于演示地址（重要）

- `http://127.0.0.1:9091/` 是**开发者本机回环地址**，仅对运行该进程的这台机器可见。
- **该地址不是可对外访问的演示地址**，其他人无法通过它访问你的实例。
- 如需对外演示，请任选其一：部署 `dist/` 到静态托管、将仓库接入 GitHub Pages、或用 `ngrok` / `cloudflared` 等工具临时暴露本地端口。
- 仓库内 `.github/workflows/deploy.yml` 存在 GitHub Pages 部署工作流，**push 到 `main` 后会自动触发部署**。

### 2.5 干净目录验证结果

为确保接手人不依赖本机环境，已在**全新临时目录**（`mktemp -d`）中执行完整克隆、安装与构建验证。

| 检查项 | 命令 | 结果 |
| --- | --- | --- |
| 全新克隆到空目录 | `git clone --no-hardlinks <repo> xinghe-web-delivery` | ✅ 成功 |
| 检出交付分支 | `git checkout main` | ✅ HEAD = `本次交付提交` |
| 克隆产物含 `node_modules` | `ls node_modules` | ❌ **不含**（已正确排除） |
| 克隆产物含符号链接 | `find . -type l` | ❌ **无任何符号链接** |
| 独立安装依赖 | `npm ci` | ✅ 成功 |
| 类型检查 | `npm run typecheck` | ✅ **0 错误** |
| 生产构建 | `npm run build` | ✅ 成功，1488 模块，`index-*.js` 492.91 kB / gzip 125.32 kB |

构建产物哈希与开发机完全一致（`index-CImK0xOo.js` / `index-CpI35PQa.css`），证明构建可复现、不依赖本机缓存。

> **两点说明（据实记录）**：
> 1. 验证用的克隆源是**本机仓库路径**。原因是当时访问 GitHub 的网络连接不稳定（先后两次 `git clone https://github.com/...` 分别报 `Empty reply from server` 与 `Failed to connect to github.com port 443`），属**环境网络问题，非仓库问题**。克隆产物内容与远端提交完全一致（HEAD 精确为 `本次交付提交`），对「接手人能否独立安装构建」这一问题的验证有效性不受影响。
> 2. 开发机上 `node_modules` 曾是指向另一本地仓库的**符号链接**。已在 `.gitignore` 中补充 `node_modules`（无斜杠）规则以匹配链接形式，该链接**从未被提交**，干净克隆产物中确认无任何符号链接。


---

## 3. 页面与功能清单

### 3.1 路由机制

自研路由，非 React Router。基于 `?page=<id>` 查询参数：

- 页面 ID 类型定义：`src/shared.ts` 的 `PageId`
- 路由分发：`src/App.tsx` 的 `renderPage()` `switch`
- 跳转：`navigate(pageId)`，同时 `window.history.pushState` 更新 URL
- 前进/后退：已监听 `popstate` 同步选中态
- 深链示例：`http://127.0.0.1:9091/?page=team-assets`

### 3.2 按用户流程分类的页面清单

#### 流程 A · 获客与账号

| 页面名称 | 进入方式 | 主要功能 | 对应代码 | 完成状态 |
| --- | --- | --- | --- | --- |
| 落地页 | 侧边栏「返回首页」/ `?page=landing` | Hero、套餐定价、FAQ、页脚 | `src/pages/LandingPage.tsx` | ✅ 视觉完成（数据来自 `billing.ts`，无后端） |
| 登录 | `?page=login` | 账号密码登录表单 | `src/pages/AuthPage.tsx` | ⚠️ 仅前端校验，未接真实鉴权 |
| 注册 | `?page=register` | 账号注册表单 | `src/pages/RegisterPage.tsx` | ⚠️ 仅前端校验，未接真实注册 |
| 新手引导 | `?page=onboarding` | 多步引导流程 | `src/pages/OnboardingPage.tsx` | ✅ 交互完成（无持久化） |

#### 流程 B · 创作与剧目

| 页面名称 | 进入方式 | 主要功能 | 对应代码 | 完成状态 |
| --- | --- | --- | --- | --- |
| 创作工作台 | 侧边栏「创作」/ `?page=workspace` | 欢迎语、统计、继续创作、项目卡片 | `App.tsx` 内 `WorkspacePage` | ✅ 完成 |
| 全部剧目 | 侧边栏「创作」→ 全部剧目 / `?page=projects` | 搜索、剧目列表、进度条、状态徽章 | `App.tsx` 内 `ProjectListPage` | ✅ 完成（数据为 mock） |
| 新建剧目 | 工作台「开始创作」下拉 / `?page=new-project` | 上传文案、**目标分镜数（1–5000）**、模型选择、费用预估 | `src/pages/NewProjectPage.tsx` | ✅ 完成（CTA 跳转资产页） |
| 无限画布 | 侧边栏「画布」/ `?page=canvas` | 节点画布、拖拽、缩放平移、SVG 连线、节点状态 | `src/pages/CanvasPage.tsx` | ✅ 交互完成（节点为 mock 数据） |

#### 流程 C · 团队与资产

| 页面名称 | 进入方式 | 主要功能 | 对应代码 | 完成状态 |
| --- | --- | --- | --- | --- |
| 团队管理 | 侧边栏「团队」/ `?page=team` | 成员管理、**分团队钱包**、额度分配/回收、角色权限 | `src/pages/TeamPage.tsx` | ✅ 完成（额度为内存态） |
| 团队资产 | 侧边栏「资产」/ `?page=team-assets` | 项目资产库、**导入资产**、**新建资产**、权限管理、服装版本、声音配置 | `src/pages/TeamAssetsPage.tsx` | ✅ 完成（1738 行，核心页面） |

#### 流程 D · 生成与交付

| 页面名称 | 进入方式 | 主要功能 | 对应代码 | 完成状态 |
| --- | --- | --- | --- | --- |
| 批量生成进度 | `?page=batch` | 任务状态统计、失败任务重试、分镜列表 | `src/pages/BatchPage.tsx` | ✅ 视觉完成（状态为 mock） |
| 生成前费用确认 | 批量页/结果页触发 / `?page=cost-confirm` | 任务规格、预计消耗星石与人民币、确认提交 | `src/pages/CostConfirmPage.tsx` | ⚠️ **未真实扣费**，确认后仅跳转 |
| 结果详情 | 批量页「查看」/ `?page=result` | 版本 A/B/C 对比、字幕擦除、画质增强、抽取帧 | `src/pages/ResultPage.tsx` | ⚠️ 按钮为**仅视觉**，未接真实处理 |
| 下载交付 | 结果页「加入交付清单」/ 账单页 / `?page=delivery` | 文件列表、打包下载、单文件下载 | `src/pages/DeliveryPage.tsx` | ⚠️ 列表为 mock，下载未接存储 |

#### 流程 E · 计费与账户

| 页面名称 | 进入方式 | 主要功能 | 对应代码 | 完成状态 |
| --- | --- | --- | --- | --- |
| 账单 | 侧边栏「账单」/ `?page=billing` | 套餐展示、充值明细、订单记录 | `src/pages/BillingPage.tsx` | ⚠️ 明细为 mock 常量 |
| 会员套餐 / 升级 | 账单页进入 / `?page=upgrade` | 个人/团队套餐、升级试算、存储扩容报价 | `src/pages/UpgradePage.tsx` | ⚠️ 试算逻辑真实，支付未接 |
| 积分充值 | 侧边栏「会员积分」→ 用户中心「积分充值」 | 充值档位、自定义金额、确认、成功页、充值明细 | `src/pages/UserCenterPage.tsx` | ⚠️ 余额**内存态增加**，刷新还原 |
| 用户中心 | 侧边栏头像「赵」/ `?page=user-center` | 资料、积分充值、会员状态、设置 | `src/pages/UserCenterPage.tsx` | ✅ 完成 |

### 3.3 已删除 / 废弃页面（⚠️ 勿恢复）

以下页面在 `本次交付提交` 中已**确认删除**，是产品方明确要求的结果。**前端请勿恢复这些页面**，也不要重新挂载相关路由。

| 已删除页面 | 原路径 | 删除原因 | 当前替代路径 |
| --- | --- | --- | --- |
| 改编结果页 | `src/pages/AIChapterPage.tsx` | 产品确认删除（AI 分集规划 + 剧本编辑 + 原著理解） | 剧目拆分 → `?page=team-assets`；批量任务 → `?page=batch` |
| 剧情解析页 | `src/pages/PlotAnalysisPage.tsx`、`src/pages/PlotAnalysis/*` | 前序轮次删除 | `?page=new-project`（剧目拆分） |
| 分镜工作台 | `src/pages/StoryboardPage.tsx` | 前序轮次删除 | `?page=canvas`（无限画布） |
| Electron 壳 | `electron/*`、`dist-electron/*`、`scripts/*.cjs` | 改为纯网页版交付 | 不适用 |

**删除页面后连带调整的入口**（`本次交付提交` 已同步完成）：

- `App.tsx`：工作台项目卡片、全部剧目列表行 → 已移除跳转点击，仅保留展示
- `BatchPage.tsx`：顶部「返回制作」按钮 → 已删除
- `ResultPage.tsx` / `DeliveryPage.tsx`：面包屑「制作」段 → 已移除
- `DeliveryPage.tsx`：空状态「返回制作」→ 改为「去批量生成」→ `batch`
- `CostConfirmPage.tsx`：X 关闭 / 取消 → 改为回到 `batch`
- `shared.ts`：`PageId` 中 `"ai-chapter"` → 已移除

> 上述两处（`DeliveryPage` 空状态、`CostConfirmPage` 关闭/取消）保留了 `batch` 落点，因为它们是流程中的必要返回路径，完全移除会导致用户无法退出。**其余入口均按产品要求纯移除。**

---

## 4. 核心交互与业务规则

### 4.1 剧目拆分（新建剧目页）

| 项 | 规则 |
| --- | --- |
| 输入 | 小说 / 剧本文案粘贴，或上传文件 |
| **目标分镜数** | 范围 **1 – 5000**，默认 500；滑块与数字输入框双向绑定，输入自动夹取到区间内 |
| 生成模型 | Fast（18.55 星石/镜）、Pro（45.00 星石/镜） |
| 费用预估 | `estStars = round(targetShots × unitPrice)`，随分镜数动态计算 |
| CTA | 「开始拆分」→ 跳转 `?page=team-assets` |

> 注：已按产品要求取消「按章节/按集数」概念，统一为「目标分镜数」。

### 4.2 团队钱包与额度分配（团队管理页）

| 项 | 规则 | 代码 |
| --- | --- | --- |
| 钱包构成 | 套餐积分 + 充值积分 + 冻结积分，个人/团队**独立存储、互不串账** | `billing.ts` `WALLET_STORE` |
| 可分配余额 | `max(0, 团队充值积分 − 已分配总额 − 团队保留额度)` | `getAssignableBalance()` |
| 分配 | 不得超过可分配余额；**释放的旧额度自动回到可分配余额**；超额返回 `false` 并提示「超出团队待分配额度 N 星石」 | `allocateToMember()` |
| 回收 | 成员额度清零，额度回到可分配余额 | `revokeAllocation()` |
| 状态判定 | 已用尽（`used ≥ allocated`）/ 偏低（剩余 ≤ 20%）/ 正常 / 未分配 | `allocationStatus()` |
| 保留额度 | `TEAM_RESERVED_STARS = 1000` | `billing.ts` |

### 4.3 资产：导入 vs 新建（团队资产页）

**两条流程相互独立、界面不同**，产品方明确要求区分。

#### 4.3.1 导入资产（`ImportAssetModal`）

- 用途：上传**已有资产图片**，直接追加到当前项目
- 交互：填写名称 → 上传图片 → 确认
- 产物：追加到当前项目角色列表，状态 `pending`（待确认）

#### 4.3.2 新建资产（`CreateAssetModal`）—— 三步流程

**Step 1 · 输入**
- 目标项目选择
- 资产信息文案（每行一个角色，格式 `角色名：外貌/性格/年龄/身份`）
- 可选上传文案文件（`.txt` / `.docx` / `.md` / `.pdf`），**仅记录文件名，不上传**
- **生成尺寸**：16:9 / 9:16 / 1:1 / 4:3 / 3:4 / 2:3（各带分辨率提示），单选
- **统一前置提示词**：多行文本框 + 5 个快捷标签（动漫写实 / 赛博朋克 / 柔光电影感 / 国风水墨 / 3D 皮克斯风），点击标签追加到提示词

**Step 2 · 解析中**
- 模拟解析动画（约 1.4 秒），无真实模型调用

**Step 3 · 解析结果与批量生成**
- 解析结果列表：勾选、全选/取消全选、角色定位标签（主角/配角）
- 批量设置栏：模型、画质（低/中/高）、分辨率（720p/1080p/4K）
- **生成数量**：
  - 全局下拉（1/2/3/4/6/8 张每资产），修改会**同步覆盖所有已解析项**
  - 每个资产行独立 `−/+` 计数器（范围 1–8）
  - 底部实时显示「已选 N 个 · 共 M 张」
- 底部提示文案回显本次尺寸与前置提示词

**提交后**：为选中资产生成记录（状态 `generating`），并携带 `aspect` / `prefix` / `count` 写入资产数据。

> 弹窗挂载：列表页「新建资产」与项目详情页「新建资产」**共用同一组弹窗组件**（提取为 `modals` 变量统一渲染），两处均可正常打开。

### 4.4 服装版本与声音配置

- 服装版本支持**自定义命名**与**提示词编辑**，提示词输入框加大（`rows=8`，`minHeight: 150px`）并可纵向拉伸
- 备注文本框同步加大
- 声音配置：系统音色 / 克隆音色两个 tab，支持性别、年龄维度选择

### 4.5 计费与套餐（`billing.ts` 单一数据源）

| 规则 | 值 | 代码 |
| --- | --- | --- |
| 基础换算 | 1 元 = 10 星石 | `STARS_PER_YUAN` |
| 会员周期 | 30 天 | `PLAN_PERIOD_DAYS` |
| 充值积分有效期 | 到账起 365 天 | `RECHARGE_VALID_DAYS` |
| 套餐 | 个人创作版 299/3000、个人专业版 599/6100、工作室版 1999/21000、制作团队版 3999/42000 | `PLANS` |
| 充值档位 | 199→1990、499→4990、1000→10000 星石 | `RECHARGE_PACKS` |
| 升级路径 | **仅** 299→599、1999→3999（同类型同范围） | `UPGRADE_PATHS` / `canUpgrade()` |
| 升级试算 | 剩余比例 = 剩余秒数 ÷ 周期总秒数；补款 =（新价−旧价）× 剩余比例；补发积分 =（新积分−旧积分）× 剩余比例（向下取整） | `computeUpgrade()` |
| 存储扩容 | 0.30 元/GB/30 天，按会员剩余比例计费，与会员同日到期，总上限 1TB | `computeStorageQuote()` |
| 核心文案 | 「每人最多同时运行 N 个任务，高峰期可能排队」 | `CONCURRENCY_DISCLAIMER` |

**重要**：落地页定价、套餐页、账单页**均已改为读取 `src/billing.ts`**，不再有硬编码价格。修改价格只需改这一个文件。

### 4.6 充值流程

1. 用户中心 → 「积分充值」tab
2. 选择档位或自定义金额
3. 「确认充值」弹窗（复选协议）→ 确认
4. **充值成功页**：显示到账星石数、当前余额、会员到期时间未改变
5. `creditRecharge(space, stars)` 累加**内存态**余额并广播变更

**校验规则**：充值仅增加积分，**不改变会员到期时间**，不增加席位/并发/存储。会员已到期时充值**不恢复生成权限**，需另行续费。

### 4.7 批量生成 → 费用确认 → 结果 → 交付

```
批量生成进度(?page=batch)
  ├─「查看」→ 结果详情(?page=result)
  │    └─「加入交付清单」→ 下载交付(?page=delivery)
  └─ 重新生成/批量提交 → 生成前费用确认(?page=cost-confirm)
       ├─ 取消 / X → 返回批量生成(batch)
       └─ 确认并提交 → 批量生成(batch)   ⚠️ 未真实扣费
```

### 4.8 表单校验

| 位置 | 校验 | 提示方式 |
| --- | --- | --- |
| 新建剧目 | 未填文案时 CTA 禁用 | 按钮置灰 + 下方说明文案 |
| 新建资产 Step 1 | 文案与文件**都为空**时阻止解析 | 行内红色错误文案「请填写资产信息或上传文案文件」 |
| 新建资产 Step 3 | 未勾选任何资产时禁用「批量生成」 | 按钮置灰 |
| 生成数量 | 单资产 1–8 夹取 | `Math.max(1, Math.min(8, v))` |
| 目标分镜数 | 1–5000 夹取 | `Math.min(MAX, Math.max(MIN, round(n)))` |
| 额度分配 | 超出可分配余额拒绝 | 红色提示「超出团队待分配额度 N 星石」 |

### 4.9 状态覆盖情况

| 状态类型 | 已覆盖 | 说明 |
| --- | --- | --- |
| 加载中 | ✅ | `Loader2` 旋转图标（解析中、生成中、生成按钮内联） |
| 空状态 | ✅ | 画布「暂无节点」、资产「暂无图像」「暂无历史版本」、交付「暂无已完成的生成文件」 |
| 失败 | ⚠️ 部分 | 资产生成失败、批量任务失败重试、画布节点 error 状态；**无全局错误边界（Error Boundary）** |
| 成功 | ✅ | 充值成功页、资产批量生成成功提示 |
| 禁用 | ✅ | 条件不满足时按钮置灰并禁用点击 |

> **待确认（产品方）**：失败态目前多为静态展示，真实接口接入后失败原因、错误码、是否可重试的规则**尚未确定**，需产品确认后补充。

---

## 5. 真实功能与演示功能

### 5.1 实现边界总览

**核查结论：全项目无任何真实网络请求、无任何持久化存储。**

```bash
# 实际执行的核查命令与结果
grep -rn "fetch(|axios|XMLHttpRequest|WebSocket|EventSource" src/   # → 无匹配
grep -rn "localStorage|sessionStorage|indexedDB" src/               # → 无匹配
grep -rn "setTimeout" src/                                           # → 6 处（均为模拟延迟）
```

### 5.2 逐项区分

| 功能 | 状态 | 说明 |
| --- | --- | --- |
| 页面布局与视觉 | ✅ **已实现** | 全部页面可渲染，交互反馈完整 |
| 路由与深链 | ✅ **已实现** | `?page=` 参数 + popstate 同步，前进后退正常 |
| 套餐定价展示 | ✅ **前端本地逻辑** | 读取 `billing.ts` 常量，逻辑真实但数据为配置 |
| 升级费用试算 | ✅ **前端本地逻辑** | `computeUpgrade()` / `computeStorageQuote()` 计算逻辑真实、可直接复用 |
| 存储扩容报价 | ✅ **前端本地逻辑** | 同上 |
| 团队额度分配 | ✅ **前端本地逻辑** | 含超分配保护，逻辑真实；数据存内存 |
| 充值到账 | ✅ **前端本地逻辑** | 余额累加正确，但**刷新即还原** |
| 登录 / 注册 | ⚠️ **仅前端校验** | 无鉴权请求，任意合法格式即可「通过」 |
| AI 解析资产 | ⚠️ **模拟** | 按行拆分文案，`setTimeout(1400)` 模拟解析 |
| 批量生成 | ⚠️ **模拟** | 状态与进度为 mock 常量 |
| 费用确认扣费 | ⚠️ **仅视觉** | 显示消耗金额，确认后**不扣款** |
| 结果处理（字幕擦除/画质增强/抽取帧） | ⚠️ **仅视觉** | 按钮无实际处理逻辑 |
| 交付下载 | ⚠️ **仅视觉** | 文件列表 mock，下载未接对象存储 |
| 图片/视频预览 | ⚠️ **仅视觉** | CSS 渐变占位，无真实媒体 |
| 画布节点 | ⚠️ **模拟数据** | 拖拽/缩放/连线为真实交互，数据为常量 |
| 通知中心 / 客服 / 帮助 | ⚠️ **仅视觉** | 面板可展开，内容为静态 |
| 真实支付 | ❌ **尚未实现** | 无任何支付渠道代码 |
| 模型调用（LLM/生图/生视频） | ❌ **尚未实现** | 无任何调用 |

### 5.3 数据存放位置与刷新行为

| 数据 | 存放位置 | 刷新后 |
| --- | --- | --- |
| 钱包余额（个人/团队） | `src/billing.ts` 模块级 `WALLET_STORE` | ❌ **还原为初始值** |
| 成员额度分配 | `src/billing.ts` 模块级 `ALLOCATION_STORE` | ❌ **还原** |
| 充值明细 | `src/billing.ts` `DEMO_RECHARGE_ORDERS` 常量 | ❌ 恒定不变 |
| 静态 mock（用户、成员、剧目、任务、分镜） | `src/shared.ts` 常量 | ❌ 恒定不变 |
| 资产项目与资产项 | `TeamAssetsPage.tsx` 组件 `useState` | ❌ **还原** |
| 画布节点 | `CanvasPage.tsx` 组件 `useState` | ❌ 还原 |
| 充值 / 升级试算结果 | 组件 `useState` | ❌ 还原 |

> **结论：当前所有数据均为内存态，刷新页面即全部丢失。** 接入后端前，前端需确定持久化方案（推荐由后端提供，本地仅保留必要 UI 状态）。

### 5.4 接口接入位置与建议

> ⚠️ **以下均为「建议」接口，尚未存在，不是已有接口。** 后端实现前请勿在文档或代码中当作现有能力引用。

| 前端位置 | 当前实现 | 建议接口（待定） | 所需数据字段 |
| --- | --- | --- | --- |
| `src/shared.ts` `USER` / `PROJECT` / `STORYBOARDS` | 硬编码常量 | `GET /api/me`、`GET /api/projects`、`GET /api/projects/:id/storyboards` | 用户信息、项目元信息、分镜列表与状态 |
| `src/billing.ts` `WALLET_STORE` | 内存态余额 | `GET /api/wallet`、`GET /api/wallet/allocations`、`POST /api/wallet/allocations`、`DELETE /api/wallet/allocations/:memberId` | 套餐积分/充值积分/冻结积分/到期时间/席位/并发/存储、成员额度与已用量 |
| `src/billing.ts` `creditRecharge()` | 内存累加 | `POST /api/wallet/recharge`、`GET /api/wallet/recharge-orders` | 金额、到账星石、有效期、订单状态 |
| `src/pages/UpgradePage.tsx` 升级确认 | 试算后无提交 | `POST /api/subscription/upgrade-quote`、`POST /api/subscription/upgrade`、`POST /api/storage/expand` | 套餐 id、剩余秒数、目标容量、应付金额 |
| `src/pages/UserCenterPage.tsx` 登录/注册 | 纯前端校验 | `POST /api/auth/login`、`POST /api/auth/register` | 账号、密码、令牌 |
| `src/pages/TeamAssetsPage.tsx` `CreateAssetModal` 解析 | `setTimeout` 模拟 | `POST /api/assets/parse`（文案/文件 → 结构化资产） | 资产名称、角色定位、描述、类型（角色/场景/道具） |
| `src/pages/TeamAssetsPage.tsx` 批量生成 | 状态置 `generating` | `POST /api/assets/generate`、轮询 `GET /api/assets/generate/:taskId` | 生成尺寸 `aspect`、前置提示词 `prefix`、生成数量 `genCount`、模型、画质、分辨率 |
| `src/pages/TeamAssetsPage.tsx` `ImportAssetModal` | 仅记录文件名 | `POST /api/assets/upload` | 文件、目标项目 id、资产名称 |
| `src/pages/BatchPage.tsx` 任务状态 | mock 常量 | `GET /api/generation/tasks`、`POST /api/generation/tasks/:id/retry` | 任务 id、状态、进度、成功/失败数、错误信息 |
| `src/pages/CostConfirmPage.tsx` 确认提交 | 仅跳转 | `POST /api/generation/quote` 确认 + 扣费 | 任务类型、模型、规格、数量、单价、版本号 |
| `src/pages/ResultPage.tsx` 结果处理 | 仅视觉 | `POST /api/storyboards/:id/{upscale|subtitle-erase|extract-frames}` | 版本 id、处理类型、参数 |
| `src/pages/DeliveryPage.tsx` 下载 | mock 列表 | `GET /api/delivery/files`、`POST /api/delivery/package` | 文件 id、名称、大小、过期时间、下载地址 |
| `src/pages/NewProjectPage.tsx` 费用预估 | 前端单价计算 | `GET /api/pricing`（单价与价格版本） | 模型、单价、计价单位、价格版本时间戳 |
| `src/pages/LandingPage.tsx` FAQ / Banner | 静态内容 | CMS 接口 | 标题、正文、图片 URL |

### 5.5 上线前必须补齐的能力

1. **持久化**：钱包、额度分配、资产项目目前刷新即丢，必须由后端承载
2. **真实鉴权**：登录/注册目前可绕过
3. **真实扣费**：`CostConfirmPage` 的「确认并提交」必须与钱包余额联动，并处理余额不足
4. **错误边界**：当前无 React Error Boundary，单页异常会白屏
5. **文件上传**：目前只记录文件名，未做 MIME / 大小校验与后端上传

---

## 6. 视觉与代码维护

### 6.1 布局

| 区域 | 规格 | 代码 |
| --- | --- | --- |
| 侧边栏 | 68px 图标栏（展开态含空间切换与底部消息/帮助/头像） | `App.tsx` `Sidebar` |
| 内容区 | `flex: 1`，各页自行 `overflow: auto` | 各页面根容器 |
| 目标窗口 | 1440×900 桌面优先 | — |

### 6.2 颜色（设计 token）

集中定义于 `src/shared.ts` 的 `colors`：

| Token | 值 | 用途 |
| --- | --- | --- |
| `bgPrimary` | `#0a0912` | 页面底色 |
| `bgSecondary` | `#12101a` | 次级面板 |
| `bgSurface` / `bgElevated` | `#1a1725` / `#231f33` | 卡片 / 浮层 |
| `border` / `borderStrong` | `rgba(255,255,255,.07)` / `.12` | 描边 |
| `accent` | `#ff8a1f` | 主品牌橙 |
| `accentLight` / `accentDim` | `#ffad4a` / `rgba(255,140,32,.15)` | 悬停 / 弱背景 |
| `success` / `warning` / `error` / `info` | `#22c55e` / `#ffac30` / `#f87171` / `#38bdf8` | 状态色 |
| `purple` | `#a78bfa` | 强调 |
| `gold`（`shared.ts` 单独导出） | `#ffac30` | 高亮数值 / 积分 |

**命名与规则**：全站积分统一称「星石」（1 元 = 10 星石）。

### 6.3 字体

未硬编码字族，沿用系统 sans-serif。若需精确还原 Figma 效果，需补 PingFang SC / Inter。

### 6.4 样式实现方式

**内联 CSS-in-JS**（`style={{...}}`）为主，辅以 `src/styles/globals.css`（344 行）的工具类。

`globals.css` 可用类：

- 布局：`.app-container`、`.drag-region`、`.no-drag`
- 按钮：`.btn-primary`、`.glass-btn`、`.orange-btn`
- 装饰：`.glass-effect`、`.text-gradient`、`.gradient-text`、`.tilt-card`、`.beam`~`.beam4`、`.glow-a`、`.glow-b`、`.ring-cw`、`.ring-ccw`、`.ticker`
- 动画：`.animate-fade-in`、`.animate-fade-up`、`.animate-slide-in`、`.animate-pulse`、`.animate-spin`、`.animate-shimmer`、`.fade-up`、`.fade-up-1`~`.fade-up-4`
- 动画 keyframes：`glow-pulse` / `glow-slow` / `ring-cw` / `ring-ccw` / `shimmer` / `ticker` / `fade-up` / `beam-pulse` / `spin` / `typing-dot` / `slide-in-right`

### 6.5 响应式适配现状

| 断点 | 位置 | 说明 |
| --- | --- | --- |
| `max-width: 1280px` | `globals.css:222` | 侧边栏/容器收缩 |
| `max-width: 1024px` | `globals.css:226` | 布局压缩 |
| `min-width: 1440px` | `globals.css:234` | 宽屏留白 |
| `max-width: 900px / 640px / 480px` | `LandingPage.tsx:647/650/653` | **仅落地页**有完整移动端适配 |

> ⚠️ **应用内页面（工作台、资产、团队、画布、计费等）无移动端/平板适配**，为桌面端固定布局。落地页之外的响应式属于未完成项。

### 6.6 代码目录职责

```
xinghe-web-delivery/
├── index.html                 # Vite 入口 HTML
├── package.json               # 依赖与脚本（dev / build / preview / typecheck）
├── vite.config.ts             # base "./"、端口 9091、polling watch
├── tsconfig.json              # strict + noUnusedLocals + noUnusedParameters
├── .github/workflows/deploy.yml  # GitHub Pages（当前仅 main 触发）
├── docs/
│   ├── frontend-handoff/README.md   # ← 本文件（唯一交付入口）
│   └── ui-implementation.md         # 历史归档（部分内容已过时）
└── src/
    ├── main.tsx               # React 挂载
    ├── App.tsx                # 路由分发 + 应用外壳 + Sidebar/Header/通知/客服
    ├── shared.ts              # PageId 类型、mock 数据、colors / surface / gold 等 token
    ├── billing.ts             # 套餐、充值、升级试算、存储扩容、团队钱包额度（单一数据源）
    ├── styles/globals.css     # 全局工具类与动画
    ├── components/
    │   ├── SharedComponents.tsx   # 跨页共用小组件
    │   └── ui/input.tsx           # 通用输入框
    └── pages/
        ├── LandingPage.tsx     # 落地页
        ├── AuthPage.tsx        # 登录
        ├── RegisterPage.tsx    # 注册
        ├── OnboardingPage.tsx  # 新手引导
        ├── NewProjectPage.tsx  # 新建剧目（目标分镜数）
        ├── CanvasPage.tsx      # 无限画布
        ├── TeamPage.tsx        # 团队管理 + 分团队钱包
        ├── TeamAssetsPage.tsx  # 团队资产（最大页面，含导入/新建资产弹窗）
        ├── BatchPage.tsx       # 批量生成进度
        ├── CostConfirmPage.tsx # 生成前费用确认
        ├── ResultPage.tsx      # 结果详情
        ├── DeliveryPage.tsx    # 下载交付
        ├── BillingPage.tsx     # 账单
        ├── UpgradePage.tsx     # 会员套餐 / 升级 / 存储扩容
        └── UserCenterPage.tsx  # 用户中心 + 积分充值
```

> `App.tsx` 内含 `WorkspacePage` 与 `ProjectListPage` 两个页面组件（未拆分为独立文件）。

### 6.7 共用组件与依赖关系

| 组件 / 模块 | 被谁使用 | 注意事项 |
| --- | --- | --- |
| `src/billing.ts` | `LandingPage`、`UpgradePage`、`UserCenterPage`、`TeamPage`、`BillingPage`、`App` | **改价格/规则只改这里**；`DEMO_WALLETS` 已标 `@deprecated`，新代码请用 `getWallet()` + `subscribeWallet()` |
| `src/shared.ts` 的 `colors` / `gold` / `surface` / `cardShadow` | 几乎所有页面 | 改主题色只需改此处 |
| `TEAM_MEMBERS_INIT` / `TEAM_ROLES` / `ROLE_STYLE` | `TeamPage`、`TeamAssetsPage`、`billing.ts` | 成员 id 与 `ALLOCATION_STORE` 的 key 对应，新增成员需同步 |
| `components/SharedComponents.tsx` | 部分页面 | 体量小（42 行），使用前先确认是否重复造轮子 |
| `components/ui/input.tsx` | 部分页面 | 体量小（40 行），使用覆盖率低，新表单建议统一采用 |
| `lucide-react` 图标 | 全部页面 | 统一从 `lucide-react` 导入，勿引入其他图标库 |

**依赖注意事项**：

1. `tsconfig.json` 开启了 `noUnusedLocals` / `noUnusedParameters` — **未使用的变量会导致构建失败**，删除代码时需同步清理 import。
2. `npm run build` = `tsc && vite build`，**类型错误会阻断构建**。
3. `billing.ts` 的模块级 store 是**可变单例**，页面通过 `subscribeWallet()` 订阅变更后强制重渲染；新增消费方请沿用此模式。
4. 内联样式为深色玻璃拟态，修改颜色时注意 `rgba` 透明度叠加关系。

### 6.8 关键页面截图

截图存放于 `docs/frontend-handoff/screenshots/`，与本文档一并提交。

| 页面 | 截图文件 | 展示重点 |
| --- | --- | --- |
| 团队资产 · 新建资产 · Step 1 | `team-assets-create-step1.png` | **本轮新增**：生成尺寸 6 选 1、统一前置提示词 + 快捷风格标签 |
| 团队资产 · 新建资产 · Step 3 | `team-assets-create-step3.png` | **本轮新增**：全局生成数量下拉 + 每资产 `−/+` 计数器 + 「共 N 张」统计 |
| 团队资产 · 项目列表 | `team-assets-list.png` | 资产项目网格、访问权限、进入资产 |
| 团队管理 · 分团队钱包 | `team-wallet-allocation.png` | 团队钱包余额、已分配/待分配/保留、各成员额度与状态 |
| 批量生成进度 | `batch.png` | 任务状态统计、失败任务重试 |
| 生成前费用确认 | `cost-confirm.png` | 任务规格、预计消耗星石与人民币 |
| 新建剧目 | `new-project.png` | **目标分镜数 1–5000**、模型选择、费用预估 |
| 落地页 | `landing.png` | Hero、套餐定价（读取 `billing.ts`）、FAQ |

> 截图基于 `本次交付提交`，1440×900 视口，浏览器实测采集。


---

## 7. 验收与后续工作

### 7.1 已执行的检查与结果

| 检查项 | 命令 / 方式 | 结果 |
| --- | --- | --- |
| TypeScript 编译 | `npm run typecheck` | ✅ **0 错误** |
| 生产构建 | `npm run build` | ✅ 成功，1488 模块，`index-*.js` 492.91 kB / gzip 125.32 kB |
| 干净目录克隆 | `mktemp -d` + `git clone --no-hardlinks` + `git checkout main` | ✅ 成功，HEAD 精确为 `本次交付提交` |
| 克隆产物含依赖/符号链接 | `ls node_modules` / `find . -type l` | ✅ 均不含（已正确排除） |
| 干净目录独立安装 | `npm ci` | ✅ 成功 |
| 干净目录类型检查 | `npm run typecheck` | ✅ 0 错误 |
| 干净目录构建 | `npm run build` | ✅ 成功，产物哈希与开发机一致 |
| GitHub 直连克隆 | `git clone https://github.com/...` | ⚠️ **未完成** —— 两次均因网络中断失败（`Empty reply from server` / `Failed to connect to github.com port 443`），属环境网络问题，**非仓库问题**，建议接手方在自己网络下复核一次 |
| 路由可用性 | 浏览器实测 `workspace` / `projects` / `batch` / `result` / `delivery` / `cost-confirm` | ✅ 均正常渲染，无断链 |
| 新建资产全流程 | 浏览器实测：输入文案 → 选 9:16 → 填前置提示词 → 解析出 3 个角色 → 调生成数量 → 批量生成 → 自动创建项目并写入 3 个角色资产 | ✅ 通过 |
| 入口清理 | `grep -rn "ai-chapter" src/` | ✅ 无残留引用 |
| 敏感信息扫描 | `grep -rniE "api_key|secret|token|BEGIN PRIVATE KEY" src/` | ✅ 无密钥 |
| 远端一致性 | `git diff HEAD origin/main` | ✅ 输出为空 |

### 7.2 ⚠️ 构建通过 ≠ 可正式上线

**必须明确区分两件事：**

| 维度 | 状态 | 说明 |
| --- | --- | --- |
| **工程可构建** | ✅ 已达成 | 干净目录可独立安装、类型检查、构建、运行 |
| **前端功能完整性** | ⚠️ 部分达成 | 布局、路由、交互、计费试算等前端逻辑完整且可用 |
| **业务可正式上线** | ❌ **未达成** | 无后端、无持久化、无真实支付、无鉴权、无模型调用 |

**上线阻塞项（必须解决）**：

1. 所有数据刷新即丢失 → 必须接后端持久化
2. 登录/注册可绕过 → 必须接真实鉴权
3. 费用确认不扣费 → 必须接真实计费与余额校验
4. 无错误边界 → 单页异常白屏
5. 文件上传未实现 → 仅记录文件名

### 7.3 已知问题

| 类别 | 问题 | 影响 |
| --- | --- | --- |
| 数据 | 全部数据内存态，刷新丢失 | 高 |
| 鉴权 | 登录/注册仅前端校验 | 高 |
| 计费 | 费用确认不真实扣费 | 高 |
| 健壮性 | 无 React Error Boundary | 中 |
| 上传 | 仅记录文件名，未做 MIME/大小校验 | 中 |
| 响应式 | 应用内页面无移动端/平板适配（仅落地页有） | 中 |
| 性能 | 主 chunk 492.91 kB（gzip 125.32 kB），Vite 有超 500 kB 警告 | 中 |
| 代码规范 | 未配置 ESLint / Prettier | 低 |
| 测试 | 无单元测试、无 E2E、无 CI 测试工作流 | 低 |
| 文档 | `docs/ui-implementation.md` 含已失效页面描述 | 低（已在 §1.2 标注） |
| 分支 | GitHub Pages 工作流监听 `main`，push 后自动触发 | 低 |

### 7.4 未完成项（产品/后端依赖，需产品方确认）

以下**规则未确认**，前端不自行补设，需产品明确后再实现：

1. 生成失败的**具体原因分类、错误码、是否自动重试/可重试**的规则
2. 资产生成任务的**超时策略**与**并发上限**
3. 分镜数与实际生成数量的**偏差容差**及超出后的计费处理
4. 团队额度**回收后已消耗部分是否退还**（当前实现为不可退还，仅额度回收）
5. 会员到期后**存量资产与历史任务的访问权限**
6. 充值积分**跨空间是否通用**（当前个人/团队严格隔离）
7. 存储扩容**是否影响已用容量**及超限后的行为
8. 交付文件**缓存有效期与到期后处理**（页面文案已提及，但规则未定）

### 7.5 后续工作优先级

#### P0 · 阻塞上线（建议 1–2 周内）

1. **接入后端与持久化**：优先钱包余额 + 成员额度分配（业务核心且已有完整前端逻辑，后端契约已在 §5.4 列出）
2. **接入真实鉴权**：登录/注册/令牌存储，配合路由守卫
3. **接入真实计费**：`CostConfirmPage` 确认时调用扣费接口，处理余额不足与并发扣费
4. **补 Error Boundary**：页面级错误兜底 + 全局 toast

#### P1 · 补齐能力（1–2 个月内）

5. **资产真实生成链路**：`CreateAssetModal` 解析与批量生成接真实接口，落实 `aspect` / `prefix` / `genCount` 字段
6. **批量任务真实状态**：轮询或 SSE 接入 `BatchPage`
7. **交付与存储**：接对象存储，落实文件过期与下载
8. **文件上传**：MIME/大小校验 + 断点续传（按需）
9. **拆分主 chunk**：`vite.config.ts` 配置 `manualChunks`，按 `pages/*` 拆包

#### P2 · 工程质量（并行推进）

10. **配置 ESLint + Prettier**，统一代码风格
11. **补单元测试**（优先 `billing.ts` 的升级试算与额度分配逻辑，纯函数易测）
12. **建立 E2E 冒烟测试**（Playwright），覆盖「新建剧目 → 新建资产 → 批量生成 → 费用确认 → 交付」主链路
13. **CI 增加 typecheck + build + test 工作流**
14. **补应用内响应式适配**（或明确仅支持桌面端并写入文档）
15. **清理历史文档**：`docs/ui-implementation.md` 归档或更新

---

## 附录 · 常用深链

启动开发服务器后可直接访问任意页面：

| URL | 页面 |
| --- | --- |
| `/?page=landing` | 落地页 |
| `/?page=login` | 登录 |
| `/?page=register` | 注册 |
| `/?page=onboarding` | 新手引导 |
| `/?page=workspace` | 创作工作台 |
| `/?page=projects` | 全部剧目 |
| `/?page=new-project` | 新建剧目 |
| `/?page=canvas` | 无限画布 |
| `/?page=team` | 团队管理 |
| `/?page=team-assets` | 团队资产 |
| `/?page=batch` | 批量生成进度 |
| `/?page=cost-confirm` | 生成前费用确认 |
| `/?page=result` | 结果详情 |
| `/?page=delivery` | 下载交付 |
| `/?page=billing` | 账单 |
| `/?page=upgrade` | 会员套餐 |
| `/?page=user-center` | 用户中心 / 积分充值 |

---

**交付基准提交**：`本次交付提交（见 `git log -1`）`
**任何与本文件描述不符的实际代码，请以仓库 `main` 分支为准，并回退文档。**
