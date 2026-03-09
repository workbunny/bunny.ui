<p align="center"><img width="260px" src="https://chaz6chez.cn/images/workbunny-logo.png" alt="workbunny"></p>

**<p align="center">workbunny/bunny.ui</p>**

**<p align="center">🐇 HTMX 拓展 Web UI 组件库 🐇</p>**

# Bunny-UI

轻量级 HTMX 拓展 Web UI 组件库，通过属性构建现代用户界面，结合简单性和超文本的强大功能。

<p>
  <a href="https://github.com/workbunny/bunny-ui/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-blue" alt="License">
  </a>
  <a href="https://github.com/workbunny/bunny-ui/releases">
    <img src="https://badgen.net/github/release/workbunny/bunny-ui" alt="Version">
  </a>
</p>

## 特性

- 📦 轻量级，无外部框架依赖
- 🎨 丰富的 UI 组件和动画效果
- 🚀 基于 HTMX 扩展，增强超文本功能
- 📱 响应式设计，支持多种设备
- 🎯 模块化结构，易于集成和扩展
- 🔧 简单易用的 API 接口

## 快速开始

### 安装

**直接引入**

```html
<!-- 在 HTML 头部引入 -->
<link href="./bunny.css" rel="stylesheet" />
<script src="./bunny.js"></script>
```

**从源码构建**
```bash
# 克隆项目
git clone https://github.com/workbunny/bunny.ui.git

# 安装依赖
bun install

# 构建调试版本
bun run build --debug

# 构建生产版本
bun run build
```

### 基本使用

```html
<!DOCTYPE html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quick Start - Bunny-ui</title>
    <!-- bunny-ui 核心文件 -->
    <link href="./bunny.css" rel="stylesheet" />
    <script src="./bunny.js"></script>
</head>
<body>
    <!-- 示例：显示警告框 -->
    <button class="bny-btn" onclick="bny.alert('Hello World')">点击我</button>
    
    <!-- 示例：显示确认框 -->
    <button class="bny-btn" onclick="bny.confirm('确定要执行此操作吗？')">确认操作</button>
    
    <!-- 示例：显示页面弹窗 -->
    <button class="bny-btn" onclick="bny.page('<h1>Hello</h1><p>这是一个弹窗</p>')">打开弹窗</button>
</body>
</html>
```

## 核心组件

- **菜单组件**：导航菜单、下拉菜单
- **表单组件**：输入框、按钮、选择器
- **布局组件**：网格系统、卡片、标签页
- **数据组件**：表格、代码

## 文档

- [HTMX 官方文档](https://htmx.org/)
- [Bunny-UI 文档](http://bnyui.kllxs.top/)

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 贡献

欢迎提交 Issue 和 Pull Request 来帮助改进这个项目！

---

**享受使用 Bunny-UI 构建现代 Web 应用！** 🐇
