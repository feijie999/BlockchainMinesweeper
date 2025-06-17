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

# 设置变量
PROJECT_NAME="区块链扫雷游戏"
FRONTEND_DIR="frontend"
CONTRACTS_DIR="contracts"
NODE_MIN_VERSION="16"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 确保在正确的目录运行
cd "$SCRIPT_DIR"

# 信号处理 - 优雅退出
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 正在停止服务...${NC}"
    # 杀死所有子进程
    jobs -p | xargs -r kill 2>/dev/null
    echo -e "${GREEN}✅ 已安全退出${NC}"
    exit 0
}

# 设置信号捕获
trap cleanup SIGINT SIGTERM

# 显示欢迎界面
welcome() {
    clear
    echo ""
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${WHITE}                    🎮 ${PROJECT_NAME} 🎮                      ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}                      可爱温馨的链上游戏                        ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}                                                              ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}  🌟 功能特色：                                                ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}     • 💻 本地模式 - 离线游戏，快速响应                        ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}     • 🔗 区块链模式 - 连接 MetaMask，数据上链                  ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}     • 🎯 智能标记 - 右键标记地雷（本地模式）                   ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}     • 📊 统计追踪 - 游戏记录和成就系统                        ${PURPLE}║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# 主菜单
main_menu() {
    echo "请选择操作："
    echo ""
    echo -e "${GREEN}[1]${NC} 🚀 启动游戏（推荐）"
    echo -e "${BLUE}[2]${NC} 🔧 检查环境"
    echo -e "${YELLOW}[3]${NC} 📦 重新安装依赖"
    echo -e "${PURPLE}[4]${NC} 🌐 启动区块链网络（高级用户）"
    echo -e "${CYAN}[5]${NC} 🧪 运行测试"
    echo -e "${WHITE}[6]${NC} ❓ 帮助说明"
    echo -e "${RED}[7]${NC} 🚪 退出"
    echo ""
    read -p "请输入选项 (1-7): " choice

    case $choice in
        1) start_game ;;
        2) check_env ;;
        3) reinstall_deps ;;
        4) start_blockchain ;;
        5) run_tests ;;
        6) show_help ;;
        7) exit_script ;;
        *)
            echo -e "${RED}❌ 无效选项，请重新选择${NC}"
            sleep 1
            welcome
            main_menu
            ;;
    esac
}

# 检查基本环境
check_basic_env() {
    echo -e "${BLUE}🔍 检查基本环境...${NC}"

    # 检查项目结构
    if [ ! -d "$FRONTEND_DIR" ]; then
        echo -e "${RED}❌ 错误：找不到 $FRONTEND_DIR 目录${NC}"
        echo -e "${YELLOW}💡 请确保在项目根目录运行此脚本${NC}"
        return 1
    fi

    if [ ! -d "$CONTRACTS_DIR" ]; then
        echo -e "${RED}❌ 错误：找不到 $CONTRACTS_DIR 目录${NC}"
        echo -e "${YELLOW}💡 请确保在项目根目录运行此脚本${NC}"
        return 1
    fi

    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ 错误：未安装 Node.js${NC}"
        echo ""
        echo -e "${YELLOW}📥 请访问 https://nodejs.org/ 下载并安装 Node.js${NC}"
        echo -e "${BLUE}💡 或使用 Homebrew 安装：brew install node${NC}"
        return 1
    fi

    # 检查 Node.js 版本
    NODE_VERSION=$(node --version | sed 's/v//')
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1)
    if [ "$NODE_MAJOR" -lt "$NODE_MIN_VERSION" ]; then
        echo -e "${RED}❌ 错误：Node.js 版本过低 (当前: v$NODE_VERSION, 需要: v$NODE_MIN_VERSION+)${NC}"
        echo -e "${YELLOW}📥 请更新 Node.js 到最新版本${NC}"
        return 1
    fi

    # 检查 npm
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ 错误：npm 不可用${NC}"
        return 1
    fi

    # 检查网络连接（可选）
    if ! ping -c 1 registry.npmjs.org &> /dev/null; then
        echo -e "${YELLOW}⚠️  警告：无法连接到 npm 仓库，可能影响依赖安装${NC}"
        echo -e "${BLUE}💡 如果遇到安装问题，请检查网络连接${NC}"
    fi

    echo -e "${GREEN}✅ 基本环境检查通过${NC}"
    return 0
}

# 检查环境
check_env() {
    clear
    echo ""
    echo -e "${CYAN}🔍 正在检查运行环境...${NC}"
    echo ""

    # 检查项目结构
    echo -e "${BLUE}[1/5]${NC} 检查项目结构..."
    if [ ! -d "$FRONTEND_DIR" ]; then
        echo -e "${RED}❌ 错误：找不到 $FRONTEND_DIR 目录${NC}"
        error_exit
    fi
    if [ ! -d "$CONTRACTS_DIR" ]; then
        echo -e "${RED}❌ 错误：找不到 $CONTRACTS_DIR 目录${NC}"
        error_exit
    fi
    echo -e "${GREEN}✅ 项目结构正确${NC}"

    # 检查 Node.js
    echo -e "${BLUE}[2/5]${NC} 检查 Node.js..."
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ 未安装 Node.js${NC}"
        echo ""
        echo -e "${YELLOW}📥 是否现在打开下载页面？ (y/n)${NC}"
        read -p "请选择: " download
        if [[ $download == "y" || $download == "Y" ]]; then
            open "https://nodejs.org/"
            echo "请安装 Node.js 后重新运行此脚本"
        fi
        error_exit
    else
        NODE_VERSION=$(node --version)
        echo -e "${GREEN}✅ Node.js: $NODE_VERSION${NC}"
    fi

    # 检查 npm
    echo -e "${BLUE}[3/5]${NC} 检查 npm..."
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm 不可用${NC}"
        error_exit
    else
        NPM_VERSION=$(npm --version)
        echo -e "${GREEN}✅ npm: $NPM_VERSION${NC}"
    fi

    # 检查前端依赖
    echo -e "${BLUE}[4/5]${NC} 检查前端依赖..."
    if [ -d "$FRONTEND_DIR/node_modules" ]; then
        echo -e "${GREEN}✅ 前端依赖已安装${NC}"
    else
        echo -e "${YELLOW}⚠️  前端依赖未安装${NC}"
    fi

    # 检查合约依赖
    echo -e "${BLUE}[5/5]${NC} 检查合约依赖..."
    if [ -d "$CONTRACTS_DIR/node_modules" ]; then
        echo -e "${GREEN}✅ 合约依赖已安装${NC}"
    else
        echo -e "${YELLOW}⚠️  合约依赖未安装${NC}"
    fi

    echo ""
    echo -e "${GREEN}🎉 环境检查完成！${NC}"
    echo ""
    read -p "按回车键返回主菜单..."
    welcome
    main_menu
}

# 启动游戏
start_game() {
    clear
    echo ""
    echo -e "${BLUE}🚀 正在启动 $PROJECT_NAME...${NC}"
    echo ""

    # 检查基本环境
    if ! check_basic_env; then
        error_exit
    fi

    # 安装前端依赖
    echo ""
    echo -e "${YELLOW}📦 检查前端依赖...${NC}"
    cd "$FRONTEND_DIR"

    if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
        echo -e "${BLUE}正在安装前端依赖，请稍候...${NC}"
        echo -e "${CYAN}💡 首次安装可能需要几分钟时间${NC}"

        # 显示安装进度
        npm install --progress=true

        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ 前端依赖安装失败${NC}"
            echo -e "${YELLOW}💡 请检查网络连接或尝试重新安装依赖${NC}"
            cd ..
            error_exit
        fi
        echo -e "${GREEN}✅ 前端依赖安装完成${NC}"
    else
        echo -e "${GREEN}✅ 前端依赖已存在${NC}"
    fi

    # 检查关键文件
    if [ ! -f "vite.config.js" ]; then
        echo -e "${RED}❌ 错误：找不到 vite.config.js 配置文件${NC}"
        cd ..
        error_exit
    fi

    echo ""
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${WHITE}  🎉 准备就绪！游戏即将启动...                                  ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}                                                              ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}  📱 游戏将在默认浏览器中打开                                   ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}  🌐 默认地址：http://localhost:5173                           ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}                                                              ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}  💡 游戏模式：                                                ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}     🏠 本地模式 - 推荐新手，无需配置                          ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}     ⛓️  区块链模式 - 需要 MetaMask 钱包                       ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}                                                              ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}  🎮 操作说明：                                                ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}     • 左键：揭示格子                                          ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}     • 右键：标记地雷（仅本地模式）                             ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}     • 数字：显示周围地雷数量                                   ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}                                                              ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}  🛑 关闭游戏：在此终端按 Ctrl+C                               ${PURPLE}║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    # 倒计时启动
    for i in 3 2 1; do
        echo -e "${GREEN}🚀 启动倒计时: $i${NC}"
        sleep 1
    done

    echo -e "${GREEN}🎮 启动游戏服务器...${NC}"
    echo ""

    # 启动开发服务器
    npm run dev

    cd ..
    echo ""
    echo -e "${YELLOW}🛑 游戏已停止${NC}"
    read -p "按回车键返回主菜单..."
    welcome
    main_menu
}

# 重新安装依赖
reinstall_deps() {
    clear
    echo ""
    echo -e "${YELLOW}🔄 重新安装项目依赖...${NC}"
    echo ""

    if ! check_basic_env; then
        error_exit
    fi

    echo -e "${RED}🗑️  清理旧依赖...${NC}"
    [ -d "$FRONTEND_DIR/node_modules" ] && rm -rf "$FRONTEND_DIR/node_modules"
    [ -d "$CONTRACTS_DIR/node_modules" ] && rm -rf "$CONTRACTS_DIR/node_modules"

    echo -e "${YELLOW}📦 安装前端依赖...${NC}"
    cd "$FRONTEND_DIR"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ 前端依赖安装失败${NC}"
        cd ..
        error_exit
    fi
    cd ..

    echo -e "${YELLOW}📦 安装合约依赖...${NC}"
    cd "$CONTRACTS_DIR"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ 合约依赖安装失败${NC}"
        cd ..
        error_exit
    fi
    cd ..

    echo -e "${GREEN}✅ 依赖安装完成！${NC}"
    read -p "按回车键返回主菜单..."
    welcome
    main_menu
}

# 启动区块链网络
start_blockchain() {
    clear
    echo ""
    echo -e "${PURPLE}⛓️  启动本地区块链网络...${NC}"
    echo ""

    if ! check_basic_env; then
        error_exit
    fi

    echo -e "${YELLOW}📦 检查合约依赖...${NC}"
    cd "$CONTRACTS_DIR"

    if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
        echo -e "${BLUE}正在安装合约依赖...${NC}"
        npm install --progress=true
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ 合约依赖安装失败${NC}"
            cd ..
            error_exit
        fi
        echo -e "${GREEN}✅ 合约依赖安装完成${NC}"
    else
        echo -e "${GREEN}✅ 合约依赖已存在${NC}"
    fi

    # 检查 Hardhat 配置
    if [ ! -f "hardhat.config.js" ]; then
        echo -e "${RED}❌ 错误：找不到 hardhat.config.js 配置文件${NC}"
        cd ..
        error_exit
    fi

    # 检查端口是否被占用
    if lsof -Pi :8545 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}⚠️  警告：端口 8545 已被占用${NC}"
        echo -e "${BLUE}💡 请先停止其他区块链服务或更改端口${NC}"
        read -p "是否继续？(y/n): " continue_choice
        if [[ $continue_choice != "y" && $continue_choice != "Y" ]]; then
            cd ..
            welcome
            main_menu
            return
        fi
    fi

    echo ""
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${WHITE}  ⛓️  本地区块链网络启动中...                                   ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}                                                              ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}  🌐 网络地址：http://127.0.0.1:8545                           ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}  🆔 链 ID：31337                                              ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}                                                              ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}  💰 测试账户已预置 10000 ETH                                  ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}  🔑 私钥和地址将在启动后显示                                   ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}                                                              ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}  ⚠️  注意：这是测试网络，请勿发送真实资金！                     ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}                                                              ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}  🛑 停止网络：按 Ctrl+C                                       ${PURPLE}║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    echo -e "${GREEN}🚀 启动 Hardhat 网络...${NC}"
    npx hardhat node

    cd ..
    echo ""
    echo -e "${YELLOW}🛑 区块链网络已停止${NC}"
    read -p "按回车键返回主菜单..."
    welcome
    main_menu
}

# 运行测试
run_tests() {
    clear
    echo ""
    echo -e "${CYAN}🧪 运行项目测试...${NC}"
    echo ""

    if ! check_basic_env; then
        error_exit
    fi

    echo "请选择测试类型："
    echo ""
    echo -e "${GREEN}[1]${NC} 🎮 前端测试 (Playwright)"
    echo -e "${BLUE}[2]${NC} ⛓️  智能合约测试 (Hardhat)"
    echo -e "${YELLOW}[3]${NC} 🔄 运行所有测试"
    echo -e "${RED}[4]${NC} 🔙 返回主菜单"
    echo ""
    read -p "请输入选项 (1-4): " test_choice

    case $test_choice in
        1) run_frontend_tests ;;
        2) run_contract_tests ;;
        3) run_all_tests ;;
        4) welcome; main_menu ;;
        *)
            echo -e "${RED}❌ 无效选项${NC}"
            sleep 1
            run_tests
            ;;
    esac
}

# 运行前端测试
run_frontend_tests() {
    echo ""
    echo -e "${GREEN}🎮 运行前端测试...${NC}"

    cd "$FRONTEND_DIR"

    # 检查依赖
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 安装前端依赖...${NC}"
        npm install
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ 依赖安装失败${NC}"
            cd ..
            error_exit
        fi
    fi

    # 安装 Playwright 浏览器
    echo -e "${BLUE}🌐 检查 Playwright 浏览器...${NC}"
    npx playwright install --with-deps

    # 运行测试
    echo -e "${CYAN}🧪 执行前端测试...${NC}"
    npm run test

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 前端测试通过！${NC}"
    else
        echo -e "${RED}❌ 前端测试失败${NC}"
    fi

    cd ..
    echo ""
    read -p "按回车键继续..."
    run_tests
}

# 运行合约测试
run_contract_tests() {
    echo ""
    echo -e "${BLUE}⛓️  运行智能合约测试...${NC}"

    cd "$CONTRACTS_DIR"

    # 检查依赖
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 安装合约依赖...${NC}"
        npm install
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ 依赖安装失败${NC}"
            cd ..
            error_exit
        fi
    fi

    # 编译合约
    echo -e "${YELLOW}🔨 编译智能合约...${NC}"
    npx hardhat compile

    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ 合约编译失败${NC}"
        cd ..
        error_exit
    fi

    # 运行测试
    echo -e "${CYAN}🧪 执行合约测试...${NC}"
    npx hardhat test

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 合约测试通过！${NC}"
    else
        echo -e "${RED}❌ 合约测试失败${NC}"
    fi

    cd ..
    echo ""
    read -p "按回车键继续..."
    run_tests
}

# 运行所有测试
run_all_tests() {
    echo ""
    echo -e "${YELLOW}🔄 运行所有测试...${NC}"
    echo ""

    # 运行合约测试
    echo -e "${BLUE}[1/2] 智能合约测试${NC}"
    run_contract_tests_silent

    echo ""
    # 运行前端测试
    echo -e "${GREEN}[2/2] 前端测试${NC}"
    run_frontend_tests_silent

    echo ""
    echo -e "${GREEN}🎉 所有测试完成！${NC}"
    read -p "按回车键继续..."
    run_tests
}

# 静默运行合约测试（用于全部测试）
run_contract_tests_silent() {
    cd "$CONTRACTS_DIR"
    if [ ! -d "node_modules" ]; then
        npm install --silent
    fi
    npx hardhat compile --quiet
    npx hardhat test
    cd ..
}

# 静默运行前端测试（用于全部测试）
run_frontend_tests_silent() {
    cd "$FRONTEND_DIR"
    if [ ! -d "node_modules" ]; then
        npm install --silent
    fi
    npx playwright install --with-deps > /dev/null 2>&1
    npm run test
    cd ..
}

# 显示帮助
show_help() {
    clear
    echo ""
    echo -e "${CYAN}❓ $PROJECT_NAME - 帮助说明${NC}"
    echo ""
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${WHITE}  🎮 游戏说明                                                  ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}                                                              ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}  这是一个结合了传统扫雷游戏和区块链技术的创新游戏。            ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}  支持两种游戏模式：                                            ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}                                                              ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}  🏠 本地模式（推荐新手）：                                     ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}     • 完全离线运行，无需网络连接                               ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}     • 数据保存在浏览器本地                                     ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}     • 支持右键标记功能                                         ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}     • 响应速度快，适合休闲游戏                                 ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}                                                              ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}  ⛓️  区块链模式（高级用户）：                                  ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}     • 需要安装 MetaMask 钱包                                  ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}     • 游戏数据存储在区块链上                                   ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}     • 支持代币奖励（测试环境）                                 ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}     • 可与其他玩家竞技                                         ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}                                                              ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}  🔧 技术要求：                                                ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}     • macOS 10.12 或更高版本                                  ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}     • Node.js 16.0 或更高版本                                 ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}     • 现代浏览器（Chrome、Firefox、Safari 等）               ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}     • MetaMask 钱包（仅区块链模式需要）                        ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}                                                              ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}  🆘 常见问题：                                                ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}     • 如果启动失败，请先运行"检查环境"                         ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}     • 网络问题可尝试"重新安装依赖"                             ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${WHITE}     • 更多帮助请访问项目 GitHub 页面                           ${PURPLE}║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    read -p "按回车键返回主菜单..."
    welcome
    main_menu
}

# 错误退出
error_exit() {
    echo ""
    echo -e "${RED}❌ 操作失败！${NC}"
    echo ""

    # 记录错误日志
    LOG_FILE="error.log"
    echo "$(date): 操作失败" >> "$LOG_FILE"

    echo -e "${YELLOW}💡 故障排除建议：${NC}"
    echo -e "${WHITE}   1. 检查网络连接${NC}"
    echo -e "${WHITE}   2. 确保 Node.js 版本 >= 16${NC}"
    echo -e "${WHITE}   3. 尝试重新安装依赖${NC}"
    echo -e "${WHITE}   4. 查看错误日志：$LOG_FILE${NC}"
    echo ""

    echo -e "${BLUE}🔧 快速修复选项：${NC}"
    echo -e "${GREEN}[1]${NC} 🔄 重新安装依赖"
    echo -e "${BLUE}[2]${NC} 🔍 检查环境"
    echo -e "${YELLOW}[3]${NC} 📋 返回主菜单"
    echo -e "${RED}[4]${NC} 🚪 退出程序"
    echo ""
    read -p "请选择 (1-4): " fix_choice

    case $fix_choice in
        1) reinstall_deps ;;
        2) check_env ;;
        3) welcome; main_menu ;;
        4) exit_script ;;
        *) welcome; main_menu ;;
    esac
}

# 正常退出
exit_script() {
    clear
    echo ""
    echo -e "${GREEN}👋 感谢使用 $PROJECT_NAME！${NC}"
    echo ""
    echo -e "${BLUE}👨‍💻 作者：青蛙会点头${NC}"
    echo -e "${PURPLE}💝 用爱心打造的可爱游戏${NC}"
    echo ""
    echo -e "${YELLOW}🌟 如果您喜欢这个游戏，请：${NC}"
    echo -e "${WHITE}   • ⭐ 给项目点个星星${NC}"
    echo -e "${WHITE}   • 🐛 报告问题和建议${NC}"
    echo -e "${WHITE}   • 💝 分享给朋友们${NC}"
    echo ""
    echo -e "${GREEN}再见！${NC}"
    sleep 3
    exit 0
}

# 主程序入口
welcome
main_menu
