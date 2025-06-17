/**
 * 主页面对象模型
 * 封装主页面的所有交互操作
 */
export class MainPage {
  constructor(page) {
    this.page = page;
    
    // 页面元素选择器
    this.selectors = {
      // 头部导航
      header: 'header',
      logo: '[data-testid="app-logo"]',
      title: 'h1:has-text("区块链扫雷")',
      gameTab: 'button:has-text("游戏")',
      statsTab: 'button:has-text("统计")',
      
      // 钱包连接区域
      walletSection: '[data-testid="wallet-connect"]',
      connectButton: '[data-testid="connect-wallet-btn"]',
      walletAddress: '[data-testid="wallet-address"]',
      networkInfo: '[data-testid="network-info"]',
      
      // 游戏设置区域
      gameSettings: '[data-testid="game-settings"]',
      difficultySelect: '[data-testid="difficulty-select"]',
      customSettings: '[data-testid="custom-settings"]',
      widthInput: '[data-testid="width-input"]',
      heightInput: '[data-testid="height-input"]',
      mineCountInput: '[data-testid="mine-count-input"]',
      startGameButton: '[data-testid="start-game-btn"]',
      
      // 游戏棋盘区域
      gameBoard: '[data-testid="game-board"]',
      gameStatus: '[data-testid="game-status"]',
      gameTimer: '[data-testid="game-timer"]',
      mineCounter: '[data-testid="mine-counter"]',
      cell: (x, y) => `[data-testid="cell-${x}-${y}"]`,
      
      // 统计页面
      statsSection: '[data-testid="player-stats"]',
      totalGames: '[data-testid="total-games"]',
      winRate: '[data-testid="win-rate"]',
      bestTime: '[data-testid="best-time"]',
      
      // 错误和加载状态
      errorMessage: '[data-testid="error-message"]',
      loadingSpinner: '[data-testid="loading-spinner"]',
      
      // 页脚
      footer: 'footer',
      githubLink: 'a:has-text("GitHub")',
      etherscanLink: 'a:has-text("Etherscan")'
    };
  }

  // 导航操作
  async goto() {
    await this.page.goto('/');
    await this.waitForPageLoad();
  }

  async waitForPageLoad() {
    await this.page.waitForSelector(this.selectors.title);
    // 使用 domcontentloaded 而不是 networkidle 来避免无限循环问题
    await this.page.waitForLoadState('domcontentloaded');
    // 等待一小段时间确保页面稳定
    await this.page.waitForTimeout(500);
  }

  async switchToGameTab() {
    await this.page.click(this.selectors.gameTab);
    await this.page.waitForSelector(this.selectors.gameSettings);
  }

  async switchToStatsTab() {
    await this.page.click(this.selectors.statsTab);
    await this.page.waitForSelector(this.selectors.statsSection);
  }

  // 钱包操作
  async isWalletConnected() {
    return await this.page.isVisible(this.selectors.walletAddress);
  }

  async getWalletAddress() {
    if (await this.isWalletConnected()) {
      return await this.page.textContent(this.selectors.walletAddress);
    }
    return null;
  }

  // 游戏设置操作
  async selectDifficulty(difficulty) {
    await this.page.selectOption(this.selectors.difficultySelect, difficulty);
  }

  async setCustomGameSettings(width, height, mineCount) {
    await this.page.fill(this.selectors.widthInput, width.toString());
    await this.page.fill(this.selectors.heightInput, height.toString());
    await this.page.fill(this.selectors.mineCountInput, mineCount.toString());
  }

  async startNewGame() {
    await this.page.click(this.selectors.startGameButton);
    await this.page.waitForSelector(this.selectors.gameBoard);
  }

  // 游戏棋盘操作
  async clickCell(x, y) {
    await this.page.click(this.selectors.cell(x, y));
  }

  async rightClickCell(x, y) {
    await this.page.click(this.selectors.cell(x, y), { button: 'right' });
  }

  async getCellState(x, y) {
    const cell = this.page.locator(this.selectors.cell(x, y));
    const classes = await cell.getAttribute('class');
    return {
      isRevealed: classes.includes('revealed'),
      isFlagged: classes.includes('flagged'),
      isMine: classes.includes('mine'),
      number: await cell.textContent()
    };
  }

  async getGameStatus() {
    return await this.page.textContent(this.selectors.gameStatus);
  }

  async getGameTimer() {
    return await this.page.textContent(this.selectors.gameTimer);
  }

  async getMineCounter() {
    return await this.page.textContent(this.selectors.mineCounter);
  }

  // 统计页面操作
  async getPlayerStats() {
    await this.switchToStatsTab();
    return {
      totalGames: await this.page.textContent(this.selectors.totalGames),
      winRate: await this.page.textContent(this.selectors.winRate),
      bestTime: await this.page.textContent(this.selectors.bestTime)
    };
  }

  // 错误和状态检查
  async hasError() {
    return await this.page.isVisible(this.selectors.errorMessage);
  }

  async getErrorMessage() {
    if (await this.hasError()) {
      return await this.page.textContent(this.selectors.errorMessage);
    }
    return null;
  }

  async isLoading() {
    return await this.page.isVisible(this.selectors.loadingSpinner);
  }

  // 响应式设计检查
  async isMobileView() {
    const viewport = this.page.viewportSize();
    return viewport.width < 768;
  }

  // 截图和调试
  async takeScreenshot(name) {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}.png`,
      fullPage: true 
    });
  }
}
