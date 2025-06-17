import { useState, useEffect, useCallback, useRef } from 'react';
import { gameManager, GameMode } from '../utils/GameManager';
import { GameStatus } from '../utils/constants';

const useGameState = () => {
  // 游戏模式状态
  const [currentMode, setCurrentMode] = useState(gameManager.getCurrentMode());

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
  const [flaggedCells, setFlaggedCells] = useState(new Set());
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
    setFlaggedCells(new Set());
  }, []);

  // 检查是否已连接
  const isConnected = useCallback(() => {
    return gameManager.isConnected();
  }, []);

  // 获取游戏信息
  const fetchGameInfo = useCallback(async () => {
    if (!isConnected()) return;

    try {
      const info = await gameManager.getGameInfo();
      setGameInfo(info);

      if (info.initialized && info.width > 0 && info.height > 0) {
        initializeBoard(info.width, info.height);
        setGameStarted(info.status !== GameStatus.NOT_STARTED);
        setGameEnded(info.status === GameStatus.WON || info.status === GameStatus.LOST);

        // 如果游戏已开始，获取已揭示的格子
        if (info.status !== GameStatus.NOT_STARTED) {
          // 使用 setTimeout 避免同步调用导致的循环
          setTimeout(() => {
            fetchRevealedCells(info.width, info.height);
          }, 0);
        }
      }
    } catch (error) {
      console.error('获取游戏信息失败:', error);
      setError('获取游戏信息失败: ' + error.message);
    }
  }, [initializeBoard, isConnected]);

  // 获取已揭示的格子
  const fetchRevealedCells = useCallback(async (width, height) => {
    if (!isConnected() || !width || !height) return;

    try {
      const revealed = new Set();
      const flagged = new Set();
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
          const isRevealed = await gameManager.isCellRevealed(x, y);
          const isFlagged = await gameManager.isCellFlagged(x, y);

          if (isRevealed) {
            revealed.add(`${x}-${y}`);
            newBoard[y][x].revealed = true;

            // 获取相邻地雷数量
            const adjacentMines = await gameManager.getAdjacentMineCount(x, y);
            newBoard[y][x].adjacentMines = adjacentMines;
          }

          if (isFlagged) {
            flagged.add(`${x}-${y}`);
            newBoard[y][x].flagged = true;
          }
        }
      }

      setRevealedCells(revealed);
      setFlaggedCells(flagged);
      setBoard(newBoard);
    } catch (error) {
      console.error('获取格子状态失败:', error);
    }
  }, [isConnected]);

  // 获取玩家统计
  const fetchPlayerStats = useCallback(async () => {
    if (!isConnected()) return;

    try {
      const stats = await gameManager.getPlayerStats();
      setPlayerStats(stats);
    } catch (error) {
      console.error('获取玩家统计失败:', error);
    }
  }, [isConnected]);

  // 开始新游戏
  const startNewGame = useCallback(async (width, height, mineCount) => {
    if (!isConnected()) {
      if (gameManager.isBlockchainMode()) {
        setError('请先连接钱包');
      } else {
        setError('游戏初始化失败');
      }
      return false;
    }

    setIsInitializing(true);
    setError('');

    try {
      await gameManager.startGame(width, height, mineCount);

      // 本地模式立即刷新，区块链模式等待交易确认
      const delay = gameManager.isLocalMode() ? 100 : 2000;
      setTimeout(() => {
        fetchGameInfo();
        fetchPlayerStats();
      }, delay);

      return true;
    } catch (error) {
      console.error('开始游戏失败:', error);
      setError('开始游戏失败: ' + error.message);
      return false;
    } finally {
      setIsInitializing(false);
    }
  }, [fetchGameInfo, fetchPlayerStats, isConnected]);

  // 揭示格子
  const revealCell = useCallback(async (x, y) => {
    if (!isConnected() || gameEnded) {
      return false;
    }

    // 检查格子是否已经揭示或被标记
    if (revealedCells.has(`${x}-${y}`) || flaggedCells.has(`${x}-${y}`)) {
      return false;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await gameManager.revealCell(x, y);

      // 本地模式立即更新状态，区块链模式等待交易确认
      if (gameManager.isLocalMode()) {
        // 立即更新本地状态
        setTimeout(() => {
          fetchGameInfo();
        }, 100);
      } else {
        // 等待交易确认后刷新状态
        setTimeout(() => {
          fetchGameInfo();
        }, 2000);
      }

      return true;
    } catch (error) {
      console.error('揭示格子失败:', error);
      setError('揭示格子失败: ' + error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [gameEnded, revealedCells, flaggedCells, fetchGameInfo, isConnected]);

  // 标记/取消标记格子（仅本地模式）
  const toggleFlag = useCallback(async (x, y) => {
    if (!gameManager.isLocalMode() || gameEnded) {
      return false;
    }

    // 检查格子是否已经揭示
    if (revealedCells.has(`${x}-${y}`)) {
      return false;
    }

    try {
      const result = await gameManager.toggleFlag(x, y);

      if (result.success) {
        const cellKey = `${x}-${y}`;
        setFlaggedCells(prev => {
          const newSet = new Set(prev);
          if (result.flagged) {
            newSet.add(cellKey);
          } else {
            newSet.delete(cellKey);
          }
          return newSet;
        });

        // 更新棋盘状态
        setBoard(prev => {
          const newBoard = [...prev];
          if (newBoard[y] && newBoard[y][x]) {
            newBoard[y][x] = {
              ...newBoard[y][x],
              flagged: result.flagged
            };
          }
          return newBoard;
        });
      }

      return result.success;
    } catch (error) {
      console.error('标记格子失败:', error);
      return false;
    }
  }, [gameEnded, revealedCells]);

  // 设置事件监听器
  const setupEventListeners = useCallback(() => {
    if (eventListenersRef.current || !isConnected()) return;

    // 只有区块链模式需要事件监听器
    if (gameManager.isBlockchainMode()) {
      const callbacks = {
        onGameStarted: (event) => {
          console.log('游戏开始事件:', event);
          setTimeout(() => fetchGameInfo(), 0);
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
          setTimeout(() => {
            fetchGameInfo();
            fetchPlayerStats();
          }, 0);
        },

        onGameLost: (event) => {
          console.log('游戏失败事件:', event);
          setGameEnded(true);
          setTimeout(() => {
            fetchGameInfo();
            fetchPlayerStats();
          }, 0);
        },

        onHighScoreUpdated: (event) => {
          console.log('最高分更新事件:', event);
          setTimeout(() => fetchPlayerStats(), 0);
        }
      };

      gameManager.setupEventListeners(callbacks);
    }

    eventListenersRef.current = true;
  }, [fetchGameInfo, fetchPlayerStats, isConnected]);

  // 清理事件监听器
  const cleanupEventListeners = useCallback(() => {
    if (eventListenersRef.current) {
      gameManager.removeEventListeners();
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
    setFlaggedCells(new Set());
    setGameStarted(false);
    setGameEnded(false);
    setError('');
  }, []);

  // 初始化和清理 - 使用 useRef 来避免依赖项导致的无限循环
  const initializeRef = useRef(false);
  const isConnectedRef = useRef(false);

  useEffect(() => {
    const initialize = async () => {
      await gameManager.initialize();
      const connected = isConnected();

      if (connected && !initializeRef.current) {
        await fetchGameInfo();
        await fetchPlayerStats();
        setupEventListeners();
        initializeRef.current = true;
        isConnectedRef.current = true;
      } else if (!connected && isConnectedRef.current) {
        resetGameState();
        cleanupEventListeners();
        initializeRef.current = false;
        isConnectedRef.current = false;
      }
    };

    initialize();

    return () => {
      cleanupEventListeners();
      initializeRef.current = false;
      isConnectedRef.current = false;
    };
  }, []); // 移除所有依赖项，使用 ref 来控制初始化

  // 监听模式切换
  useEffect(() => {
    const handleModeChange = (newMode) => {
      setCurrentMode(newMode);

      // 重置状态并重新初始化
      resetGameState();
      cleanupEventListeners();
      initializeRef.current = false;
      isConnectedRef.current = false;

      // 延迟重新初始化
      setTimeout(async () => {
        await gameManager.initialize();
        const connected = isConnected();

        if (connected) {
          await fetchGameInfo();
          await fetchPlayerStats();
          setupEventListeners();
          initializeRef.current = true;
          isConnectedRef.current = true;
        }
      }, 100);
    };

    gameManager.onModeChange = handleModeChange;

    return () => {
      gameManager.onModeChange = null;
    };
  }, []);

  // 监听连接状态变化 - 仅区块链模式需要
  useEffect(() => {
    if (gameManager.isLocalMode()) return;

    const handleConnectionChange = (connected) => {
      if (connected !== isConnectedRef.current) {
        if (connected) {
          setTimeout(() => {
            fetchGameInfo();
            fetchPlayerStats();
            setupEventListeners();
            initializeRef.current = true;
          }, 100);
        } else {
          resetGameState();
          cleanupEventListeners();
          initializeRef.current = false;
        }
        isConnectedRef.current = connected;
      }
    };

    // 监听钱包连接事件而不是轮询
    if (window.ethereum && gameManager.isBlockchainMode()) {
      window.ethereum.on('accountsChanged', () => {
        handleConnectionChange(gameManager.isConnected());
      });
      window.ethereum.on('chainChanged', () => {
        handleConnectionChange(gameManager.isConnected());
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, [currentMode]);

  // 格式化游戏时间
  const getGameDuration = useCallback(() => {
    if (!gameInfo.startTime) return '00:00';

    // 本地模式使用毫秒，区块链模式使用秒
    const startTime = gameManager.isLocalMode() ? gameInfo.startTime : gameInfo.startTime * 1000;
    const endTime = gameInfo.endTime ?
      (gameManager.isLocalMode() ? gameInfo.endTime : gameInfo.endTime * 1000) :
      Date.now();

    const duration = Math.floor((endTime - startTime) / 1000);

    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [gameInfo.startTime, gameInfo.endTime]);

  return {
    // 游戏模式
    currentMode,
    isLocalMode: gameManager.isLocalMode(),
    isBlockchainMode: gameManager.isBlockchainMode(),

    // 游戏状态
    gameInfo,
    board,
    revealedCells,
    flaggedCells,
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
    toggleFlag,
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
