import { test, expect } from '@playwright/test';

test.describe('冒烟测试', () => {
  test('应用基本加载测试', async ({ page }) => {
    // 访问首页
    await page.goto('/');
    
    // 检查页面标题
    await expect(page).toHaveTitle(/区块链扫雷/);
    
    // 检查主要元素是否存在
    await expect(page.locator('h1:has-text("区块链扫雷")')).toBeVisible();
    
    // 检查导航按钮 (使用更具体的选择器)
    await expect(page.locator('header button:has-text("游戏")')).toBeVisible();
    await expect(page.locator('header button:has-text("统计")')).toBeVisible();
    
    // 检查钱包连接区域
    await expect(page.locator('[data-testid="wallet-connect"]')).toBeVisible();
    
    // 检查页脚
    await expect(page.locator('footer')).toBeVisible();
    
    console.log('✅ 基本页面加载测试通过');
  });

  test('页面无JavaScript错误', async ({ page }) => {
    const errors = [];
    
    // 监听控制台错误
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // 访问页面
    await page.goto('/');
    
    // 等待页面完全加载
    await page.waitForLoadState('networkidle');
    
    // 检查是否有JavaScript错误
    expect(errors).toHaveLength(0);
    
    console.log('✅ 无JavaScript错误测试通过');
  });

  test('响应式设计基本检查', async ({ page }) => {
    // 桌面视图
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await expect(page.locator('header')).toBeVisible();
    
    // 平板视图
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await expect(page.locator('header')).toBeVisible();
    
    // 移动视图
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    await expect(page.locator('header')).toBeVisible();
    
    console.log('✅ 响应式设计基本检查通过');
  });
});
