# 科研小组工作台（XResearch112.github.io）

X 科研实践小组的在线协作工作台，单文件前端应用（HTML + JS + CSS），后端使用 WorkBuddy 云服务（数据库 / 文件存储 / 账号体系 / 大模型）。

## 功能

- **总览**：科研打卡、积分榜、全局搜索、数据备份（组长）
- **任务**：发布 → 交付 → 验收 完整闭环，逾期监督、按时完成标记、附件交付
- **文档资料**：共享文件上传、分类、在线分析
- **文献库**：文献收录、分组、标签、附件、AI 智能摘要
- **论文空间**：空间讨论 + 文件共享 + 已读回执 + 引用/撤回
- **会议**：会议安排、站内 WebRTC 音视频会议（Cloudflare TURN）
- **公告**：置顶公告
- **论坛**：板块分类、发帖、回帖、配图、置顶
- **智能助手**：基于大模型的组内问答与写作辅助

## 技术栈

- 单文件 `index.html`（约 5000 行），无构建步骤
- `@tencent-ai/workbuddy-cloud-sdk`（CDN）提供 auth / database / storage / llm
- PostgreSQL + RLS 行级安全，按 `is_member()` / `is_admin()` 控制数据权限
- PWA：`manifest.webmanifest` + `sw.js`，支持添加到主屏幕与系统级消息通知

## 部署说明

- 线上正式环境：WorkBuddy 应用托管（分享链接形式）
- 本仓库同时可发布到 GitHub Pages，仅作为代码存档与静态预览；
  云服务按 Origin 做精确校验，**GitHub Pages 域下的登录与数据读写不会生效**

## 文件

| 文件 | 说明 |
| --- | --- |
| `index.html` | 应用主体（页面、样式、全部逻辑） |
| `sw.js` | Service Worker：离线缓存 + 通知点击跳转 |
| `manifest.webmanifest` | PWA 配置 |
| `icon-*.png` | 应用图标 |
