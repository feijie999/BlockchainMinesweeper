import { useState, useEffect } from 'react';
import { 
  Bomb, 
  Flag, 
  Clock, 
  Trophy, 
  Target, 
  Zap,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';

const GameBoard = ({
  gameInfo,
  board,
  revealedCells,
  flaggedCells: propFlaggedCells,
  onCellClick,
  onCellRightClick,
  isLoading,
  isGameWon,
  isGameLost,
  isGameInProgress,
  getGameDuration,
  gameMode,
  showFlags = false
}) => {
  const [localFlaggedCells, setLocalFlaggedCells] = useState(new Set());
  const [animatingCells, setAnimatingCells] = useState(new Set());

  // 使用传入的标记状态或本地状态
  const flaggedCells = propFlaggedCells || localFlaggedCells;

  // 重置标记状态当游戏重新开始时
  useEffect(() => {
    if (!isGameInProgress && !isGameWon && !isGameLost) {
      setLocalFlaggedCells(new Set());
      setAnimatingCells(new Set());
    }
  }, [isGameInProgress, isGameWon, isGameLost]);

  // 处理格子点击
  const handleCellClick = async (x, y, event) => {
    event.preventDefault();
    
    // 游戏结束或格子已揭示则不处理
    if (!isGameInProgress || revealedCells.has(`${x}-${y}`) || flaggedCells.has(`${x}-${y}`)) {
      return;
    }

    // 添加点击动画
    const cellKey = `${x}-${y}`;
    setAnimatingCells(prev => new Set([...prev, cellKey]));
    
    // 调用父组件的点击处理
    const success = await onCellClick(x, y);
    
    // 移除动画
    setTimeout(() => {
      setAnimatingCells(prev => {
        const newSet = new Set(prev);
        newSet.delete(cellKey);
        return newSet;
      });
    }, 300);
  };

  // 处理右键点击（标记/取消标记）
  const handleRightClick = async (x, y, event) => {
    event.preventDefault();

    if (!isGameInProgress || revealedCells.has(`${x}-${y}`) || !showFlags) {
      return;
    }

    // 如果有外部处理函数，使用它
    if (onCellRightClick) {
      await onCellRightClick(x, y);
    } else {
      // 否则使用本地状态
      const cellKey = `${x}-${y}`;
      setLocalFlaggedCells(prev => {
        const newSet = new Set(prev);
        if (newSet.has(cellKey)) {
          newSet.delete(cellKey);
        } else {
          newSet.add(cellKey);
        }
        return newSet;
      });
    }
  };

  // 获取格子显示内容
  const getCellContent = (x, y) => {
    const cellKey = `${x}-${y}`;
    const cell = board[y]?.[x];
    
    if (!cell) return '';

    // 如果格子被标记
    if (flaggedCells.has(cellKey)) {
      return <Flag className="w-3 h-3 text-red-500" />;
    }

    // 如果格子未揭示
    if (!cell.revealed) {
      return '';
    }

    // 如果是地雷
    if (cell.isMine) {
      return <span className="text-lg">💣</span>;
    }

    // 如果有相邻地雷
    if (cell.adjacentMines > 0) {
      return (
        <span className={`font-bold text-sm ${getNumberColor(cell.adjacentMines)}`}>
          {cell.adjacentMines}
        </span>
      );
    }

    // 空格子
    return '';
  };

  // 获取数字颜色
  const getNumberColor = (number) => {
    const colors = {
      1: 'text-blue-600',
      2: 'text-green-600',
      3: 'text-red-600',
      4: 'text-purple-600',
      5: 'text-yellow-600',
      6: 'text-pink-600',
      7: 'text-black',
      8: 'text-gray-600'
    };
    return colors[number] || 'text-gray-600';
  };

  // 获取格子样式
  const getCellStyle = (x, y) => {
    const cellKey = `${x}-${y}`;
    const cell = board[y]?.[x];
    const isRevealed = cell?.revealed;
    const isFlagged = flaggedCells.has(cellKey);
    const isAnimating = animatingCells.has(cellKey);

    let baseStyle = 'cell-button';
    
    if (isAnimating) {
      baseStyle += ' animate-pulse';
    }

    if (isRevealed) {
      baseStyle += ' cell-revealed';
      
      if (cell?.isMine) {
        baseStyle += ' cell-mine';
      } else {
        baseStyle += ' cell-safe';
      }
    } else if (isFlagged) {
      baseStyle += ' bg-yellow-100 border-yellow-400';
    }

    return baseStyle;
  };

  // 计算剩余地雷数
  const getRemainingMines = () => {
    return Math.max(0, gameInfo.mineCount - flaggedCells.size);
  };

  // 如果没有游戏数据
  if (!gameInfo.initialized || !board.length) {
    return (
      <div className="card-cute text-center py-12">
        <Target className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">请开始新游戏</p>
      </div>
    );
  }

  return (
    <div className="card-cute">
      {/* 游戏状态栏 */}
      <div className="flex items-center justify-between mb-4 p-3 bg-gradient-to-r from-pink-50 to-lavender-50 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Bomb className="w-4 h-4 text-red-500" />
            <span className="text-sm font-semibold text-gray-700">
              {getRemainingMines()}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-semibold text-gray-700">
              {getGameDuration()}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-semibold text-gray-700">
              {gameInfo.score}
            </span>
          </div>
        </div>

        {/* 游戏状态指示器 */}
        <div className="flex items-center gap-2">
          {isLoading && (
            <Loader className="w-4 h-4 text-pink-500 animate-spin" />
          )}
          
          {isGameWon && (
            <div className="flex items-center gap-1 text-mint-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-semibold">胜利!</span>
            </div>
          )}
          
          {isGameLost && (
            <div className="flex items-center gap-1 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-semibold">失败</span>
            </div>
          )}
          
          {isGameInProgress && (
            <div className="flex items-center gap-1 text-blue-600">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-semibold">进行中</span>
            </div>
          )}
        </div>
      </div>

      {/* 游戏棋盘 */}
      <div className="relative">
        <div 
          className="grid gap-1 mx-auto"
          style={{
            gridTemplateColumns: `repeat(${gameInfo.width}, minmax(0, 1fr))`,
            maxWidth: `${Math.min(gameInfo.width * 40, 600)}px`
          }}
        >
          {board.map((row, y) =>
            row.map((cell, x) => (
              <button
                key={`${x}-${y}`}
                className={getCellStyle(x, y)}
                onClick={(e) => handleCellClick(x, y, e)}
                onContextMenu={(e) => handleRightClick(x, y, e)}
                disabled={isLoading || !isGameInProgress}
                style={{
                  aspectRatio: '1',
                  minHeight: '32px',
                  fontSize: gameInfo.width > 15 ? '10px' : '12px'
                }}
              >
                {getCellContent(x, y)}
              </button>
            ))
          )}
        </div>

        {/* 加载遮罩 */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <div className="flex items-center gap-2 text-pink-600">
              <Loader className="w-5 h-5 animate-spin" />
              <span className="text-sm font-semibold">处理中...</span>
            </div>
          </div>
        )}
      </div>

      {/* 游戏结果显示 */}
      {(isGameWon || isGameLost) && (
        <div className={`mt-4 p-4 rounded-2xl text-center ${
          isGameWon 
            ? 'bg-gradient-to-r from-mint-50 to-mint-100 border border-mint-200' 
            : 'bg-gradient-to-r from-red-50 to-red-100 border border-red-200'
        }`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            {isGameWon ? (
              <>
                <CheckCircle className="w-6 h-6 text-mint-600" />
                <span className="text-lg font-bold text-mint-800">恭喜获胜！</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-6 h-6 text-red-600" />
                <span className="text-lg font-bold text-red-800">游戏结束</span>
              </>
            )}
          </div>
          
          <div className="text-sm space-y-1">
            <p className={isGameWon ? 'text-mint-700' : 'text-red-700'}>
              得分: <span className="font-semibold">{gameInfo.score}</span>
            </p>
            <p className={isGameWon ? 'text-mint-700' : 'text-red-700'}>
              用时: <span className="font-semibold">{getGameDuration()}</span>
            </p>
            <p className={isGameWon ? 'text-mint-700' : 'text-red-700'}>
              点击次数: <span className="font-semibold">{gameInfo.clickCount}</span>
            </p>
          </div>
        </div>
      )}

      {/* 操作提示 */}
      <div className="mt-4 p-3 bg-gray-50 rounded-2xl">
        <div className="text-xs text-gray-600 space-y-1">
          <p>• 左键点击揭示格子</p>
          {showFlags && <p>• 右键点击标记/取消标记地雷</p>}
          <p>• 数字表示周围地雷数量</p>
          {gameMode && (
            <p>• 当前模式: <span className="font-semibold">
              {gameMode === 'local' ? '本地模式' : '区块链模式'}
            </span></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
