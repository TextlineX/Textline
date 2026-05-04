# Hero 交互装置设计说明

版本：`v0.1`
状态：结构方案

## 1. 目标

这个 Hero 不是普通首屏，而是一个“交互式人格装置”。

核心表达由三部分组成：

- 顶部名字：稳定身份锚点
- 中央字符球：逻辑母体与信息宇宙
- 边缘融球：真实情绪与温度泄露

用户不是在看信息，而是在“进入规则”。

## 2. 视觉结构

### 2.1 顶部名字

- 文本：`Textline`
- 位置：绝对顶部居中
- 字体：宽扁的 Monospace
- 动画：1 秒内字符扰动，随后同步锁定

要求：

- 先乱序，再收束
- 最终态必须稳定、干净、白色
- 不能一开始就直接展示最终字样

### 2.2 中央字符球

- 中心元素：字符云 / 球体
- 占比：屏幕视觉中心，约 60% 主视觉面积
- 形式：`Three.js` 粒子球或 `Points` 球
- 数据来源：`dataset[]`

字符集建议包含：

- 代码片段
- 感性词汇
- 二次元/私有语汇
- 逻辑碎片

要求：

- 球体要有持续轻微运动
- 不要做成静态装饰
- 字符必须是“动态实体”，不是贴图

### 2.3 融球头像

- 触发：鼠标接近球体边缘
- 效果：边缘 gooey / 液态溢出
- 内容：头像露出

要求：

- 头像只在交互触发后显现
- 头像和字符球要形成强对比
- 融球感要有张力，不是单纯渐隐

## 3. 交互规则

### 3.1 鼠标样式

- 禁止默认箭头样式
- 使用极简十字准星
- 准星可显示坐标信息

### 3.2 吸附机制

- 鼠标接近球体边缘时产生磁吸
- 自由移动收束为沿圆周滑动
- 交互要有“被规则抓住”的感觉

### 3.3 连续触发控制

- 采用可配置延迟
- 在延迟时间内发生的连续滚轮输入要合并
- 结束后才允许下一次切换

这个逻辑建议独立写成 hook，不要塞进组件。

## 4. 技术拆分

### 4.1 组件拆分

- `HeroSection`
- `NameBanner`
- `CharacterSphere`
- `MagneticCursor`
- `GooeyReveal`
- `HeroAvatar`

### 4.2 行为脚本拆分

- `useTextScatter`
- `useSphereInteraction`
- `useMagneticCursor`
- `useGooeyState`
- `useFrameLoop`

### 4.3 工具函数拆分

- `calcDistance`
- `calcAngle`
- `clamp`
- `snapToCircle`
- `shuffleChars`

### 4.4 数据拆分

- `heroDataset`
- `heroCopy`
- `heroConfig`

## 5. 目录建议

```text
src/
├── sections/
│   └── HeroSection/
│       ├── HeroSection.tsx
│       ├── HeroSection.less
│       ├── NameBanner.tsx
│       ├── CharacterSphere.tsx
│       ├── MagneticCursor.tsx
│       ├── GooeyReveal.tsx
│       └── HeroAvatar.tsx
├── hooks/
│   ├── useTextScatter.ts
│   ├── useSphereInteraction.ts
│   ├── useMagneticCursor.ts
│   ├── useGooeyState.ts
│   └── useFrameLoop.ts
├── utils/
│   ├── calcDistance.ts
│   ├── calcAngle.ts
│   ├── snapToCircle.ts
│   └── shuffleChars.ts
├── data/
│   └── heroDataset.ts
└── effects/
    └── hero/
        ├── SphereScene.ts
        ├── cursorRenderer.ts
        └── gooeyFilter.ts
```

## 6. 实现要求

### 6.1 先结构，后效果

- 先搭骨架
- 再接行为
- 最后接视觉和材质

### 6.2 组件只管渲染

- 组件不要承载复杂逻辑
- 复杂逻辑统一放 hook / utils
- 这样后续改交互不会把 UI 打碎

### 6.3 样式必须分离

- 每个组件独立 `.less`
- 测试样式单独放 `src/styles/test.less`
- 全局只保留 reset 和基础变量

### 6.4 交互必须可配置

建议参数化：

- `delayMs`
- `lockRadius`
- `sphereRadius`
- `spinSpeed`
- `datasetSize`

## 7. 你需要先确认的输入项

在真正开始做之前，最好先定这些内容：

- 顶部名字最终是否固定为 `Textline`
- 字符集的来源是你手动提供，还是我先给默认集合
- 头像是否已经准备好
- 中央球体是偏 3D，还是偏 2.5D 粒子感
- 磁吸范围要强还是弱
- 融球触发是仅 hover，还是 hover + click
- 首屏是否允许用户直接进入下一屏

## 8. 我的建议

### 8.1 先做最小可运行版本

先不要一次性把所有效果塞满，建议第一版只做：

- 顶部名字扰动收束
- 一个字符球
- 一个基础磁吸准星
- 一个简单 gooey 过渡

### 8.2 字符集先手工配置

先不要接复杂数据源，先用你明确认可的一小组字符：

- `null`
- `ptr`
- `Alice`
- `夢`
- `01`

这样更容易验证氛围。

### 8.3 动效参数先做成常量

不要把参数散落在逻辑里，建议单独放配置文件，后面调手感会快很多。

### 8.4 保留降级方案

如果 `Three.js` 场景性能不够，至少保留：

- 文字扰动
- 简化字符球
- 准星
- gooey outline

## 9. 风险提示

- `Three.js` 球体 + gooey + 磁吸 + 自定义光标，组合起来性能压力不低
- HMR 阶段改 hook 容易触发热更新问题
- 交互过强时，注意不要把首屏做得“只有效果没有可读性”

## 10. 当前结论

这版 Hero 的本质是：

- 一个名字锚点
- 一个信息球体
- 一个边界触发的情绪泄露层

它不是展示模板，而是一个可交互的身份装置。
