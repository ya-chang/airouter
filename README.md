<div align="center">

# 🎭 AiRouter

### AI 的 AI — 345+ 专业 AI 专家 + 智能匹配 + 一键输出

![Electron](https://img.shields.io/badge/Electron-31-47848F?logo=electron)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green)

[English](#english) | **中文**

</div>

---

## 📖 项目简介

AiRouter 是一个独立的 AI 智能路由器桌面应用。它不替代任何 AI 工具，而是作为所有 AI 工具的**上游入口**——你先跟专家聊清楚要什么，再拿结果去 Cursor / ChatGPT / VS Code 落地。

### 核心价值

| 痛点 | AiRouter 解决方案 |
|------|------------------|
| AI 回答太通用 | 345+ 专业 Agent 人设，专家视角回答 |
| 不知道哪个 Agent 适合 | 智能匹配算法，自动推荐 |
| 不想折腾 IDE 插件 | 配个 API Key 就能用 |
| 生成结果不知道怎么用 | 复制/保存/生成项目/导出文档 |
| 外部 AI 结果质量没保障 | 接力模式：拿回来让专家二次审查 |

---

## ✨ 功能特性

### 🎯 四种使用模式

| 模式 | 说明 | 示例 |
|------|------|------|
| **咨询方案** | 找专家问方案，拿去执行 | "我想做一个电商后台" → 输出 PRD |
| **问题诊断** | 贴代码让专家分析 | "这段代码总是超时" → 输出修复方案 |
| **代码嫁接** | 生成代码骨架 | "写一个 React 登录组件" → 输出完整代码 |
| **接力优化** | 外部结果二次审查 | "这段代码帮我优化" → 输出优化版本 |

### 🤖 345+ 专业专家

覆盖 **18 个领域**：

| 领域 | 示例专家 |
|------|----------|
| 工程 | 前端开发、后端开发、DevOps、AI工程师、软件架构师 |
| 设计 | UI/UX设计师、品牌设计师、动效设计师 |
| 产品 | 产品经理、用户研究员、增长产品经理 |
| 营销 | SEO专家、内容策略师、增长黑客 |
| 安全 | 安全工程师、渗透测试专家 |
| 更多... | 游戏开发、地理信息、医疗健康、金融、法律... |

### ⚡ 核心功能

- **智能匹配** - 输入问题自动推荐最合适的专家
- **多选专家** - 可同时选择多个专家，依次回答对比
- **流式输出** - 实时显示 AI 回复
- **多 Provider** - 支持 DeepSeek、硅基流动、Kimi、OpenAI、Claude 等
- **模型选择** - 每个 Provider 提供最新模型列表
- **新手引导** - 首次使用自动引导

---

## 🚀 快速开始

### 方式一：直接使用（推荐）

1. 下载 [AiRouter Setup 1.0.0.exe](https://github.com/你的用户名/airouter/releases)
2. 双击安装
3. 打开应用，配置 API Key
4. 开始使用

### 方式二：从源码运行

```bash
# 克隆仓库
git clone https://github.com/你的用户名/airouter.git
cd airouter

# 安装依赖
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
| DeepSeek | `https://api.deepseek.com/v1` | deepseek-v4-pro |
| 硅基流动 | `https://api.siliconflow.cn/v1` | DeepSeek-V4-Pro, Qwen3.6 |
| Kimi | `https://api.moonshot.cn/v1` | kimi-k2.7 |
| OpenAI | `https://api.openai.com/v1` | gpt-5.6-sol |
| Claude | `https://api.anthropic.com/v1` | claude-sonnet-4 |
| Ollama | `http://localhost:11434/v1` | qwen3:32b |

### 配置步骤

1. 打开应用，点击右上角「⚙️ 设置」
2. 选择 API 服务商
3. 输入 API Key
4. 选择模型
5. 点击「测试连接」验证
6. 保存设置

---

## 📁 项目结构

```
airouter/
├── src/
│   ├── main/                    # Electron 主进程
│   │   ├── index.ts            # 入口文件
│   │   ├── agent-manager.ts    # 专家管理
│   │   ├── task-analyzer.ts    # 任务分析
│   │   ├── agent-matcher.ts    # 智能匹配
│   │   ├── execution-engine.ts # AI API 调用
│   │   ├── output-manager.ts   # 输出管理
│   │   └── settings-manager.ts # 设置管理
│   ├── preload/                 # 预加载脚本
│   │   └── index.ts
│   └── renderer/               # React 前端
│       ├── src/
│       │   ├── components/     # UI 组件
│       │   ├── stores/         # 状态管理 (Zustand)
│       │   ├── mock-agents.ts  # 345个专家数据
│       │   └── mock-api.ts     # Mock API
│       └── index.html
├── agents/                     # Agent 源文件
├── resources/                  # 资源文件
├── electron-builder.json       # 打包配置
├── electron.vite.config.ts     # 构建配置
└── package.json
```

---

## 🛠️ 技术栈

| 技术 | 用途 |
|------|------|
| Electron 31 | 桌面应用框架 |
| React 19 | UI 框架 |
| TypeScript 5.5 | 类型安全 |
| Zustand | 状态管理 |
| Vite | 构建工具 |
| electron-vite | Electron 构建 |
| electron-builder | 应用打包 |

---

## 📝 开发计划

- [x] MVP 版本（核心可用）
- [x] 345+ 专家模板
- [x] 多 Provider 支持
- [x] 模型选择功能
- [x] 新手引导
- [x] Windows 安装包
- [ ] macOS 安装包
- [ ] Linux 安装包
- [ ] ONNX Embedding 本地匹配
- [ ] 任务历史记录
- [ ] 专家评分系统

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

- [agency-agents](https://github.com/msitarzewski/agency-agents) - 304+ Agent 人设库
- [Electron](https://www.electronjs.org/) - 桌面应用框架
- [React](https://react.dev/) - UI 框架

---

<div align="center">

**AiRouter = AI 的 AI**

*先跟专家聊清楚要什么，再拿结果去落地*

</div>
