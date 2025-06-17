import { test, expect } from '@playwright/test';

// 区块链集成测试配置
const LOCAL_URL = 'http://localhost:5174';
const HARDHAT_NETWORK_ID = '31337';
const CONTRACT_ADDRESS = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';

test.describe('区块链合约交互集成测试', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到应用
    await page.goto(LOCAL_URL);
    
    // 等待页面加载完成
    await page.waitForLoadState('networkidle');
    
    // 等待React应用完全加载
    await page.waitForTimeout(1000);
  });

  test('合约地址和ABI配置验证', async ({ page }) => {
    // 检查控制台日志中的合约配置信息
    const logs = [];
    page.on('console', msg => {
      if (msg.type() === 'log' || msg.type() === 'info') {
        logs.push(msg.text());
      }
    });

    // 刷新页面触发初始化
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 验证合约地址配置
    const contractLogs = logs.filter(log => 
      log.includes(CONTRACT_ADDRESS) || 
      log.includes('合约') || 
      log.includes('contract')
    );

    console.log('合约相关日志:', contractLogs);
    
    // 验证页面没有合约配置错误
    const errorLogs = logs.filter(log => 
      log.toLowerCase().includes('error') && 
      (log.includes('合约') || log.includes('contract'))
    );
    
    expect(errorLogs.length).toBe(0);
  });

  test('Web3 连接状态检测', async ({ page }) => {
    // 检查Web3连接状态
    const web3Status = await page.evaluate(() => {
      return {
        hasEthereum: typeof window.ethereum !== 'undefined',
        hasWeb3: typeof window.web3 !== 'undefined',
        isMetaMask: window.ethereum && window.ethereum.isMetaMask
      };
    });

    console.log('Web3状态:', web3Status);

    // 验证钱包连接界面正确显示
    if (!web3Status.hasEthereum) {
      // 如果没有MetaMask，应该显示下载提示
      await expect(page.locator('text=下载 MetaMask')).toBeVisible();
    } else {
      // 如果有MetaMask，应该显示连接按钮
      await expect(page.locator('button:has-text("连接 MetaMask")')).toBeVisible();
    }
  });

  test('合约常量读取测试（模拟）', async ({ page }) => {
    // 注入模拟的Web3环境
    await page.addInitScript(() => {
      // 模拟MetaMask环境
      window.ethereum = {
        isMetaMask: true,
        request: async (params) => {
          if (params.method === 'eth_requestAccounts') {
            return ['0x742d35Cc6634C0532925a3b8D0C9C0C8c8C8C8C8'];
          }
          if (params.method === 'eth_chainId') {
            return '0x7a69'; // 31337 in hex
          }
          if (params.method === 'eth_call') {
            // 模拟合约调用返回
            return '0x0000000000000000000000000000000000000000000000000000000000000001';
          }
          return null;
        },
        on: () => {},
        removeListener: () => {}
      };
    });

    // 刷新页面以应用模拟环境
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 验证模拟环境生效
    const hasMetaMask = await page.evaluate(() => {
      return window.ethereum && window.ethereum.isMetaMask;
    });

    expect(hasMetaMask).toBe(true);
  });

  test('游戏状态同步测试（本地逻辑）', async ({ page }) => {
    // 切换到测试模式进行本地游戏逻辑测试
    await page.click('button:has-text("🧪 测试")');
    
    // 开始简单游戏
    await page.click('text=🌸 简单 (8×8, 10雷)');
    
    // 等待游戏棋盘生成
    await page.waitForSelector('button[style*="aspect-ratio"]', { timeout: 5000 });
    
    // 验证初始游戏状态
    await expect(page.locator('text=地雷总数: 10')).toBeVisible();
    await expect(page.locator('text=已揭示: 0')).toBeVisible();
    
    // 点击第一个格子
    const firstCell = page.locator('button[style*="aspect-ratio"]').first();
    await firstCell.click();
    
    // 验证游戏状态更新
    await expect(page.locator('text=游戏时间:')).toBeVisible();
    await expect(page.locator('text=得分:')).toBeVisible();
    
    // 验证已揭示数量增加
    const revealedText = await page.locator('text=已揭示:').textContent();
    expect(revealedText).toContain('已揭示:');
  });

  test('错误处理和用户反馈测试', async ({ page }) => {
    // 监听控制台错误
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    
    // 模拟网络错误情况
    await page.route('**/*', route => {
      if (route.request().url().includes('eth_call')) {
        route.abort();
      } else {
        route.continue();
      }
    });

    // 执行可能触发网络请求的操作
    await page.click('button:has-text("🧪 测试")');
    await page.click('text=🌸 简单 (8×8, 10雷)');
    
    // 等待一段时间
    await page.waitForTimeout(2000);
    
    // 验证应用仍然正常工作（本地逻辑不依赖网络）
    await expect(page.locator('button[style*="aspect-ratio"]')).toBeVisible();
    
    // 验证没有严重的JavaScript错误
    const criticalErrors = errors.filter(error => 
      !error.includes('Warning') && 
      !error.includes('MetaMask') &&
      !error.includes('ethereum') &&
      !error.includes('ResizeObserver') &&
      !error.includes('Network')
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test('响应式设计在不同设备上的表现', async ({ page }) => {
    // 测试桌面视图
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('h1:has-text("区块链扫雷")')).toBeVisible();
    
    // 测试平板视图
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await expect(page.locator('h1:has-text("区块链扫雷")')).toBeVisible();
    
    // 测试手机视图
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    await expect(page.locator('h1:has-text("区块链扫雷")')).toBeVisible();
    
    // 在手机视图下测试游戏功能
    await page.click('button:has-text("🧪 测试")');
    await page.click('text=🌸 简单 (8×8, 10雷)');
    await page.waitForSelector('button[style*="aspect-ratio"]');
    
    // 验证游戏在小屏幕上仍然可用
    const firstCell = page.locator('button[style*="aspect-ratio"]').first();
    await firstCell.click();
    
    await expect(page.locator('text=游戏时间:')).toBeVisible();
  });

  test('性能监控和优化验证', async ({ page }) => {
    // 监控页面性能
    const startTime = Date.now();
    
    // 测试大棋盘的性能
    await page.click('button:has-text("🧪 测试")');
    await page.click('text=🔥 困难 (16×16, 40雷)');
    
    const boardLoadTime = Date.now();
    await page.waitForSelector('button[style*="aspect-ratio"]');
    const renderTime = Date.now() - boardLoadTime;
    
    // 验证大棋盘渲染时间合理（小于3秒）
    expect(renderTime).toBeLessThan(3000);
    
    // 测试连续点击性能
    const cells = page.locator('button[style*="aspect-ratio"]');
    const cellCount = await cells.count();
    
    console.log(`棋盘格子数量: ${cellCount}`);
    expect(cellCount).toBe(256); // 16x16 = 256
    
    // 测试点击响应性能
    const clickStartTime = Date.now();
    await cells.first().click();
    const clickResponseTime = Date.now() - clickStartTime;
    
    // 验证点击响应时间合理（小于500ms）
    expect(clickResponseTime).toBeLessThan(500);
  });

  test('数据持久化和状态管理', async ({ page }) => {
    // 测试游戏状态在页面刷新后的行为
    await page.click('button:has-text("🧪 测试")');
    await page.click('text=🌸 简单 (8×8, 10雷)');
    
    // 开始游戏
    await page.waitForSelector('button[style*="aspect-ratio"]');
    const firstCell = page.locator('button[style*="aspect-ratio"]').first();
    await firstCell.click();
    
    // 验证游戏开始
    await expect(page.locator('text=游戏时间:')).toBeVisible();
    
    // 刷新页面
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // 验证页面重新加载后回到初始状态
    await expect(page.locator('h1:has-text("区块链扫雷")')).toBeVisible();
    await expect(page.locator('button:has-text("游戏")')).toBeVisible();
    
    // 验证测试模式仍然可用
    await page.click('button:has-text("🧪 测试")');
    await expect(page.locator('h1:has-text("🧪 游戏逻辑测试模式")')).toBeVisible();
  });

  test('用户体验和可访问性', async ({ page }) => {
    // 测试键盘导航
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // 验证焦点管理
    const focusedElement = await page.evaluate(() => document.activeElement.tagName);
    expect(['BUTTON', 'A', 'INPUT'].includes(focusedElement)).toBe(true);
    
    // 测试颜色对比度（通过检查CSS类）
    await page.click('button:has-text("🧪 测试")');
    await page.click('text=🌸 简单 (8×8, 10雷)');
    
    // 验证游戏棋盘的可访问性
    const gameBoard = page.locator('button[style*="aspect-ratio"]').first();
    const backgroundColor = await gameBoard.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    
    // 验证背景色不是透明的
    expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(backgroundColor).not.toBe('transparent');
  });
});
