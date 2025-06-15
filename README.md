# Timee ⏰

一个现代化的时间协调和团队协作工具，帮助团队轻松找到最佳的会议时间。

## 🌟 项目简介

Timee 是一个基于 React + TypeScript 构建的 Web 应用，专为解决团队时间协调难题而设计。通过直观的界面和智能的时间匹配算法，让团队成员能够快速找到最适合所有人的会议时间。

### 核心功能

- 🗓️ **智能时间选择** - 可视化时间网格，支持拖拽选择可用时间
- 🔥 **热力图显示** - 直观展示团队成员时间重叠情况
- 🔗 **多种加入方式** - 支持 T-Code 快速加入和链接分享
- 📧 **邮件反馈系统** - 集成 EmailJS，支持功能建议和问题反馈
- 🌍 **时区智能处理** - 自动处理不同时区的时间转换
- 📱 **响应式设计** - 完美适配桌面端和移动端
- 🎨 **现代化 UI** - 基于 Tailwind CSS 的精美界面设计

## 🚀 技术栈

### 前端框架
- **React 19** - 最新版本的 React 框架
- **TypeScript** - 类型安全的 JavaScript 超集
- **Vite** - 快速的构建工具和开发服务器

### UI 组件库
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Radix UI** - 无样式的高质量组件库
- **Headless UI** - 完全无样式的 UI 组件
- **Heroicons** - 精美的 SVG 图标库
- **Lucide React** - 现代化图标库
- **Framer Motion** - 流畅的动画库

### 状态管理与路由
- **Zustand** - 轻量级状态管理库
- **React Router DOM** - 声明式路由管理

### 数据与服务
- **Supabase** - 开源的 Firebase 替代方案
- **EmailJS** - 前端邮件发送服务
- **Day.js** - 轻量级日期处理库

### 开发工具
- **ESLint** - 代码质量检查
- **PostCSS** - CSS 后处理器
- **Autoprefixer** - CSS 自动添加浏览器前缀

## 📦 安装与运行

### 环境要求
- Node.js >= 18.0.0
- npm >= 8.0.0

### 快速开始

1. **克隆项目**
```bash
git clone <repository-url>
cd Timee/timee
```

2. **安装依赖**
```bash
npm install
```

3. **环境配置**
创建 `.env` 文件并配置必要的环境变量：
```env
# EmailJS 配置
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key

# Supabase 配置（如果使用）
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **启动开发服务器**
```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动。

### 构建与部署

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 代码检查
npm run lint
```

## 🎯 功能详解

### 主要页面

- **首页 (HomePage)** - 项目介绍和快速导航
- **事件页面 (EventPage)** - 核心功能，时间选择和协调
- **加入页面** - 通过 T-Code 或链接加入事件
- **功能许愿池 (WishlistPage)** - 用户功能建议提交
- **反馈页面 (FeedbackPage)** - 问题报告和改进建议
- **使用指南 (HowToUsePage)** - 详细的使用说明
- **更新日志 (ChangelogPage)** - 版本更新记录

### 核心特性

#### 1. 智能时间协调
- 可视化时间网格界面
- 支持拖拽选择时间段
- 实时显示团队成员可用性
- 热力图展示最佳会议时间

#### 2. 多样化加入方式
- **T-Code 系统** - 6位随机码快速加入
- **链接分享** - 生成专属链接邀请成员
- **实时同步** - 所有更改实时同步到所有参与者

#### 3. 邮件反馈系统
- 集成 EmailJS 服务
- 支持功能建议提交
- 问题反馈和改进建议
- 自动邮件发送，无需用户操作邮件客户端

#### 4. 用户体验优化
- 响应式设计，完美适配各种设备
- 现代化 UI 设计，直观易用
- 智能错误处理和用户提示
- 流畅的动画效果

## 📁 项目结构

```
timee/
├── src/
│   ├── components/          # 可复用组件
│   ├── pages/              # 页面组件
│   ├── config/             # 配置文件
│   ├── services/           # 服务层
│   ├── utils/              # 工具函数
│   ├── hooks/              # 自定义 Hooks
│   ├── store/              # 状态管理
│   ├── types/              # TypeScript 类型定义
│   ├── router/             # 路由配置
│   ├── lib/                # 第三方库配置
│   └── assets/             # 静态资源
├── public/                 # 公共资源
├── docs/                   # 文档文件
│   ├── EMAILJS_README.md
│   ├── EMAILJS_SETUP_GUIDE.md
│   └── ...
└── package.json
```

## 🔧 配置指南

### EmailJS 配置
详细的 EmailJS 配置指南请参考 `EMAILJS_SETUP_GUIDE.md`。

### 数据库配置
如果使用 Supabase，请参考 `database-setup.sql` 进行数据库初始化。

## 🧪 测试

### EmailJS 功能测试
在浏览器控制台中运行：
```javascript
// 检查配置状态
emailTest.getConfigurationInfo()

// 发送测试邮件
emailTest.runConsoleTest()
```

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 如何贡献
1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 代码规范
- 使用 TypeScript 进行类型安全开发
- 遵循 ESLint 配置的代码规范
- 使用 Tailwind CSS 进行样式开发
- 组件命名使用 PascalCase
- 函数命名使用 camelCase，事件处理函数使用 handle 前缀

## 📝 更新日志

查看 `ChangelogPage.tsx` 或访问应用内的更新日志页面了解最新更新。

## 🐛 问题反馈

遇到问题？我们提供多种反馈渠道：

1. **应用内反馈** - 使用应用内的反馈页面
2. **功能建议** - 通过功能许愿池提交新功能建议
3. **GitHub Issues** - 在 GitHub 仓库创建 Issue

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

感谢所有为 Timee 项目做出贡献的开发者和用户！

特别感谢以下开源项目：
- React 团队提供的优秀框架
- Tailwind CSS 的实用优先设计理念
- Radix UI 的无障碍组件库
- EmailJS 的前端邮件服务
- Supabase 的开源后端服务

---

**让时间协调变得简单，让团队协作更加高效！** ⚡️
