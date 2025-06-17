import { test, expect } from '@playwright/test';
import { MainPage } from '../page-objects/MainPage.js';
import { mockWalletConnection, checkAccessibility, measurePerformance } from '../utils/test-helpers.js';

test.describe('性能和可访问性测试', () => {
  let mainPage;

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    await mockWalletConnection(page);
  });

  test('页面加载性能测试', async ({ page }) => {
    // 测量页面加载时间
    const loadTime = await measurePerformance(page, async () => {
      await mainPage.goto();
    });
    
    console.log(`页面加载时间: ${loadTime}ms`);
    
    // 页面应该在2秒内加载完成
    expect(loadTime).toBeLessThan(2000);
    
    // 检查 Core Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const metrics = {};
          
          entries.forEach((entry) => {
            if (entry.entryType === 'navigation') {
              metrics.loadTime = entry.loadEventEnd - entry.loadEventStart;
              metrics.domContentLoaded = entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart;
            }
            if (entry.entryType === 'paint') {
              if (entry.name === 'first-contentful-paint') {
                metrics.fcp = entry.startTime;
              }
              if (entry.name === 'largest-contentful-paint') {
                metrics.lcp = entry.startTime;
              }
            }
          });
          
          resolve(metrics);
        }).observe({ entryTypes: ['navigation', 'paint'] });
        
        // 如果没有获取到指标，5秒后返回空对象
        setTimeout(() => resolve({}), 5000);
      });
    });
    
    console.log('性能指标:', metrics);
    
    // FCP 应该在1.8秒内
    if (metrics.fcp) {
      expect(metrics.fcp).toBeLessThan(1800);
    }
    
    // LCP 应该在2.5秒内
    if (metrics.lcp) {
      expect(metrics.lcp).toBeLessThan(2500);
    }
  });

  test('游戏交互性能测试', async ({ page }) => {
    await mainPage.goto();
    
    // 连接钱包
    await page.click('[data-testid="connect-wallet-btn"]');
    await page.waitForSelector('[data-testid="wallet-address"]');
    
    // 开始游戏
    await page.selectOption('[data-testid="difficulty-select"]', 'easy');
    await page.click('[data-testid="start-game-btn"]');
    await page.waitForSelector('[data-testid="game-board"]');
    
    // 测量点击响应时间
    const clickTime = await measurePerformance(page, async () => {
      await page.click('[data-testid="cell-0-0"]');
      await page.waitForFunction(() => {
        const cell = document.querySelector('[data-testid="cell-0-0"]');
        return cell && cell.classList.contains('revealed');
      });
    });
    
    console.log(`游戏点击响应时间: ${clickTime}ms`);
    
    // 点击响应应该在100ms内
    expect(clickTime).toBeLessThan(100);
  });

  test('内存使用测试', async ({ page }) => {
    await mainPage.goto();
    
    // 获取初始内存使用
    const initialMemory = await page.evaluate(() => {
      if (performance.memory) {
        return {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit
        };
      }
      return null;
    });
    
    if (initialMemory) {
      console.log('初始内存使用:', initialMemory);
      
      // 进行一些操作
      await page.click('[data-testid="connect-wallet-btn"]');
      await page.waitForSelector('[data-testid="wallet-address"]');
      
      // 开始多个游戏
      for (let i = 0; i < 5; i++) {
        await page.selectOption('[data-testid="difficulty-select"]', 'easy');
        await page.click('[data-testid="start-game-btn"]');
        await page.waitForSelector('[data-testid="game-board"]');
        await page.click('[data-testid="restart-game-btn"]');
        await page.waitForTimeout(500);
      }
      
      // 获取最终内存使用
      const finalMemory = await page.evaluate(() => {
        if (performance.memory) {
          return {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit
          };
        }
        return null;
      });
      
      if (finalMemory) {
        console.log('最终内存使用:', finalMemory);
        
        // 内存增长不应该超过50MB
        const memoryGrowth = finalMemory.used - initialMemory.used;
        expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024);
      }
    }
  });

  test('可访问性基础检查', async ({ page }) => {
    await mainPage.goto();
    
    // 运行可访问性检查
    const accessibilityResults = await checkAccessibility(page);
    
    console.log('可访问性检查结果:', accessibilityResults);
    
    // 所有检查都应该通过
    accessibilityResults.forEach(result => {
      expect(result.passed).toBe(true);
    });
  });

  test('键盘导航测试', async ({ page }) => {
    await mainPage.goto();
    
    // 测试 Tab 键导航
    let focusedElements = [];
    
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => {
        const element = document.activeElement;
        return {
          tagName: element.tagName,
          id: element.id,
          className: element.className,
          textContent: element.textContent?.trim().substring(0, 20)
        };
      });
      focusedElements.push(focusedElement);
    }
    
    console.log('键盘导航路径:', focusedElements);
    
    // 应该能够导航到主要的交互元素
    const interactiveElements = focusedElements.filter(el => 
      ['BUTTON', 'INPUT', 'SELECT', 'A'].includes(el.tagName)
    );
    
    expect(interactiveElements.length).toBeGreaterThan(3);
  });

  test('屏幕阅读器支持测试', async ({ page }) => {
    await mainPage.goto();
    
    // 检查 ARIA 标签
    const ariaLabels = await page.$$eval('[aria-label]', elements => 
      elements.map(el => ({
        tagName: el.tagName,
        ariaLabel: el.getAttribute('aria-label'),
        role: el.getAttribute('role')
      }))
    );
    
    console.log('ARIA 标签:', ariaLabels);
    
    // 应该有适当的 ARIA 标签
    expect(ariaLabels.length).toBeGreaterThan(0);
    
    // 检查语义化标签
    const semanticElements = await page.$$eval('main, nav, header, footer, section, article', elements => 
      elements.map(el => el.tagName)
    );
    
    console.log('语义化元素:', semanticElements);
    
    // 应该使用语义化 HTML
    expect(semanticElements).toContain('HEADER');
    expect(semanticElements).toContain('MAIN');
    expect(semanticElements).toContain('FOOTER');
  });

  test('颜色对比度测试', async ({ page }) => {
    await mainPage.goto();
    
    // 检查文本颜色对比度
    const contrastResults = await page.evaluate(() => {
      const elements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, button');
      const results = [];
      
      elements.forEach(el => {
        const styles = window.getComputedStyle(el);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        
        if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
          results.push({
            element: el.tagName,
            color: color,
            backgroundColor: backgroundColor,
            text: el.textContent?.trim().substring(0, 20)
          });
        }
      });
      
      return results;
    });
    
    console.log('颜色对比度检查:', contrastResults.slice(0, 5));
    
    // 这里可以添加更详细的对比度计算
    expect(contrastResults.length).toBeGreaterThan(0);
  });

  test('移动设备可访问性测试', async ({ page }) => {
    // 设置移动设备视口
    await page.setViewportSize({ width: 375, height: 667 });
    await mainPage.goto();
    
    // 检查触摸目标大小
    const touchTargets = await page.$$eval('button, a, input, [role="button"]', elements => 
      elements.map(el => {
        const rect = el.getBoundingClientRect();
        return {
          width: rect.width,
          height: rect.height,
          area: rect.width * rect.height
        };
      })
    );
    
    console.log('触摸目标尺寸:', touchTargets.slice(0, 5));
    
    // 触摸目标应该至少 44x44 像素
    const smallTargets = touchTargets.filter(target => 
      target.width < 44 || target.height < 44
    );
    
    expect(smallTargets.length).toBeLessThan(touchTargets.length * 0.2); // 允许20%的小目标
  });

  test('网络条件性能测试', async ({ page }) => {
    // 模拟慢速网络
    await page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 100)); // 100ms 延迟
      await route.continue();
    });
    
    const loadTime = await measurePerformance(page, async () => {
      await mainPage.goto();
    });
    
    console.log(`慢速网络加载时间: ${loadTime}ms`);
    
    // 即使在慢速网络下，页面也应该在合理时间内加载
    expect(loadTime).toBeLessThan(5000);
    
    // 检查是否有适当的加载状态
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
  });
});
