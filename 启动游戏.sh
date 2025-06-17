#!/bin/bash

# 设置颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# 设置项目信息
PROJECT_NAME="区块链扫雷游戏"
FRONTEND_DIR="frontend"
CONTRACTS_DIR="contracts"

# 清屏并显示欢迎信息
clear
echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║${WHITE}                    🎮 ${PROJECT_NAME} 🎮                      ${PURPLE}║${NC}"
echo -e "${PURPLE}║${WHITE}                      可爱温馨的链上游戏                        ${PURPLE}║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# 检查是否在正确的目录
if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}❌ 错误：请将此脚本放在项目根目录下！${NC}"
    echo -e "${YELLOW}   项目根目录应包含 frontend 和 contracts 文件夹${NC}"
    echo ""
    read -p "按回车键退出..."
    exit 1
fi

# 检查 Node.js 是否安装
echo -e "${CYAN}🔍 检查 Node.js 环境...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ 未检测到 Node.js！${NC}"
    echo ""
    echo -e "${YELLOW}📥 请安装 Node.js 后重新运行此脚本${NC}"
    echo -e "${BLUE}   下载地址：https://nodejs.org/${NC}"
    echo ""
    echo -e "${YELLOW}💡 推荐使用 Homebrew 安装：${NC}"
    echo -e "${WHITE}   brew install node${NC}"
    echo ""
    read -p "按回车键退出..."
    exit 1
else
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js 已安装: ${NODE_VERSION}${NC}"
fi

# 检查 npm 是否可用
echo -e "${CYAN}🔍 检查 npm 包管理器...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm 不可用！请重新安装 Node.js${NC}"
    read -p "按回车键退出..."
    exit 1
else
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm 已安装: ${NPM_VERSION}${NC}"
fi

echo ""
echo -e "${BLUE}🚀 开始启动游戏...${NC}"
echo ""

# 进入前端目录
cd "$FRONTEND_DIR"

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 首次运行，正在安装依赖包...${NC}"
    echo -e "${YELLOW}   这可能需要几分钟时间，请耐心等待...${NC}"
    echo ""
    
    npm install
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ 依赖安装失败！${NC}"
        echo -e "${YELLOW}   请检查网络连接或尝试使用国内镜像：${NC}"
        echo -e "${WHITE}   npm config set registry https://registry.npmmirror.com/${NC}"
        echo ""
        read -p "按回车键退出..."
        exit 1
    fi
    echo -e "${GREEN}✅ 依赖安装完成！${NC}"
else
    echo -e "${GREEN}✅ 依赖已安装，跳过安装步骤${NC}"
fi

echo ""
echo -e "${BLUE}🎯 启动开发服务器...${NC}"
echo ""
echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║${WHITE}  🎉 游戏即将启动！                                            ${PURPLE}║${NC}"
echo -e "${PURPLE}║${WHITE}                                                              ${PURPLE}║${NC}"
echo -e "${PURPLE}║${WHITE}  📱 游戏将在浏览器中自动打开                                   ${PURPLE}║${NC}"
echo -e "${PURPLE}║${WHITE}  🌐 如果没有自动打开，请手动访问显示的地址                      ${PURPLE}║${NC}"
echo -e "${PURPLE}║${WHITE}                                                              ${PURPLE}║${NC}"
echo -e "${PURPLE}║${WHITE}  💡 使用说明：                                                ${PURPLE}║${NC}"
echo -e "${PURPLE}║${WHITE}     • 默认使用本地模式，无需网络连接                           ${PURPLE}║${NC}"
echo -e "${PURPLE}║${WHITE}     • 可切换到区块链模式（需要 MetaMask 钱包）                 ${PURPLE}║${NC}"
echo -e "${PURPLE}║${WHITE}     • 左键点击揭示格子，右键标记地雷（本地模式）               ${PURPLE}║${NC}"
echo -e "${PURPLE}║${WHITE}                                                              ${PURPLE}║${NC}"
echo -e "${PURPLE}║${WHITE}  🛑 关闭游戏：在此终端按 Ctrl+C                               ${PURPLE}║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# 等待用户确认
echo -e "${YELLOW}按回车键开始启动游戏...${NC}"
read

# 启动开发服务器
echo -e "${GREEN}🚀 正在启动...${NC}"
npm run dev

# 如果到达这里，说明服务器已停止
echo ""
echo -e "${YELLOW}🛑 游戏服务器已停止${NC}"
echo ""
read -p "按回车键退出..."
