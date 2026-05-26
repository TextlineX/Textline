# About Section Animation Skill

## 概述
About 页面使用弹幕效果展示多组内容，每组包含：
- 多条弹幕文字（从右向左飞入）
- 一个 SVG 图形（固定在屏幕中央）

## 动画阶段

```
┌─────────────┐
│  弹幕飞入   │ ← 文字从屏幕右侧飞入到左侧
└──────┬──────┘
       ↓
┌─────────────┐
│   锁定等待   │ ← 等待所有文字进入完成
└──────┬──────┘
       ↓
┌─────────────┐
│  SVG 变形   │ ← SVG 播放动画/切换形态
└──────┬──────┘
       ↓
┌─────────────┐
│  下一组进入  │ ← 滚动触发下一组
└─────────────┘
```

## 数据结构

```ts
type TextItem = {
  content: string          // 文字内容
  position: 'left' | 'center' | 'right'  // 水平位置
  top?: number           // 垂直位置百分比 (0-100)
  fontClass?: 'hand' | 'normal'
}

type ContentGroup = {
  texts: TextItem[]       // 该组的所有文字
  svgType: 'rings' | 'spiral' | 'wave' | 'particles'
  svgColor: string        // SVG 主色调
  svgAnimation?: 'rotate' | 'pulse' | 'morph'
}
```

## 弹幕文字布局

```css
/* 文字容器 - 覆盖整个视口 */
.about-text-layer {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
}

/* 文字样式 - absolute 定位 */
.about-text {
  position: absolute;
  left: 5%;  /* left 位置 */
  /* 或 */
  right: 5%; /* right 位置 */
  /* 或 */
  left: 50%; transform: translateX(-50%); /* center 位置 */
}

/* 弹幕飞入 - 从右侧飞入 */
@keyframes barrage-enter {
  from {
    transform: translateX(120vw);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

## SVG 类型

| 类型 | 形态 | 说明 |
|-----|------|-----|
| `rings` | 双圆环 | 外圈 + 内圈 |
| `spiral` | 螺旋线 | 旋转螺旋 |
| `wave` | 波浪线 | 波动曲线 |
| `particles` | 粒子点 | 散点分布 |

## GSAP 实现

```ts
// 1. 弹幕飞入动画
texts.forEach((text, i) => {
  gsap.set(text, { x: '120%', opacity: 0 })
  tl.to(text, {
    x: '0%',
    opacity: 1,
    duration: 0.8,
    ease: 'power2.out'
  }, i * delayStep)
})

// 2. 等待文字全部进入
tl.add(() => {}, '+=0.5') // 等待 0.5s

// 3. SVG 动画
tl.to(svgElement, {
  rotation: 360,
  duration: 2,
  ease: 'none'
}, 0)
```

## 关键样式

```less
.about-text-layer {
  position: sticky;
  top: 0;
  left: 0;
  z-index: 2;
  width: 100%;
  height: 100vh;
  pointer-events: none;
}

.about-text {
  position: absolute;
  will-change: transform, opacity;
}

.about-text--left {
  left: 5%;
  text-align: left;
}

.about-text--center {
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}

.about-text--right {
  right: 5%;
  text-align: right;
}
```

## 注意事项

1. **pointer-events: none** - 文字层不能阻挡 SVG 交互
2. **sticky 定位** - 让内容在滚动时锁定在屏幕
3. **will-change** - 优化动画性能
4. **top 位置** - 每条文字需要不同的 top 值避免叠加