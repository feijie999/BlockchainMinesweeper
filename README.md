# 🌸 区块链扫雷游戏 (Blockchain Minesweeper)

一个可爱温馨的区块链扫雷游戏，采用 Solidity 智能合约和 React 前端开发。

## ✨ 特性

- 🎮 完整的链上扫雷游戏逻辑
- 💖 可爱温馨的用户界面设计
- 🏆 永久存储的积分系统
- 🔧 自定义棋盘大小和地雷数量
- 🔐 安全的智能合约实现
- 📱 响应式设计，支持桌面和移动端

## 🏗️ 项目结构

```
blockchain-minesweeper/
├── contracts/          # 智能合约
│   ├── contracts/      # Solidity 合约文件
│   ├── scripts/        # 部署脚本
│   ├── test/          # 合约测试
│   └── hardhat.config.js
├── frontend/          # React 前端应用
│   ├── src/
│   ├── public/
│   └── package.json
└── README.md
```

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm 或 yarn
- MetaMask 钱包

### 安装依赖

```bash
# 安装所有依赖
npm run install:all
```

### 开发模式

```bash
# 启动本地区块链节点
npm run node

# 编译智能合约
npm run compile

# 运行测试
npm run test

# 启动前端开发服务器
npm run dev
```

### 部署到测试网

```bash
# 部署智能合约到 Sepolia 测试网
npm run deploy:sepolia

# 构建并部署前端应用
npm run deploy:frontend
```

## 🎮 功能特性

### 智能合约功能

- ✅ 完整的链上扫雷游戏逻辑
- ✅ 自定义棋盘尺寸（5x5 到 20x20）
- ✅ 地雷密度控制（10%-30%）
- ✅ 安全的随机数生成
- ✅ 永久积分系统和历史记录
- ✅ 防重入攻击和安全验证
- ✅ Gas 优化的位图存储

### 前端界面功能

- ✅ 可爱温馨的 UI 设计
- ✅ MetaMask 钱包集成
- ✅ 响应式设计（桌面/移动端）
- ✅ 实时游戏状态同步
- ✅ 玩家统计和成就系统
- ✅ 加载动画和过渡效果
- ✅ 错误处理和用户反馈

## 📱 界面预览

### 主游戏界面

- 🌸 可爱的粉色、薄荷绿、淡紫色主题
- 🎯 直观的游戏棋盘和控制面板
- 📊 实时统计和进度显示
- 🏆 成就系统和等级进度

### 钱包连接

- 🔗 一键连接 MetaMask
- 💰 余额和网络状态显示
- 🔄 自动重连和状态同步

### 游戏设置

- ⚙️ 预设难度选择
- 🎛️ 自定义棋盘参数
- 📈 游戏预览和难度评估

## 🔧 技术架构

### 智能合约层

- **语言**: Solidity ^0.8.19
- **框架**: Hardhat
- **测试**: Mocha + Chai
- **网络**: Ethereum, Sepolia, 本地测试网

### 前端应用层

- **框架**: React 19.1.0 + Vite 6.3.5
- **样式**: Tailwind CSS 4.1.10
- **Web3**: Ethers.js 6.14.3
- **图标**: Lucide React 0.515.0

### 开发工具

- **包管理**: npm
- **代码检查**: ESLint
- **构建优化**: Vite 生产构建
- **部署**: 静态文件服务器兼容

## 🎯 游戏规则

1. **目标**: 揭示所有安全格子，避免点击地雷
2. **操作**:
   - 左键点击揭示格子
   - 右键点击标记/取消标记地雷
3. **提示**: 数字表示周围 8 个格子中的地雷数量
4. **积分**:
   - 每个安全格子 +1 分
   - 完成游戏额外 +5 分
   - 难度加成倍率

## 🏆 积分系统

### 基础积分

- 揭示安全格子: 1 分/格
- 完成游戏奖励: 5 分
- 难度倍率: 简单 1x, 中等 1.2x, 困难 1.5x, 专家 2x

### 玩家等级

- 🌱 新手: 0-4 局
- 🌸 初级: 5-19 局
- 🌺 中级: 20-49 局
- 🌹 高级: 50-99 局
- 👑 专家: 100+ 局

### 成就徽章

- 🎯 初次尝试: 完成第一局游戏
- 🏆 首次胜利: 赢得第一局游戏
- 💪 坚持不懈: 完成 10 局游戏
- ⭐ 胜率达人: 胜率达到 50%
- 🎊 高分选手: 单局得分超过 100
- 👑 连胜王者: 累计胜利 10 局

## 🔒 安全特性

### 智能合约安全

- ✅ 防重入攻击保护
- ✅ 输入参数验证
- ✅ 边界条件检查
- ✅ 安全的随机数生成
- ✅ Gas 优化和限制

### 前端安全

- ✅ 钱包连接验证
- ✅ 网络兼容性检查
- ✅ 用户输入清理
- ✅ 错误边界处理

## 📊 性能优化

### 智能合约优化

- 位图存储减少 Gas 消耗
- 批量操作优化
- 事件日志优化

### 前端优化

- 组件懒加载
- 状态管理优化
- 响应式图片和资源
- 构建时代码分割

## 🚀 部署指南

### 本地开发

```bash
# 1. 安装依赖
npm run install:all

# 2. 启动本地区块链
npm run node

# 3. 编译和部署合约
npm run compile

# 4. 启动前端开发服务器
npm run dev
```

### 生产部署

```bash
# 1. 构建所有组件
npm run build:all

# 2. 部署智能合约到测试网
npm run deploy:sepolia

# 3. 构建前端应用
npm run deploy:frontend

# 4. 部署到静态文件服务器
# 将 frontend/dist/ 目录内容上传到服务器
```

### 推荐部署平台

- **Vercel**: `vercel --prod`
- **Netlify**: `netlify deploy --prod --dir=dist`
- **GitHub Pages**: 推送到 gh-pages 分支
- **IPFS**: `ipfs add -r dist/`

## 🧪 测试覆盖

### 智能合约测试

- ✅ 游戏初始化测试
- ✅ 游戏玩法测试
- ✅ 边界条件测试
- ✅ 安全性测试
- ✅ Gas 消耗测试

### 前端测试

- ✅ 组件渲染测试
- ✅ 用户交互测试
- ✅ 钱包集成测试
- ✅ 响应式设计测试

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [OpenZeppelin](https://openzeppelin.com/) - 智能合约安全库
- [Hardhat](https://hardhat.org/) - 以太坊开发环境
- [React](https://reactjs.org/) - 前端框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Ethers.js](https://ethers.org/) - 以太坊库
- [Lucide](https://lucide.dev/) - 图标库

## 📞 联系方式

- 开发者: The Augster
- 项目链接: [GitHub Repository](https://github.com/your-username/blockchain-minesweeper)
- 问题反馈: [Issues](https://github.com/your-username/blockchain-minesweeper/issues)

---

<div align="center">
  <p>🌸 Made with love by The Augster 🌸</p>
  <p>⭐ 如果这个项目对你有帮助，请给它一个星标！ ⭐</p>
</div>

```bash
# 部署到 Sepolia 测试网
npm run deploy:sepolia
```

## 🎯 游戏规则

1. 选择棋盘大小（5x5 到 20x20）和地雷数量
2. 点击格子揭示内容
3. 数字表示周围地雷数量
4. 避免点击地雷
5. 揭示所有安全格子即获胜

## 🏆 积分系统

- 揭示安全格子：+1 分
- 完成游戏：额外 +5 分
- 难度加成：根据地雷密度提供倍率

## 🔧 技术栈

- **智能合约**: Solidity + Hardhat
- **前端**: React + Vite + Tailwind CSS
- **Web3**: Ethers.js
- **测试网**: Sepolia

## 📝 许可证

MIT License
