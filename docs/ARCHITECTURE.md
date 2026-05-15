# Textline 项目架构文档

> 本文档详细记录 Textline 作品集网站的完整架构、代码关系与技术细节。

---

## 目录

1. [项目概述](#1-项目概述)
2. [技术栈](#2-技术栈)
3. [目录结构](#3-目录结构)
4. [入口与启动流程](#4-入口与启动流程)
5. [路由架构](#5-路由架构)
6. [滚动系统（核心导航）](#6-滚动系统核心导航)
7. [Context 体系](#7-context-体系)
8. [页面与 Sections](#8-页面与-sections)
9. [共享组件](#9-共享组件)
10. [视觉特效模块](#10-视觉特效模块)
11. [自定义 Hooks](#11-自定义-hooks)
12. [数据层](#12-数据层)
13. [后端 API](#13-后端-api)
14. [样式系统](#14-样式系统)
15. [自定义事件（跨组件通信）](#15-自定义事件跨组件通信)
16. [构建与开发](#16-构建与开发)
17. [架构设计理念](#17-架构设计理念)

---

## 1. 项目概述

**Textline** 是一个以"滚动驱动的物理交互体验"为核心的作品集网站。用户通过滚轮/触控滑动在垂直堆叠的页面区块之间导航，每个区块内部有大量的 Three.js / Matter.js / Canvas 物理/3D 特效。

项目分为两层：
- **Frontend** — Vite + React (src/)
- **Backend** — Express + TypeScript (api/)

---

## 2. 技术栈

### Frontend

| 类别 | 技术 | 版本 | 用途 |
|------|------|------|------|
| 构建工具 | Vite | 8.x | 开发服务器 + 生产构建 |
| 框架 | React | 19.x | UI 层 |
| 语言 | TypeScript | ~6.0 | 类型安全 |
| 样式 | Less | 4.6 | CSS 预处理器 |
| 3D 渲染 | Three.js | 0.184 | 球体、GLTF 模型 |
| 物理引擎 | Matter.js | 0.20 | 技能云、绳索物理、时间线 |
| 动画 | Motion (Framer Motion) | 12.38 | React 组件动画 |
| 动画 | GSAP | 3.15 | SVG 路径、时间线、CornerIcon |
| 图标 | simple-icons | 16.18 | 技能 SVG 图标 |
| 样式 | Less | 4.6.4 | CSS 预处理器 |

### Backend

| 类别 | 技术 | 用途 |
|------|------|------|
| 运行时 | Node.js | 服务端环境 |
| 框架 | Express | 5.1 HTTP 服务 |
| 运行器 | tsx | TypeScript 即时运行 |
| 类型 | TypeScript | 类型安全 |

---

## 3. 目录结构

```
Textline/
├── src/                          # 前端 React 应用
│   ├── main.tsx                  # 入口：createRoot + 渲染 App
│   ├── App.tsx                   # 根组件：渲染 AppRouter
│   ├── App.less
│   ├── router/
│   │   ├── AppRouter.tsx         # 路由判断：/game → GamePage, 其他 → HomePage
│   │   └── index.ts
│   ├── pages/
│   │   ├── home/
│   │   │   ├── HomePage.tsx      # 首页：所有 section + loadingScreen
│   │   │   └── index.ts
│   │   └── game/
│   │       ├── GamePage.tsx       # 独立游戏页路由
│   │       ├── useGameMachine.ts # 游戏状态机（开始/操作/结束）
│   │       ├── useGameConfig.ts  # 读取 URL 参数（embed/fullscreen）
│   │       ├── gameConfig.ts     # URL 构建 + postMessage 工具
│   │       ├── gameData.ts       # 卡牌数据（profile/tech/projects/play）
│   │       └── components/
│   │           ├── GameCanvasScene.tsx   # ASCII 风格 Canvas 渲染
│   │           └── GameVirtualControls.tsx # 移动端虚拟手柄
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx              # 主容器：滚轮处理 + 区块切换逻辑
│   │   │   ├── AppShellScroll.tsx        # AppShellScrollContext Provider
│   │   │   ├── AppShellScrollContext.ts  # 滚动状态 Context
│   │   │   ├── BootProvider.tsx          # BootContext Provider
│   │   │   └── BootContext.ts            # bootComplete: boolean 上下文
│   │   └── shared/
│   │       ├── LoadingScreen.tsx          # 全屏启动动画
│   │       ├── LogoMark.tsx              # 左上角 Logo，点击回首页
│   │       ├── SectionShell.tsx          # section 包裹器（带 id）
│   │       ├── SideDrawer.tsx            # 导航抽屉浮层
│   │       ├── StickyMagneticTitle.tsx   # 粘性标题：模糊+淡出效果
│   │       └── RevealFromBelow.tsx        # 入场动画：从下浮现
│   ├── sections/                  # 页面区块（7 个）
│   │   ├── hero/                 # [0] Hero 首屏
│   │   │   ├── HeroSection.tsx
│   │   │   ├── CharacterSphere.tsx
│   │   │   ├── NameBanner.tsx
│   │   │   └── *.less
│   │   ├── about/                # [1] 关于我
│   │   │   ├── AboutSection.tsx
│   │   │   ├── AboutShowcaseModel.tsx
│   │   │   └── *.less
│   │   ├── skills/               # [2] 技能云
│   │   │   ├── SkillsSection.tsx
│   │   │   └── *.less
│   │   ├── works/                # [3] 代码隧道
│   │   │   ├── WorksSection.tsx
│   │   │   ├── CodeTunnel.tsx
│   │   │   ├── WorksModePanel.tsx
│   │   │   └── *.less
│   │   ├── experience/           # [4] 时间线
│   │   │   ├── ExperienceSection.tsx
│   │   │   ├── ExperienceTimeline.tsx
│   │   │   └── *.less
│   │   ├── playground/           # [5] 六边形蜂巢
│   │   │   ├── PlaygroundSection.tsx
│   │   │   └── *.less
│   │   └── contact/              # [6] 联系方式
│   │       ├── ContactSection.tsx
│   │       └── *.less
│   ├── effects/                  # 视觉特效
│   │   ├── hero/
│   │   │   ├── ThreeSphereScene.tsx  # Three.js 球体 + 文字纹理
│   │   │   └── GooeyReveal.tsx       # SVG gooey 滤镜头像动画
│   │   ├── cursor/
│   │   │   └── MagneticCursor.tsx    # Portal 渲染自定义光标
│   │   ├── background/
│   │   │   └── AsciiWavesBackdrop.tsx # Canvas ASCII 波浪背景
│   │   ├── skills/
│   │   │   └── PhysicsSkillCloud.tsx  # Matter.js 漂浮技能芯片
│   │   ├── text/
│   │   │   ├── ScrollLinger.tsx        # 粘性滚动：固定+模糊
│   │   │   └── ScrollLingerText.tsx     # 别名指向同一文件
│   │   ├── transition/
│   │   │   └── SectionBridge.tsx       # 区块入场/离场动画
│   │   ├── StageBackdrop.tsx        # 背景层容器
│   │   ├── CornerIcon.tsx           # GSAP 动画汉堡菜单图标
│   │   └── *.less
│   ├── hooks/                    # 可复用逻辑
│   │   ├── cursor/
│   │   │   └── useMagneticCursor.ts   # 光标跟踪 + 模式切换
│   │   ├── hero/
│   │   │   ├── useSphereInteraction.ts # 光标-球体距离检测
│   │   │   ├── useTextScatter.ts       # 文字乱码解密效果
│   │   │   └── useFrameLoop.ts         # RAF 循环辅助
│   │   ├── useCooldownGate.ts    # 滚动物理节流门
│   │   ├── useViewportSize.ts    # 窗口尺寸响应式
│   │   ├── useViewportVars.ts    # 动态设置 CSS 变量
│   │   └── useWheelNavigation.ts # 滚轮防抖辅助
│   ├── data/                     # 静态配置数据
│   │   ├── siteData.ts           # 导航、技能、项目、经历、联系方式
│   │   ├── heroConfig.ts         # Hero 配置：名称、球体比例、时机
│   │   ├── heroDataset.ts        # Three.js 球体文字 tokens
│   │   ├── heroNameDataset.ts    # 散字动画字符集
│   │   ├── heroThreeConfig.ts    # Three.js 球体几何参数
│   │   ├── skillsCloudData.ts    # 技能项（group/weight/iconKey）
│   │   ├── skillsIconMap.ts      # 图标 key → simple-icons SVG path 映射
│   │   ├── textFlowTokens.ts     # ASCII 动画字符合集
│   │   ├── sectionBridgeConfig.ts # 各 section 动画曲线配置
│   │   └── backgroundConfig.ts    # 背景遮罩预设（已定义但未使用）
│   ├── styles/
│   │   └── global.less            # 全局样式：reset、CSS 变量、暗色主题
│   └── utils/
│       ├── isBrowser.ts          # SSR 守卫（typeof window !== 'undefined'）
│       └── throttle.ts            # 节流工具（当前未使用）
│
├── api/                          # Express 后端
│   ├── src/
│   │   ├── index.ts              # Express 入口，端口 3001
│   │   ├── types.ts              # API 响应类型
│   │   ├── data/
│   │   │   └── siteData.ts       # 后端数据副本
│   │   ├── routes/
│   │   │   ├── profile.ts         # GET /api/profile
│   │   │   ├── skills.ts         # GET /api/skills
│   │   │   ├── projects.ts       # GET /api/projects
│   │   │   ├── experience.ts     # GET /api/experience
│   │   │   └── contact.ts        # GET /api/contact
│   │   └── utils/
│   │       └── response.ts        # ok() 辅助函数
│   └── dist/                     # 编译产物（.gitignore）
│
├── public/                      # 静态资源
│   ├── avatar.png                # 头像（用于 GooeyReveal）
│   ├── contact/aris.png          # Contact 区块头像
│   ├── models/GB.glb             # 3D 模型（About 区块）
│   └── textline-icon-pack/       # SVG/PNG 图标变体
│
├── scripts/
│   └── video_to_ascii.py         # Python ASCII 视频生成脚本
│
├── dist/                         # 前端构建产物（.gitignore）
├── index.html                    # Vite HTML 入口
├── vite.config.ts                # Vite 配置：React 插件 + API 代理
├── tsconfig.json                 # 项目引用配置
├── tsconfig.app.json             # App TypeScript 配置
├── tsconfig.node.json            # Node TypeScript 配置
├── package.json
└── .gitignore
```

---

## 4. 入口与启动流程

### Frontend 启动链路

```
index.html
  └── <script type="module" src="/src/main.tsx">
        └── main.tsx
              └── createRoot(document.getElementById('root')!)
                    └── <App />
                          └── <AppRouter />
                                ├── /game/*  → <GamePage />
                                └── 其他       → <HomePage />
```

### Backend 启动链路

```
cd api && npm run dev
  └── tsx watch src/index.ts
        └── Express app.listen(3001)
              └── /health, /api, /api/*
```

### 开发模式

需要**两个终端**并行运行：

```bash
# 终端 1：前端
npm run dev

# 终端 2：后端
cd api && npm run dev
```

Vite dev server（3000）会自动将 `/api` 和 `/health` 代理到 `localhost:3001`。

---

## 5. 路由架构

**所有路由均为客户端路由**，服务端只返回 `index.html`。

| URL | 组件 | 说明 |
|-----|------|------|
| `/` | `HomePage` | 主站：7 个 section 垂直堆叠 |
| `/game` | `GamePage` | 独立游戏页（全屏模式） |
| `/game?embed=true` | `GamePage` | 嵌入式游戏（在 About 模型中使用） |

`AppRouter.tsx` 通过 `window.location.pathname` 判断渲染哪个页面：

```typescript
// src/router/AppRouter.tsx
const path = window.location.pathname
if (path.startsWith('/game')) {
  return <GamePage />
}
return <HomePage />
```

---

## 6. 滚动系统（核心导航）

这是整个项目最重要的设计：**没有 URL 跳转，滚动即导航**。

### 工作原理

```
用户滚轮事件 (wheel event)
    ↓
AppShell.tsx 的 handleWheel()
    ↓
targetOffsetRef.current = clampOffset(delta)
    ↓
requestAnimationFrame 动画循环
    ↓
currentOffset → setCurrentOffset()
    ↓
CSS transform: translate3d(0, -currentOffset px, 0)
    ↓
AppShellScrollContext 更新：
  ├── scrollOffset          当前偏移量（px）
  ├── scrollProgress       整体进度（0-1）
  ├── activeIndex          当前活动 section（0-6）
  ├── playgroundRevealProgress  蜂巢展开进度（0-1）
  ├── experienceRevealProgress  时间线展开进度
  ├── worksRevealProgress      作品集展开进度
  ├── scrollPhysicsDirection  物理推力方向
  ├── scrollPhysicsStrength   物理推力强度
  └── scrollPhysicsPulseId    脉冲 ID（用于节流门）
```

### Section 定位

每个 section 高度为 `100vh`，`activeIndex` 计算公式：

```typescript
activeIndex = Math.round(scrollOffset / viewportHeight)
```

### 相邻区块动画

`AppShell` 管理各 section 的 `z-index`：
- 当前活动 section: z=3
- 相邻 section: z=2
- 其他 section: z=1

---

## 7. Context 体系

项目中有两个顶层 Context：

### BootContext

**文件：** `src/components/layout/BootContext.ts`

```typescript
type BootContextType = {
  bootComplete: boolean
}
```

由 `BootProvider.tsx` 提供，在 `LoadingScreen` 动画完成后设置为 `true`。

**消费者：**
- `LogoMark` — bootComplete 后才显示
- `CornerIcon` — bootComplete 后才显示
- `NameBanner` — bootComplete 后才触发动画
- `GooeyReveal` — bootComplete 后才触发动画

### AppShellScrollContext

**文件：** `src/components/layout/AppShellScrollContext.ts`

**Provider：** `AppShellScroll.tsx`（由 `AppShell.tsx` 使用）

```typescript
type AppShellScrollContextType = {
  scrollOffset: number          // 像素偏移
  scrollProgress: number        // 0-1 进度
  viewportHeight: number        // 视口高度
  maxOffset: number             // 最大可滚动偏移
  activeIndex: number           // 当前 section 索引（0-6）
  scrollDirection: 'up' | 'down'
  scrollPhysicsDirection: number // 供物理引擎使用的方向值
  scrollPhysicsStrength: number // 供物理引擎使用的强度值
  scrollPhysicsPulseId: number  // 脉冲 ID（每次方向变化递增）
  playgroundRevealProgress: number  // 0-1
  experienceRevealProgress: number  // 0-1
  worksRevealProgress: number      // 0-1
  requestHome: () => void       // 滚动回首页的回调
}
```

**消费者：** 所有需要响应滚动状态的组件都从这里读取。

---

## 8. 页面与 Sections

### HomePage (`src/pages/home/HomePage.tsx`)

```
HomePage
├── BootProvider
│   └── 包裹整个页面，初始化 BootContext
├── LoadingScreen
│   └── 全屏启动动画（bootComplete 设为 true 后消失）
└── AppShell
    ├── LogoMark（点击 → requestHome）
    ├── CornerIcon（菜单按钮 → 打开 SideDrawer）
    ├── SideDrawer（导航浮层）
    └── main.app-shell__viewport（CSS transform 容器）
        ├── [0] HeroSection
        ├── [1] AboutSection
        ├── [2] SkillsSection
        ├── [3] WorksSection
        ├── [4] ExperienceSection
        ├── [5] PlaygroundSection
        └── [6] ContactSection
```

### Section 详解

#### [0] HeroSection — 首屏

```
HeroSection
├── StageBackdrop
│   └── AsciiWavesBackdrop      # Canvas ASCII 波浪，响应鼠标
├── CharacterSphere
│   └── ThreeSphereScene        # Three.js ribbon 球体 + 文字纹理
├── NameBanner                  # "TEXTLINE" 散字解密动画
├── GooeyReveal                 # SVG gooey 滤镜头像 blob
└── MagneticCursor              # Portal 自定义光标
```

**ThreeSphereScene 技术细节：**
- 球体由 N 条 Ribbon（条带）围绕中心旋转组成
- 每条 Ribbon 上附有从 `heroDataset` 中取样的文字 tokens
- 光标靠近时：粒子碎片从球体表面迸发（`useSphereInteraction`）
- 滚动时：滚动强度通过 `scrollPhysicsStrength/Direction` 传递，推送球体

#### [1] AboutSection — 关于我

```
AboutSection
├── AboutShowcaseModel          # Three.js + GLTF + Raycaster 热点交互
│   ├── GLTF 模型（/models/GB.glb）
│   ├── 热点网格（up/down/left/right/A/B/screen）
│   └── 嵌入 GameCanvasScene 作为模型"屏幕"纹理
└── ScrollLinger               # 粘性标题
```

**热点交互逻辑：**
- Raycaster 检测鼠标悬停热点
- 热点点击派发 `about-showcase-command` 事件：
  - `up/down/left/right` → 更新模型观察角度
  - `A/B` → 按钮反馈动画
  - `screen` → 控制嵌入式游戏

#### [2] SkillsSection — 技能云

```
SkillsSection
├── PhysicsSkillCloud          # Matter.js 物理芯片
└── ScrollLinger
```

**PhysicsSkillCloud 原理：**
- Matter.js `Engine` + `World` 管理所有刚体
- 每个技能_chip 是一个 `Body.rectangle`
- 初始化时从堆叠位置"爆发"发射（随机速度）
- 滚动事件触发 `scrollPhysicsPulse` 冲向力（根据方向推开芯片）
- 指针拖拽可以抓住并投掷芯片（`mouseConstraint`）
- 技能图标通过 `skillsIconMap.ts` 映射 `simple-icons` SVG path 渲染

#### [3] WorksSection — 代码隧道

```
WorksSection
├── CodeTunnel                 # 15 个 CSS 3D 圆环 + 代码片段
└── WorksModePanel             # 项目卡片 3D 深度效果
```

**CodeTunnel 原理：**
- 15 个同心圆环，用 CSS `perspective` + `rotateX/Y` 实现 3D 旋转
- 圆环内显示从 `textFlowTokens.ts` 中抽取的代码片段文字
- 鼠标移动改变 `--tunnel-origin-x/y` CSS 变量，控制透视中心
- 滚动触发 `scrollPhysicsPulse`，推动圆环视差运动

**WorksModePanel 原理：**
- CSS `transform-style: preserve-3d` + `rotateY` 实现 3D 卡片深度
- 鼠标在面板内移动驱动卡片 X/Y 旋转角度
- `worksRevealProgress` 控制入场时机

#### [4] ExperienceSection — 时间线

```
ExperienceSection
├── ExperienceTimeline
│   ├── SVG 贝塞尔曲线路径
│   ├── Matter.js 绳索（卡片从路径锚点垂下）
│   ├── GSAP MotionPathPlugin（鼠标沿线移动动画）
│   └── feTurbulence 滤镜（位移扭曲效果）
└── ScrollLinger
```

**ExperienceTimeline 原理：**
- SVG `<path>` 定义曲线路径
- GSAP `MotionPathPlugin.path` 让一个元素沿线运动
- 鼠标移动为 warp 滤镜注入能量（强度与光标距中心距离成正比）
- Matter.js `Constraint` 绳索将经历卡片悬挂在路径锚点上

#### [5] PlaygroundSection — 蜂巢

```
PlaygroundSection
├── Honeycomb 网格
│   ├── 轴坐标系（axial coordinate system）
│   ├── 六边形格子（q, r → 像素坐标）
│   ├── 指针拖拽移动世界（camera = -worldPos）
│   ├── 惯性衰减（Friction）
│   └── 双击重置
└── 每个格子显示项目信息（图片、标题、栈、状态）
```

**蜂巢数学：**
```typescript
// 六边形像素坐标计算
function hexToPixel(q, r, size) {
  const x = size * (3/2 * q)
  const y = size * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r)
  return { x, y }
}
```

#### [6] ContactSection — 联系方式

```
ContactSection
├── Canvas 背景
└── Matter.js 绳索物理
    ├── 锚点：标题 "SAY HELLO"
    ├── Payload：头像图片（aris.png）
    └── 指针拖拽移动 Payload，强力拉动触发 requestHome()
```

**ContactSection 原理：**
- Matter.js `Body`（Payload）+ `Constraint`（绳索）
- 指针拖拽使用 `mouseConstraint`
- 滚动事件给 Payload 添加向上的冲力（`Body.applyForce`）
- 检测到强力拉动时调用 `requestHome()`，带回首页

---

## 9. 共享组件

### SectionShell

```typescript
// src/components/shared/SectionShell.tsx
// 包裹每个 section，提供 <section id={id}> 标签
<SectionShell id="hero">
  {children}
</SectionShell>
```

### StickyMagneticTitle

粘性悬浮标题，带有以下效果：
- **模糊效果**：随滚动渐变模糊
- **淡出效果**：随滚动渐变透明度
- **磁吸效果**：靠近可交互元素时光标被吸引

### ScrollLinger

"粘性滚动"效果——内容在滚动过程中被固定在视口顶部：

```typescript
// 消费 AppShellScrollContext.scrollOffset
// 计算 pinnedTranslateY，当区块接近顶部时"粘"住
// 同时更新 backdropFilter blur 和 opacity
```

### SectionBridge

每个 section 的入场/离场动画：

```typescript
// 基于 scrollProgress 计算 transformY 和 opacity
// 使用 sectionBridgeConfig.ts 中定义的分段曲线
// 离场时：translateY(-liftPx), opacity → 0
// 入场时：translateY(0), opacity → 1
```

### MagneticCursor

Portal 渲染的自定义光标：
- 追踪 `.magnetic-target` 类元素
- 靠近时光标被磁吸拉动（通过 `useMagneticCursor` hook）
- 根据当前所在区域切换模式（tunnel / grid / default）

### LoadingScreen

全屏启动画面：
- GSAP 时间线动画（进度条推进）
- 完成后 `bootComplete = true`，Curtain 动画升起消失

### LogoMark

左上角 Logo，点击触发 `requestHome()` 回首页。

### SideDrawer

导航抽屉浮层：
- 7 个 section 对应 7 个导航项
- 点击导航项滚动到对应 section（通过 `AppShell` 的滚动控制）

---

## 10. 视觉特效模块

### ThreeSphereScene (`src/effects/hero/ThreeSphereScene.tsx`)

**技术：** Three.js + React Three Fiber 风格（但使用原生 Three.js API）

**球体构成：**
- `SphereGeometry` 作为基础
- N 条 `BufferGeometry` Ribbon 围绕球体表面
- 每个 Ribbon 携带文字 texture（canvas 生成）
- `requestAnimationFrame` 旋转 + 光标交互

**参数来源：** `heroThreeConfig.ts`（球体半径、条带数量、旋转速度等）

**光标交互：** `useSphereInteraction.ts` 检测光标-球体距离，触发碎片粒子迸发

### GooeyReveal (`src/effects/hero/GooeyReveal.tsx`)

**技术：** SVG filter + Motion 动画

```svg
<filter id="gooey">
  <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
  <feColorMatrix in="blur" mode="matrix" values="..." />
</filter>
```

- `feGaussianBlur` 模糊源图形
- `feColorMatrix` 将模糊色块"固化"形成果冻质感
- Motion 的 `animate()` 驱动 blob 形态变化

### AsciiWavesBackdrop (`src/effects/background/AsciiWavesBackdrop.tsx`)

**技术：** HTML Canvas

- Canvas 覆盖全屏
- 绘制 ASCII 字符网格（`textFlowTokens.ts` 字符合集）
- 字符亮度随鼠标位置产生波纹衰减
- `requestAnimationFrame` 逐帧重绘

### PhysicsSkillCloud (`src/effects/skills/PhysicsSkillCloud.tsx`)

**技术：** Matter.js（与 `src/sections/skills/SkillsSection.tsx` 是同一个组件的两种导入路径）

### MagneticCursor (`src/effects/cursor/MagneticCursor.tsx`)

**技术：** ReactDOM.createPortal

- 光标渲染在 `<body>` 根级别，不受滚动容器 `overflow: hidden` 裁剪
- 监听全局 `mousemove`
- 读取所有 `.magnetic-target` 元素位置
- 光标位置 = 鼠标位置 + 磁吸偏移量（lerp 平滑插值）

### CornerIcon (`src/effects/CornerIcon.tsx`)

**技术：** GSAP

- SVG 线条动画（三条线 → X 关闭）
- 协调动画：`gsap.timeline()` 控制各线条的 `stroke-dashoffset`

---

## 11. 自定义 Hooks

### useMagneticCursor (`src/hooks/cursor/useMagneticCursor.ts`)

```typescript
const { cursorPos, isNearMagnetic, mode } = useMagneticCursor()
// cursorPos: { x, y }
// isNearMagnetic: boolean
// mode: 'default' | 'tunnel' | 'grid' | 'drag'
```

管理自定义光标的全局状态，根据不同区域的 CustomEvent 切换模式。

### useSphereInteraction (`src/hooks/hero/useSphereInteraction.ts`)

```typescript
const { nearSphere, distance } = useSphereInteraction()
// nearSphere: 光标是否靠近球体
// distance: 光标到球体距离（用于控制粒子迸发强度）
```

### useTextScatter (`src/hooks/hero/useTextScatter.ts`)

```typescript
const { scrambled, done } = useTextScatter(targetText)
// scrambled: 当前显示的乱码字符串
// done: 是否已完成解密
```

实现名字的"解密"动画效果。

### useFrameLoop (`src/hooks/hero/useFrameLoop.ts`)

```typescript
const stop = useFrameLoop((dt) => { ... })
// 在 requestAnimationFrame 中运行逻辑
// dt: 帧间隔（秒）
// stop(): 停止循环
```

### useCooldownGate (`src/hooks/useCooldownGate.ts`)

```typescript
const { pass, cooldown } = useCooldownGate(500)
// pass(): 若在冷却期返回 false，否则触发并重置冷却
// cooldown: 当前是否在冷却中
```

用于滚动物理冲力的节流——防止滚动事件过频触发 Matter.js 冲力。

### useViewportSize (`src/hooks/useViewportSize.ts`)

```typescript
const { width, height } = useViewportSize()
// 返回 window.innerWidth 和 window.innerHeight
// 响应 resize 事件
```

### useViewportVars (`src/hooks/useViewportVars.ts`)

```typescript
useViewportVars()
// 在 :root 上设置 CSS 变量 --vh（解决移动端 100vh 问题）
// 同时设置 --app-width, --app-height
```

### useWheelNavigation (`src/hooks/useWheelNavigation.ts`)

```typescript
const handleWheel = useWheelNavigation({ debounceMs: 100 })
// 对 wheel 事件进行防抖处理
// 返回的事件处理函数传给 AppShell
```

---

## 12. 数据层

### siteData.ts (`src/data/siteData.ts`)

主数据文件，包含：

```typescript
navItems: { label, href }[]           // 导航项（7 个 section）
skills: Skill[]                        // 技能列表
playgroundProjects: PlaygroundProject[] // 蜂巢项目
experienceItems: Experience[]          // 经历条目
contactLinks: ContactLink[]            // 联系方式链接
```

### heroConfig.ts (`src/data/heroConfig.ts`)

```typescript
displayName: "TEXTLINE"               // 显示名称
nameBannerRatio: number               // NameBanner 区域比例
sphereRatio: number                   // 球体区域比例
timings: { introDuration, ... }       // 动画时机配置
```

### heroDataset.ts (`src/data/heroDataset.ts`)

球体文字 tokens：`['TEXTLINE', 'REACT', 'ARIS', 'AI', 'PYTHON', ...]`

### heroThreeConfig.ts (`src/data/heroThreeConfig.ts`)

Three.js 球体参数：
```typescript
{
  radius,          // 球体半径
  ribbonCount,    // 条带数量
  ribbonWidth,    // 条带宽度
  rotationSpeed,  // 自转速度
  textScrollSpeed, // 文字滚动速度
  particleCount,  // 碎片粒子数量
  ...
}
```

### skillsCloudData.ts (`src/data/skillsCloudData.ts`)

```typescript
Skill {
  name: string
  group: 'frontend' | 'backend' | 'devops' | 'tools'
  weight: number       // 影响 Matter.js 初始速度
  iconKey: string      // 映射到 skillsIconMap.ts
}
```

### skillsIconMap.ts (`src/data/skillsIconMap.ts`)

```typescript
// iconKey → simple-icons SVG path 映射
const map: Record<string, string> = {
  react: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10...",
  typescript: "M3 3h18v18H3V3zm7.5 15.5l2-7.5 2 7.5 2-2.5 2 2.5-2 7.5-2-7.5-2 2.5-2-2.5z",
  ...
}
```

### sectionBridgeConfig.ts (`src/data/sectionBridgeConfig.ts`)

每个 section 的入场/离场动画曲线配置：

```typescript
{
  hero:     { enterY: -40, exitY: 30, ... },
  about:    { enterY: -50, exitY: 40, ... },
  skills:   { enterY: -30, exitY: 25, ... },
  works:    { enterY: -60, exitY: 50, ... },
  experience:{ enterY: -35, exitY: 45, ... },
  playground:{ enterY: -45, exitY: 35, ... },
  contact:  { enterY: -55, exitY: 55, ... },
}
```

---

## 13. 后端 API

### 路由一览

| 路由 | 方法 | 文件 | 响应 |
|------|------|------|------|
| `/health` | GET | `api/src/index.ts` | `{ status: 'healthy' }` |
| `/api` | GET | `api/src/index.ts` | API 路由列表 |
| `/api/profile` | GET | `api/src/routes/profile.ts` | Profile 对象 |
| `/api/skills` | GET | `api/src/routes/skills.ts` | SkillGroup[] |
| `/api/projects` | GET | `api/src/routes/projects.ts` | Project[] |
| `/api/experience` | GET | `api/src/routes/experience.ts` | Experience[] |
| `/api/contact` | GET | `api/src/routes/contact.ts` | profile.links |

### 响应格式

```typescript
type ApiResponse<T> = {
  success: boolean
  data: T
  message: string
  timestamp: number
}
```

### API 工具函数

```typescript
// api/src/utils/response.ts
import { ok } from '../utils/response.ts'

// 在路由中使用：
router.get('/profile', (req, res) => {
  res.json(ok(profile))
})
```

### 当前状态

> ⚠️ **重要提示：** 后端 API 存在但**未被前端连接使用**。前端所有数据均来自 `src/data/siteData.ts` 模拟数据。要让前端使用真实 API，需要在 React 组件的 `useEffect` 中调用 `fetch('/api/profile')` 并将返回值设置到组件状态中。

### Vite 代理配置

```typescript
// vite.config.ts
proxy: {
  '/api': { target: 'http://localhost:3001', changeOrigin: true },
  '/health': { target: 'http://localhost:3001', changeOrigin: true },
}
```

---

## 14. 样式系统

### 架构

```
Less 预处理器
  ↓
每个组件一个 .less 文件（与组件同目录）
  ↓
CSS Custom Properties（动态值通过 JS 注入）
  ↓
global.less 定义全局 CSS 变量
```

### 全局 CSS 变量（abyssal 暗色主题）

```less
:root {
  --abyssal-bg: #0d1117;            // 主背景
  --abyssal-surface: #111826;       // 卡片表面
  --abyssal-text: #f5f7fa;          // 主文字
  --abyssal-muted: #8b949e;         // 次要文字
  --abyssal-border: rgba(168, 230, 255, 0.14);
  --abyssal-ember: #a8e6ff;         // 强调色（青色）
  --abyssal-cyan: #ffd1dc;          // 次强调色（粉色）
  --abyssal-ember-glow: rgba(168, 230, 255, 0.25);
}
```

### 滚动驱动动画模式

```typescript
// 通过 JS 动态设置 CSS 变量
style={{
  transform: `translate3d(0, ${transformY}px, 0)`,
  opacity,
  '--section-progress': String(scrollProgress),
  '--playground-reveal-progress': String(revealProgress),
}} as CSSProperties
```

```less
// 在 .less 文件中使用
.my-element {
  transform: translateY(calc(var(--section-progress) * 100px));
  opacity: calc(1 - var(--section-progress));
}
```

### CSS-only 3D 动画（CodeTunnel）

```less
.tunnel-ring {
  transform-style: preserve-3d;
  perspective: 800px;
  .ring-inner {
    transform: rotateX(var(--ring-rotate-x)) rotateY(var(--ring-rotate-y));
  }
}
```

---

## 15. 自定义事件（跨组件通信）

项目使用原生 CustomEvent 进行跨组件通信，无需状态管理库：

| 事件名 | 派发位置 | 监听位置 | 用途 |
|--------|----------|----------|------|
| `game-control` | `AboutShowcaseModel`（热点点击） | `GameCanvasScene`（About 内嵌游戏） | 控制游戏中角色移动 |
| `works-tunnel-cursor-state` | `CodeTunnel` | `useMagneticCursor` | 切换光标模式为 tunnel |
| `playground-grid-cursor-state` | `PlaygroundSection` | `useMagneticCursor` | 切换光标模式为 grid/drag |
| `about-showcase-command` | `GamePage`（独立游戏页） | `AboutShowcaseModel` | 远程控制 About 模型热点 |

```typescript
// 派发示例
window.dispatchEvent(new CustomEvent('game-control', {
  detail: { key: 'up', pressed: true }
}))

// 监听示例
useEffect(() => {
  const handler = (e: CustomEvent) => { ... }
  window.addEventListener('game-control', handler)
  return () => window.removeEventListener('game-control', handler)
}, [])
```

---

## 16. 构建与开发

### npm scripts

```json
{
  "dev": "vite",                          // 前端开发服务器（端口 3000）
  "build": "tsc -b && vite build",       // 生产构建
  "preview": "vite preview",             // 预览构建产物
  "ascii:video": "python scripts/video_to_ascii.py"
}
```

### API scripts

```json
// api/package.json
{
  "dev": "tsx watch src/index.ts",       // 开发运行（端口 3001）
  "build": "tsc",                        // 编译 TypeScript
  "start": "node dist/index.js"          // 生产启动
}
```

### Vite 配置

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: true,
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
      '/health': { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
})
```

### TypeScript 配置

- `tsconfig.json` — 项目引用（app + node）
- `tsconfig.app.json` — Frontend（DOM + ES2023, react-jsx）
- `tsconfig.node.json` — Node（vite.config.ts）

---

## 17. 架构设计理念

### 滚动即导航

整个网站没有传统的页面跳转。用户通过滚轮或拖拽在垂直堆叠的 7 个 `100vh` 区块之间"滑动"。这消除了 URL 跳转的割裂感，使整个体验像是一个连贯的"舞台"。

### 物理引擎无处不在

Matter.js 被用于 4 个独立区域（技能云、体验时间线、联系区域绳索、蜂巢惯性），Three.js 处理球体和 3D 模型。这意味着项目中实际有两套"物理世界"在同时运行。

### CSS 变量作为动画驱动

滚动状态（`scrollProgress`、`revealProgress`）通过 `AppShellScrollContext` 注入为 CSS 变量，使得样式层（Less）和逻辑层（TypeScript）解耦。CSS 负责插值计算，JS 负责提供原始值。

### 自定义光标即品牌

`MagneticCursor` 通过 React Portal 在根级别渲染，完全脱离滚动容器的 `overflow: hidden` 裁剪限制，可以自由追踪鼠标并产生磁吸效果。

### 无状态管理库

全项目仅使用 React 内置机制：
- `useState` / `useRef` — 组件局部状态
- `Context` — 全局状态（滚动、Boot）
- `CustomEvent` — 跨组件通信

这与流行的 Redux/Zustand/Jotai 方案相比，依赖更少、bundle 更小。

### 后端作为数据 API 层

Express 后端将所有数据通过 REST API 暴露，但目前前端使用模拟数据直接导入。这为将来的 CMS 集成或动态数据源提供了基础架构。

---

*文档版本：1.0.0 | 生成日期：2026-05-07*
