# Textline

一个面向个人表达的全屏主页项目。

它不是普通的简历页，而是一个把身份、作品、技术审美和交互装置合在一起的个人站点。当前版本采用 `Vite + React + TypeScript + Less`，主视觉围绕 `Textline` 名字、Hero 字符球、自定义光标、磁吸交互和分板块滚动结构展开。

## 当前定位

- 全屏单页主页
- 视觉优先，信息分板块承载
- 组件化拆分，效果和业务解耦
- 先用本地 mock 数据，API 以后单独拆
- 样式统一使用 `Less`

## 技术栈

- `Vite`
- `React`
- `TypeScript`
- `Less`
- `three.js`
- `motion`

## 当前板块

页面目前按以下顺序组织：

1. `Hero`
2. `About`
3. `Skills`
4. `Works`
5. `Experience`
6. `Playground`
7. `Contact`

## 当前实现

- `Hero` 首屏主视觉
- `three.js` 字符球场景
- `Textline` 名字触发的 Gooey Reveal 头像
- 自定义磁吸光标
- 左上角 Logo 回到首页顶部
- 右上角菜单和侧边栏
- 全屏加载动画
- 分板块滚动导航
- 单独的背景层和测试样式层
- `About` 已改成左侧身份叙事 + 右侧叠放档案卡的双栏结构
- `About` 背景增加了光栅网格与发光点阵
- `About` 卡片已收敛为更实的档案面板，不再走玻璃光栅卡路线
- 当前 `About` 标题只保留 `IDENTITY`
- About 内部磁吸只对当前激活卡片生效，避免整组抢吸附

## 目录结构

```text
src/
├── components/   # 通用组件和布局
├── sections/     # 页面分板块内容
├── effects/      # 背景、光标、Hero 特效
├── hooks/        # 可复用逻辑
├── data/         # mock 数据和配置
├── styles/       # 全局样式和测试样式
├── utils/        # 公共工具
└── App.tsx
```

## 本地运行

```bash
npm install
npm run dev
```

构建：

```bash
npm run build
```

预览：

```bash
npm run preview
```

## 项目约定

- 所有模块按板块和功能拆分
- 每个组件配一个独立 `Less` 文件
- 全局样式只放基础变量、重置和通用规范
- 占位符保持极简，不抢主视觉
- 头像、名字、光标吸附逻辑要分开管理
- About 的视觉重心偏左，右侧卡片只做档案承载，不做噪音堆叠

## 当前数据策略

- 作品、技能、经历、联系方式先使用本地 mock 数据
- API 暂时不接真实平台
- 后续如果需要动态数据，再单独拆 `api/` 项目

## 部署建议

- 前端优先考虑 `Cloudflare Pages`
- 后端 API 如果后续启用，优先考虑 `Cloudflare Workers`

## 说明

仓库里的视频背景方案已经不再作为当前主实现，现阶段主方向是：

- 收敛视觉噪音
- 保持全屏结构
- 强化 Hero 交互和板块分层
- 用 mock 数据先把网站结构和效果跑通
- About 作为 Hero 后的身份缓冲层，采用更大的左侧叙事、更实的右侧面板和背景光栅点阵
