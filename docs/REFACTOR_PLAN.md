# Textline 重构计划

更新时间：2026-05-15

## 目标

把当前的主页和游戏页从“混合壳层”整理成清晰的分层结构，降低耦合，避免滚动、加载、光标、特效互相污染。

## 现在的核心问题

1. `HomePage` 同时负责加载态、全局注入、页面结构和交互门闸。
2. `AppShell` 同时负责滚动导航、板块尺寸、板块 reveal、全局光标、首页回调。
3. Hero 相关逻辑混入了全局状态，导致光标和 three.js 场景容易互相影响。
4. `BootContext` / `AppShellScrollContext` 里既有 UI 状态，也有交互状态，语义不够单一。
5. 页面级特效大量依赖 CustomEvent，跨组件边界不够清楚。
6. 现在的“预加载”更多是启发式挂载，不是统一的资源生命周期管理。

## 建议的目标架构

### 1. 应用入口层

只保留两个职责：

- 根据路由选择 `HomePage` 或 `GamePage`
- 注入最外层 provider

建议后续入口只做：

- `AppRouter`
- `AppProviders`

### 2. 页面编排层

`HomePage` 只负责：

- 加载态
- 全局页面数据准备
- 将页面编排传给 `HomeLayout`

`GamePage` 只负责：

- game 配置
- game machine
- game UI 编排

### 3. 布局壳层

`AppShell` 只负责：

- section 堆叠
- 滚动位置同步
- active section 计算
- section bridge 和页面节距

不再直接承担：

- 光标渲染
- Hero 特殊启动逻辑
- 页面级业务状态

### 4. 交互层

把全局交互分成三类：

- `boot`：加载完成、进入正式交互
- `scroll`：滚动状态、当前板块、预加载窗口
- `pointer`：磁吸光标、hover target、模式切换

### 5. 特效层

每个特效只接收最少必要输入：

- `Hero` 的 three 场景只接收 `enabled`、`scroll impulse`、`pointer state`
- `About` 的模型只接收 `enabled`、`screen state`
- `Works` / `Playground` / `Contact` 只接收自己的局部能量状态

## 推荐拆分顺序

### Phase 1：先收敛入口和上下文

- 把 `BootContext` 还原成只管 boot
- 新增独立的 `InteractionContext`
- 让 `AppShellScrollContext` 只管滚动，不再塞别的状态

### Phase 2：拆 `AppShell`

- 滚动计算独立成 hook
- section 布局独立成组件
- 全局光标移出 `AppShell`

### Phase 3：拆 Hero

- Hero 的 three 场景、名字、头像、背景分开
- ready / preload / visible 三种状态明确分开
- `CharacterSphere` 只管场景，不管页面编排

### Phase 4：拆各区块

- About：模型控制与屏幕纹理分离
- Works：隧道和面板分离
- Experience：时间线和交互拖拽分离
- Playground：蜂巢数据层和渲染层分离
- Contact：物理 rig 和 canvas 渲染分离

### Phase 5：统一资源生命周期

- 所有重资源统一走 `enabled`
- 预加载窗口统一走一个 hook
- 页面离开后确保释放 GPU / Matter / RAF / 事件监听

## 目录建议

```text
src/
├── app/                # 应用入口、路由、providers
├── layouts/            # 页面布局壳层
├── pages/
├── sections/
├── features/           # 按业务域拆分的交互和特效
├── shared/             # 通用组件
├── hooks/
├── data/
├── styles/
└── utils/
```

## 重构原则

1. 页面编排和交互逻辑分离。
2. 复杂特效只依赖最少输入。
3. 全局状态只保留真正全局的内容。
4. 不再通过“谁先挂载谁就能控制一切”来串逻辑。
5. 先稳定结构，再恢复视觉。

## 当前建议

先不要继续在原结构上做碎修。下一步应该：

1. 先把 `AppShell`、`BootContext`、`HeroSection` 的职责边界定死。
2. 再把 Hero 相关逻辑整理成独立 feature。
3. 最后再处理其它 section 的统一预加载和释放策略。
