import { test, expect } from '@playwright/test';
import { MainPage } from '../page-objects/MainPage.js';
import { mockWalletConnection, waitForElement, testResponsiveDesign } from '../utils/test-helpers.js';

test.describe('基础功能测试', () => {
  let mainPage;

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    await mockWalletConnection(page);
    await mainPage.goto();
  });

  test('页面加载和基本元素显示', async ({ page }) => {
    // 检查页面标题
    await expect(page).toHaveTitle(/区块链扫雷/);
    
    // 检查主要元素是否存在
    await expect(page.locator('h1:has-text("区块链扫雷")')).toBeVisible();
    await expect(page.locator('button:has-text("游戏")')).toBeVisible();
    await expect(page.locator('button:has-text("统计")')).toBeVisible();
    
    // 检查页脚
    await expect(page.locator('footer')).toBeVisible();
    await expect(page.locator('a:has-text("GitHub")')).toBeVisible();
    await expect(page.locator('a:has-text("Etherscan")')).toBeVisible();
  });

  test('导航标签切换功能', async ({ page }) => {
    // 默认应该在游戏标签
    await expect(page.locator('button:has-text("游戏")')).toHaveClass(/bg-pink-100/);
    
    // 切换到统计标签
    await mainPage.switchToStatsTab();
    await expect(page.locator('button:has-text("统计")')).toHaveClass(/bg-mint-100/);
    
    // 切换回游戏标签
    await mainPage.switchToGameTab();
    await expect(page.locator('button:has-text("游戏")')).toHaveClass(/bg-pink-100/);
  });

  test('响应式设计测试', async ({ page }) => {
    await testResponsiveDesign(page, test);
  });

  test('错误边界测试', async ({ page }) => {
    // 模拟网络错误
    await page.route('**/*', route => {
      if (route.request().url().includes('api')) {
        route.abort();
      } else {
        route.continue();
      }
    });

    // 重新加载页面
    await page.reload();
    
    // 应该显示错误信息或优雅降级
    // 这里需要根据实际的错误处理逻辑来调整
    await page.waitForTimeout(2000);
  });

  test('页面性能测试', async ({ page }) => {
    // 测量页面加载时间
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // 页面应该在3秒内加载完成
    expect(loadTime).toBeLessThan(3000);
    
    // 检查是否有控制台错误
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });

  test('链接和外部资源测试', async ({ page }) => {
    // 测试 GitHub 链接
    const githubLink = page.locator('a:has-text("GitHub")');
    await expect(githubLink).toHaveAttribute('href', 'https://github.com');
    await expect(githubLink).toHaveAttribute('target', '_blank');
    
    // 测试 Etherscan 链接
    const etherscanLink = page.locator('a:has-text("Etherscan")');
    await expect(etherscanLink).toHaveAttribute('href', 'https://sepolia.etherscan.io/');
    await expect(etherscanLink).toHaveAttribute('target', '_blank');
  });

  test('键盘导航测试', async ({ page }) => {
    // 测试 Tab 键导航
    await page.keyboard.press('Tab');
    
    // 检查焦点是否正确移动到可交互元素
    const focusedElement = await page.evaluate(() => document.activeElement.tagName);
    expect(['BUTTON', 'A', 'INPUT', 'SELECT']).toContain(focusedElement);
  });

  test('浏览器兼容性测试', async ({ page, browserName }) => {
    // 根据不同浏览器进行特定测试
    console.log(`Running on ${browserName}`);
    
    // 检查 CSS 支持
    const supportsGrid = await page.evaluate(() => {
      return CSS.supports('display', 'grid');
    });
    expect(supportsGrid).toBe(true);
    
    // 检查 JavaScript 功能
    const supportsES6 = await page.evaluate(() => {
      try {
        eval('const test = () => {};');
        return true;
      } catch (e) {
        return false;
      }
    });
    expect(supportsES6).toBe(true);
  });
});
