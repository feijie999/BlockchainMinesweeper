import React, { useState, useEffect } from 'react';
import GameBoard from './GameBoard';
import { GameStatus } from '../utils/constants';

// 测试模式组件 - 用于测试游戏逻辑而不需要区块链连接
const TestMode = () => {
  const [gameInfo, setGameInfo] = useState({
    width: 8,
    height: 8,
    mineCount: 10,
    status: GameStatus.NOT_STARTED,
    score: 0,
    clickCount: 0,
    startTime: 0,
    endTime: 0,
    initialized: false
  });

  const [board, setBoard] = useState([]);
  const [revealedCells, setRevealedCells] = useState(new Set());
  const [minePositions, setMinePositions] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // 生成随机地雷位置
  const generateMines = (width, height, mineCount, firstClickX, firstClickY) => {
    const mines = new Set();
    const totalCells = width * height;
    
    // 确保第一次点击的位置及其周围不是地雷
    const safeZone = new Set();
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const x = firstClickX + dx;
        const y = firstClickY + dy;
        if (x >= 0 && x < width && y >= 0 && y < height) {
          safeZone.add(`${x}-${y}`);
        }
      }
    }

    while (mines.size < mineCount) {
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);
      const key = `${x}-${y}`;
      
      if (!safeZone.has(key)) {
        mines.add(key);
      }
    }

    return mines;
  };

  // 计算相邻地雷数量
  const getAdjacentMineCount = (x, y, mines, width, height) => {
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          if (mines.has(`${nx}-${ny}`)) {
            count++;
          }
        }
      }
    }
    return count;
  };

  // 初始化棋盘
  const initializeBoard = (width, height) => {
    const newBoard = Array(height).fill(null).map(() => 
      Array(width).fill(null).map(() => ({
        revealed: false,
        isMine: false,
        adjacentMines: 0,
        flagged: false
      }))
    );
    setBoard(newBoard);
  };

  // 开始新游戏
  const startNewGame = (width = 8, height = 8, mineCount = 10) => {
    setGameInfo({
      width,
      height,
      mineCount,
      status: GameStatus.NOT_STARTED,
      score: 0,
      clickCount: 0,
      startTime: 0,
      endTime: 0,
      initialized: true
    });

    initializeBoard(width, height);
    setRevealedCells(new Set());
    setMinePositions(new Set());
    setIsLoading(false);

    console.log('🎮 新游戏开始:', { width, height, mineCount });
  };

  // 揭示格子
  const revealCell = async (x, y) => {
    if (gameInfo.status === GameStatus.WON || gameInfo.status === GameStatus.LOST) {
      return false;
    }

    const cellKey = `${x}-${y}`;
    if (revealedCells.has(cellKey)) {
      return false;
    }

    setIsLoading(true);

    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 200));

    let mines = minePositions;
    let newGameInfo = { ...gameInfo };

    // 如果是第一次点击，生成地雷
    if (gameInfo.status === GameStatus.NOT_STARTED) {
      mines = generateMines(gameInfo.width, gameInfo.height, gameInfo.mineCount, x, y);
      setMinePositions(mines);
      newGameInfo.status = GameStatus.IN_PROGRESS;
      newGameInfo.startTime = Math.floor(Date.now() / 1000);
    }

    // 更新棋盘
    const newBoard = [...board];
    const isMine = mines.has(cellKey);
    const adjacentMines = isMine ? 0 : getAdjacentMineCount(x, y, mines, gameInfo.width, gameInfo.height);

    newBoard[y][x] = {
      ...newBoard[y][x],
      revealed: true,
      isMine,
      adjacentMines
    };

    // 更新已揭示的格子
    const newRevealedCells = new Set([...revealedCells, cellKey]);

    // 如果点到地雷，游戏结束
    if (isMine) {
      newGameInfo.status = GameStatus.LOST;
      newGameInfo.endTime = Math.floor(Date.now() / 1000);
      
      // 揭示所有地雷
      mines.forEach(mineKey => {
        const [mx, my] = mineKey.split('-').map(Number);
        newBoard[my][mx].revealed = true;
        newRevealedCells.add(mineKey);
      });
    } else {
      // 如果是空格子，自动揭示相邻的空格子
      if (adjacentMines === 0) {
        const toReveal = [[x, y]];
        const visited = new Set([cellKey]);

        while (toReveal.length > 0) {
          const [cx, cy] = toReveal.pop();
          
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nx = cx + dx;
              const ny = cy + dy;
              const nKey = `${nx}-${ny}`;
              
              if (nx >= 0 && nx < gameInfo.width && ny >= 0 && ny < gameInfo.height && 
                  !visited.has(nKey) && !mines.has(nKey)) {
                
                visited.add(nKey);
                newRevealedCells.add(nKey);
                
                const nAdjacentMines = getAdjacentMineCount(nx, ny, mines, gameInfo.width, gameInfo.height);
                newBoard[ny][nx] = {
                  ...newBoard[ny][nx],
                  revealed: true,
                  isMine: false,
                  adjacentMines: nAdjacentMines
                };

                if (nAdjacentMines === 0) {
                  toReveal.push([nx, ny]);
                }
              }
            }
          }
        }
      }

      // 检查是否获胜
      const totalSafeCells = gameInfo.width * gameInfo.height - gameInfo.mineCount;
      const revealedSafeCells = newRevealedCells.size - (newGameInfo.status === GameStatus.LOST ? mines.size : 0);
      
      if (revealedSafeCells >= totalSafeCells) {
        newGameInfo.status = GameStatus.WON;
        newGameInfo.endTime = Math.floor(Date.now() / 1000);
        newGameInfo.score = revealedSafeCells + 5; // 每个安全格子1分，完成游戏额外5分
      }
    }

    newGameInfo.clickCount++;
    
    setBoard(newBoard);
    setRevealedCells(newRevealedCells);
    setGameInfo(newGameInfo);
    setIsLoading(false);

    return true;
  };

  // 获取游戏持续时间
  const getGameDuration = () => {
    if (gameInfo.startTime === 0) return 0;
    const endTime = gameInfo.endTime || Math.floor(Date.now() / 1000);
    return endTime - gameInfo.startTime;
  };

  // 初始化
  useEffect(() => {
    startNewGame();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-pink-600 mb-2">🧪 游戏逻辑测试模式</h1>
          <p className="text-gray-600">测试扫雷游戏的核心逻辑功能</p>
        </div>

        {/* 游戏控制 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-center">
            <button
              onClick={() => startNewGame(8, 8, 10)}
              className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              🌸 简单 (8×8, 10雷)
            </button>
            <button
              onClick={() => startNewGame(12, 12, 21)}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              🌺 中等 (12×12, 21雷)
            </button>
            <button
              onClick={() => startNewGame(16, 16, 51)}
              className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
            >
              🌹 困难 (16×16, 51雷)
            </button>
          </div>
        </div>

        {/* 游戏状态 */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-pink-600">{gameInfo.mineCount}</div>
              <div className="text-sm text-gray-600">地雷总数</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{revealedCells.size}</div>
              <div className="text-sm text-gray-600">已揭示</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{getGameDuration()}s</div>
              <div className="text-sm text-gray-600">游戏时间</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{gameInfo.score}</div>
              <div className="text-sm text-gray-600">得分</div>
            </div>
          </div>
        </div>

        {/* 游戏棋盘 */}
        {gameInfo.initialized && (
          <GameBoard
            gameInfo={gameInfo}
            board={board}
            revealedCells={revealedCells}
            onCellClick={revealCell}
            isLoading={isLoading}
            isGameWon={gameInfo.status === GameStatus.WON}
            isGameLost={gameInfo.status === GameStatus.LOST}
            isGameInProgress={gameInfo.status === GameStatus.IN_PROGRESS || gameInfo.status === GameStatus.NOT_STARTED}
            getGameDuration={getGameDuration}
          />
        )}

        {/* 测试说明 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">🧪 测试功能说明</h3>
          <ul className="space-y-2 text-gray-600">
            <li>• <strong>左键点击</strong>：揭示格子</li>
            <li>• <strong>右键点击</strong>：标记/取消标记地雷</li>
            <li>• <strong>自动展开</strong>：点击空格子会自动展开相邻的空格子</li>
            <li>• <strong>游戏逻辑</strong>：完全本地化，无需区块链连接</li>
            <li>• <strong>胜利条件</strong>：揭示所有非地雷格子</li>
            <li>• <strong>失败条件</strong>：点击到地雷</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestMode;
