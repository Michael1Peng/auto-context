<div align="center">
  <img src="auto-copilot-context.png" alt="Auto Copilot Context Logo" width="128" height="128">
  
  <h1>Auto Copilot Context</h1>
  
  <p align="center">
    <strong>"Turn Opened Tabs to Rules"</strong>
  </p>
  
  <p>
    将您的开发行为转化为智能上下文规则<br>
    通过打开的标签页和工作区自动生成丰富的AI编程上下文
  </p>

  <p align="center">
    <a href="https://marketplace.visualstudio.com/items?itemName=little-lion-39.auto-context" target="_blank">
      <img src="https://img.shields.io/visual-studio-marketplace/v/little-lion-39.auto-context?style=for-the-badge&logo=visualstudiocode&logoColor=white&label=VS%20Code%20Marketplace" alt="VSCode Marketplace">
    </a>
    <a href="https://marketplace.visualstudio.com/items?itemName=little-lion-39.auto-context" target="_blank">
      <img src="https://img.shields.io/visual-studio-marketplace/d/little-lion-39.auto-context?style=for-the-badge&logo=visualstudiocode&logoColor=white&label=Downloads" alt="Downloads">
    </a>
    <a href="https://github.com/Michael1Peng/auto-copilot-context/blob/master/LICENSE.md" target="_blank">
      <img src="https://img.shields.io/github/license/Michael1Peng/auto-copilot-context?style=for-the-badge" alt="License">
    </a>
  </p>
</div>

---

## 🎯 核心理念

在大型项目中，AI 编程助手面临的最大挑战是**获取准确的上下文**。传统方式要么上下文过多导致请求超限，要么信息不足影响代码质量。

**Auto Copilot Context** 通过监听您的开发行为，自动收集和整理相关文件内容，将您的工作习惯转化为智能规则，让 AI 助手始终拥有恰到好处的项目上下文。

## 🚀 使用方式

### 核心工作流程

```
📂 打开文件标签页    →    🔍 智能识别上下文    →    � 生成规则文件    →    🤖 AI 精准编码
   正常开发操作          自动收集相关代码         输出结构化内容         获得项目知识
```

### 基于窗口和工作区的上下文管理

#### 1. 窗口级别上下文
- **单一焦点原则**：每个窗口专注于一个主要任务或功能模块
- **标签页组织**：相关文件在同一窗口中打开，形成自然的上下文边界
- **实时更新**：当您切换标签页时，上下文规则自动更新

#### 2. 工作区级别上下文
- **项目范围**：基于当前工作区的文件结构和依赖关系
- **智能过滤**：自动识别并过滤掉无关文件（如 node_modules、build 文件等）
- **多格式输出**：自动生成到 `.cursor/rules/`、`.roo/rules/`、`.clinerules/` 和 `output/` 目录

#### 3. 上下文切换策略
```bash
# 功能开发时
Window 1: 组件文件 + 样式文件 + 测试文件
Window 2: API 接口 + 数据模型 + 业务逻辑

# 问题调试时
Window 1: 错误文件 + 相关依赖 + 配置文件
Window 2: 日志文件 + 测试用例 + 文档

# 代码审查时
Window 1: 变更文件 + 相关测试 + 文档更新
Window 2: 原始文件 + 依赖关系 + 架构文档
```

## � 项目上下文目录组织

### 推荐的项目结构

```
project-root/
├── .cursor/
│   └── rules/
│       ├── opened-files.mdc       # 当前打开文件上下文
│       ├── project-structure.mdc  # 项目结构说明
│       └── coding-standards.mdc   # 编码规范
├── .roo/
│   └── rules/
│       └── opened-files.md        # Roo AI 上下文
├── .clinerules/
│   └── opened-files.md            # Cline AI 上下文
├── docs/
│   ├── architecture.md            # 架构文档
│   ├── api-reference.md           # API 文档
│   └── development-guide.md       # 开发指南
├── context-output/
│   ├── opened-files.xml           # 通用XML格式
│   └── session-context.json       # 会话上下文
└── your-project-files...
```

### 需求管理和上下文组织

#### 1. 按功能模块组织
```
feature-auth/
├── context/
│   ├── current-session.mdc       # 当前开发会话
│   ├── related-files.mdc         # 相关文件列表
│   └── dependencies.mdc          # 依赖关系
├── src/
├── tests/
└── docs/
```

#### 2. 按开发阶段组织
```
development-phases/
├── planning/
│   └── context-requirements.mdc  # 需求分析上下文
├── implementation/
│   └── context-development.mdc   # 开发实现上下文
├── testing/
│   └── context-testing.mdc       # 测试验证上下文
└── deployment/
    └── context-deployment.mdc    # 部署配置上下文
```

## 🛠 快速开始

### 1️⃣ 安装扩展
```bash
# 在 VS Code 扩展市场搜索
Auto Context

# 或者通过命令行安装
code --install-extension little-lion-39.auto-context
```

### 2️⃣ 配置输出格式
```json
{
  "autoContext.outputList": [
    {
      "path": ".cursor/rules/opened-files.mdc",
      "format": "# Opened Files\n## File Name\n${fileName}\n## File Content\n${content}\n",
      "prependContent": "---\ndescription: Auto-generated context from opened tabs\nglobs: \nalwaysApply: true\n---"
    },
    {
      "path": "context-output/session-context.xml",
      "format": "<OpenedFiles>\n<File name=\"${fileName}\">\n${content}\n</File>\n</OpenedFiles>\n"
    }
  ],
  "autoContext.shouldOutput": true,
  "autoContext.ignorePinnedTabs": true
}
```

### 3️⃣ 开始使用
1. 正常打开和编辑项目文件
2. 插件自动监听标签页变化
3. 实时生成上下文规则文件
4. AI 工具自动获取丰富上下文

## 🎬 实际使用场景

### 🆕 新人接手项目
```
场景：刚加入团队，需要理解项目架构
操作：在不同窗口中打开相关模块文件
效果：AI 获得分层的项目架构信息，快速理解代码结构
```

### 🔧 功能开发
```
场景：开发新功能，需要了解相关模块
操作：同一窗口打开相关组件、样式、测试文件
效果：AI 理解功能的完整实现链路
```

### 🐛 Bug 修复
```
场景：定位和修复线上问题
操作：打开错误文件和相关依赖
效果：AI 获得问题的完整上下文，准确定位根因
```

## ⚙️ 高级配置

### 自定义输出格式
```json
{
  "autoContext.outputList": [
    {
      "path": ".cursor/rules/context-with-metadata.mdc",
      "format": "# Context: ${fileName}\n\n## File Path\n${fileName}\n\n## Content\n```\n${content}\n```\n\n## Last Modified\n${timestamp}\n",
      "prependContent": "---\ndescription: Enhanced context with metadata\nglobs: \nalwaysApply: true\ntags: [auto-generated, current-session]\n---"
    }
  ]
}
```

### 工作区特定配置
在项目根目录创建 `.vscode/settings.json`：
```json
{
  "autoContext.outputList": [
    {
      "path": "project-context/current-session.mdc",
      "format": "# Current Development Session\n\n## Active Files\n${fileName}\n\n## Code Content\n```${fileExtension}\n${content}\n```\n"
    }
  ]
}
```

## 📄 推荐的 .gitignore

```gitignore
# Build outputs
out/
dist/
build/
*.vsix

# Dependencies
node_modules/
.pnp
.pnp.js

# Auto-generated context files (optional - you may want to commit these)
context-output/
.cursor/rules/opened-files.mdc
.roo/rules/opened-files.md
.clinerules/opened-files.md

# IDE files
.vscode-test/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# OS files
.DS_Store
Thumbs.db

# Environment files
.env
.env.local
.env.*.local

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Coverage and test files
coverage/
.nyc_output/
.jest/

# Temporary files
*.tmp
*.temp
.cache/
```

## 🔧 开发和贡献

### 本地开发
```bash
# 克隆项目
git clone https://github.com/Michael1Peng/auto-copilot-context.git
cd auto-copilot-context

# 安装依赖
npm install

# 编译
npm run compile

# 运行测试
npm test

# 打包扩展
npm run package
```

### 项目结构
```
src/
├── core/
│   ├── ContextTracker.ts      # 核心上下文追踪器
│   └── FileCollector.ts       # 文件收集器
├── services/
│   ├── ConfigurationManager.ts  # 配置管理
│   ├── FileFilter.ts           # 文件过滤器
│   ├── OutputFormatter.ts     # 输出格式化
│   └── OutputWriter.ts        # 输出写入器
└── types/
    └── interfaces.ts           # 类型定义
```

## 🛠 技术特性

- ⚡ **零性能开销** - 异步处理，不影响开发体验
- 🎯 **智能过滤** - 自动识别有效文件，过滤无关内容
- 📱 **多格式支持** - 支持 Cursor、Claude、Cline 等多种 AI 工具
- 🔧 **高度可配置** - 灵活的配置选项，满足不同需求
- 🚀 **即插即用** - 安装即用，无需复杂设置
- 🪟 **窗口感知** - 基于窗口和工作区的智能上下文管理

## 📄 许可证

本项目基于 [MIT License](LICENSE.md) 开源协议发布。

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

---

<div align="center">
  <p>
    如果这个项目对您有帮助，请考虑给我们一个 ⭐ Star！
  </p>
  <p>
    <sub>Built with ❤️ for developers who love efficient coding</sub>
  </p>
</div>