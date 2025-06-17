import { ethers } from 'ethers';

// 智能合约 ABI（从编译后的合约中获取）
export const MINESWEEPER_ABI = [
  "function startGame(uint8 width, uint8 height, uint16 mineCount) external",
  "function revealCell(uint8 x, uint8 y) external",
  "function getGameInfo() external view returns (uint8 width, uint8 height, uint16 mineCount, uint8 status, uint32 score, uint32 clickCount, uint256 startTime, uint256 endTime, bool initialized)",
  "function isCellRevealed(uint8 x, uint8 y) external view returns (bool)",
  "function getAdjacentMineCount(uint8 x, uint8 y) external view returns (uint8)",
  "function getPlayerStats() external view returns (uint32 totalGamesPlayed, uint32 gamesWon, uint32 currentHighScore, uint8 winRate)",
  "function games(address) external view returns (uint8 width, uint8 height, uint16 mineCount, uint256 revealedCells, uint256 mineBitmap, uint8 status, uint32 score, uint32 clickCount, uint256 startTime, uint256 endTime, bool initialized)",
  "function highScores(address) external view returns (uint32)",
  "function totalGames(address) external view returns (uint32)",
  "function winCount(address) external view returns (uint32)",
  "function MIN_SIZE() external view returns (uint8)",
  "function MAX_SIZE() external view returns (uint8)",
  "function MIN_MINE_RATE() external view returns (uint8)",
  "function MAX_MINE_RATE() external view returns (uint8)",
  "function CELL_SCORE() external view returns (uint32)",
  "function WIN_BONUS() external view returns (uint32)",
  "event GameStarted(address indexed player, uint8 width, uint8 height, uint16 mineCount)",
  "event CellRevealed(address indexed player, uint8 x, uint8 y, bool isMine, uint8 adjacentMines)",
  "event GameWon(address indexed player, uint32 score, uint32 clickCount, uint256 duration)",
  "event GameLost(address indexed player, uint8 x, uint8 y, uint32 clickCount)",
  "event HighScoreUpdated(address indexed player, uint32 newHighScore)"
];

// 合约地址（部署后需要更新）
export const MINESWEEPER_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // 本地测试地址

// 游戏状态枚举
export const GameStatus = {
  NOT_STARTED: 0,
  IN_PROGRESS: 1,
  WON: 2,
  LOST: 3
};

// Web3 连接管理
export class Web3Manager {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.account = null;
  }

  // 连接钱包
  async connectWallet() {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('请安装 MetaMask 钱包');
    }

    try {
      // 请求连接钱包
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // 创建 provider 和 signer
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      this.account = await this.signer.getAddress();
      
      // 创建合约实例
      this.contract = new ethers.Contract(MINESWEEPER_ADDRESS, MINESWEEPER_ABI, this.signer);
      
      // 监听账户变化
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          this.disconnect();
        } else {
          this.account = accounts[0];
          window.location.reload(); // 简单的重新加载页面
        }
      });

      // 监听网络变化
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });

      return this.account;
    } catch (error) {
      console.error('连接钱包失败:', error);
      throw error;
    }
  }

  // 断开连接
  disconnect() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.account = null;
  }

  // 检查是否已连接
  isConnected() {
    return this.account !== null;
  }

  // 获取网络信息
  async getNetwork() {
    if (!this.provider) return null;
    return await this.provider.getNetwork();
  }

  // 获取余额
  async getBalance() {
    if (!this.provider || !this.account) return null;
    const balance = await this.provider.getBalance(this.account);
    return ethers.formatEther(balance);
  }

  // 开始游戏
  async startGame(width, height, mineCount) {
    if (!this.contract) throw new Error('合约未连接');
    
    try {
      const tx = await this.contract.startGame(width, height, mineCount);
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('开始游戏失败:', error);
      throw error;
    }
  }

  // 揭示格子
  async revealCell(x, y) {
    if (!this.contract) throw new Error('合约未连接');
    
    try {
      const tx = await this.contract.revealCell(x, y);
      await tx.wait();
      return tx;
    } catch (error) {
      console.error('揭示格子失败:', error);
      throw error;
    }
  }

  // 获取游戏信息
  async getGameInfo() {
    if (!this.contract) throw new Error('合约未连接');
    
    try {
      const result = await this.contract.getGameInfo();
      return {
        width: Number(result[0]),
        height: Number(result[1]),
        mineCount: Number(result[2]),
        status: Number(result[3]),
        score: Number(result[4]),
        clickCount: Number(result[5]),
        startTime: Number(result[6]),
        endTime: Number(result[7]),
        initialized: result[8]
      };
    } catch (error) {
      console.error('获取游戏信息失败:', error);
      throw error;
    }
  }

  // 检查格子是否已揭示
  async isCellRevealed(x, y) {
    if (!this.contract) throw new Error('合约未连接');
    
    try {
      return await this.contract.isCellRevealed(x, y);
    } catch (error) {
      console.error('检查格子状态失败:', error);
      return false;
    }
  }

  // 获取相邻地雷数量
  async getAdjacentMineCount(x, y) {
    if (!this.contract) throw new Error('合约未连接');
    
    try {
      const count = await this.contract.getAdjacentMineCount(x, y);
      return Number(count);
    } catch (error) {
      console.error('获取相邻地雷数量失败:', error);
      return 0;
    }
  }

  // 获取玩家统计
  async getPlayerStats() {
    if (!this.contract) throw new Error('合约未连接');
    
    try {
      const result = await this.contract.getPlayerStats();
      return {
        totalGamesPlayed: Number(result[0]),
        gamesWon: Number(result[1]),
        currentHighScore: Number(result[2]),
        winRate: Number(result[3])
      };
    } catch (error) {
      console.error('获取玩家统计失败:', error);
      throw error;
    }
  }

  // 监听合约事件
  setupEventListeners(callbacks) {
    if (!this.contract) return;

    // 游戏开始事件
    this.contract.on('GameStarted', (player, width, height, mineCount, event) => {
      if (callbacks.onGameStarted) {
        callbacks.onGameStarted({ player, width: Number(width), height: Number(height), mineCount: Number(mineCount), event });
      }
    });

    // 格子揭示事件
    this.contract.on('CellRevealed', (player, x, y, isMine, adjacentMines, event) => {
      if (callbacks.onCellRevealed) {
        callbacks.onCellRevealed({ player, x: Number(x), y: Number(y), isMine, adjacentMines: Number(adjacentMines), event });
      }
    });

    // 游戏胜利事件
    this.contract.on('GameWon', (player, score, clickCount, duration, event) => {
      if (callbacks.onGameWon) {
        callbacks.onGameWon({ player, score: Number(score), clickCount: Number(clickCount), duration: Number(duration), event });
      }
    });

    // 游戏失败事件
    this.contract.on('GameLost', (player, x, y, clickCount, event) => {
      if (callbacks.onGameLost) {
        callbacks.onGameLost({ player, x: Number(x), y: Number(y), clickCount: Number(clickCount), event });
      }
    });

    // 最高分更新事件
    this.contract.on('HighScoreUpdated', (player, newHighScore, event) => {
      if (callbacks.onHighScoreUpdated) {
        callbacks.onHighScoreUpdated({ player, newHighScore: Number(newHighScore), event });
      }
    });
  }

  // 移除事件监听器
  removeEventListeners() {
    if (this.contract) {
      this.contract.removeAllListeners();
    }
  }
}

// 创建全局 Web3 管理器实例
export const web3Manager = new Web3Manager();
