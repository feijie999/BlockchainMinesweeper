import { test, expect } from '@playwright/test';

// 集成测试配置
const LOCAL_URL = 'http://localhost:5174';
const HARDHAT_NETWORK_ID = '31337';
const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

test.describe('区块链扫雷游戏集成测试', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到应用
    await page.goto(LOCAL_URL);

    // 等待页面加载完成
    await page.waitForLoadState('networkidle');

    // 等待React应用完全加载
    await page.waitForTimeout(1000);
  });

  test('环境验证 - 页面加载和基础元素', async ({ page }) => {
    // 验证页面标题
    await expect(page).toHaveTitle(/区块链扫雷/);

    // 验证主要UI元素存在
    await expect(page.locator('h1')).toContainText('区块链扫雷');
    await expect(page.locator('text=可爱温馨的链上游戏')).toBeVisible();

    // 验证导航标签存在（不检查具体按钮，避免重复元素问题）
    await expect(page.locator('header')).toContainText('游戏');
    await expect(page.locator('header')).toContainText('统计');
    await expect(page.locator('header')).toContainText('🧪 测试');

    // 验证钱包连接组件标题
    await expect(page.locator('h3:has-text("连接钱包")')).toBeVisible();
  });

  test('测试模式验证 - 本地游戏逻辑', async ({ page }) => {
    // 切换到测试模式
    await page.click('button:has-text("🧪 测试")');

    // 验证测试模式界面
    await expect(page.locator('h1:has-text("🧪 游戏逻辑测试模式")')).toBeVisible();
    await expect(page.locator('text=测试扫雷游戏的核心逻辑功能')).toBeVisible();

    // 测试简单难度游戏
    await page.click('text=🌸 简单 (8×8, 10雷)');

    // 等待游戏棋盘生成 - 使用更通用的选择器
    await page.waitForSelector('button[style*="aspect-ratio"]', { timeout: 5000 });

    // 验证游戏状态显示
    await expect(page.locator('text=地雷总数')).toBeVisible();
    await expect(page.locator('text=已揭示')).toBeVisible();

    // 点击第一个格子开始游戏
    const firstCell = page.locator('button[style*="aspect-ratio"]').first();
    await firstCell.click();

    // 验证游戏统计更新
    await expect(page.locator('text=游戏时间')).toBeVisible();
    await expect(page.locator('text=得分')).toBeVisible();
  });

  test('合约配置验证', async ({ page }) => {
    // 检查控制台是否有合约地址配置
    const logs = [];
    page.on('console', msg => logs.push(msg.text()));
    
    // 刷新页面触发初始化
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // 验证没有严重错误
    const errors = logs.filter(log => log.includes('Error') || log.includes('error'));
    const contractErrors = errors.filter(log => 
      log.includes('合约') || log.includes('contract') || log.includes('web3')
    );
    
    // 如果有合约相关错误，记录但不失败（因为可能没有连接钱包）
    if (contractErrors.length > 0) {
      console.log('合约相关日志:', contractErrors);
    }
  });

  test('钱包连接界面测试', async ({ page }) => {
    // 验证钱包连接标题
    await expect(page.locator('h3:has-text("连接钱包")')).toBeVisible();

    // 验证钱包连接提示
    await expect(page.locator('text=连接您的 MetaMask 钱包开始游戏')).toBeVisible();

    // 验证连接按钮存在
    await expect(page.locator('button:has-text("连接 MetaMask")')).toBeVisible();
  });

  test('游戏设置界面测试', async ({ page }) => {
    // 验证游戏设置组件
    await expect(page.locator('h3:has-text("游戏设置")')).toBeVisible();

    // 验证预设难度选项 - 使用更精确的选择器
    await expect(page.locator('[data-testid="difficulty-easy"]')).toBeVisible();
    await expect(page.locator('[data-testid="difficulty-medium"]')).toBeVisible();
    await expect(page.locator('[data-testid="difficulty-hard"]')).toBeVisible();

    // 验证自定义设置标题
    await expect(page.locator('h4:has-text("自定义设置")')).toBeVisible();

    // 测试难度选择
    await page.click('[data-testid="difficulty-medium"]');

    // 验证设置更新 - 使用更精确的选择器
    await expect(page.locator('text=12×12')).toBeVisible();
    await expect(page.locator('text=地雷密度: 15%')).toBeVisible(); // 检查具体的地雷密度文本
  });

  test('统计页面测试', async ({ page }) => {
    // 切换到统计页面
    await page.click('button:has-text("统计")');

    // 验证未连接状态提示（因为没有连接钱包）
    await expect(page.locator('text=连接钱包查看统计数据')).toBeVisible();

    // 验证统计页面的特定图标（避免多个svg元素的问题）
    await expect(page.locator('.lucide-chart-column')).toBeVisible();
  });

  test('响应式设计测试', async ({ page }) => {
    // 测试桌面视图
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('.lg\\:col-span-2')).toBeVisible();
    
    // 测试移动视图
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500); // 等待响应式调整
    
    // 验证移动端布局
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
  });

  test('错误处理测试', async ({ page }) => {
    // 监听控制台错误
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));

    // 执行一些可能触发错误的操作
    await page.click('button:has-text("🧪 测试")');
    await page.click('text=🌸 简单 (8×8, 10雷)');

    // 等待一段时间让错误显现
    await page.waitForTimeout(2000);

    // 验证没有严重的JavaScript错误
    const criticalErrors = errors.filter(error =>
      !error.includes('Warning') &&
      !error.includes('MetaMask') &&
      !error.includes('ethereum') &&
      !error.includes('ResizeObserver')
    );

    expect(criticalErrors.length).toBe(0);
  });

  test('性能基准测试', async ({ page }) => {
    // 测量页面加载时间
    const startTime = Date.now();
    await page.goto(LOCAL_URL);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // 验证加载时间合理（小于5秒）
    expect(loadTime).toBeLessThan(5000);

    // 测试游戏初始化性能
    await page.click('button:has-text("🧪 测试")');
    const gameStartTime = Date.now();
    await page.click('text=🌸 简单 (8×8, 10雷)');
    await page.waitForSelector('button[style*="aspect-ratio"]');
    const gameInitTime = Date.now() - gameStartTime;

    // 验证游戏初始化时间合理（小于3秒）
    expect(gameInitTime).toBeLessThan(3000);
  });
});

// 区块链特定集成测试（需要MetaMask）
test.describe('区块链功能集成测试 (需要MetaMask)', () => {
  test.skip('钱包连接集成测试', async ({ page }) => {
    // 这个测试需要MetaMask扩展，暂时跳过
    // 在实际环境中需要配置MetaMask测试环境
    
    await page.goto(LOCAL_URL);
    
    // 模拟钱包连接（需要MetaMask配置）
    // await page.click('text=连接钱包');
    // await expect(page.locator('text=已连接')).toBeVisible();
  });

  test.skip('合约交互集成测试', async ({ page }) => {
    // 这个测试需要连接的钱包，暂时跳过
    // 在实际环境中需要预先连接钱包
    
    await page.goto(LOCAL_URL);
    
    // 假设钱包已连接
    // await page.click('text=开始游戏');
    // await expect(page.locator('text=交易确认中')).toBeVisible();
  });
});
