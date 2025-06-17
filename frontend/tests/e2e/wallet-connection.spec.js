import { test, expect } from '@playwright/test';
import { MainPage } from '../page-objects/MainPage.js';
import { mockWalletConnection, waitForElement, testData } from '../utils/test-helpers.js';

test.describe('钱包连接测试', () => {
  let mainPage;

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
  });

  test('MetaMask 钱包连接流程', async ({ page }) => {
    // 不预先注入钱包，测试连接流程
    await mainPage.goto();
    
    // 检查初始状态 - 应该显示连接按钮
    await expect(page.locator('[data-testid="connect-wallet-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="connect-wallet-btn"]')).toContainText('连接钱包');
    
    // 注入模拟钱包
    await mockWalletConnection(page);
    
    // 点击连接钱包按钮
    await page.click('[data-testid="connect-wallet-btn"]');
    
    // 等待连接完成
    await waitForElement(page, '[data-testid="wallet-address"]');
    
    // 验证钱包已连接
    const walletAddress = await mainPage.getWalletAddress();
    expect(walletAddress).toContain('0x1234');
    
    // 检查网络信息显示
    await expect(page.locator('[data-testid="network-info"]')).toBeVisible();
  });

  test('钱包未安装时的处理', async ({ page }) => {
    // 不注入钱包对象，模拟未安装 MetaMask
    await page.addInitScript(() => {
      delete window.ethereum;
    });
    
    await mainPage.goto();
    
    // 点击连接钱包按钮
    await page.click('[data-testid="connect-wallet-btn"]');
    
    // 应该显示安装 MetaMask 的提示
    await expect(page.locator('text=请安装 MetaMask')).toBeVisible();
  });

  test('钱包连接被拒绝时的处理', async ({ page }) => {
    // 注入模拟钱包，但拒绝连接请求
    await page.addInitScript(() => {
      window.ethereum = {
        isMetaMask: true,
        request: async ({ method }) => {
          if (method === 'eth_requestAccounts') {
            throw new Error('User rejected the request');
          }
          return [];
        }
      };
    });
    
    await mainPage.goto();
    
    // 点击连接钱包按钮
    await page.click('[data-testid="connect-wallet-btn"]');
    
    // 应该显示连接被拒绝的错误信息
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('连接被拒绝');
  });

  test('网络切换检测', async ({ page }) => {
    await mockWalletConnection(page);
    await mainPage.goto();
    
    // 连接钱包
    await page.click('[data-testid="connect-wallet-btn"]');
    await waitForElement(page, '[data-testid="wallet-address"]');
    
    // 模拟网络切换
    await page.evaluate(() => {
      window.ethereum.request = async ({ method }) => {
        if (method === 'eth_chainId') {
          return '0x1'; // 切换到主网
        }
        return '0x1234567890123456789012345678901234567890';
      };
      
      // 触发网络切换事件
      if (window.ethereum.emit) {
        window.ethereum.emit('chainChanged', '0x1');
      }
    });
    
    await page.waitForTimeout(1000);
    
    // 应该显示网络不支持的警告
    await expect(page.locator('text=请切换到 Sepolia 测试网')).toBeVisible();
  });

  test('账户切换检测', async ({ page }) => {
    await mockWalletConnection(page);
    await mainPage.goto();
    
    // 连接钱包
    await page.click('[data-testid="connect-wallet-btn"]');
    await waitForElement(page, '[data-testid="wallet-address"]');
    
    const initialAddress = await mainPage.getWalletAddress();
    
    // 模拟账户切换
    await page.evaluate(() => {
      const newAddress = '0x0987654321098765432109876543210987654321';
      
      // 更新选中的地址
      window.ethereum.selectedAddress = newAddress;
      
      // 触发账户切换事件
      if (window.ethereum.emit) {
        window.ethereum.emit('accountsChanged', [newAddress]);
      }
    });
    
    await page.waitForTimeout(1000);
    
    // 验证地址已更新
    const newAddress = await mainPage.getWalletAddress();
    expect(newAddress).not.toBe(initialAddress);
    expect(newAddress).toContain('0x0987');
  });

  test('钱包余额显示', async ({ page }) => {
    await mockWalletConnection(page);
    await mainPage.goto();
    
    // 连接钱包
    await page.click('[data-testid="connect-wallet-btn"]');
    await waitForElement(page, '[data-testid="wallet-address"]');
    
    // 检查余额显示
    await expect(page.locator('[data-testid="wallet-balance"]')).toBeVisible();
    
    const balance = await page.textContent('[data-testid="wallet-balance"]');
    expect(balance).toContain('ETH');
  });

  test('断开钱包连接', async ({ page }) => {
    await mockWalletConnection(page);
    await mainPage.goto();
    
    // 连接钱包
    await page.click('[data-testid="connect-wallet-btn"]');
    await waitForElement(page, '[data-testid="wallet-address"]');
    
    // 点击断开连接按钮
    await page.click('[data-testid="disconnect-wallet-btn"]');
    
    // 验证已断开连接
    await expect(page.locator('[data-testid="connect-wallet-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="wallet-address"]')).not.toBeVisible();
  });

  test('钱包连接状态持久化', async ({ page }) => {
    await mockWalletConnection(page);
    await mainPage.goto();
    
    // 连接钱包
    await page.click('[data-testid="connect-wallet-btn"]');
    await waitForElement(page, '[data-testid="wallet-address"]');
    
    // 刷新页面
    await page.reload();
    
    // 验证连接状态保持
    await waitForElement(page, '[data-testid="wallet-address"]');
    const address = await mainPage.getWalletAddress();
    expect(address).toContain('0x1234');
  });
});
