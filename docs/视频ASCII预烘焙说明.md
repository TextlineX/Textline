# 视频 ASCII 预烘焙说明

## 目标

把本地视频预处理成 ASCII 风格视频，作为 Hero 背景的参考输入。

## 命令

```bash
npm run ascii:video -- public/videos/hero-black-liquid.mp4 public/videos/hero-black-liquid-ascii.mp4
```

## 常用参数

```bash
npm run ascii:video -- public/videos/hero-black-liquid.mp4 public/videos/hero-black-liquid-ascii.mp4 --cols 132 --width 1280 --height 720 --fps 12
```

## 参数说明

- `--cols`: ASCII 列数，越大越细腻，但越慢
- `--width` / `--height`: 输出视频分辨率
- `--fps`: 输出帧率，默认 12，适合背景循环
- `--font-size`: 字体大小
- `--seconds`: 只处理前几秒，适合先做样片

## 推荐工作流

1. 先拿 `public/videos/hero-black-liquid.mp4` 试跑样片
2. 看 ASCII 颗粒感和节奏是否符合主题
3. 再导出完整视频
4. 最后把生成结果接回当前背景层

## 建议

- 背景视频不要太亮
- ASCII 输出不要太密
- Hero 优先保留大面积黑场，避免抢前景主视觉
