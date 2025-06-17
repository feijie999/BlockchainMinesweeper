@echo off
chcp 65001 >nul
title 区块链扫雷游戏 - 启动器
color 0A

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    🎮 区块链扫雷游戏 🎮                      ║
echo ║                      可爱温馨的链上游戏                        ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

:: 检查是否在正确的目录
if not exist "frontend" (
    echo ❌ 错误：请将此脚本放在项目根目录下！
    echo    项目根目录应包含 frontend 和 contracts 文件夹
    echo.
    pause
    exit /b 1
)

:: 检查 Node.js 是否安装
echo 🔍 检查 Node.js 环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未检测到 Node.js！
    echo.
    echo 📥 正在打开 Node.js 下载页面...
    echo    请下载并安装 Node.js LTS 版本，然后重新运行此脚本
    echo.
    start https://nodejs.org/
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js 已安装: %NODE_VERSION%
)

:: 检查 npm 是否可用
echo 🔍 检查 npm 包管理器...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm 不可用！请重新安装 Node.js
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✅ npm 已安装: %NPM_VERSION%
)

echo.
echo 🚀 开始启动游戏...
echo.

:: 进入前端目录
cd frontend

:: 检查是否已安装依赖
if not exist "node_modules" (
    echo 📦 首次运行，正在安装依赖包...
    echo    这可能需要几分钟时间，请耐心等待...
    echo.
    npm install
    if errorlevel 1 (
        echo ❌ 依赖安装失败！
        echo    请检查网络连接或尝试使用国内镜像：
        echo    npm config set registry https://registry.npmmirror.com/
        echo.
        pause
        exit /b 1
    )
    echo ✅ 依赖安装完成！
) else (
    echo ✅ 依赖已安装，跳过安装步骤
)

echo.
echo 🎯 启动开发服务器...
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║  🎉 游戏即将启动！                                            ║
echo ║                                                              ║
echo ║  📱 游戏将在浏览器中自动打开                                   ║
echo ║  🌐 如果没有自动打开，请手动访问显示的地址                      ║
echo ║                                                              ║
echo ║  💡 使用说明：                                                ║
echo ║     • 默认使用本地模式，无需网络连接                           ║
echo ║     • 可切换到区块链模式（需要 MetaMask 钱包）                 ║
echo ║     • 左键点击揭示格子，右键标记地雷（本地模式）               ║
echo ║                                                              ║
echo ║  🛑 关闭游戏：在此窗口按 Ctrl+C                               ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

:: 等待用户确认
echo 按任意键开始启动游戏...
pause >nul

:: 启动开发服务器
echo 🚀 正在启动...
npm run dev

:: 如果到达这里，说明服务器已停止
echo.
echo 🛑 游戏服务器已停止
echo.
pause
