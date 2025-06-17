@echo off
chcp 65001 >nul
title 区块链扫雷游戏 - 智能启动器
color 0A

:: 设置变量
set "PROJECT_NAME=区块链扫雷游戏"
set "FRONTEND_DIR=frontend"
set "CONTRACTS_DIR=contracts"
set "NODE_MIN_VERSION=16"

:: 显示欢迎界面
:welcome
cls
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    🎮 %PROJECT_NAME% 🎮                      ║
echo ║                      可爱温馨的链上游戏                        ║
echo ║                                                              ║
echo ║  🌟 功能特色：                                                ║
echo ║     • 💻 本地模式 - 离线游戏，快速响应                        ║
echo ║     • 🔗 区块链模式 - 连接 MetaMask，数据上链                  ║
echo ║     • 🎯 智能标记 - 右键标记地雷（本地模式）                   ║
echo ║     • 📊 统计追踪 - 游戏记录和成就系统                        ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

:: 主菜单
echo 请选择操作：
echo.
echo [1] 🚀 启动游戏（推荐）
echo [2] 🔧 检查环境
echo [3] 📦 重新安装依赖
echo [4] 🌐 启动区块链网络（高级用户）
echo [5] 🧪 运行测试
echo [6] ❓ 帮助说明
echo [7] 🚪 退出
echo.
set /p choice="请输入选项 (1-7): "

if "%choice%"=="1" goto start_game
if "%choice%"=="2" goto check_env
if "%choice%"=="3" goto reinstall_deps
if "%choice%"=="4" goto start_blockchain
if "%choice%"=="5" goto run_tests
if "%choice%"=="6" goto show_help
if "%choice%"=="7" goto exit_script
echo ❌ 无效选项，请重新选择
timeout /t 1 /nobreak >nul
goto welcome

:: 检查环境
:check_env
cls
echo.
echo 🔍 正在检查运行环境...
echo.

:: 检查项目结构
echo [1/5] 检查项目结构...
if not exist "%FRONTEND_DIR%" (
    echo ❌ 错误：找不到 %FRONTEND_DIR% 目录
    goto error_exit
)
if not exist "%CONTRACTS_DIR%" (
    echo ❌ 错误：找不到 %CONTRACTS_DIR% 目录
    goto error_exit
)
echo ✅ 项目结构正确

:: 检查 Node.js
echo [2/5] 检查 Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未安装 Node.js
    echo.
    echo 📥 是否现在下载 Node.js？ (y/n)
    set /p download="请选择: "
    if /i "%download%"=="y" (
        start https://nodejs.org/
        echo 请安装 Node.js 后重新运行此脚本
    )
    goto error_exit
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js: %NODE_VERSION%
)

:: 检查 npm
echo [3/5] 检查 npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm 不可用
    goto error_exit
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✅ npm: %NPM_VERSION%
)

:: 检查前端依赖
echo [4/5] 检查前端依赖...
if exist "%FRONTEND_DIR%\node_modules" (
    echo ✅ 前端依赖已安装
) else (
    echo ⚠️  前端依赖未安装
)

:: 检查合约依赖
echo [5/5] 检查合约依赖...
if exist "%CONTRACTS_DIR%\node_modules" (
    echo ✅ 合约依赖已安装
) else (
    echo ⚠️  合约依赖未安装
)

echo.
echo 🎉 环境检查完成！
echo.
pause
goto welcome

:: 启动游戏
:start_game
cls
echo.
echo 🚀 正在启动 %PROJECT_NAME%...
echo.

:: 检查基本环境
call :check_basic_env
if errorlevel 1 goto error_exit

:: 安装前端依赖
echo 📦 检查前端依赖...
cd "%FRONTEND_DIR%"
if not exist "node_modules" (
    echo 正在安装前端依赖，请稍候...
    npm install --silent
    if errorlevel 1 (
        echo ❌ 前端依赖安装失败
        cd ..
        goto error_exit
    )
)

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║  🎉 准备就绪！游戏即将启动...                                  ║
echo ║                                                              ║
echo ║  📱 游戏将在默认浏览器中打开                                   ║
echo ║  🌐 默认地址：http://localhost:5173                           ║
echo ║                                                              ║
echo ║  💡 游戏模式：                                                ║
echo ║     🏠 本地模式 - 推荐新手，无需配置                          ║
echo ║     ⛓️  区块链模式 - 需要 MetaMask 钱包                       ║
echo ║                                                              ║
echo ║  🎮 操作说明：                                                ║
echo ║     • 左键：揭示格子                                          ║
echo ║     • 右键：标记地雷（仅本地模式）                             ║
echo ║     • 数字：显示周围地雷数量                                   ║
echo ║                                                              ║
echo ║  🛑 关闭游戏：在此窗口按 Ctrl+C                               ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

timeout /t 3 /nobreak >nul
echo 🚀 启动中...

:: 启动开发服务器
npm run dev

cd ..
echo.
echo 🛑 游戏已停止
pause
goto welcome

:: 重新安装依赖
:reinstall_deps
cls
echo.
echo 🔄 重新安装项目依赖...
echo.

call :check_basic_env
if errorlevel 1 goto error_exit

echo 🗑️  清理旧依赖...
if exist "%FRONTEND_DIR%\node_modules" rmdir /s /q "%FRONTEND_DIR%\node_modules"
if exist "%CONTRACTS_DIR%\node_modules" rmdir /s /q "%CONTRACTS_DIR%\node_modules"

echo 📦 安装前端依赖...
cd "%FRONTEND_DIR%"
npm install
if errorlevel 1 (
    echo ❌ 前端依赖安装失败
    cd ..
    goto error_exit
)
cd ..

echo 📦 安装合约依赖...
cd "%CONTRACTS_DIR%"
npm install
if errorlevel 1 (
    echo ❌ 合约依赖安装失败
    cd ..
    goto error_exit
)
cd ..

echo ✅ 依赖安装完成！
pause
goto welcome

:: 启动区块链网络
:start_blockchain
cls
echo.
echo ⛓️  启动本地区块链网络...
echo.

call :check_basic_env
if errorlevel 1 goto error_exit

echo 检查合约依赖...
cd "%CONTRACTS_DIR%"
if not exist "node_modules" (
    echo 正在安装合约依赖...
    npm install
    if errorlevel 1 (
        echo ❌ 合约依赖安装失败
        cd ..
        goto error_exit
    )
)

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║  ⛓️  本地区块链网络启动中...                                   ║
echo ║                                                              ║
echo ║  🌐 网络地址：http://127.0.0.1:8545                           ║
echo ║  🆔 链 ID：31337                                              ║
echo ║                                                              ║
echo ║  💰 测试账户已预置 10000 ETH                                  ║
echo ║  🔑 私钥和地址将在启动后显示                                   ║
echo ║                                                              ║
echo ║  ⚠️  注意：这是测试网络，请勿发送真实资金！                     ║
echo ║                                                              ║
echo ║  🛑 停止网络：按 Ctrl+C                                       ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

npx hardhat node

cd ..
echo.
echo 🛑 区块链网络已停止
pause
goto welcome

:: 运行测试
:run_tests
cls
echo.
echo 🧪 运行项目测试...
echo.

call :check_basic_env
if errorlevel 1 goto error_exit

echo 请选择测试类型：
echo.
echo [1] 🎮 前端测试 (Playwright)
echo [2] ⛓️  智能合约测试 (Hardhat)
echo [3] 🔄 运行所有测试
echo [4] 🔙 返回主菜单
echo.
set /p test_choice="请输入选项 (1-4): "

if "%test_choice%"=="1" goto run_frontend_tests
if "%test_choice%"=="2" goto run_contract_tests
if "%test_choice%"=="3" goto run_all_tests
if "%test_choice%"=="4" goto welcome
echo ❌ 无效选项
timeout /t 1 /nobreak >nul
goto run_tests

:: 运行前端测试
:run_frontend_tests
echo.
echo 🎮 运行前端测试...

cd "%FRONTEND_DIR%"

:: 检查依赖
if not exist "node_modules" (
    echo 📦 安装前端依赖...
    npm install
    if errorlevel 1 (
        echo ❌ 依赖安装失败
        cd ..
        goto error_exit
    )
)

:: 安装 Playwright 浏览器
echo 🌐 检查 Playwright 浏览器...
npx playwright install --with-deps

:: 运行测试
echo 🧪 执行前端测试...
npm run test

if errorlevel 1 (
    echo ❌ 前端测试失败
) else (
    echo ✅ 前端测试通过！
)

cd ..
echo.
pause
goto run_tests

:: 运行合约测试
:run_contract_tests
echo.
echo ⛓️  运行智能合约测试...

cd "%CONTRACTS_DIR%"

:: 检查依赖
if not exist "node_modules" (
    echo 📦 安装合约依赖...
    npm install
    if errorlevel 1 (
        echo ❌ 依赖安装失败
        cd ..
        goto error_exit
    )
)

:: 编译合约
echo 🔨 编译智能合约...
npx hardhat compile

if errorlevel 1 (
    echo ❌ 合约编译失败
    cd ..
    goto error_exit
)

:: 运行测试
echo 🧪 执行合约测试...
npx hardhat test

if errorlevel 1 (
    echo ❌ 合约测试失败
) else (
    echo ✅ 合约测试通过！
)

cd ..
echo.
pause
goto run_tests

:: 运行所有测试
:run_all_tests
echo.
echo 🔄 运行所有测试...
echo.

:: 运行合约测试
echo [1/2] 智能合约测试
cd "%CONTRACTS_DIR%"
if not exist "node_modules" npm install --silent
npx hardhat compile --quiet
npx hardhat test
cd ..

echo.
:: 运行前端测试
echo [2/2] 前端测试
cd "%FRONTEND_DIR%"
if not exist "node_modules" npm install --silent
npx playwright install --with-deps >nul 2>&1
npm run test
cd ..

echo.
echo 🎉 所有测试完成！
pause
goto run_tests

:: 显示帮助
:show_help
cls
echo.
echo ❓ %PROJECT_NAME% - 帮助说明
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║  🎮 游戏说明                                                  ║
echo ║                                                              ║
echo ║  这是一个结合了传统扫雷游戏和区块链技术的创新游戏。            ║
echo ║  支持两种游戏模式：                                            ║
echo ║                                                              ║
echo ║  🏠 本地模式（推荐新手）：                                     ║
echo ║     • 完全离线运行，无需网络连接                               ║
echo ║     • 数据保存在浏览器本地                                     ║
echo ║     • 支持右键标记功能                                         ║
echo ║     • 响应速度快，适合休闲游戏                                 ║
echo ║                                                              ║
echo ║  ⛓️  区块链模式（高级用户）：                                  ║
echo ║     • 需要安装 MetaMask 钱包                                  ║
echo ║     • 游戏数据存储在区块链上                                   ║
echo ║     • 支持代币奖励（测试环境）                                 ║
echo ║     • 可与其他玩家竞技                                         ║
echo ║                                                              ║
echo ║  🎯 游戏规则：                                                ║
echo ║     • 点击格子揭示内容                                         ║
echo ║     • 数字表示周围地雷数量                                     ║
echo ║     • 标记所有地雷位置即可获胜                                 ║
echo ║     • 点到地雷则游戏失败                                       ║
echo ║                                                              ║
echo ║  🔧 技术要求：                                                ║
echo ║     • Windows 7 或更高版本                                    ║
echo ║     • Node.js 16.0 或更高版本                                 ║
echo ║     • 现代浏览器（Chrome、Firefox、Edge 等）                  ║
echo ║     • MetaMask 钱包（仅区块链模式需要）                        ║
echo ║                                                              ║
echo ║  🆘 常见问题：                                                ║
echo ║     • 如果启动失败，请先运行"检查环境"                         ║
echo ║     • 网络问题可尝试"重新安装依赖"                             ║
echo ║     • 更多帮助请访问项目 GitHub 页面                           ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
pause
goto welcome

:: 检查基本环境函数
:check_basic_env
if not exist "%FRONTEND_DIR%" (
    echo ❌ 错误：项目结构不完整，请确保在正确的目录运行此脚本
    exit /b 1
)

node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误：未安装 Node.js
    echo.
    echo 📥 请访问 https://nodejs.org/ 下载并安装 Node.js
    exit /b 1
)

npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误：npm 不可用
    exit /b 1
)

exit /b 0

:: 错误退出
:error_exit
echo.
echo ❌ 操作失败！
echo.

:: 记录错误日志
echo %date% %time%: 操作失败 >> error.log

echo 💡 故障排除建议：
echo    1. 检查网络连接
echo    2. 确保 Node.js 版本 ^>= 16
echo    3. 尝试重新安装依赖
echo    4. 查看错误日志：error.log
echo.

echo 🔧 快速修复选项：
echo [1] 🔄 重新安装依赖
echo [2] 🔍 检查环境
echo [3] 📋 返回主菜单
echo [4] 🚪 退出程序
echo.
set /p fix_choice="请选择 (1-4): "

if "%fix_choice%"=="1" goto reinstall_deps
if "%fix_choice%"=="2" goto check_env
if "%fix_choice%"=="3" goto welcome
if "%fix_choice%"=="4" goto exit_script
goto welcome

:: 正常退出
:exit_script
cls
echo.
echo 👋 感谢使用 %PROJECT_NAME%！
echo.
echo 👨‍💻 作者：青蛙会点头
echo 💝 用爱心打造的可爱游戏
echo.
echo 🌟 如果您喜欢这个游戏，请：
echo    • ⭐ 给项目点个星星
echo    • 🐛 报告问题和建议
echo    • 💝 分享给朋友们
echo.
echo 再见！
timeout /t 3 /nobreak >nul
exit
