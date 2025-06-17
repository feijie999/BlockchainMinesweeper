#!/bin/bash

# 测试一键启动脚本的各项功能
echo "🧪 开始测试一键启动脚本..."

# 设置颜色
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 测试计数器
TESTS_PASSED=0
TESTS_FAILED=0

# 测试函数
test_function() {
    local test_name="$1"
    local command="$2"
    
    echo -e "\n${YELLOW}测试: $test_name${NC}"
    
    if eval "$command"; then
        echo -e "${GREEN}✅ $test_name - 通过${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ $test_name - 失败${NC}"
        ((TESTS_FAILED++))
    fi
}

# 1. 测试脚本文件存在
test_function "脚本文件存在" "[ -f '一键启动.sh' ]"

# 2. 测试脚本有执行权限
test_function "脚本有执行权限" "[ -x '一键启动.sh' ]"

# 3. 测试项目结构
test_function "前端目录存在" "[ -d 'frontend' ]"
test_function "合约目录存在" "[ -d 'contracts' ]"

# 4. 测试前端配置文件
test_function "前端package.json存在" "[ -f 'frontend/package.json' ]"
test_function "Vite配置文件存在" "[ -f 'frontend/vite.config.js' ]"

# 5. 测试合约配置文件
test_function "合约package.json存在" "[ -f 'contracts/package.json' ]"
test_function "Hardhat配置文件存在" "[ -f 'contracts/hardhat.config.js' ]"

# 6. 测试Node.js环境
test_function "Node.js已安装" "command -v node >/dev/null 2>&1"
test_function "npm已安装" "command -v npm >/dev/null 2>&1"

# 7. 测试Node.js版本
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version | sed 's/v//')
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1)
    test_function "Node.js版本>=16" "[ $NODE_MAJOR -ge 16 ]"
fi

# 8. 测试脚本语法
test_function "脚本语法正确" "bash -n '一键启动.sh'"

# 9. 测试依赖安装状态
test_function "前端依赖已安装" "[ -d 'frontend/node_modules' ]"
test_function "合约依赖已安装" "[ -d 'contracts/node_modules' ]"

# 输出测试结果
echo ""
echo "==================== 测试结果 ===================="
echo -e "${GREEN}✅ 通过: $TESTS_PASSED${NC}"
echo -e "${RED}❌ 失败: $TESTS_FAILED${NC}"
echo "总计: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 所有测试通过！脚本可以正常使用。${NC}"
    exit 0
else
    echo -e "\n${RED}⚠️  有 $TESTS_FAILED 个测试失败，请检查相关问题。${NC}"
    exit 1
fi
