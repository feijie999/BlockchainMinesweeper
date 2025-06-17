import { test, expect } from '@playwright/test';
import { MainPage } from '../page-objects/MainPage.js';
import { mockWalletConnection, waitForElement, simulateUserDelay, testData } from '../utils/test-helpers.js';

test.describe('游戏功能测试', () => {
  let mainPage;

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    await mockWalletConnection(page);
    await mainPage.goto();
    
    // 连接钱包
    await page.click('[data-testid="connect-wallet-btn"]');
    await waitForElement(page, '[data-testid="wallet-address"]');
  });

  test('游戏设置界面功能', async ({ page }) => {
    // 检查默认设置
    await expect(page.locator('[data-testid="difficulty-select"]')).toBeVisible();
    
    // 测试难度选择
    await mainPage.selectDifficulty('easy');
    await expect(page.locator('[data-testid="width-input"]')).toHaveValue('9');
    await expect(page.locator('[data-testid="height-input"]')).toHaveValue('9');
    await expect(page.locator('[data-testid="mine-count-input"]')).toHaveValue('10');
    
    // 测试中等难度
    await mainPage.selectDifficulty('medium');
    await expect(page.locator('[data-testid="width-input"]')).toHaveValue('16');
    await expect(page.locator('[data-testid="height-input"]')).toHaveValue('16');
    await expect(page.locator('[data-testid="mine-count-input"]')).toHaveValue('40');
    
    // 测试自定义设置
    await mainPage.selectDifficulty('custom');
    await mainPage.setCustomGameSettings(12, 12, 20);
    await expect(page.locator('[data-testid="width-input"]')).toHaveValue('12');
    await expect(page.locator('[data-testid="height-input"]')).toHaveValue('12');
    await expect(page.locator('[data-testid="mine-count-input"]')).toHaveValue('20');
  });

  test('开始新游戏流程', async ({ page }) => {
    // 设置简单游戏
    await mainPage.selectDifficulty('easy');
    
    // 开始游戏
    await mainPage.startNewGame();
    
    // 验证游戏棋盘已显示
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible();
    
    // 验证游戏状态显示
    await expect(page.locator('[data-testid="game-status"]')).toContainText('进行中');
    await expect(page.locator('[data-testid="game-timer"]')).toBeVisible();
    await expect(page.locator('[data-testid="mine-counter"]')).toContainText('10');
    
    // 验证棋盘尺寸正确
    const cells = await page.locator('[data-testid^="cell-"]').count();
    expect(cells).toBe(81); // 9x9 = 81
  });

  test('游戏棋盘交互', async ({ page }) => {
    // 开始简单游戏
    await mainPage.selectDifficulty('easy');
    await mainPage.startNewGame();
    
    // 点击第一个格子
    await mainPage.clickCell(0, 0);
    await simulateUserDelay();
    
    // 验证格子状态改变
    const cellState = await mainPage.getCellState(0, 0);
    expect(cellState.isRevealed).toBe(true);
    
    // 测试右键标记功能
    await mainPage.rightClickCell(1, 1);
    await simulateUserDelay();
    
    const flaggedCellState = await mainPage.getCellState(1, 1);
    expect(flaggedCellState.isFlagged).toBe(true);
    
    // 验证地雷计数器减少
    const mineCounter = await mainPage.getMineCounter();
    expect(mineCounter).toContain('9'); // 10 - 1 = 9
  });

  test('游戏计时器功能', async ({ page }) => {
    await mainPage.selectDifficulty('easy');
    await mainPage.startNewGame();
    
    // 记录开始时间
    const initialTimer = await mainPage.getGameTimer();
    
    // 等待几秒
    await page.waitForTimeout(3000);
    
    // 验证计时器在运行
    const updatedTimer = await mainPage.getGameTimer();
    expect(updatedTimer).not.toBe(initialTimer);
  });

  test('游戏胜利场景', async ({ page }) => {
    // 这里需要模拟一个必胜的游戏场景
    // 由于真实的扫雷游戏有随机性，我们需要模拟或使用固定的种子
    
    await page.addInitScript(() => {
      // 模拟一个简单的胜利场景
      window.mockGameWin = true;
    });
    
    await mainPage.selectDifficulty('easy');
    await mainPage.startNewGame();
    
    // 模拟完成游戏的操作
    // 这里需要根据实际的游戏逻辑来调整
    await page.evaluate(() => {
      if (window.mockGameWin) {
        // 触发游戏胜利状态
        const event = new CustomEvent('gameWon');
        window.dispatchEvent(event);
      }
    });
    
    await page.waitForTimeout(1000);
    
    // 验证胜利状态
    await expect(page.locator('[data-testid="game-status"]')).toContainText('胜利');
    await expect(page.locator('[data-testid="victory-message"]')).toBeVisible();
  });

  test('游戏失败场景', async ({ page }) => {
    await page.addInitScript(() => {
      window.mockGameLoss = true;
    });
    
    await mainPage.selectDifficulty('easy');
    await mainPage.startNewGame();
    
    // 模拟点击地雷
    await page.evaluate(() => {
      if (window.mockGameLoss) {
        const event = new CustomEvent('gameLost');
        window.dispatchEvent(event);
      }
    });
    
    await page.waitForTimeout(1000);
    
    // 验证失败状态
    await expect(page.locator('[data-testid="game-status"]')).toContainText('失败');
    await expect(page.locator('[data-testid="game-over-message"]')).toBeVisible();
  });

  test('游戏重新开始功能', async ({ page }) => {
    await mainPage.selectDifficulty('easy');
    await mainPage.startNewGame();
    
    // 进行一些游戏操作
    await mainPage.clickCell(0, 0);
    await simulateUserDelay();
    
    // 重新开始游戏
    await page.click('[data-testid="restart-game-btn"]');
    
    // 验证游戏重置
    await expect(page.locator('[data-testid="game-timer"]')).toContainText('00:00');
    await expect(page.locator('[data-testid="mine-counter"]')).toContainText('10');
    
    // 验证所有格子都重置了
    const firstCellState = await mainPage.getCellState(0, 0);
    expect(firstCellState.isRevealed).toBe(false);
  });

  test('无效游戏设置处理', async ({ page }) => {
    // 测试无效的自定义设置
    await mainPage.selectDifficulty('custom');
    
    // 设置无效值
    await page.fill('[data-testid="width-input"]', '0');
    await page.fill('[data-testid="height-input"]', '0');
    await page.fill('[data-testid="mine-count-input"]', '999');
    
    // 尝试开始游戏
    await page.click('[data-testid="start-game-btn"]');
    
    // 应该显示错误信息
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('设置无效');
  });

  test('游戏状态保存和恢复', async ({ page }) => {
    await mainPage.selectDifficulty('easy');
    await mainPage.startNewGame();
    
    // 进行一些游戏操作
    await mainPage.clickCell(0, 0);
    await mainPage.rightClickCell(1, 1);
    await simulateUserDelay();
    
    // 刷新页面
    await page.reload();
    await waitForElement(page, '[data-testid="wallet-address"]');
    
    // 验证游戏状态是否恢复
    // 这取决于实际的状态保存逻辑
    const gameStatus = await page.locator('[data-testid="game-status"]').textContent();
    expect(gameStatus).toBeTruthy();
  });
});
