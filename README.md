<div align="center">
  <img src="auto-copilot-context.png" alt="Auto Copilot Context Logo" width="128" height="128">
  
  <h1>Auto Copilot Context</h1>
  
  <p align="center">
    <strong>"Bring Your Action Into Context"</strong>
  </p>
  
  <p>
    自动将你的开发行为转化为 AI 助手的智能上下文<br>
    解决大型项目中 LLM 编程的上下文获取难题
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

**Auto Copilot Context** 通过监听你的开发行为，自动收集和整理相关文件内容，让 AI 助手始终拥有恰到好处的项目上下文。

## ✨ 工作流程

```
📂 你浏览文件    →    🔍 智能分析依赖    →    📝 自动生成上下文    →    🤖 AI 精准编码
    正常开发           收集相关代码           输出结构化内容           获得项目知识
```

## 🚀 三步开始使用

### 1️⃣ 安装扩展
```bash
# 在 VS Code 扩展市场搜索
Auto Context

# 或者通过命令行安装
code --install-extension little-lion-39.auto-context
```

### 2️⃣ 打开项目
正常浏览和编辑你的项目文件，无需任何特殊操作

### 3️⃣ 自动工作
扩展会自动：
- 🔄 实时监听文件打开和切换
- 📋 收集当前标签页的文件内容
- 📤 生成结构化的上下文输出
- 🎯 与 Cursor/Claude 等 AI 工具无缝集成

## 🎬 实际使用场景

### 🆕 新人接手项目
```
场景：刚加入团队，需要理解项目架构
行为：浏览核心文件 → 自动收集架构信息 → AI 获得项目全貌
效果：快速上手，减少学习成本
```

### 🔧 功能开发
```
场景：开发新功能，需要了解相关模块
行为：查看相关组件 → 自动分析依赖关系 → AI 理解代码关联
效果：生成符合项目规范的代码
```

### 🐛 Bug 修复
```
场景：定位和修复线上问题
行为：追踪问题代码 → 自动关联相关文件 → AI 获得完整上下文
效果：准确定位问题，避免误修改
```

## ⚙️ 配置选项

### 基础配置
插件安装后即可使用，默认配置适合大多数场景：

```json
{
  "autoContext.shouldOutput": false,  // 是否自动输出上下文文件
  "autoContext.ignorePinnedTabs": true,  // 是否忽略固定标签页
  "autoContext.outputList": [
    {
      "path": "context-output.txt",  // 输出文件路径
      "format": "<Opened Files>\n<File Name>\n${fileName}\n</File Name>\n<File Content>\n${content}\n</File Content>\n</Opened Files>\n"
    }
  ]
}
```

### 高级配置
支持自定义输出格式，适配不同 AI 工具的输入要求：

```json
{
  "autoContext.outputList": [
    {
      "path": ".cursor/rules/context-output.mdc",
      "format": "<Opened Files>\n<File Name>\n${fileName}\n</File Name>\n<File Content>\n${content}\n</File Content>\n</Opened Files>\n",
      "prependContent": "---\ndescription: Auto-generated context\nglobs: \nalwaysApply: true\n---"
    }
  ]
}
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
- 📱 **多格式支持** - 支持多种输出格式，适配不同 AI 工具
- 🔧 **高度可配置** - 灵活的配置选项，满足不同需求
- 🚀 **即插即用** - 安装即用，无需复杂设置

## 📄 许可证

本项目基于 [MIT License](LICENSE.md) 开源协议发布。

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

---

<div align="center">
  <p>
    如果这个项目对你有帮助，请考虑给我们一个 ⭐ Star！
  </p>
  <p>
    <sub>Built with ❤️ for developers who love efficient coding</sub>
  </p>
</div>