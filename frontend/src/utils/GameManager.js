import { web3Manager } from './web3';
import { LocalGameEngine } from './LocalGameEngine';
import { STORAGE_KEYS } from './constants';

/**
 * 游戏模式枚举
 */
export const GameMode = {
  LOCAL: 'local',
  BLOCKCHAIN: 'blockchain'
};

/**
 * 游戏管理器 - 统一管理本地模式和区块链模式
 */
export class GameManager {
  constructor() {
    this.currentMode = this.loadGameMode();
    this.localEngine = new LocalGameEngine();
    this.blockchainEngine = web3Manager;
    this.isInitialized = false;
  }

  /**
   * 初始化游戏管理器
   */
  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // 如果是区块链模式，检查连接状态
      if (this.currentMode === GameMode.BLOCKCHAIN) {
        // 检查是否有可用的 Web3 环境
        if (typeof window.ethereum === 'undefined') {
          console.warn('未检测到 MetaMask，切换到本地模式');
          this.setGameMode(GameMode.LOCAL);
        }
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('游戏管理器初始化失败:', error);
      // 出错时默认使用本地模式
      this.setGameMode(GameMode.LOCAL);
    }
  }

  /**
   * 设置游戏模式
   */
  setGameMode(mode) {
    if (!Object.values(GameMode).includes(mode)) {
      throw new Error('无效的游戏模式');
    }
    
    this.currentMode = mode;
    this.saveGameMode();
    
    // 触发模式切换事件
    if (this.onModeChange) {
      this.onModeChange(mode);
    }
  }

  /**
   * 获取当前游戏模式
   */
  getCurrentMode() {
    return this.currentMode;
  }

  /**
   * 检查是否为本地模式
   */
  isLocalMode() {
    return this.currentMode === GameMode.LOCAL;
  }

  /**
   * 检查是否为区块链模式
   */
  isBlockchainMode() {
    return this.currentMode === GameMode.BLOCKCHAIN;
  }

  /**
   * 获取当前游戏引擎
   */
  getCurrentEngine() {
    return this.isLocalMode() ? this.localEngine : this.blockchainEngine;
  }

  /**
   * 检查是否已连接（区块链模式需要钱包连接）
   */
  isConnected() {
    if (this.isLocalMode()) {
      return true; // 本地模式总是"已连接"
    } else {
      return this.blockchainEngine.isConnected();
    }
  }

  /**
   * 连接钱包（仅区块链模式）
   */
  async connectWallet() {
    if (this.isLocalMode()) {
      throw new Error('本地模式不需要连接钱包');
    }
    
    return await this.blockchainEngine.connectWallet();
  }

  /**
   * 断开连接
   */
  disconnect() {
    if (this.isBlockchainMode()) {
      this.blockchainEngine.disconnect();
    }
    // 本地模式无需断开操作
  }

  /**
   * 获取账户信息
   */
  async getAccountInfo() {
    if (this.isLocalMode()) {
      return {
        address: '本地模式',
        balance: '∞',
        network: '本地'
      };
    } else {
      if (!this.blockchainEngine.isConnected()) {
        return null;
      }
      
      return {
        address: this.blockchainEngine.account,
        balance: await this.blockchainEngine.getBalance(),
        network: await this.blockchainEngine.getNetwork()
      };
    }
  }

  // ===== 游戏操作统一接口 =====

  /**
   * 开始游戏
   */
  async startGame(width, height, mineCount) {
    await this.initialize();
    const engine = this.getCurrentEngine();
    return await engine.startGame(width, height, mineCount);
  }

  /**
   * 揭示格子
   */
  async revealCell(x, y) {
    const engine = this.getCurrentEngine();
    return await engine.revealCell(x, y);
  }

  /**
   * 标记格子（仅本地模式支持）
   */
  async toggleFlag(x, y) {
    if (this.isLocalMode()) {
      return await this.localEngine.toggleFlag(x, y);
    } else {
      // 区块链模式暂不支持标记功能
      throw new Error('区块链模式暂不支持标记功能');
    }
  }

  /**
   * 获取游戏信息
   */
  async getGameInfo() {
    const engine = this.getCurrentEngine();
    return await engine.getGameInfo();
  }

  /**
   * 检查格子是否已揭示
   */
  async isCellRevealed(x, y) {
    const engine = this.getCurrentEngine();
    return await engine.isCellRevealed(x, y);
  }

  /**
   * 检查格子是否被标记（仅本地模式）
   */
  async isCellFlagged(x, y) {
    if (this.isLocalMode()) {
      return await this.localEngine.isCellFlagged(x, y);
    }
    return false;
  }

  /**
   * 获取相邻地雷数量
   */
  async getAdjacentMineCount(x, y) {
    const engine = this.getCurrentEngine();
    return await engine.getAdjacentMineCount(x, y);
  }

  /**
   * 获取玩家统计
   */
  async getPlayerStats() {
    const engine = this.getCurrentEngine();
    return await engine.getPlayerStats();
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners(callbacks) {
    if (this.isBlockchainMode()) {
      this.blockchainEngine.setupEventListeners(callbacks);
    }
    // 本地模式的事件通过直接调用回调函数实现
  }

  /**
   * 移除事件监听器
   */
  removeEventListeners() {
    if (this.isBlockchainMode()) {
      this.blockchainEngine.removeEventListeners();
    }
  }

  /**
   * 获取模式显示名称
   */
  getModeDisplayName() {
    return this.isLocalMode() ? '本地模式' : '区块链模式';
  }

  /**
   * 获取模式描述
   */
  getModeDescription() {
    if (this.isLocalMode()) {
      return '离线游戏，数据保存在本地，支持标记功能';
    } else {
      return '连接区块链，数据上链存储，支持代币奖励';
    }
  }

  /**
   * 检查模式是否可用
   */
  async isModeAvailable(mode) {
    if (mode === GameMode.LOCAL) {
      return true; // 本地模式总是可用
    } else if (mode === GameMode.BLOCKCHAIN) {
      // 检查是否有 MetaMask 等 Web3 环境
      return typeof window.ethereum !== 'undefined';
    }
    return false;
  }

  /**
   * 获取模式切换建议
   */
  async getModeSuggestion() {
    const isWeb3Available = await this.isModeAvailable(GameMode.BLOCKCHAIN);
    
    if (!isWeb3Available) {
      return {
        suggested: GameMode.LOCAL,
        reason: '未检测到 MetaMask 钱包，建议使用本地模式'
      };
    }
    
    // 如果两种模式都可用，根据用户偏好或网络状态建议
    return {
      suggested: GameMode.LOCAL,
      reason: '本地模式无需网络连接，响应更快'
    };
  }

  // ===== 数据管理 =====

  /**
   * 保存游戏模式
   */
  saveGameMode() {
    localStorage.setItem(STORAGE_KEYS.GAME_MODE, this.currentMode);
  }

  /**
   * 加载游戏模式
   */
  loadGameMode() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GAME_MODE);
      if (saved && Object.values(GameMode).includes(saved)) {
        return saved;
      }
    } catch (error) {
      console.error('加载游戏模式失败:', error);
    }
    
    // 默认使用本地模式
    return GameMode.LOCAL;
  }

  /**
   * 重置所有数据
   */
  resetAllData() {
    if (this.isLocalMode()) {
      this.localEngine.resetGameData();
    }
    // 区块链模式的数据在链上，无法重置
  }

  /**
   * 导出游戏数据（仅本地模式）
   */
  exportGameData() {
    if (this.isLocalMode()) {
      const currentGame = localStorage.getItem(STORAGE_KEYS.CURRENT_GAME);
      const playerStats = localStorage.getItem(STORAGE_KEYS.PLAYER_STATS);
      
      return {
        currentGame: currentGame ? JSON.parse(currentGame) : null,
        playerStats: playerStats ? JSON.parse(playerStats) : null,
        exportTime: new Date().toISOString()
      };
    }
    
    throw new Error('仅本地模式支持数据导出');
  }

  /**
   * 导入游戏数据（仅本地模式）
   */
  importGameData(data) {
    if (!this.isLocalMode()) {
      throw new Error('仅本地模式支持数据导入');
    }
    
    try {
      if (data.currentGame) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_GAME, JSON.stringify(data.currentGame));
      }
      
      if (data.playerStats) {
        localStorage.setItem(STORAGE_KEYS.PLAYER_STATS, JSON.stringify(data.playerStats));
      }
      
      // 重新加载数据
      this.localEngine.loadCurrentGame();
      this.localEngine.playerStats = this.localEngine.loadPlayerStats();
      
      return { success: true };
    } catch (error) {
      console.error('导入游戏数据失败:', error);
      throw error;
    }
  }

  /**
   * 设置模式切换回调
   */
  onModeChange = null;
}

// 创建全局游戏管理器实例
export const gameManager = new GameManager();
