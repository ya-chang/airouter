<div align="center">

<img src="resources/icon.png" alt="AiRouter Logo" width="120" />

# 🎭 AiRouter

### AI 的 AI —— 让 345+ 专业 AI 专家为你出谋划策

[![Electron](https://img.shields.io/badge/Electron-31-47848F?logo=electron&style=flat-square)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&style=flat-square)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&style=flat-square)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=flat-square)](https://github.com/ya-chang/airouter/releases)
[![Platform](https://img.shields.io/badge/Platform-Windows-0078D6?logo=windows&style=flat-square)](https://github.com/ya-chang/airouter/releases)

</div>

---

## 📖 项目简介

**AiRouter** 是一个独立的 AI 智能路由器桌面应用。它**不替代**任何 AI 工具，而是作为所有 AI 工具的 **上游入口** —— 你先跟专家聊清楚要什么，再拿结果去 Cursor / ChatGPT / VS Code 落地。

> 💡 **灵感来源**：本项目基于 [agency-agents](https://github.com/msitarzewski/agency-agents) 的 304+ Agent 人设库构建，将其从纯 Markdown 模板升级为可交互的桌面应用，每个 Agent 都拥有独立的 System Prompt 和专家人格。

### 🎯 核心价值

| 痛点 | AiRouter 解决方案 |
|------|------------------|
| AI 回答太通用，缺乏领域深度 | 345+ 专业 Agent 人设，专家视角精准回答 |
| 不知道选哪个 Agent 合适 | 智能匹配算法，自动推荐最合适的专家 |
| 不想折腾 IDE 插件 / 命令行 | 配个 API Key 就能用，桌面端开箱即用 |
| 生成结果不知道如何落地 | 复制 / 保存 / 生成项目 / 导出文档 / 一键 VS Code 打开 |
| 外部 AI 结果质量没保障 | 接力模式：拿回来让专家二次审查优化 |

---

## ✨ 功能特性

### 🤖 345+ 专业专家 · 18 大领域

| 领域 | 示例专家 |
|------|----------|
| 🔧 工程开发 | 前端开发、后端开发、全栈开发、AI 工程师、软件架构师、API 设计师 |
| 🎨 设计 | UI/UX 设计师、品牌设计师、前端设计师、动效设计师 |
| 📊 数据 | 数据分析师、数据工程师、机器学习工程师 |
| 📱 移动端 | iOS 开发、Android 开发、React Native 开发 |
| 🔒 安全 | 安全工程师、渗透测试专家、安全审计师 |
| 📈 营销 | SEO 专家、内容策略师、增长黑客、社交媒体经理 |
| 🎮 游戏 | 游戏开发、游戏设计师、Unity 工程师 |
| 🗺️ 地理信息 | GIS 工程师、地图开发专家 |
| 🚀 DevOps | DevOps 工程师、SRE、云架构师 |
| 📝 写作 | 技术文档工程师、文案策划、编辑 |
| 🧪 测试 | QA 工程师、自动化测试工程师 |
| 🏥 医疗 | 医疗 AI 顾问、生物信息学专家 |
| 💰 金融 | 量化分析师、金融科技工程师 |
| ⚖️ 法律 | 法律科技顾问、隐私合规专家 |
| 📋 产品 | 产品经理、用户研究员、增长产品经理 |
| 🎓 教育 | 教育技术专家、课程设计师 |
| 🔬 科研 | 研究科学家、学术写作助手 |
| 🏢 企业 | 企业架构师、数字化转型顾问 |

### ⚡ 四种使用模式

| 模式 | 说明 | 示例 |
|------|------|------|
| 💬 **咨询方案** | 找专家问方案，拿去执行 | "我想做一个电商后台" → 输出完整 PRD |
| 🔍 **问题诊断** | 贴代码让专家分析 | "这段代码总是超时" → 输出修复方案 |
| 🧬 **代码嫁接** | 生成代码骨架 | "写一个 React 登录组件" → 输出完整代码 |
| 🔄 **接力优化** | 外部结果二次审查 | "这段代码帮我优化" → 输出优化版本 |

### 🛠️ 核心能力

- **智能匹配** — 输入问题自动推荐最合适的专家，含匹配度评分和推荐理由
- **多选对比** — 同时选择多个专家，依次回答方便对比不同视角
- **流式输出** — 实时 SSE 流式显示 AI 回复，无需等待
- **多 Provider** — 支持 DeepSeek、小米 MiMo、Kimi、OpenAI、Claude、Ollama
- **模型选择** — 每个 Provider 提供最新模型列表，自由切换
- **新手引导** — 首次使用自动弹出引导，零学习成本
- **输出管理** — 一键复制代码 / 保存文件 / 导出文档 / 生成项目 / VS Code 打开

---

## 🚀 快速开始

### 方式一：直接下载（推荐）

1. 前往 [Releases](https://github.com/ya-chang/airouter/releases) 下载 `AiRouter Setup 1.0.0.exe`
2. 双击安装
3. 打开应用，配置 API Key
4. 开始使用

### 方式二：从源码运行

```bash
# 克隆仓库
git clone https://github.com/ya-chang/airouter.git
cd airouter

# 安装依赖（推荐使用 npmmirror 镜像）
npm install --registry=https://registry.npmmirror.com

# 启动开发模式
npm run dev
```

### 方式三：构建安装包

```bash
# 构建生产版本
npm run build

# 打包 Windows 安装包
npm run build:win
```

---

## ⚙️ API 配置

### 支持的 Provider

| Provider | API 地址 | 推荐模型 |
|----------|----------|----------|
| DeepSeek | `https://api.deepseek.com/v1` | deepseek-chat |
| 小米 MiMo | `https://api.xiaomi.com/v1` | MiMo-v2.5-Pro |
| Kimi | `https://api.moonshot.cn/v1` | kimi-k2 |
| OpenAI | `https://api.openai.com/v1` | gpt-4o |
| Claude | `https://api.anthropic.com/v1` | claude-sonnet-4-20250514 |
| Ollama | `http://localhost:11434/v1` | llama3 |

### 配置步骤

1. 打开应用，点击右上角「⚙️ 设置」
2. 选择 API 服务商
3. 输入 API Key
4. 选择模型
5. 点击「测试连接」验证
6. 保存设置，开始使用

---

## 📁 项目结构

```
airouter/
├── src/
│   ├── main/                    # Electron 主进程
│   │   ├── index.ts            # 入口 + IPC 注册 + 窗口管理
│   │   ├── agent-manager.ts    # Agent 解析/导入/搜索（gray-matter）
│   │   ├── task-analyzer.ts    # 任务意图分析
│   │   ├── agent-matcher.ts    # 智能匹配算法
│   │   ├── execution-engine.ts # AI API 调用（SSE 流式）
│   │   ├── output-manager.ts   # 输出管理（复制/保存/导出）
│   │   └── settings-manager.ts # API Key 等配置管理
│   ├── preload/                 # 预加载脚本
│   │   └── index.ts
│   └── renderer/               # React 前端
│       ├── src/
│       │   ├── components/     # UI 组件
│       │   ├── stores/         # 状态管理 (Zustand)
│       │   ├── mock-agents.ts  # 345 个 Agent 数据
│       │   └── mock-api.ts     # Mock API
│       └── index.html
├── agents/                     # Agent 源文件（18 个领域，Markdown 格式）
├── resources/                  # 图标等资源文件
├── electron-builder.json       # 打包配置
└── package.json
```

---

## 🛠️ 技术栈

| 技术 | 用途 |
|------|------|
| [Electron 31](https://www.electronjs.org/) | 桌面应用框架 |
| [React 19](https://react.dev/) | UI 框架 |
| [TypeScript 5.5](https://www.typescriptlang.org/) | 类型安全 |
| [Zustand](https://github.com/pmndrs/zustand) | 状态管理 |
| [Vite](https://vitejs.dev/) | 构建工具 |
| [electron-vite](https://electron-vite.org/) | Electron 构建 |
| [electron-builder](https://www.electron.build/) | 应用打包 |
| [gray-matter](https://github.com/jonschlinkert/gray-matter) | Markdown Frontmatter 解析 |

---

## 📝 开发计划

- [x] MVP 版本（核心可用）
- [x] 345+ 专家模板（18 个领域）
- [x] 多 Provider 支持（DeepSeek / MiMo / Kimi / OpenAI / Claude / Ollama）
- [x] 模型选择功能
- [x] 新手引导
- [x] Windows 安装包
- [ ] macOS 安装包
- [ ] Linux 安装包
- [ ] ONNX Embedding 本地语义匹配
- [ ] 任务历史记录持久化
- [ ] 专家评分与反馈系统

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

---

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源。

---

## 🙏 致谢

- [agency-agents](https://github.com/msitarzewski/agency-agents) — 304+ Agent 人设库，本项目核心灵感来源，Agent 模板基于此项目构建
- [Electron](https://www.electronjs.org/) — 桌面应用框架
- [React](https://react.dev/) — UI 框架

---

<div align="center">

**AiRouter = AI 的 AI**

*先跟专家聊清楚要什么，再拿结果去落地*

</div>
