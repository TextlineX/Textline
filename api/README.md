# Textline API

本项目是个人主页的独立 API 服务，当前先使用本地数据返回结果。

## 监听端口

- 默认端口：`3001`
- 可通过环境变量覆盖：`PORT`
- 兼容旧写法：`API_PORT`

## 启动

```bash
npm install
npm run dev
```

## 接口

- `GET /health`
- `GET /api`
- `GET /api/profile`
- `GET /api/skills`
- `GET /api/projects`
- `GET /api/experience`
- `GET /api/contact`
