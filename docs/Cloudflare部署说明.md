# Cloudflare 部署说明

适用对象：`Textline` 前端主页

## 1. 推荐方式

推荐使用 `Cloudflare Pages` 直接连接 GitHub 仓库部署。

这样你每次推送到 `main` 分支后，Cloudflare 都可以自动重新构建并发布。

## 2. 本项目部署参数

当前仓库是 `Vite + React + TypeScript + Less`，所以 Pages 的核心参数如下：

- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: 留空
- Production branch: `main`

## 3. 在 Cloudflare Pages 里怎么填

### 方式 A：GitHub 导入

1. 进入 Cloudflare Dashboard
2. 打开 `Workers & Pages`
3. 选择 `Create application`
4. 选择 `Pages`
5. 选择 `Connect to Git`
6. 绑定你的 GitHub 仓库 `Textline`
7. 在构建设置里填：
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: 不填
8. 保存并部署

### 方式 B：本地直传

适合你想先本地 build 再手动发版。

1. 本地执行：

```bash
npm run build
```

2. 上传 `dist/` 目录到 Cloudflare Pages

注意：

- 直传适合临时发版
- 如果你想要自动部署，优先用 GitHub 导入

## 4. 环境变量

如果以后前端要读 API 地址，建议在 Cloudflare Pages 里设置：

- `VITE_API_BASE_URL`

说明：

- Vite 只会把以 `VITE_` 开头的变量暴露给前端代码
- 本地开发时可以放到 `.env.development`
- 线上在 Cloudflare Pages 的 Environment variables 里配置

## 5. 现在这个项目是否需要 API

当前不需要真实 API。

建议先这样：

- 前端直接用本地 mock 数据
- API 项目先不接真实平台
- 等主页效果稳定后，再把 `api/` 单独接上

## 6. 关于 SPA 路由

如果后面你加了前端路由，建议再补一个 Cloudflare 重写规则，让刷新不 404。

如果当前只是单页滚动主页，这一步可以先不做。

## 7. 当前结论

你这个项目现在最合适的部署方式是：

- 前端仓库直接导入到 Cloudflare Pages
- 构建参数就是 `npm run build` 和 `dist`
- API 先不单独部署
- 先把主页跑起来，再考虑 Workers
