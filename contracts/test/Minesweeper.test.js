const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Minesweeper", function () {
  let minesweeper;
  let owner;
  let player1;
  let player2;

  beforeEach(async function () {
    [owner, player1, player2] = await ethers.getSigners();
    
    const Minesweeper = await ethers.getContractFactory("Minesweeper");
    minesweeper = await Minesweeper.deploy();
    await minesweeper.waitForDeployment();
  });

  describe("Game Initialization", function () {
    it("Should start a new game with valid parameters", async function () {
      const width = 10;
      const height = 10;
      const mineCount = 15;

      await expect(minesweeper.connect(player1).startGame(width, height, mineCount))
        .to.emit(minesweeper, "GameStarted")
        .withArgs(player1.address, width, height, mineCount);

      const gameInfo = await minesweeper.connect(player1).getGameInfo();
      expect(gameInfo.width).to.equal(width);
      expect(gameInfo.height).to.equal(height);
      expect(gameInfo.mineCount).to.equal(mineCount);
      expect(gameInfo.status).to.equal(1); // InProgress
      expect(gameInfo.initialized).to.be.true;
    });

    it("Should reject invalid board dimensions", async function () {
      // 太小的尺寸
      await expect(minesweeper.connect(player1).startGame(4, 5, 5))
        .to.be.revertedWith("Invalid width");
      
      await expect(minesweeper.connect(player1).startGame(5, 4, 5))
        .to.be.revertedWith("Invalid height");

      // 太大的尺寸
      await expect(minesweeper.connect(player1).startGame(21, 10, 20))
        .to.be.revertedWith("Invalid width");
      
      await expect(minesweeper.connect(player1).startGame(10, 21, 20))
        .to.be.revertedWith("Invalid height");
    });

    it("Should reject invalid mine count", async function () {
      const width = 10;
      const height = 10;
      const totalCells = width * height;

      // 地雷太少 (< 10%)
      await expect(minesweeper.connect(player1).startGame(width, height, 5))
        .to.be.revertedWith("Invalid mine count");

      // 地雷太多 (> 30%)
      await expect(minesweeper.connect(player1).startGame(width, height, 35))
        .to.be.revertedWith("Invalid mine count");

      // 地雷数量等于总格子数
      await expect(minesweeper.connect(player1).startGame(width, height, totalCells))
        .to.be.revertedWith("Invalid mine count");
    });

    it("Should allow restarting a game", async function () {
      // 开始第一个游戏
      await minesweeper.connect(player1).startGame(8, 8, 10);
      
      // 开始第二个游戏（应该覆盖第一个）
      await expect(minesweeper.connect(player1).startGame(10, 10, 15))
        .to.emit(minesweeper, "GameStarted")
        .withArgs(player1.address, 10, 10, 15);

      const gameInfo = await minesweeper.connect(player1).getGameInfo();
      expect(gameInfo.width).to.equal(10);
      expect(gameInfo.height).to.equal(10);
      expect(gameInfo.mineCount).to.equal(15);
    });
  });

  describe("Game Play", function () {
    beforeEach(async function () {
      // 开始一个标准游戏
      await minesweeper.connect(player1).startGame(8, 8, 10);
    });

    it("Should reveal a cell and emit event", async function () {
      const tx = await minesweeper.connect(player1).revealCell(0, 0);
      const receipt = await tx.wait();

      // 检查是否发出了 CellRevealed 或 GameLost 事件
      const cellRevealedEvent = receipt.logs.find(log => {
        try {
          const parsed = minesweeper.interface.parseLog(log);
          return parsed.name === "CellRevealed";
        } catch {
          return false;
        }
      });

      const gameLostEvent = receipt.logs.find(log => {
        try {
          const parsed = minesweeper.interface.parseLog(log);
          return parsed.name === "GameLost";
        } catch {
          return false;
        }
      });

      // 应该发出其中一个事件
      expect(cellRevealedEvent || gameLostEvent).to.not.be.undefined;

      // 检查格子是否被标记为已揭示（如果不是地雷）
      if (cellRevealedEvent) {
        const isRevealed = await minesweeper.connect(player1).isCellRevealed(0, 0);
        expect(isRevealed).to.be.true;
      }
    });

    it("Should not allow revealing the same cell twice", async function () {
      await minesweeper.connect(player1).revealCell(0, 0);
      
      await expect(minesweeper.connect(player1).revealCell(0, 0))
        .to.be.revertedWith("Cell already revealed");
    });

    it("Should not allow revealing cells with invalid coordinates", async function () {
      await expect(minesweeper.connect(player1).revealCell(8, 0))
        .to.be.revertedWith("Invalid coordinate");
      
      await expect(minesweeper.connect(player1).revealCell(0, 8))
        .to.be.revertedWith("Invalid coordinate");
    });

    it("Should not allow game actions without initialization", async function () {
      await expect(minesweeper.connect(player2).revealCell(0, 0))
        .to.be.revertedWith("Game not initialized");
    });

    it("Should increment click count", async function () {
      // 尝试多次点击，直到找到安全格子
      let clickCount = 0;
      let gameInfo;

      for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
          try {
            await minesweeper.connect(player1).revealCell(x, y);
            clickCount++;
            gameInfo = await minesweeper.connect(player1).getGameInfo();

            // 如果游戏还在进行中，继续点击
            if (gameInfo.status === 1) { // InProgress
              continue;
            } else {
              // 游戏结束了，检查点击次数
              break;
            }
          } catch (error) {
            // 如果格子已经被揭示，跳过
            if (error.message.includes("Cell already revealed")) {
              continue;
            }
            // 其他错误重新抛出
            throw error;
          }
        }
        if (gameInfo && gameInfo.status !== 1) break;
      }

      gameInfo = await minesweeper.connect(player1).getGameInfo();
      expect(gameInfo.clickCount).to.be.at.least(1);
    });

    it("Should increase score when revealing safe cells", async function () {
      // 尝试多个位置，直到找到安全格子
      let foundSafeCell = false;

      for (let x = 0; x < 8 && !foundSafeCell; x++) {
        for (let y = 0; y < 8 && !foundSafeCell; y++) {
          try {
            const tx = await minesweeper.connect(player1).revealCell(x, y);
            const receipt = await tx.wait();

            // 检查是否发出了 CellRevealed 事件（表示是安全格子）
            const cellRevealedEvent = receipt.logs.find(log => {
              try {
                const parsed = minesweeper.interface.parseLog(log);
                return parsed.name === "CellRevealed";
              } catch {
                return false;
              }
            });

            if (cellRevealedEvent) {
              foundSafeCell = true;
              const gameInfo = await minesweeper.connect(player1).getGameInfo();
              expect(gameInfo.score).to.be.at.least(1);
            } else {
              // 如果是地雷，游戏结束，重新开始
              await minesweeper.connect(player1).startGame(8, 8, 10);
            }
          } catch (error) {
            if (error.message.includes("Cell already revealed")) {
              continue;
            }
            throw error;
          }
        }
      }

      expect(foundSafeCell).to.be.true;
    });
  });

  describe("Player Statistics", function () {
    it("Should track player statistics", async function () {
      // 初始统计应该为0
      let stats = await minesweeper.connect(player1).getPlayerStats();
      expect(stats.totalGamesPlayed).to.equal(0);
      expect(stats.gamesWon).to.equal(0);
      expect(stats.currentHighScore).to.equal(0);
      expect(stats.winRate).to.equal(0);

      // 开始一个游戏
      await minesweeper.connect(player1).startGame(5, 5, 3);
      
      stats = await minesweeper.connect(player1).getPlayerStats();
      expect(stats.totalGamesPlayed).to.equal(1);
    });

    it("Should maintain separate statistics for different players", async function () {
      await minesweeper.connect(player1).startGame(5, 5, 3);
      await minesweeper.connect(player2).startGame(6, 6, 5);

      const stats1 = await minesweeper.connect(player1).getPlayerStats();
      const stats2 = await minesweeper.connect(player2).getPlayerStats();

      expect(stats1.totalGamesPlayed).to.equal(1);
      expect(stats2.totalGamesPlayed).to.equal(1);
    });
  });

  describe("Game Constants", function () {
    it("Should have correct constants", async function () {
      expect(await minesweeper.MIN_SIZE()).to.equal(5);
      expect(await minesweeper.MAX_SIZE()).to.equal(20);
      expect(await minesweeper.MIN_MINE_RATE()).to.equal(10);
      expect(await minesweeper.MAX_MINE_RATE()).to.equal(30);
      expect(await minesweeper.CELL_SCORE()).to.equal(1);
      expect(await minesweeper.WIN_BONUS()).to.equal(5);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle minimum board size", async function () {
      const minSize = 5;
      const minMines = Math.floor((minSize * minSize * 10) / 100); // 10%
      
      await expect(minesweeper.connect(player1).startGame(minSize, minSize, minMines))
        .to.not.be.reverted;
    });

    it("Should handle maximum board size", async function () {
      const maxSize = 20;
      const maxMines = Math.floor((maxSize * maxSize * 30) / 100); // 30%
      
      await expect(minesweeper.connect(player1).startGame(maxSize, maxSize, maxMines))
        .to.not.be.reverted;
    });
  });
});
