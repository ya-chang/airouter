# Agent 导入说明

## 从 agency-agents 仓库导入

本项目基于 [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) 仓库。

### 方法一：手动导入

1. 克隆 agency-agents 仓库：
   ```bash
   git clone https://github.com/msitarzewski/agency-agents.git /tmp/agency-agents
   ```

2. 将 agents 目录复制到本项目的 agents 目录：
   ```bash
   cp -r /tmp/agency-agents/agents/* ./agents/
   ```

3. 重启 AiRouter，Agent 会自动导入。

### 方法二：通过 UI 导入

1. 打开 AiRouter
2. 进入设置页面
3. 点击「更新 Agent 库」
4. 选择包含 .md 文件的目录

### Agent 文件格式

每个 Agent 是一个 `.md` 文件，格式如下：

```yaml
---
name: Agent Name
description: Agent description
color: blue
emoji: 🤖
vibe: One-line vibe description
---

# Agent System Prompt

完整的 Markdown body 会作为 system prompt 注入到 LLM 对话中。
```

### 必需字段

| 字段 | 类型 | 说明 |
|------|------|------|
| name | string | Agent 名称（必填） |
| description | string | 简短描述 |
| color | string | 颜色标识 |
| emoji | string | 表情符号 |
| vibe | string | 一句话定位 |

### 目录结构

```
agents/
├── engineering/    # 工程类
├── design/         # 设计类
├── marketing/      # 营销类
├── product/        # 产品类
├── security/       # 安全类
├── testing/        # 测试类
├── devops/         # 运维类
├── data/           # 数据类
├── writing/        # 写作类
└── IMPORT.md       # 本文件
```

目录名即为 Agent 的 `division` 分类。
