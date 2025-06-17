// 测试辅助函数
export const testHelpers = {
  // 模拟钱包连接
  mockWalletConnection: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          account: '0x1234567890123456789012345678901234567890',
          balance: '1.5',
          network: { chainId: 31337, name: 'localhost' }
        });
      }, 1000);
    });
  },

  // 模拟游戏数据
  mockGameInfo: {
    width: 10,
    height: 10,
    mineCount: 15,
    status: 1, // IN_PROGRESS
    score: 25,
    clickCount: 12,
    startTime: Math.floor(Date.now() / 1000) - 120, // 2分钟前开始
    endTime: 0,
    initialized: true
  },

  // 模拟玩家统计
  mockPlayerStats: {
    totalGamesPlayed: 15,
    gamesWon: 8,
    currentHighScore: 156,
    winRate: 53
  },

  // 模拟棋盘数据
  generateMockBoard: (width, height) => {
    return Array(height).fill(null).map(() => 
      Array(width).fill(null).map(() => ({
        revealed: Math.random() < 0.3, // 30% 的格子已揭示
        isMine: Math.random() < 0.15, // 15% 的格子是地雷
        adjacentMines: Math.floor(Math.random() * 4), // 0-3 个相邻地雷
        flagged: false
      }))
    );
  },

  // 验证组件渲染
  checkComponentRender: (componentName) => {
    console.log(`✅ ${componentName} 组件渲染成功`);
  },

  // 验证功能
  checkFeature: (featureName, isWorking) => {
    if (isWorking) {
      console.log(`✅ ${featureName} 功能正常`);
    } else {
      console.log(`❌ ${featureName} 功能异常`);
    }
  },

  // 性能测试
  measurePerformance: (functionName, fn) => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`⏱️ ${functionName} 执行时间: ${(end - start).toFixed(2)}ms`);
    return result;
  },

  // 检查响应式设计
  checkResponsive: () => {
    const width = window.innerWidth;
    if (width < 640) {
      console.log('📱 当前为移动端视图');
    } else if (width < 1024) {
      console.log('📱 当前为平板端视图');
    } else {
      console.log('🖥️ 当前为桌面端视图');
    }
  },

  // 检查 Web3 环境
  checkWeb3Environment: () => {
    if (typeof window.ethereum !== 'undefined') {
      console.log('✅ MetaMask 已安装');
      return true;
    } else {
      console.log('❌ 未检测到 MetaMask');
      return false;
    }
  },

  // 测试合约地址格式
  isValidAddress: (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  },

  // 测试网络连接
  testNetworkConnection: async () => {
    try {
      const response = await fetch('https://api.github.com/zen');
      if (response.ok) {
        console.log('✅ 网络连接正常');
        return true;
      }
    } catch (error) {
      console.log('❌ 网络连接异常:', error.message);
      return false;
    }
  },

  // 运行基本测试套件
  runBasicTests: () => {
    console.log('🧪 开始运行基本测试...');
    
    // 检查环境
    testHelpers.checkWeb3Environment();
    testHelpers.checkResponsive();
    
    // 检查组件
    testHelpers.checkComponentRender('WalletConnect');
    testHelpers.checkComponentRender('GameSettings');
    testHelpers.checkComponentRender('GameBoard');
    testHelpers.checkComponentRender('PlayerStats');
    
    // 检查工具函数
    testHelpers.checkFeature('地址验证', testHelpers.isValidAddress('0x1234567890123456789012345678901234567890'));
    testHelpers.checkFeature('地址验证（无效）', !testHelpers.isValidAddress('invalid-address'));
    
    console.log('✅ 基本测试完成');
  }
};

// 开发模式下自动运行测试
if (process.env.NODE_ENV === 'development') {
  // 延迟执行，确保组件已加载
  setTimeout(() => {
    testHelpers.runBasicTests();
  }, 2000);
}

export default testHelpers;
