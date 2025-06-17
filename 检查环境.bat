@echo off
chcp 65001 >nul
title 区块链扫雷游戏 - 环境检查工具
color 0B

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                🔍 环境检查工具 🔍                             ║
echo ║              检查游戏运行所需的环境配置                        ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

set "error_count=0"
set "warning_count=0"

:: 检查项目结构
echo [1/8] 🗂️  检查项目结构...
if not exist "frontend" (
    echo ❌ 错误：找不到 frontend 目录
    set /a error_count+=1
) else (
    echo ✅ frontend 目录存在
)

if not exist "contracts" (
    echo ❌ 错误：找不到 contracts 目录
    set /a error_count+=1
) else (
    echo ✅ contracts 目录存在
)

if not exist "frontend\package.json" (
    echo ❌ 错误：找不到 frontend\package.json
    set /a error_count+=1
) else (
    echo ✅ frontend\package.json 存在
)

echo.

:: 检查 Node.js
echo [2/8] 🟢 检查 Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误：未安装 Node.js
    echo    请访问 https://nodejs.org/ 下载安装
    set /a error_count+=1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js 版本: %NODE_VERSION%
    
    :: 检查版本是否足够新
    for /f "tokens=2 delims=v." %%a in ("%NODE_VERSION%") do set NODE_MAJOR=%%a
    if %NODE_MAJOR% LSS 16 (
        echo ⚠️  警告：Node.js 版本较旧，推荐 16.0 或更高版本
        set /a warning_count+=1
    )
)

echo.

:: 检查 npm
echo [3/8] 📦 检查 npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误：npm 不可用
    set /a error_count+=1
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✅ npm 版本: %NPM_VERSION%
)

echo.

:: 检查网络连接
echo [4/8] 🌐 检查网络连接...
ping -n 1 8.8.8.8 >nul 2>&1
if errorlevel 1 (
    echo ⚠️  警告：网络连接异常，可能影响依赖安装
    set /a warning_count+=1
) else (
    echo ✅ 网络连接正常
)

echo.

:: 检查前端依赖
echo [5/8] 🎨 检查前端依赖...
if exist "frontend\node_modules" (
    echo ✅ 前端依赖已安装
    
    :: 检查关键依赖
    if exist "frontend\node_modules\react" (
        echo ✅ React 已安装
    ) else (
        echo ⚠️  警告：React 未正确安装
        set /a warning_count+=1
    )
    
    if exist "frontend\node_modules\ethers" (
        echo ✅ Ethers.js 已安装
    ) else (
        echo ⚠️  警告：Ethers.js 未正确安装
        set /a warning_count+=1
    )
) else (
    echo ⚠️  前端依赖未安装，首次启动时会自动安装
    set /a warning_count+=1
)

echo.

:: 检查合约依赖
echo [6/8] ⛓️  检查合约依赖...
if exist "contracts\node_modules" (
    echo ✅ 合约依赖已安装
    
    if exist "contracts\node_modules\hardhat" (
        echo ✅ Hardhat 已安装
    ) else (
        echo ⚠️  警告：Hardhat 未正确安装
        set /a warning_count+=1
    )
) else (
    echo ⚠️  合约依赖未安装，区块链模式需要时会自动安装
    set /a warning_count+=1
)

echo.

:: 检查浏览器
echo [7/8] 🌐 检查浏览器...
set "browser_found=0"

:: 检查 Chrome
reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe" >nul 2>&1
if not errorlevel 1 (
    echo ✅ Google Chrome 已安装
    set "browser_found=1"
)

:: 检查 Edge
reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\msedge.exe" >nul 2>&1
if not errorlevel 1 (
    echo ✅ Microsoft Edge 已安装
    set "browser_found=1"
)

:: 检查 Firefox
reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\firefox.exe" >nul 2>&1
if not errorlevel 1 (
    echo ✅ Mozilla Firefox 已安装
    set "browser_found=1"
)

if "%browser_found%"=="0" (
    echo ⚠️  警告：未检测到常见浏览器，请确保已安装现代浏览器
    set /a warning_count+=1
)

echo.

:: 检查端口占用
echo [8/8] 🔌 检查端口占用...
netstat -an | find "5173" >nul 2>&1
if not errorlevel 1 (
    echo ⚠️  警告：端口 5173 已被占用，游戏可能使用其他端口
    set /a warning_count+=1
) else (
    echo ✅ 端口 5173 可用
)

netstat -an | find "8545" >nul 2>&1
if not errorlevel 1 (
    echo ⚠️  警告：端口 8545 已被占用，区块链网络可能无法启动
    set /a warning_count+=1
) else (
    echo ✅ 端口 8545 可用
)

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    📊 检查结果汇总                            ║
echo ╚══════════════════════════════════════════════════════════════╝

if %error_count%==0 (
    if %warning_count%==0 (
        echo.
        echo 🎉 恭喜！您的环境配置完美！
        echo ✅ 所有检查项目都通过
        echo 🚀 可以正常启动游戏
        echo.
        echo 建议：
        echo • 双击"一键启动.bat"开始游戏
        echo • 选择本地模式获得最佳体验
    ) else (
        echo.
        echo ✅ 环境基本正常，有 %warning_count% 个警告
        echo 🚀 可以启动游戏，但可能需要注意警告项
        echo.
        echo 建议：
        echo • 可以尝试启动游戏
        echo • 如遇问题请解决上述警告
    )
) else (
    echo.
    echo ❌ 发现 %error_count% 个错误，%warning_count% 个警告
    echo 🛑 需要解决错误后才能正常运行游戏
    echo.
    echo 建议：
    echo • 请先解决上述错误
    echo • 安装缺失的软件
    echo • 重新运行此检查工具
)

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    🆘 获取帮助                               ║
echo ║                                                              ║
echo ║  如果遇到问题，请：                                            ║
echo ║  • 查看"README_用户指南.md"文件                               ║
echo ║  • 确保网络连接正常                                            ║
echo ║  • 以管理员身份运行脚本                                        ║
echo ║  • 关闭杀毒软件后重试                                          ║
echo ║                                                              ║
echo ║  Node.js 下载：https://nodejs.org/                           ║
echo ║  Chrome 下载：https://www.google.com/chrome/                 ║
echo ╚══════════════════════════════════════════════════════════════╝

echo.
pause
