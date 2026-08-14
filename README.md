# 政策大脑 POLICY BRAIN

全国政策数据 · AI 辅助申报平台前端。面向企业与服务机构，提供政策检索、资讯追踪、企业/政策双向匹配等能力。当前为 Vue 3 单页原型，页面数据来自本地 Mock，尚未对接后端接口。

## 功能概览

| 模块 | 状态 | 说明 |
| --- | --- | --- |
| 首页 | 已实现 | 搜政策 / 搜企业、热门关键词、功能入口、行业标签、资讯列表 |
| 政策资讯 | 已实现 | 关键词搜索、地区 / 行业 / 级别 / 类型筛选、分页列表 |
| 政策数据库 | 开发中 | 顶栏可进入，展示占位页 |
| 企业数据库 | 开发中 | 同上 |
| 投资项目库 | 开发中 | 同上 |
| 数据导出 | 开发中 | 同上 |
| API 接口 | 开发中 | 同上 |
| 登录 / 注册 | UI 已实现 | 手机验证码 / 二维码登录；注册含账户验证、身份选择、身份认证三步 |

首页功能入口：企业匹配政策、政策匹配企业、AI 问政、工作台。

## 技术栈

- Vue 3（`<script setup>` + TypeScript）
- Vite 8
- Ant Design Vue 4
- Sass
- dayjs（中文 locale）

页面切换由 `App.vue` 中的 `activeNav` 控制，未接入 Vue Router。

## 目录结构

```
src/
├── App.vue                 # 根布局：顶栏 + 页面切换
├── main.ts                 # 入口，注册 Ant Design Vue
├── style.css               # 全局样式
├── assets/                 # 图片、图标
├── components/
│   ├── AppHeader.vue       # 顶栏：城市、导航、登录
│   └── LoginModal.vue      # 登录 / 注册弹窗
├── mock/
│   ├── home.ts             # 首页 Mock
│   └── policyNews.ts       # 资讯页 Mock（导航、筛选项、列表）
└── views/
    ├── home/index.vue      # 首页
    └── policyNews/index.vue
```

路径别名：`@` → `src/`（见 `vite.config.ts`）。

## 快速开始

要求：Node.js 18+，建议使用 npm。

```bash
npm install
npm run dev
```

浏览器打开终端提示的本地地址（默认 `http://localhost:5173`）。

```bash
npm run build      # 类型检查 + 生产构建
npm run preview    # 预览构建产物
```

## 说明

- 列表、筛选项、热门词等均来自 `src/mock/`，检索、申报、登录提交等操作为前端占位。
- 顶栏城市默认「郑州市」，可切换河南省内若干城市。
- 界面文案与 Ant Design 组件均为中文。
