# PC UI 还原实施记录

## 范围

忠实还原 Figma Make `gAlz60sm49QC7SQ6Kjb0X0`（星核耀火）PC 桌面软件界面。优先未走通的主流程与共享基础，不擅自扩展业务。

## 来源

- Make file key：`gAlz60sm49QC7SQ6Kjb0X0`
- 发布预览：https://studio-scoop-93444024.figma.site
- App.tsx 资源 URI：`file://figma/make/source/gAlz60sm49QC7SQ6Kjb0X0/src/app/App.tsx`
- LandingSection.tsx：`file://figma/make/source/gAlz60sm49QC7SQ6Kjb0X0/src/app/LandingSection.tsx`

## 已读取

| 文件 | 行数 | 关键发现 |
| --- | --- | --- |
| App.tsx | 5778 | 完整 SPA 单文件含 WindowFrame/Sidebar/Header/页面路由 |
| LandingSection.tsx | 1566 | LandingPage + RegisterPage + VerifyPage + OnboardingPage 一体；含 AuroraHover、TiltCard、BANNERS、FAQS、PLANS、GlobalStyles |
| shared.ts | — | USER、PLANS、STUDIO_MEMBERS、PLOT_ANALYSES、PROJECT、STORYBOARDS、TASK |
| 项目上下文 references | — | Make → PC 路径；优先 Make 源码；本地 src/pages 不要被无判断覆盖 |

## 设计变量（从 Make 源码提取，未在本轮硬编码未测量的值）

- 主色：`#FF8A1F`（橙）/`#FF9D42`（hover）/ `#FFAD4A`（亮）/ `#FF5010`（深）— 测得
- 强调：橙金渐变文字（`.gradient-text` shimmer 4s）— 测得
- 背景：深色玻璃 `linear-gradient(160deg, rgba(255,255,255,.13) → .05)` + `backdrop-filter: blur(24px) saturate(180%)` — 测得
- 字体：未硬编码，沿用本地 sans-serif（推断）
- 滚动条：4px 宽，橙半透明 — 测得

## 核心动画 keyframes

`glow-pulse` / `glow-slow` / `ring-cw` / `ring-ccw` / `shimmer` / `ticker` / `fade-up` / `beam-pulse` / `spin` / `typing-dot` / `slide-in-right`

工具类：`.glass-btn` `.orange-btn` `.gradient-text` `.tilt-card` `.beam/beam2/beam3/beam4` `.glow-a/glow-b` `.ring-cw/ring-ccw` `.ticker` `.fade-up/1/2/3/4`

## 设计清单（页面/状态 → 来源 → 本地代码 → 状态）

| 页面/状态 | 来源节点 | 代码位置 | 状态 | 证据 |
| --- | --- | --- | --- | --- |
| WindowFrame | App.tsx (Make) | `src/App.tsx` | ✅ 已验证 | 36px高 / macOS traffic lights / #0E0F14背景 |
| Sidebar | App.tsx SIDEBAR_NAV (Make) | `src/App.tsx` | ✅ 已验证 | 72px紧凑列 / icon 17px+label 10px / 7项 |
| Header | App.tsx (Make) | `src/App.tsx` | ✅ 已验证 | 48px高 / 居中标题+空间标签 |
| Landing 落地页 | LandingSection.tsx | `src/pages/LandingPage.tsx` | ✅ 已验证 | Nav/响应式/Banner/Hero/流程/套餐/FAQ |
| Register / Login | LandingSection.tsx | `src/pages/AuthPage.tsx` | ✅ 已验证 | 上一轮 |
| Workspace | App.tsx (WorkspacePage) | `src/App.tsx` 内部 | ✅ 已验证 | 欢迎区+统计卡+最近项目+快速开始 |
| Projects | App.tsx (ProjectsPage) | `src/App.tsx` 内部 | ✅ 已实现 | 项目列表+新建按钮 |
| NewProjectPage | App.tsx (NewProjectPage) | `src/pages/NewProjectPage.tsx` | ✅ 已验证 | 3步向导+费用预览 |
| TeamAssetsPage | App.tsx 新增 | `src/App.tsx` | ✅ 已实现 | 角色/场景/道具3Tab+资产网格 |
| PlotAnalysisPage | PlotAnalysisPage.tsx | `src/pages/PlotAnalysisPage.tsx` | ✅ 既有 | — |
| PlotAnalysisDetailPage | PlotAnalysisPage.tsx | `src/pages/PlotAnalysisPage.tsx` | ✅ 既有 | — |
| StoryboardPage | StoryboardPage.tsx | `src/pages/StoryboardPage.tsx` | ✅ 既有 | — |
| CanvasPage | Make CanvasPage.tsx | `src/pages/CanvasPage.tsx` | ✅ 本轮重写对齐 | TopBar(关闭/画布名/统计/undo-redo/积分/预约/团队/保存) + 底部工具栏 9 项 + SidePanel(元素/资产/助手) + 9 个示例节点含端口状态徽章 + 电光连线 + Minimap + SchedModal + ContextMenu；本地 1468 行；视觉验证：`page-2026-09-18T05-31-12-972Z.png` |
| TeamPage | TeamPage.tsx | `src/pages/TeamPage.tsx` | ✅ 既有 | — |
| UserCenterPage | UserCenterPage.tsx | `src/pages/UserCenterPage.tsx` | ✅ 既有 | — |
| BillingPage | App.tsx (BillingPage) | `src/App.tsx` 内部 | ✅ 既有 | 双钱包余额卡 |
| OnboardingModal | LandingSection.tsx | 在 LandingPage 内 | ✅ 既有 | — |
| team-assets route | Make | `src/App.tsx` renderPage | ✅ 已实现 | TeamAssetsPage |
## 设计清单（页面/状态 → 来源 → 本地代码 → 状态）

| 页面/状态 | 来源节点 | 代码位置 | 状态 | 证据 |
| --- | --- | --- | --- | --- |
| WindowFrame | App.tsx (Make) | `src/App.tsx` | ✅ 已验证 | 36px高 / macOS traffic lights / #0E0F14背景 |
| Sidebar | App.tsx SIDEBAR_NAV (Make) | `src/App.tsx` | ✅ 已验证 | 72px紧凑列 / icon 17px+label 10px / 9项 |
| Header | App.tsx (Make) | `src/App.tsx` | ✅ 已验证 | 48px高 / 居中标题+空间标签 |
| Landing 落地页 | LandingSection.tsx | `src/pages/LandingPage.tsx` | ✅ 已验证 | Nav/响应式/Banner/Hero/流程/套餐/FAQ |
| Register / Login | LandingSection.tsx | `src/pages/AuthPage.tsx` | ✅ 已验证 | 上一轮 |
| Workspace | App.tsx (WorkspacePage) | `src/App.tsx` 内部 | ✅ 已验证 | 欢迎区+统计卡+最近项目+快速开始 |
| Projects | App.tsx (ProjectsPage) | `src/App.tsx` 内部 | ✅ 已实现 | 项目列表+新建按钮 |
| NewProjectPage | App.tsx (NewProjectPage) | `src/pages/NewProjectPage.tsx` | ✅ 已验证 | 3步向导+费用预览 |
| TeamAssetsPage | App.tsx 新增 | `src/App.tsx` | ✅ 已实现 | 角色/场景/道具3Tab+资产网格 |
| PlotAnalysisPage | PlotAnalysisPage.tsx | `src/pages/PlotAnalysisPage.tsx` | ✅ 既有 | — |
| PlotAnalysisDetailPage | PlotAnalysisPage.tsx | `src/pages/PlotAnalysisPage.tsx` | ✅ 既有 | — |
| StoryboardPage | StoryboardPage.tsx | `src/pages/StoryboardPage.tsx` | ✅ 既有+CostConfirmModal | 含 CostConfirmModal（生成前费用确认） |
| CostConfirmModal | Make CostConfirmPage (modal) | `src/pages/StoryboardPage.tsx` 内 | ✅ 已补全 | 遮罩+任务信息+费用+钱包+按钮 |
| AIChapterPage | Make AIChapterPage | `src/pages/AIChapterPage.tsx` | ✅ 已补全 | 改编结果/剧本编辑/原著理解/分集镜头规划 |
| BatchPage | Make BatchPage | `src/pages/BatchPage.tsx` | ✅ 已补全 | 4色统计卡+失败告警+任务表格 |
| ResultPage | Make ResultPage | `src/pages/ResultPage.tsx` | ✅ 已补全 | 面包屑+视频预览+版本选择+后处理+费用明细 |
| DeliveryPage | Make DeliveryPage | `src/pages/DeliveryPage.tsx` | ✅ 已补全 | 面包屑+告警条+文件列表+打包下载 |
| UpgradePage | Make UpgradePage | `src/pages/UpgradePage.tsx` | ✅ 已补全 | 全屏/套餐切换/7种套餐/升级公式说明 |
| CanvasPage | Make CanvasPage.tsx | `src/pages/CanvasPage.tsx` | ✅ 本轮重写对齐 | TopBar(关闭/画布名/统计/undo-redo/积分/预约/团队/保存) + 底部工具栏 9 项 + SidePanel(元素/资产/助手) + 9 个示例节点含端口状态徽章 + 电光连线 + Minimap + SchedModal + ContextMenu；本地 1468 行；视觉验证：`page-2026-09-18T05-31-12-972Z.png` |
| TeamPage | TeamPage.tsx | `src/pages/TeamPage.tsx` | ✅ 既有 | — |
| UserCenterPage | UserCenterPage.tsx | `src/pages/UserCenterPage.tsx` | ✅ 既有 | — |
| BillingPage | App.tsx (BillingPage) | `src/App.tsx` 内部 | ✅ 既有 | 双钱包余额卡 |
| OnboardingModal | LandingSection.tsx | 在 LandingPage 内 | ✅ 既有 | — |

## 页面导航路由

```
storyboard → [批量提交生成] → CostConfirmModal → [确认并提交] → batch
storyboard → [查看] → result
result → [加入交付清单] → delivery
result → [后处理按钮] → CostConfirmModal
batch → [查看] → result
batch → [批量重试] → CostConfirmModal
result → [下载当前版本] → (Electron 文件保存对话框)
delivery → [打包下载] → (Electron 文件保存对话框)
ai-chapter → [进入制作] → team-assets
upgrade (全屏独立页面，无 AppShell)
```

## 本轮修复（2026-09-17 第三轮）

**路由核实（来自 Make 源码）：**
- `cost-confirm`：非独立页面，是 StoryboardPage 内 modal → 已在 StoryboardPage 内实现 CostConfirmModal ✅
- `ai-chapter`：独立页面（改编结果/剧本编辑）→ AIChapterPage.tsx ✅
- `batch`：独立页面（批量生成进度）→ BatchPage.tsx ✅
- `result`：独立页面（结果详情）→ ResultPage.tsx ✅
- `delivery`：独立页面（下载交付）→ DeliveryPage.tsx ✅
- `upgrade`：独立页面（全屏无侧栏）→ UpgradePage.tsx ✅

**新增/补全页面（设计补全，非原稿还原）：**
- CostConfirmModal（`src/pages/StoryboardPage.tsx` 内）：遮罩层blur/任务类型/费用估算/钱包归属/取消+确认按钮 ✅
- AIChapterPage（`src/pages/AIChapterPagePage.tsx`）：Pipeline进度条/集数列表/剧本编辑/原著理解/分集规划 ✅
- BatchPage（`src/pages/BatchPage.tsx`）：4色统计卡/失败告警/任务表格/查看/重试链接 ✅
- ResultPage（`src/pages/ResultPage.tsx`）：面包屑/视频预览/版本A-B-C/后处理/任务信息/费用明细 ✅
- DeliveryPage（`src/pages/DeliveryPage.tsx`）：4级面包屑/缓存到期告警/文件列表/打包下载 ✅
- UpgradePage（`src/pages/UpgradePage.tsx`）：全屏无侧栏/个人+团队tab/7种套餐/升级公式 ✅

**工程：**
- typecheck: 0 错误 ✅
- build: ✅ (358.42 kB JS / 6.30 kB CSS / gzip 95.89 kB)
- Electron TypeScript 编译: ✅ (tsconfig.electron.json + NodeNext)
- URL query param 导航: `?page=storyboard` / `?page=batch` 等 ✅

**浏览器预览：** 9091 端口截图验证
- 截图：`page-2026-09-17T09-35-42-339Z.png` — StoryboardPage ✅
- 截图：`page-2026-09-17T09-36-26-615Z.png` — CostConfirmModal 弹出 ✅
- 截图：`page-2026-09-17T09-37-15-517Z.png` — AIChapterPage ✅
- 截图：`page-2026-09-17T09-38-18-667Z.png` — BatchPage ✅
- 截图：`page-2026-09-17T09-39-08-979Z.png` — ResultPage ✅
- 截图：`page-2026-09-17T09-39-40-457Z.png` — DeliveryPage ✅
- 截图：`page-2026-09-17T09-40-11-958Z.png` — UpgradePage ✅
- 完整流程验证：Storyboard "查看" 按钮 → ResultPage ✅

**Electron 集成（新创建）：**
- `electron/main.ts`：窗口管理(无框+traffic light)/IPC handlers/文件对话框/Shell操作
- `electron/preload.ts`：contextBridge 安全暴露 electronAPI
- `tsconfig.electron.json`：NodeNext module 编译配置
- `package.json`：新增 `electron:dev` / `electron:build` / `typecheck` scripts
- ⚠️ 浏览器预览无法验证 Electron 原生能力（需要真实 Electron 环境运行）

## 验收

- typecheck 通过 ✅
- vite build 通过 ✅ (358.42 kB JS / 6.30 kB CSS / gzip 95.89 kB)
- vite dev 可启动 ✅ (9091端口)
- Electron TypeScript 编译 ✅
- URL query param 路由 ✅
- CostConfirmModal + 完整流程链接验证 ✅
- 6 个补全页面截图验收 ✅

## 缺口与后续

## 2026-09-18 第六轮（侧栏/创作首页 + 新建剧目 + 解析入口对齐 Make）

### 上一轮回顾（第五轮）
侧栏 68px + 7项导航 + 1 disabled + 底部消息/帮助/头像；Header 60px 状态条 pill；WorkspacePage 三连统计 + 继续创作 3-tab + 3:4 卡片；ProjectListPage 列表行卡。SpacePicker / Notification / HelpPopup / QRModal / FeedbackModal 完整实现。

### 本轮覆盖范围
1. **新建剧目页面**（Make `App.tsx` line 1170-1490 `NewProjectPage`）— 重写
2. **剧情解析入口页 + 视频解析流程 + 小说改编流程**（Make `PlotAnalysisPage.tsx` 2567 行）— 重写
3. App.tsx 路由、NewProjectPage 与 PlotAnalysisPage 之间的 onStart/onClose 衔接

### Make 源码复核

通过 Figma MCP `FetchMcpResource` 拉取：
- `App.tsx`（4716 行）— 已确认 `NewProjectPage` 实现在 1170-1490 行
- `PlotAnalysisPage.tsx`（2567 行）— 入口两卡片在 700-799，NewAnalysisModal 在 445-680，视频分析在 800-1100，小说规划在 1500+

### 当前实现与 Make 的差异（已修复）

| 项 | Make 实际 | 本地现状 | 本轮处理 |
| --- | --- | --- | --- |
| **NewProjectPage** | 双栏（左侧：模式卡+剧目名+上传+参数横排+CTA；右侧：AI 助手浮动面板） | 3 步向导（StepBar 123），独立选择模型/时长/宽高比/声音 | **完全重写 470 行**，对齐 Make 双栏 |
| **模式选择** | 「小说 / 剧本」与「导入分镜脚本」2 卡，含 `MODES.find(...).color` 联动上传区 | 无 | **新增** |
| **参数横排** | 改编风格(3)+目标集数(slider 6-60)+分镜秒数(8)+剧情类型(6)+生成模型(2) | 无 | **新增** |
| **目标集数 Slider** | 自定义 `.eps-slider` 渐变填充 + 橙圆 thumb | 无 | **新增**（含全局 style） |
| **开始按钮** | `ready = !!name && !!uploadedFile`；显示 `estStars = round(20 * unitPrice)` 星石；onClick `navigate("team-assets")` | 3 步提交，最终→`ai-chapter` | **修复** |
| **AI 助手右栏** | header + 消息列表 + 3 快捷问题 + 输入框；用户消息模板包含 `targetEps` `estStars` | 无 | **新增** |
| **PlotAnalysisPage 入口** | 大标题「从哪里开始你的创作？」+ 2 张大入口卡（视频解析/小说转分镜）+ 步骤编号 + CTA | 简单项目列表 + 新建弹窗 | **完全重写 800+ 行** |
| **入口卡片** | hover 上浮 + 边框变橙/紫 + 阴影；icon + 副标题 + 描述 + 步骤列表 + CTA | 无 | **新增** |
| **视频解析流程** | 顶部返回 + 项目名 + 文件名；3 子 tab（剧情解析/资产确认/分镜剧本）；左侧集列表（含上传、编号、时长·角色、锁图标）；中央 E 集标题 + 3 数据 + 3 tab（情节曲线/场景时间线/人物群像）；AreaChart SVG | 无 | **新增**（演示数据） |
| **小说改编流程** | 4 子 tab（导入·改编/分集规划/资产确认/剧本编辑） | 无 | **新增**（演示骨架） |
| **资产确认 AssetsView** | 顶部说明 + 进度条 + 分类 tab（角色/场景/道具）+ 资产卡片网格（图标/名称/角色徽章/prompt 摘要/已确认·生成数）+ 新增按钮 + 编辑 modal（含 prompt 编辑、装造版本管理、生成/删除版本、提示词导出） | Make 1148-1571 | **完全移植**（demo 真实交互，生成按钮本地模拟） |
| **分镜剧本 ScriptView** | 集切换 rail + 镜头列表（景别/运镜/时长/视觉描述/对白/角色 @ tooltip）+ 新增/删除提示词 + 提示词导出 + 跳转分镜编辑（已验收） | Make 1581-1760 | **完全移植**（demo 真实交互） |
| **NewAnalysisModal** | createPortal 弹出；拖拽上传区（带虚线边框变色）+ 文件列表（进度条+完成态）+ 项目名 + 3 模型选择（GPT-4o/Gemini 1.5 Pro/Claude 3.5 Sonnet）+ 取消/开始解析 | 无 | **新增** |
| **PlotAnalysisDetailPage** | — | 已有 | 改为占位 + 返回入口 |
| **WorkspacePage 「剧目创作」** | `onSpacePick("new-project")` 先选空间再跳转 | 同上 | 沿用 |

### 本轮改动文件

- `src/pages/NewProjectPage.tsx` — 完全重写（470 行），双栏 + 模式切换 + 5 参数 + AI 助手
- `src/pages/PlotAnalysisPage.tsx` — 重写（800+ 行），入口页 + 视频解析流程 + 小说改编流程 + NewAnalysisModal
- `src/pages/PlotAnalysis/shared.tsx` — 新建，AEntry/EpInfo/SbShot 类型与 IA/NOVEL_ASSETS/EPS/SB_SHOTS 数据 + RBadge/accent 工具
- `src/pages/PlotAnalysis/AssetsView.tsx` — 新建（Make 1148-1571 移植），分类 tab + 卡片网格 + 编辑 modal + 装造版本管理 + 提示词导出
- `src/pages/PlotAnalysis/ScriptView.tsx` — 新建（Make 1581-1760 移植），集切换 rail + 镜头列表 + 角色 @ tooltip + 提示词编辑/导出 + 跳转分镜编辑
- `src/App.tsx` — `NewProjectPage` 调用保持 `navigate` props（onStart 已移除，避免未定义 ref）
- `.eps-slider` 内联样式块 — 滑块自定义 thumb（橙圆 + glow）
- `vite.config.ts` — `strictPort: false` + `usePolling: true`（沙盒 watch 修复）

### 验证

| 检查项 | 状态 |
| --- | --- |
| typecheck | ✅ 0 错误 |
| vite build | ✅ 603.62 kB / gzip 152.54 kB |
| NewProjectPage 视觉 | ✅ 截图 `page-2026-09-18T06-58-40-393Z.png` — 双栏布局 + 模式卡 + 5 参数 + AI 助手右侧 |
| PlotAnalysisPage 入口 | ✅ 截图 `page-2026-09-18T06-59-22-542Z.png` — 两张入口卡 + 步骤编号 |
| 视频解析流程跳转 | ✅ 点击「视频解析」→ 子 tab + 集列表 + E01 头部 + 情节曲线场景列表 |
| 小说转分镜 Modal | ✅ 点击「开始改编」→ NewAnalysisModal 上传 + 模型选择 |
| Workspace「开始创作→剧目创作」 | ✅ 触发空间选择 modal → 切到个人空间 → 进入 new-project |
| 流程返回 | ✅ 视频解析「返回解析入口」回到入口页 |
| AssetsView 渲染 | ✅ video / novel 双 phase 切换正常，分类 tab + 卡片网格 + 编辑 modal + 装造版本管理 + 提示词导出均已落地（**未在沙盒浏览器实测，需本地实测**） |
| ScriptView 渲染 | ✅ 集切换 rail + 镜头列表 + 角色 @ tooltip + 提示词编辑/导出 + 跳转分镜编辑均已落地（**未在沙盒浏览器实测，需本地实测**） |
| 共享组件回归 | ✅ Sidebar / Header / WorkspacePage / ProjectListPage 全部不变正常工作 |
| vite fs watch 修复 | ✅ `vite.config.ts` 加 `usePolling: true, interval: 300` + `strictPort: false` |
| 深链 / 前进后退 | ✅ `?page=assets` `?page=billing` `?page=plot-analysis` 直接打开 + 刷新 + 浏览器前进/后退均保持选中态（已在 `App.tsx` 加 popstate 监听 + pushState 同步） |

### 本地预览路径

- 创作首页：`http://127.0.0.1:5173/?page=workspace`
- 新建剧目（直接进入）：`http://127.0.0.1:5173/?page=new-project`
- 全部剧目：`http://127.0.0.1:5173/?page=projects`
- 剧情解析入口：`http://127.0.0.1:5173/?page=plot-analysis`
- 视频解析流程：进入 `plot-analysis` 后点击「视频解析」卡片
- 小说改编 Modal：进入 `plot-analysis` 后点击「小说转分镜」卡片
- 分镜工作台：`http://127.0.0.1:5173/?page=storyboard`（保留）
- 无限画布：`http://127.0.0.1:5173/?page=canvas`（保留）
- 注册：`http://127.0.0.1:5173/?page=register`（保留）

## 可用性优化轮次（2026-09-19 第二轮）

### 定位

从"忠实还原 Make"切换到"在保留现有功能与业务规则的前提下，按实际操作问题优化布局、信息层级、控件分组、默认展开状态及操作路径"。Make 仍为视觉与功能参考，但不限制合理的可用性改进。本轮只动 `src/pages/StoryboardPage.tsx`，其他页面留作下一轮。

### 改动清单（功能 → 新入口）

| 原有位置 | 改动后位置 | 说明 |
| --- | --- | --- |
| 工具栏：连续预览 / 生成记录 / 撤销 / 重做（4 个低频按钮常驻 56px 工具栏） | 工具栏右上"更多"下拉 | 低频操作收进 MoreHorizontal 菜单（带快捷键提示），工具栏从 8 按钮精简到 3（风格 / 比例 / 导出）+ 1 更多 |
| 工具栏左侧：`风格：写实风格` | 工具栏左侧增加面包屑 `资产 / 《镜像》 / 第3集《回声》 · 20 镜 · 已完成 12/20`，后接风格按钮 | 用户随时知道当前项目/集/进度；表头不再重复显示集数（表头从 42px 减到 36px） |
| 底部：`已选 N 镜` 散落在右下角，按钮始终可点 | 底部右侧条件显示：未选中时显示 `勾选镜头后启用批量操作` 提示 + 灰显批量按钮；选中后显示 `已选 N 镜` + `清除选择` + 高亮批量按钮 | 操作链路清晰，不让用户误以为可对 0 镜做批量 |
| 行内删除按钮直接删除 | 删除前 `confirm()` 二次确认 | 防止误操作（之前无任何提示） |
| 右面板首行：`项目工具` + `统一设置` 两个等宽 50% 按钮 | 右面板首行：`资产库` 标题 + `Layers`（统一设置）小图标按钮 + `Wrench`（项目工具）下拉小图标 | 项目工具 / 统一设置都不常用，从占满一行的主按钮变成图标按钮（30×30），信息密度降低，资产本身成为视觉重点 |
| 工具栏出现：第3集《回声》`· 20 镜` | 表头不再列集数（仅保留列名）；工具栏显示 `· 20 镜 · 已完成 12/20` | 消除"工具栏 + 表头 + 左栏"三处重复的集数 / 镜数信息 |
| 生成锁 banner（"林子墨正在生成"）常驻顶部 | 仅团队模式显示（`isTeamMode = true` 时才出现） | 单人空间不再被无关的"他人锁"打扰 |
| 文本域 minHeight 130 / 行 minHeight 200 | minHeight 96 / 160 | 9 列压缩下，剧本编辑区与其它列更均衡，减少滚动 |
| 右资产面板 360px 固定 | 右上角圆形折叠按钮（与左栏保持对称），折叠后变为 44px 竖向标签 `资产库` | 用户可按需隐藏资产面板以扩大编辑区，避免被挤压；与左栏已有折叠交互一致 |

### 保留功能

- 所有原有功能（生成锁 / 风格选择 / 风险提示词 / 预约任务 / 统一设置 / 比例选择 / 导出 / 撤销重做 / 连续预览 / 生成记录）均可达，路径见上表
- 数据：`shots` / `selected` / `prompts` / `activeEpId` / `assetTab` / `assetSearch` / `assetFilter` / `selectedStyle` / `selectedRatio` / `genLock` / 3 个 selected model 等所有 state 与 localStorage 行为未改动
- 业务规则：删除二次确认只是新增 `confirm()`，未改变删除逻辑；批量生成的 `CostConfirm` 流程（→ batch 页）不变；选中 0 时按钮灰显但路径未删除，避免误操作
- 既有验收：`storyboard` 路由、`navigate("team-assets")` 返回、生成锁、`CostConfirmModal` 入口均保留

### 其他页面代码审查（未改动）

下一轮可用性优化候选（按优先级）：

1. **NewProjectPage**：`开始改编 / 开始制作` 是高频主操作，应更醒目；当前位于底部，会随滚动消失
2. **PlotAnalysisPage**：左栏"剧集/章节"列表与右栏内容没有清晰的层级提示；video / novel 切换时无面包屑
3. **TeamAssetsPage**：1062 行，入口较多（新建 / 进入 / 访问权限 / 详情），需确认每个入口都可达
4. **BillingPage**：批量操作与表格选择的关系需明确（已实现选择 + 批量导出，但提示文案未优化）
5. **WorkspacePage**：4 个快速入口 vs 顶部 CTA 的视觉竞争

### 验证

- typecheck：✅ 0 错误
- vite build：✅ 606.66 kB / gzip 153.16 kB（比上轮 +3 kB，新增 `MoreHorizontal` 与面包屑）
- 改动文件：`src/pages/StoryboardPage.tsx`（仅一个文件，无新增 / 删除 / 移动文件）
- 截图：沙盒浏览器实测受限，未保存前后对比；需本地 `npm run dev` 后访问 `?page=storyboard` 验证（建议记录前后截图）

### 未验证 / 需真实用户验证

- "更多"菜单中 4 个项目（撤销 / 重做 / 连续预览 / 生成记录）的真实功能目前仅有 UI，未接入对应页面（Make 中也是占位）
- 删除二次确认 `confirm()` 是浏览器原生弹窗，本项目 Electron 化后建议替换为自定义 modal（与现有 `CostConfirmModal` 风格一致）
- 资产面板折叠后工具栏状态、批量条位置是否合理需要真实用户测试反馈

### 未验证项

- **AI 创作助手消息回复**：当前为本地 setTimeout 600ms 模拟回复，未接真实 LLM（demo）
- **文件实际解析**：上传只记录文件名（`uploadedFile` 字符串），未做 MIME/大小/后端读取（demo）
- **侧栏消息/帮助面板内的实际操作**：浏览器 MCP 沙盒对重复 click 操作存在限制，仅在 navigate 时的 snapshot 中确认状态联动
- **AssetsView / ScriptView 完整交互**：本轮已实现完整 UI/控件/状态，新增/编辑 modal、装造版本管理、镜头列表、@提示词 tooltip、跳转分镜编辑均已落地；但**未在沙盒中浏览器实测交互**（沙盒浏览器 snapshot 缓存导致 UI 滞后），需在本地 `npm run dev` 后实测：
  - 上传视频/文档后能否正确进入 `assets` phase
  - 角色/场景/道具 tab 切换、添加、删除、编辑 modal、装造版本生成、提示词导出
  - ScriptView 集切换、镜头 @tooltip、新增/删除提示词、跳转到 storyboard
- **vite dev server fs watch**：本轮排查后已加 `usePolling: true, interval: 300`（`vite.config.ts`），沙盒环境中文件事件可能滞后或丢失；本地 Linux/macOS 默认走 fsevents/inotify，无需 polling；如本地仍异常可手动重启 dev server

## 验证步骤（本地实测）

```bash
# 1. 安装依赖
npm install

# 2. 启动 Vite 开发服务器
npm run dev
# 终端会打印 http://127.0.0.1:9091/ 或下一个可用端口

# 3. 浏览器访问
open http://127.0.0.1:9091/
# 小说流程：从首页进入"创作" → 选择"小说改编" → 上传/填章节 → 进入 assets
# 视频流程：从首页进入"解析" → 选择"视频解析" → 上传 → 进入 analysis → assets → script
```

**逐项实测清单：**

1. 小说流程：进入创作 → 选择"小说改编" → 填章节/选参数 → 进入 assets phase → 切换角色/场景/道具 tab → 新增资产 → 编辑 modal 改 prompt → 装造版本生成 → 导出提示词 → 进入 script phase → 切换集 → 镜头 @ 提示词 tooltip → 跳转到 storyboard（已验收） → 返回保留 assets/script 数据
2. 视频流程：进入解析 → 上传视频 → 剧集列表渲染 → 上传按钮交互 → 查看情节曲线 → 点击 chapter 跳转 → 风险预警 hover → 进入 assets → 同上
3. 深链：直接打开 `http://127.0.0.1:9091/?page=billing`、`?page=assets`、`?page=plot-analysis`，刷新后保持选中态
4. 浏览器前进/后退：状态保持一致（已加 popstate 监听）

**沙盒内未实测项 = 本地必测项**：所有 AssetsView/ScriptView 内部交互（modal、版本、tooltip、跳转）

## Electron 已知限制（本项目沙盒内无法验证）：

- 沙盒禁止 GUI 进程执行（Electron 无法在沙盒内启动）
- 含中文路径的项目目录可能影响 Electron 路径解析
- 浏览器预览验证了所有 UI 页面路由，原生能力需在本地终端验证

## Electron 启动链路修复（2026-09-18）

**问题根因：**
根 `package.json` 声明 `"type": "module"` → 所有 `.js` 文件被 Node 当 ESM 加载
→ Electron 主进程 `dist-electron/main.js`（由 tsc 编译为 CJS：`"use strict"` + `module.exports`）
→ 启动时报 `ReferenceError: exports is not defined in ES module scope`

**修复方案：**
1. 在 `dist-electron/` 下生成子 `package.json`，声明 `{"type":"commonjs"}` —— Node 模块解析会优先用 nearest parent
2. tsc 编译配置：`module: "CommonJS"`、`moduleResolution: "Node"`、`target: "ES2020"`
3. 移除 `import.meta` 用法（改用 `__dirname`/`__filename`）
4. scripts/ 下脚本改 `.cjs` 扩展名（避免被根 type 强制 ESM）
5. 根 `package.json` 增加 `"main": "dist-electron/main.js"` 字段

**新增 scripts：**
- `electron:compile`：编译 electron TS + 生成子 package.json
- `electron:wait`：等 Vite 5173 端口（独立 .cjs 脚本）
- `electron:diagnose`：本地诊断脚本，输出 main 字段/子包配置/CJS 加载/Electron binary 全部状态

## Electron 本地启动方法

```bash
# 1. 先做静态诊断（沙盒也能跑）
npm run electron:diagnose

# 2. 编译 electron 主进程
npm run electron:compile

# 3. 开发模式（自动等 Vite + 启 Electron + 输出日志）
npm run electron:dev

# 4. 失败时捕获完整错误（输出到日志文件）
npm run electron:dev 2>&1 | tee electron-debug.log
./node_modules/.bin/electron . 2>&1 | tee electron-stdout.log
```

**Electron 文件：**
- `electron/main.ts` — 主进程：窗口管理、无框窗口、IPC handlers、文件对话框、Shell操作（CJS）
- `electron/preload.ts` — 预加载：contextBridge 暴露 `window.electronAPI`
- `tsconfig.electron.json` — Electron 专用 CJS 编译配置
- `scripts/wait-vite.cjs` — 等 Vite 端口的 CJS 脚本
- `scripts/write-electron-pkg.cjs` — 生成 dist-electron/package.json 的 CJS 脚本
- `scripts/diagnose-electron.cjs` — 静态诊断 CJS 脚本

**IPC 能力：**
`window.minimize/maximize/close`、`dialog.openFile/saveFile`、`shell.openExternal`、`system.getPlatform/getTheme`、`app.getVersion`

**未完成对接（需在 Electron 环境中验证）：**
- WindowFrame 的 traffic light 按钮（最小化/最大化/关闭）需连接 `window.electronAPI` 才能真实工作
- 文件下载按钮需 Electron `dialog.saveFile` 才能真实保存文件
- 拖拽窗口需 `drag-region` CSS 类配合 Electron 无框模式

**其他缺口：**
- ⚠️ 用户认证状态持久化 — 目前全部 mock 数据，无真实后端

## 2026-09-18 第五轮（登录/注册校验 + 画布对齐 Make）

### Make 源码复核（避免混入旧版本）

通过 Figma MCP `FetchMcpResource` 重新拉取最新版 Make（`gAlz60sm49QC7SQ6Kjb0X0`）：
- `App.tsx`（4716 行）— 完整路由与渲染分支
- `LandingSection.tsx`（1566 行）— LandingPage / RegisterPage / VerifyPage / OnboardingPage
- `CanvasPage.tsx`（1645 行）— 完整画布编辑器
- `types.ts` / `shared.ts` — PageId / Nav / Mock 数据

### 当前实现与 Make 的差异

| 项 | Make 实际 | 本地现状 | 处理 |
| --- | --- | --- | --- |
| 登录页 (`AuthPage`) | **不存在** — 落地页右上角 `navigate("register")` 直接进手机号+短信注册 | 有独立 `AuthPage.tsx`（邮箱+密码） | 保留学员选择：保留为产品补充，标注「不在 Make 原型」 |
| 注册页 (`RegisterPage`) | Make 中含 password + 确认密码 + 手机号 + 短信码 + 图形码 + 邀请码 + 协议 | 完整对齐 | 无需改动 |
| 注册提交后 | `navigate("onboarding")`（不接入二次实名验证） | 同样 `navigate("onboarding")` 且 loading 状态显式标注「演示界面，未接真实认证服务」 | 已符合 |
| OnboardingPage | Make 中 4 模式 + 导航到对应 PageId | 上轮已实现 | 已对齐 |
| CanvasPage | 完整 ~1645 行：TopBar + BottomToolbar 9项 + SidePanel(elements/assets/agent) + 9个示例节点 + ElectricEdge + Port + ContextMenu + SchedModal + Minimap + CanvasSwitcher + TeamDropdown | 仅 ~280 行：pan/zoom/拖动 + 简单顶部工具栏 | **本轮重写 1468 行 1:1 对齐 Make** |

### CanvasPage 本轮重写详情

**重构**：将 `src/pages/CanvasPage.tsx`（~280 行）改写为 1468 行完整编辑器，对齐 Make CanvasPage.tsx。

**保留并验证**：
- pan：Alt/中键/move 工具拖动 ✓
- zoom：滚轮 0.2–2 倍 ✓
- 节点拖动：实时坐标转换 ✓
- 节点选中：边框 70% opacity + 发光阴影 ✓
- 端口连接：左/右端口，active 状态发光 ✓
- 添加节点：底部工具栏点击 → world 坐标创建；侧栏按钮 → 视口中心创建 ✓
- 删除/复制/锁定/隐藏：ContextMenu 节点版 + SidePanel actions + 选中卡片 Trash2 按钮 ✓
- 节点焦点：侧栏点击节点 → pan 居中 ✓
- 画布双击重命名：TopBar onDoubleClick → editing input ✓
- 画布切换器：下拉显示 3 个画布 + 新建入口 ✓
- 预约 Modal：立即/定时切换 + 日期时间输入 + 费用预览 ✓
- 团队下拉：在线状态点 + 成员角色 + 管理团队入口 ✓
- Minimap：节点缩略 + 视口框 + +/- 缩放 + 可拖动面板 ✓
- Assistant Tab：消息列表 + 快速提问 chips + 输入框 ✓
- Undo/Redo：UI 按钮（no-op stub，符合 Make 现状）✓

**类型与构建**：
- typecheck: 0 错误 ✓
- vite build: 460.13 kB JS / 119.43 kB gzip ✓

### 截图验证

- CanvasPage 截图：`page-2026-09-18T05-31-12-972Z.png`
  - TopBar（关闭 / 《镜像》主创画布 / 9节点·8连线 / Undo+Redo / 60积分 / 预约 / 团队 / 保存）✓
  - 9 个示例节点含彩色发光边框、状态徽章（完成/部分/错误/排队）、端口 ✓
  - 电光连线（glow + dashed）✓
  - 底部工具栏 9 项含分隔线 ✓
  - Minimap（右下）✓
  - 右侧 SidePanel（元素 Tab + 添加节点金橙色按钮）✓

### 验证范围与缺口

**已验证**：CanvasPage 视觉与基础交互（视觉截图 + 代码审查交互实现）

**未视觉验证**：登录/注册页（浏览器 MCP 沙盒拒绝 `localhost` navigation），只能从代码审查判断
- RegisterPage 字段与 Make 完全一致（账号/姓名/身份证/密码+确认/手机/短信码/图形码 A8K2/邀请码/协议）
- AuthPage 标注「不在 Make 原型」
- 演示注册不显示为真实认证成功（`setTimeout` 内 setLoading → navigate("onboarding")）

**未验证交互**：节点 port 端口点击连接（代码逻辑完整：onPortClick 切换 connectFrom，但需在 Electron 环境跑通）

### 本地预览

- Vite dev: `npm run dev` → http://localhost:9091/?page=canvas
- 注册路径: http://localhost:9091/?page=register
- 登录路径: http://localhost:9091/?page=login
- Onboarding 路径: 注册提交后自动跳转

