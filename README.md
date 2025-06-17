# 🎮 区块链扫雷游戏

> 可爱温馨的链上游戏，支持本地和区块链双模式！

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.24.2-orange.svg)](https://hardhat.org/)

## 🌟 项目特色

### 🎯 双模式设计

- **🏠 本地模式**：完全离线运行，零配置启动，支持标记功能
- **⛓️ 区块链模式**：连接 MetaMask，数据上链，支持代币奖励

### 🎨 可爱的视觉设计

- 温馨的粉色、薄荷绿、淡紫色配色方案
- 圆角设计，柔和的视觉体验
- 流畅的动画效果和交互反馈

### 🚀 用户友好

- **Windows 一键启动脚本**，普通用户双击即可运行
- 智能环境检测和依赖管理
- 详细的中文操作指南

## 📁 项目结构

```
扫雷游戏/
├── frontend/                 # React 前端应用
│   ├── src/
│   │   ├── components/       # React 组件
│   │   ├── hooks/           # 自定义 Hooks
│   │   ├── utils/           # 工具函数
│   │   └── App.jsx          # 主应用组件
│   ├── package.json
│   └── ...
├── contracts/               # 智能合约
│   ├── contracts/
│   │   └── Minesweeper.sol  # 扫雷智能合约
│   ├── scripts/
│   │   └── deploy.js        # 部署脚本
│   ├── test/               # 合约测试
│   └── hardhat.config.js   # Hardhat 配置
├── 一键启动.bat             # 智能启动脚本
├── 启动游戏.bat             # 简单启动脚本
├── 检查环境.bat             # 环境检查工具
└── README_用户指南.md       # 用户使用指南
```

## 🚀 快速开始

### 方法一：一键启动（推荐）

1. 双击 `一键启动.bat` 文件
2. 选择 `[1] 🚀 启动游戏`
3. 等待自动安装依赖和启动
4. 游戏将在浏览器中自动打开

### 方法二：手动启动

```bash
# 安装前端依赖
cd frontend
npm install

# 启动开发服务器
npm run dev
```

### 方法三：区块链模式

```bash
# 启动本地区块链网络
cd contracts
npm install
npx hardhat node

# 在新终端启动前端
cd frontend
npm run dev
```

## 🎮 游戏模式

### 🏠 本地模式

- ✅ 无需网络连接，完全离线运行
- ✅ 响应速度快，适合休闲游戏
- ✅ 支持右键标记功能
- ✅ 数据本地保存，游戏记录持久化
- ✅ 零配置启动，开箱即用

### ⛓️ 区块链模式

- 🔗 连接 MetaMask 钱包
- 🔗 游戏数据存储在区块链
- 🔗 支持代币奖励（测试环境）
- 🔗 可与其他玩家竞技
- 🔗 需要网络连接和钱包配置

## 🛠️ 技术栈

### 前端技术

- **React 19.1.0** - 现代化的用户界面框架
- **Vite 6.3.5** - 快速的构建工具
- **Tailwind CSS 3.4.17** - 实用优先的 CSS 框架
- **Ethers.js 6.14.3** - 以太坊交互库
- **Lucide React** - 美观的图标库

### 区块链技术

- **Solidity 0.8.19** - 智能合约开发语言
- **Hardhat 2.24.2** - 以太坊开发环境
- **OpenZeppelin** - 安全的智能合约库

## 👨‍💻 作者信息

- **作者**：青蛙会点头
- **设计理念**：可爱温馨的游戏体验
- **开发初衷**：让区块链技术更贴近普通用户

## 📄 许可证

本项目采用 MIT 许可证

---

<div align="center">

**🎮 享受游戏！✨**

Made with ❤️ by 青蛙会点头

</div>
