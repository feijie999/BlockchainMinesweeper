import { test, expect } from '@playwright/test';
import { MainPage } from '../page-objects/MainPage.js';
import { mockWalletConnection, waitForElement } from '../utils/test-helpers.js';

test.describe('玩家统计测试', () => {
  let mainPage;

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    await mockWalletConnection(page);
    await mainPage.goto();
    
    // 连接钱包
    await page.click('[data-testid="connect-wallet-btn"]');
    await waitForElement(page, '[data-testid="wallet-address"]');
  });

  test('统计页面基本显示', async ({ page }) => {
    // 切换到统计页面
    await mainPage.switchToStatsTab();
    
    // 验证统计页面元素
    await expect(page.locator('[data-testid="player-stats"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-games"]')).toBeVisible();
    await expect(page.locator('[data-testid="win-rate"]')).toBeVisible();
    await expect(page.locator('[data-testid="best-time"]')).toBeVisible();
    
    // 验证统计卡片
    await expect(page.locator('[data-testid="games-played-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="games-won-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="win-percentage-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="best-time-card"]')).toBeVisible();
  });

  test('新玩家统计显示', async ({ page }) => {
    // 模拟新玩家（无游戏记录）
    await page.addInitScript(() => {
      window.mockPlayerStats = {
        totalGames: 0,
        gamesWon: 0,
        bestTime: 0,
        totalScore: 0,
        level: 1,
        experience: 0
      };
    });
    
    await mainPage.switchToStatsTab();
    
    // 验证新玩家的默认统计
    await expect(page.locator('[data-testid="total-games"]')).toContainText('0');
    await expect(page.locator('[data-testid="win-rate"]')).toContainText('0%');
    await expect(page.locator('[data-testid="best-time"]')).toContainText('--');
    
    // 验证等级和经验
    await expect(page.locator('[data-testid="player-level"]')).toContainText('1');
    await expect(page.locator('[data-testid="player-experience"]')).toContainText('0');
  });

  test('有游戏记录的玩家统计', async ({ page }) => {
    // 模拟有游戏记录的玩家
    await page.addInitScript(() => {
      window.mockPlayerStats = {
        totalGames: 50,
        gamesWon: 30,
        bestTime: 120, // 2分钟
        totalScore: 1500,
        level: 5,
        experience: 750
      };
    });
    
    await mainPage.switchToStatsTab();
    
    // 验证统计数据
    await expect(page.locator('[data-testid="total-games"]')).toContainText('50');
    await expect(page.locator('[data-testid="games-won"]')).toContainText('30');
    await expect(page.locator('[data-testid="win-rate"]')).toContainText('60%');
    await expect(page.locator('[data-testid="best-time"]')).toContainText('02:00');
    
    // 验证等级和经验
    await expect(page.locator('[data-testid="player-level"]')).toContainText('5');
    await expect(page.locator('[data-testid="total-score"]')).toContainText('1500');
  });

  test('成就系统显示', async ({ page }) => {
    await mainPage.switchToStatsTab();
    
    // 验证成就部分
    await expect(page.locator('[data-testid="achievements-section"]')).toBeVisible();
    
    // 检查各种成就
    const achievements = [
      'first-win',
      'speed-demon',
      'perfectionist',
      'persistent',
      'expert'
    ];
    
    for (const achievement of achievements) {
      await expect(page.locator(`[data-testid="achievement-${achievement}"]`)).toBeVisible();
    }
  });

  test('等级进度条显示', async ({ page }) => {
    await page.addInitScript(() => {
      window.mockPlayerStats = {
        level: 3,
        experience: 450,
        experienceToNextLevel: 600
      };
    });
    
    await mainPage.switchToStatsTab();
    
    // 验证等级进度条
    await expect(page.locator('[data-testid="level-progress"]')).toBeVisible();
    await expect(page.locator('[data-testid="current-level"]')).toContainText('3');
    await expect(page.locator('[data-testid="next-level"]')).toContainText('4');
    
    // 验证进度条百分比
    const progressBar = page.locator('[data-testid="progress-bar"]');
    const progressWidth = await progressBar.getAttribute('style');
    expect(progressWidth).toContain('75%'); // 450/600 = 75%
  });

  test('游戏历史记录显示', async ({ page }) => {
    await page.addInitScript(() => {
      window.mockGameHistory = [
        {
          id: 1,
          date: '2024-01-15',
          difficulty: 'easy',
          result: 'won',
          time: 180,
          score: 100
        },
        {
          id: 2,
          date: '2024-01-14',
          difficulty: 'medium',
          result: 'lost',
          time: 240,
          score: 0
        }
      ];
    });
    
    await mainPage.switchToStatsTab();
    
    // 验证游戏历史部分
    await expect(page.locator('[data-testid="game-history"]')).toBeVisible();
    
    // 验证历史记录条目
    await expect(page.locator('[data-testid="history-item-1"]')).toBeVisible();
    await expect(page.locator('[data-testid="history-item-2"]')).toBeVisible();
    
    // 验证记录详情
    await expect(page.locator('[data-testid="history-item-1"]')).toContainText('胜利');
    await expect(page.locator('[data-testid="history-item-1"]')).toContainText('03:00');
    await expect(page.locator('[data-testid="history-item-2"]')).toContainText('失败');
  });

  test('统计数据刷新功能', async ({ page }) => {
    await mainPage.switchToStatsTab();
    
    // 点击刷新按钮
    await page.click('[data-testid="refresh-stats-btn"]');
    
    // 验证加载状态
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
    
    // 等待加载完成
    await page.waitForSelector('[data-testid="loading-spinner"]', { state: 'hidden' });
    
    // 验证数据已更新
    await expect(page.locator('[data-testid="player-stats"]')).toBeVisible();
  });

  test('排行榜功能', async ({ page }) => {
    await mainPage.switchToStatsTab();
    
    // 切换到排行榜标签
    await page.click('[data-testid="leaderboard-tab"]');
    
    // 验证排行榜显示
    await expect(page.locator('[data-testid="leaderboard"]')).toBeVisible();
    
    // 验证排行榜类型切换
    await page.click('[data-testid="leaderboard-type-wins"]');
    await expect(page.locator('[data-testid="leaderboard-wins"]')).toBeVisible();
    
    await page.click('[data-testid="leaderboard-type-time"]');
    await expect(page.locator('[data-testid="leaderboard-time"]')).toBeVisible();
  });

  test('统计数据导出功能', async ({ page }) => {
    await mainPage.switchToStatsTab();
    
    // 点击导出按钮
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-stats-btn"]');
    
    // 验证下载开始
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('minesweeper-stats');
    expect(download.suggestedFilename()).toContain('.json');
  });

  test('未连接钱包时的统计页面', async ({ page }) => {
    // 不连接钱包直接访问统计页面
    await mainPage.goto();
    await mainPage.switchToStatsTab();
    
    // 应该显示连接钱包的提示
    await expect(page.locator('[data-testid="connect-wallet-prompt"]')).toBeVisible();
    await expect(page.locator('[data-testid="connect-wallet-prompt"]')).toContainText('请先连接钱包');
    
    // 统计数据应该不可见
    await expect(page.locator('[data-testid="player-stats"]')).not.toBeVisible();
  });
});
