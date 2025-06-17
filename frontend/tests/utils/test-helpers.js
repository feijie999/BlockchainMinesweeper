/**
 * 测试辅助工具函数
 */

/**
 * 模拟 MetaMask 钱包连接
 */
export async function mockWalletConnection(page) {
  // 注入模拟的 ethereum 对象到页面
  await page.addInitScript(() => {
    window.ethereum = {
      isMetaMask: true,
      request: async ({ method, params }) => {
        switch (method) {
          case 'eth_requestAccounts':
            return ['0x1234567890123456789012345678901234567890'];
          case 'eth_accounts':
            return ['0x1234567890123456789012345678901234567890'];
          case 'eth_chainId':
            return '0xaa36a7'; // Sepolia testnet
          case 'eth_getBalance':
            return '0x1bc16d674ec80000'; // 2 ETH
          case 'personal_sign':
            return '0x' + '0'.repeat(130);
          case 'eth_sendTransaction':
            return '0x' + '1'.repeat(64);
          case 'eth_getTransactionReceipt':
            return {
              status: '0x1',
              transactionHash: '0x' + '1'.repeat(64),
              blockNumber: '0x1',
              gasUsed: '0x5208'
            };
          default:
            throw new Error(`Unsupported method: ${method}`);
        }
      },
      on: (event, handler) => {
        // 模拟事件监听
        if (event === 'accountsChanged') {
          setTimeout(() => handler(['0x1234567890123456789012345678901234567890']), 100);
        }
      },
      removeListener: () => {},
      selectedAddress: '0x1234567890123456789012345678901234567890',
      networkVersion: '11155111' // Sepolia
    };
  });
}

/**
 * 等待元素出现并可交互
 */
export async function waitForElement(page, selector, timeout = 10000) {
  await page.waitForSelector(selector, { 
    state: 'visible', 
    timeout 
  });
  await page.waitForFunction(
    (sel) => {
      const element = document.querySelector(sel);
      return element && !element.disabled;
    },
    selector,
    { timeout }
  );
}

/**
 * 等待加载完成
 */
export async function waitForLoadingComplete(page) {
  // 等待加载动画消失
  await page.waitForFunction(() => {
    const spinner = document.querySelector('[data-testid="loading-spinner"]');
    return !spinner || spinner.style.display === 'none';
  }, { timeout: 30000 });
}

/**
 * 模拟游戏交互延迟
 */
export async function simulateUserDelay(min = 100, max = 500) {
  const delay = Math.random() * (max - min) + min;
  await new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * 检查响应式设计
 */
export async function testResponsiveDesign(page, test) {
  const viewports = [
    { name: 'Desktop', width: 1920, height: 1080 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 }
  ];

  for (const viewport of viewports) {
    await test.step(`Testing ${viewport.name} (${viewport.width}x${viewport.height})`, async () => {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500); // 等待布局调整
      
      // 检查基本元素是否可见
      await page.waitForSelector('header', { state: 'visible' });
      await page.waitForSelector('main', { state: 'visible' });
      
      // 截图用于视觉回归测试
      await page.screenshot({ 
        path: `test-results/screenshots/responsive-${viewport.name.toLowerCase()}.png`,
        fullPage: true 
      });
    });
  }
}

/**
 * 检查可访问性
 */
export async function checkAccessibility(page) {
  // 检查基本的可访问性要求
  const checks = [
    // 检查是否有 alt 属性的图片
    async () => {
      const imagesWithoutAlt = await page.$$eval('img:not([alt])', imgs => imgs.length);
      return { name: 'Images with alt text', passed: imagesWithoutAlt === 0 };
    },
    
    // 检查是否有适当的标题结构
    async () => {
      const hasH1 = await page.$('h1') !== null;
      return { name: 'Has H1 heading', passed: hasH1 };
    },
    
    // 检查按钮是否可访问
    async () => {
      const buttonsWithoutText = await page.$$eval(
        'button:not([aria-label]):empty', 
        buttons => buttons.length
      );
      return { name: 'Buttons have accessible text', passed: buttonsWithoutText === 0 };
    }
  ];

  const results = [];
  for (const check of checks) {
    results.push(await check());
  }
  
  return results;
}

/**
 * 性能测试辅助函数
 */
export async function measurePerformance(page, action) {
  const startTime = Date.now();
  await action();
  const endTime = Date.now();
  return endTime - startTime;
}

/**
 * 生成测试数据
 */
export const testData = {
  gameSettings: {
    easy: { width: 9, height: 9, mineCount: 10 },
    medium: { width: 16, height: 16, mineCount: 40 },
    hard: { width: 30, height: 16, mineCount: 99 },
    custom: { width: 12, height: 12, mineCount: 20 }
  },
  
  walletAddresses: [
    '0x1234567890123456789012345678901234567890',
    '0x0987654321098765432109876543210987654321'
  ],
  
  errorMessages: {
    walletNotConnected: '请先连接钱包',
    invalidGameSettings: '游戏设置无效',
    transactionFailed: '交易失败'
  }
};

/**
 * 清理测试环境
 */
export async function cleanupTestEnvironment(page) {
  // 清理本地存储
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  
  // 清理 cookies
  await page.context().clearCookies();
}
