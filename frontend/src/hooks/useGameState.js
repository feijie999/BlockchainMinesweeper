import { useState, useEffect, useCallback, useRef } from 'react';
import { web3Manager, GameStatus } from '../utils/web3';

const useGameState = () => {
  // 游戏基本状态
  const [gameInfo, setGameInfo] = useState({
    width: 0,
    height: 0,
    mineCount: 0,
    status: GameStatus.NOT_STARTED,
    score: 0,
    clickCount: 0,
    startTime: 0,
    endTime: 0,
    initialized: false
  });

  // 棋盘状态
  const [board, setBoard] = useState([]);
  const [revealedCells, setRevealedCells] = useState(new Set());
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);

  // 加载和错误状态
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);

  // 玩家统计
  const [playerStats, setPlayerStats] = useState({
    totalGamesPlayed: 0,
    gamesWon: 0,
    currentHighScore: 0,
    winRate: 0
  });

  // 事件监听器引用
  const eventListenersRef = useRef(false);

  // 初始化棋盘
  const initializeBoard = useCallback((width, height) => {
    const newBoard = Array(height).fill(null).map(() => 
      Array(width).fill(null).map(() => ({
        revealed: false,
        isMine: false,
        adjacentMines: 0,
        flagged: false
      }))
    );
    setBoard(newBoard);
    setRevealedCells(new Set());
  }, []);

  // 获取游戏信息
  const fetchGameInfo = useCallback(async () => {
    if (!web3Manager.isConnected()) return;

    try {
      const info = await web3Manager.getGameInfo();
      setGameInfo(info);
      
      if (info.initialized && info.width > 0 && info.height > 0) {
        initializeBoard(info.width, info.height);
        setGameStarted(info.status !== GameStatus.NOT_STARTED);
        setGameEnded(info.status === GameStatus.WON || info.status === GameStatus.LOST);
        
        // 如果游戏已开始，获取已揭示的格子
        if (info.status !== GameStatus.NOT_STARTED) {
          await fetchRevealedCells(info.width, info.height);
        }
      }
    } catch (error) {
      console.error('获取游戏信息失败:', error);
      setError('获取游戏信息失败: ' + error.message);
    }
  }, [initializeBoard]);

  // 获取已揭示的格子
  const fetchRevealedCells = useCallback(async (width, height) => {
    if (!web3Manager.isConnected()) return;

    try {
      const revealed = new Set();
      const newBoard = Array(height).fill(null).map(() => 
        Array(width).fill(null).map(() => ({
          revealed: false,
          isMine: false,
          adjacentMines: 0,
          flagged: false
        }))
      );

      // 检查每个格子的状态
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const isRevealed = await web3Manager.isCellRevealed(x, y);
          if (isRevealed) {
            revealed.add(`${x}-${y}`);
            newBoard[y][x].revealed = true;
            
            // 获取相邻地雷数量
            const adjacentMines = await web3Manager.getAdjacentMineCount(x, y);
            newBoard[y][x].adjacentMines = adjacentMines;
          }
        }
      }

      setRevealedCells(revealed);
      setBoard(newBoard);
    } catch (error) {
      console.error('获取格子状态失败:', error);
    }
  }, []);

  // 获取玩家统计
  const fetchPlayerStats = useCallback(async () => {
    if (!web3Manager.isConnected()) return;

    try {
      const stats = await web3Manager.getPlayerStats();
      setPlayerStats(stats);
    } catch (error) {
      console.error('获取玩家统计失败:', error);
    }
  }, []);

  // 开始新游戏
  const startNewGame = useCallback(async (width, height, mineCount) => {
    if (!web3Manager.isConnected()) {
      setError('请先连接钱包');
      return false;
    }

    setIsInitializing(true);
    setError('');

    try {
      await web3Manager.startGame(width, height, mineCount);
      
      // 等待交易确认后刷新游戏状态
      setTimeout(() => {
        fetchGameInfo();
        fetchPlayerStats();
      }, 2000);

      return true;
    } catch (error) {
      console.error('开始游戏失败:', error);
      setError('开始游戏失败: ' + error.message);
      return false;
    } finally {
      setIsInitializing(false);
    }
  }, [fetchGameInfo, fetchPlayerStats]);

  // 揭示格子
  const revealCell = useCallback(async (x, y) => {
    if (!web3Manager.isConnected() || gameEnded) {
      return false;
    }

    // 检查格子是否已经揭示
    if (revealedCells.has(`${x}-${y}`)) {
      return false;
    }

    setIsLoading(true);
    setError('');

    try {
      await web3Manager.revealCell(x, y);
      
      // 等待交易确认后刷新状态
      setTimeout(() => {
        fetchGameInfo();
        fetchRevealedCells(gameInfo.width, gameInfo.height);
      }, 2000);

      return true;
    } catch (error) {
      console.error('揭示格子失败:', error);
      setError('揭示格子失败: ' + error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [gameEnded, revealedCells, fetchGameInfo, fetchRevealedCells, gameInfo.width, gameInfo.height]);

  // 设置事件监听器
  const setupEventListeners = useCallback(() => {
    if (eventListenersRef.current || !web3Manager.isConnected()) return;

    const callbacks = {
      onGameStarted: (event) => {
        console.log('游戏开始事件:', event);
        fetchGameInfo();
        setGameStarted(true);
        setGameEnded(false);
      },

      onCellRevealed: (event) => {
        console.log('格子揭示事件:', event);
        const { x, y, isMine, adjacentMines } = event;
        
        // 更新本地状态
        setRevealedCells(prev => new Set([...prev, `${x}-${y}`]));
        setBoard(prev => {
          const newBoard = [...prev];
          if (newBoard[y] && newBoard[y][x]) {
            newBoard[y][x] = {
              ...newBoard[y][x],
              revealed: true,
              isMine,
              adjacentMines
            };
          }
          return newBoard;
        });
      },

      onGameWon: (event) => {
        console.log('游戏胜利事件:', event);
        setGameEnded(true);
        fetchGameInfo();
        fetchPlayerStats();
      },

      onGameLost: (event) => {
        console.log('游戏失败事件:', event);
        setGameEnded(true);
        fetchGameInfo();
        fetchPlayerStats();
      },

      onHighScoreUpdated: (event) => {
        console.log('最高分更新事件:', event);
        fetchPlayerStats();
      }
    };

    web3Manager.setupEventListeners(callbacks);
    eventListenersRef.current = true;
  }, [fetchGameInfo, fetchPlayerStats]);

  // 清理事件监听器
  const cleanupEventListeners = useCallback(() => {
    if (eventListenersRef.current) {
      web3Manager.removeEventListeners();
      eventListenersRef.current = false;
    }
  }, []);

  // 重置游戏状态
  const resetGameState = useCallback(() => {
    setGameInfo({
      width: 0,
      height: 0,
      mineCount: 0,
      status: GameStatus.NOT_STARTED,
      score: 0,
      clickCount: 0,
      startTime: 0,
      endTime: 0,
      initialized: false
    });
    setBoard([]);
    setRevealedCells(new Set());
    setGameStarted(false);
    setGameEnded(false);
    setError('');
  }, []);

  // 初始化和清理
  useEffect(() => {
    if (web3Manager.isConnected()) {
      fetchGameInfo();
      fetchPlayerStats();
      setupEventListeners();
    } else {
      resetGameState();
      cleanupEventListeners();
    }

    return () => {
      cleanupEventListeners();
    };
  }, [fetchGameInfo, fetchPlayerStats, setupEventListeners, cleanupEventListeners, resetGameState]);

  // 格式化游戏时间
  const getGameDuration = useCallback(() => {
    if (!gameInfo.startTime) return '00:00';
    
    const endTime = gameInfo.endTime || Date.now() / 1000;
    const duration = Math.floor(endTime - gameInfo.startTime);
    
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [gameInfo.startTime, gameInfo.endTime]);

  return {
    // 游戏状态
    gameInfo,
    board,
    revealedCells,
    gameStarted,
    gameEnded,
    playerStats,
    
    // 加载状态
    isLoading,
    isInitializing,
    error,
    
    // 操作方法
    startNewGame,
    revealCell,
    fetchGameInfo,
    fetchPlayerStats,
    resetGameState,
    
    // 工具方法
    getGameDuration,
    
    // 状态检查
    isGameWon: gameInfo.status === GameStatus.WON,
    isGameLost: gameInfo.status === GameStatus.LOST,
    isGameInProgress: gameInfo.status === GameStatus.IN_PROGRESS
  };
};

export default useGameState;
