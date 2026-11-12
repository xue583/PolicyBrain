# 政策大脑 POLICY BRAIN

全国政策数据 · AI 辅助申报平台门户前端，面向企业与服务机构提供政策、资讯、企业和匹配等页面入口。

## 模块入口

页面通过 Vue Router 组织，主要路由如下：

| 模块         | 路由               |
| ------------ | ------------------ |
| 首页         | `/`                |
| 政策资讯     | `/news`            |
| 政策数据库   | `/policy-db`       |
| 企业数据库   | `/enterprise-db`   |
| 政策匹配企业 | `/policy-match`    |
| 投资项目库   | `/invest-db`       |
| 数据导出     | `/export`          |
| API 接口目录 | `/api`             |
| 个人中心     | `/personal-center` |
| 工作台       | `/workspace`       |

## 技术栈

- Vue 3（`<script setup>` + TypeScript）
- Vue Router
- Pinia
- Vite 8
- Ant Design Vue 4
- Sass
- Axios
- Vitest

## 数据来源

页面同时存在真实 API 与本地 mock 数据：接口定义集中在 `src/api/`，请求封装位于 `src/utils/request.ts`，本地数据位于 `src/mock/`。具体数据来源以各页面的实际调用为准。

## 目录结构

```text
src/
├── api/           # API 参数、响应 DTO 与数据映射
├── assets/        # 图片、图标和全局样式资源
├── components/    # 通用组件与布局
├── composables/   # 跨页面复用的组合式逻辑
├── mock/          # 本地 mock 数据
├── router/        # Vue Router 路由与访问控制
├── stores/        # Pinia 状态
├── utils/         # 请求、认证及通用工具
├── views/         # 各路由页面
├── App.vue        # 根组件
└── main.ts        # 应用入口
```

路径别名：`@` → `src/`（见 `vite.config.ts`）。

## 快速开始

```bash
npm install
npm run dev
```

开发服务默认端口为 `8001`，即 `http://localhost:8001`；可通过 `VITE_CLI_PORT` 配置修改。

## 常用脚本

```bash
npm run dev         # 启动开发服务
npm run typecheck   # TypeScript / Vue 类型检查
npm run test        # 运行 Vitest 测试
npm run lint        # ESLint 检查
npm run build       # 类型检查并构建生产产物
npm run preview     # 预览构建产物
```
