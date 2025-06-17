import { GameStatus, STORAGE_KEYS } from './constants';

/**
 * 本地游戏引擎 - 实现完整的扫雷游戏逻辑
 * 无需网络连接，数据存储在 localStorage
 */
export class LocalGameEngine {
  constructor() {
    this.currentGame = null;
    this.playerStats = this.loadPlayerStats();
    this.loadCurrentGame();
  }

  /**
   * 开始新游戏
   */
  async startGame(width, height, mineCount) {
    try {
      // 验证参数
      if (width < 5 || width > 20 || height < 5 || height > 20) {
        throw new Error('棋盘尺寸必须在 5-20 之间');
      }
      
      const maxMines = Math.floor((width * height) * 0.3);
      const minMines = Math.floor((width * height) * 0.1);
      
      if (mineCount < minMines || mineCount > maxMines) {
        throw new Error(`地雷数量必须在 ${minMines}-${maxMines} 之间`);
      }

      // 创建新游戏
      this.currentGame = {
        width,
        height,
        mineCount,
        status: GameStatus.IN_PROGRESS,
        board: this.createEmptyBoard(width, height),
        revealedCells: new Set(),
        flaggedCells: new Set(),
        minePositions: this.generateMinePositions(width, height, mineCount),
        startTime: Date.now(),
        endTime: null,
        clickCount: 0,
        score: 0,
        initialized: true
      };

      // 计算相邻地雷数
      this.calculateAdjacentMines();
      
      // 保存游戏状态
      this.saveCurrentGame();
      
      return { success: true };
    } catch (error) {
      console.error('开始游戏失败:', error);
      throw error;
    }
  }

  /**
   * 揭示格子
   */
  async revealCell(x, y) {
    if (!this.currentGame || this.currentGame.status !== GameStatus.IN_PROGRESS) {
      throw new Error('游戏未开始或已结束');
    }

    if (x < 0 || x >= this.currentGame.width || y < 0 || y >= this.currentGame.height) {
      throw new Error('坐标超出范围');
    }

    const cellKey = `${x},${y}`;
    
    // 检查格子是否已揭示或被标记
    if (this.currentGame.revealedCells.has(cellKey) || this.currentGame.flaggedCells.has(cellKey)) {
      return { success: false, message: '格子已揭示或被标记' };
    }

    this.currentGame.clickCount++;
    
    // 检查是否是地雷
    const isMine = this.currentGame.minePositions.has(cellKey);
    
    if (isMine) {
      // 游戏失败
      this.currentGame.status = GameStatus.LOST;
      this.currentGame.endTime = Date.now();
      this.revealAllMines();
      this.updatePlayerStats(false);
    } else {
      // 揭示格子
      this.revealCellAndAdjacent(x, y);
      
      // 检查是否胜利
      if (this.checkWinCondition()) {
        this.currentGame.status = GameStatus.WON;
        this.currentGame.endTime = Date.now();
        this.calculateScore();
        this.updatePlayerStats(true);
      }
    }

    this.saveCurrentGame();
    
    return {
      success: true,
      isMine,
      gameStatus: this.currentGame.status,
      adjacentMines: isMine ? 0 : this.getAdjacentMineCount(x, y)
    };
  }

  /**
   * 标记/取消标记格子
   */
  async toggleFlag(x, y) {
    if (!this.currentGame || this.currentGame.status !== GameStatus.IN_PROGRESS) {
      throw new Error('游戏未开始或已结束');
    }

    const cellKey = `${x},${y}`;
    
    // 不能标记已揭示的格子
    if (this.currentGame.revealedCells.has(cellKey)) {
      return { success: false, message: '不能标记已揭示的格子' };
    }

    if (this.currentGame.flaggedCells.has(cellKey)) {
      this.currentGame.flaggedCells.delete(cellKey);
    } else {
      this.currentGame.flaggedCells.add(cellKey);
    }

    this.saveCurrentGame();
    return { success: true, flagged: this.currentGame.flaggedCells.has(cellKey) };
  }

  /**
   * 获取游戏信息
   */
  async getGameInfo() {
    if (!this.currentGame) {
      return {
        width: 0,
        height: 0,
        mineCount: 0,
        status: GameStatus.NOT_STARTED,
        score: 0,
        clickCount: 0,
        startTime: 0,
        endTime: 0,
        initialized: false
      };
    }

    return {
      width: this.currentGame.width,
      height: this.currentGame.height,
      mineCount: this.currentGame.mineCount,
      status: this.currentGame.status,
      score: this.currentGame.score,
      clickCount: this.currentGame.clickCount,
      startTime: this.currentGame.startTime,
      endTime: this.currentGame.endTime || 0,
      initialized: this.currentGame.initialized
    };
  }

  /**
   * 检查格子是否已揭示
   */
  async isCellRevealed(x, y) {
    if (!this.currentGame) return false;
    return this.currentGame.revealedCells.has(`${x},${y}`);
  }

  /**
   * 检查格子是否被标记
   */
  async isCellFlagged(x, y) {
    if (!this.currentGame) return false;
    return this.currentGame.flaggedCells.has(`${x},${y}`);
  }

  /**
   * 获取相邻地雷数量
   */
  async getAdjacentMineCount(x, y) {
    if (!this.currentGame) return 0;
    return this.getAdjacentMineCount(x, y);
  }

  /**
   * 获取玩家统计
   */
  async getPlayerStats() {
    return {
      totalGamesPlayed: this.playerStats.totalGamesPlayed,
      gamesWon: this.playerStats.gamesWon,
      currentHighScore: this.playerStats.currentHighScore,
      winRate: this.playerStats.totalGamesPlayed > 0 
        ? Math.round((this.playerStats.gamesWon / this.playerStats.totalGamesPlayed) * 100)
        : 0
    };
  }

  // ===== 私有方法 =====

  /**
   * 创建空棋盘
   */
  createEmptyBoard(width, height) {
    return Array(height).fill().map(() => Array(width).fill(0));
  }

  /**
   * 生成地雷位置
   */
  generateMinePositions(width, height, mineCount) {
    const positions = new Set();
    const totalCells = width * height;
    
    while (positions.size < mineCount) {
      const randomIndex = Math.floor(Math.random() * totalCells);
      const x = randomIndex % width;
      const y = Math.floor(randomIndex / width);
      positions.add(`${x},${y}`);
    }
    
    return positions;
  }

  /**
   * 计算相邻地雷数
   */
  calculateAdjacentMines() {
    for (let y = 0; y < this.currentGame.height; y++) {
      for (let x = 0; x < this.currentGame.width; x++) {
        if (!this.currentGame.minePositions.has(`${x},${y}`)) {
          this.currentGame.board[y][x] = this.getAdjacentMineCount(x, y);
        } else {
          this.currentGame.board[y][x] = -1; // 地雷标记为 -1
        }
      }
    }
  }

  /**
   * 获取指定位置相邻地雷数量
   */
  getAdjacentMineCount(x, y) {
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < this.currentGame.width && 
            ny >= 0 && ny < this.currentGame.height &&
            this.currentGame.minePositions.has(`${nx},${ny}`)) {
          count++;
        }
      }
    }
    return count;
  }

  /**
   * 揭示格子及相邻空格子
   */
  revealCellAndAdjacent(x, y) {
    const cellKey = `${x},${y}`;
    
    if (this.currentGame.revealedCells.has(cellKey) || 
        this.currentGame.flaggedCells.has(cellKey) ||
        this.currentGame.minePositions.has(cellKey)) {
      return;
    }

    this.currentGame.revealedCells.add(cellKey);
    
    // 如果是空格子（相邻无地雷），递归揭示相邻格子
    if (this.currentGame.board[y][x] === 0) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < this.currentGame.width && 
              ny >= 0 && ny < this.currentGame.height) {
            this.revealCellAndAdjacent(nx, ny);
          }
        }
      }
    }
  }

  /**
   * 揭示所有地雷
   */
  revealAllMines() {
    this.currentGame.minePositions.forEach(pos => {
      this.currentGame.revealedCells.add(pos);
    });
  }

  /**
   * 检查胜利条件
   */
  checkWinCondition() {
    const totalCells = this.currentGame.width * this.currentGame.height;
    const revealedCount = this.currentGame.revealedCells.size;
    return revealedCount === totalCells - this.currentGame.mineCount;
  }

  /**
   * 计算得分
   */
  calculateScore() {
    const duration = this.currentGame.endTime - this.currentGame.startTime;
    const timeBonus = Math.max(0, 300000 - duration) / 1000; // 5分钟内完成有时间奖励
    const clickEfficiency = this.currentGame.width * this.currentGame.height / this.currentGame.clickCount;
    
    this.currentGame.score = Math.round(
      (this.currentGame.width * this.currentGame.height * 10) + // 基础分
      (timeBonus * 2) + // 时间奖励
      (clickEfficiency * 50) // 效率奖励
    );
  }

  /**
   * 更新玩家统计
   */
  updatePlayerStats(won) {
    this.playerStats.totalGamesPlayed++;
    if (won) {
      this.playerStats.gamesWon++;
      if (this.currentGame.score > this.playerStats.currentHighScore) {
        this.playerStats.currentHighScore = this.currentGame.score;
      }
    }
    this.savePlayerStats();
  }

  /**
   * 保存当前游戏状态
   */
  saveCurrentGame() {
    if (this.currentGame) {
      const gameData = {
        ...this.currentGame,
        revealedCells: Array.from(this.currentGame.revealedCells),
        flaggedCells: Array.from(this.currentGame.flaggedCells),
        minePositions: Array.from(this.currentGame.minePositions)
      };
      localStorage.setItem(STORAGE_KEYS.CURRENT_GAME, JSON.stringify(gameData));
    }
  }

  /**
   * 加载当前游戏状态
   */
  loadCurrentGame() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_GAME);
      if (saved) {
        const gameData = JSON.parse(saved);
        this.currentGame = {
          ...gameData,
          revealedCells: new Set(gameData.revealedCells),
          flaggedCells: new Set(gameData.flaggedCells),
          minePositions: new Set(gameData.minePositions)
        };
      }
    } catch (error) {
      console.error('加载游戏状态失败:', error);
      this.currentGame = null;
    }
  }

  /**
   * 保存玩家统计
   */
  savePlayerStats() {
    localStorage.setItem(STORAGE_KEYS.PLAYER_STATS, JSON.stringify(this.playerStats));
  }

  /**
   * 加载玩家统计
   */
  loadPlayerStats() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PLAYER_STATS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('加载玩家统计失败:', error);
    }
    
    return {
      totalGamesPlayed: 0,
      gamesWon: 0,
      currentHighScore: 0
    };
  }

  /**
   * 重置游戏数据
   */
  resetGameData() {
    this.currentGame = null;
    this.playerStats = {
      totalGamesPlayed: 0,
      gamesWon: 0,
      currentHighScore: 0
    };
    localStorage.removeItem(STORAGE_KEYS.CURRENT_GAME);
    localStorage.removeItem(STORAGE_KEYS.PLAYER_STATS);
  }
}
