import { useState, useEffect } from 'react';
import { Sparkles, Heart, Github, ExternalLink } from 'lucide-react';
import WalletConnect from './components/WalletConnect';
import GameModeSelector from './components/GameModeSelector';
import GameSettings from './components/GameSettings';
import GameBoard from './components/GameBoard';
import PlayerStats from './components/PlayerStats';
import TestMode from './components/TestMode';
import useGameState from './hooks/useGameState';
import './App.css';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [currentAccount, setCurrentAccount] = useState('');
  const [currentView, setCurrentView] = useState('game'); // 'game' | 'stats' | 'test'

  // 使用游戏状态管理 Hook
  const {
    currentMode,
    isLocalMode,
    isBlockchainMode,
    gameInfo,
    board,
    revealedCells,
    flaggedCells,
    gameStarted,
    gameEnded,
    playerStats,
    isLoading,
    isInitializing,
    error,
    startNewGame,
    revealCell,
    toggleFlag,
    fetchGameInfo,
    fetchPlayerStats,
    getGameDuration,
    isGameWon,
    isGameLost,
    isGameInProgress
  } = useGameState();

  // 处理钱包连接状态变化
  const handleConnectionChange = (connected, account) => {
    setIsConnected(connected);
    setCurrentAccount(account);

    if (connected) {
      // 连接成功后刷新游戏状态
      fetchGameInfo();
      fetchPlayerStats();
    }
  };

  // 处理开始新游戏
  const handleStartGame = async (settings) => {
    const success = await startNewGame(settings.width, settings.height, settings.mineCount);
    if (success) {
      // 游戏开始成功，可以添加一些反馈
      console.log('游戏开始成功');
    }
  };

  // 处理格子点击
  const handleCellClick = async (x, y) => {
    return await revealCell(x, y);
  };

  // 处理格子右键点击（标记）
  const handleCellRightClick = async (x, y) => {
    if (isLocalMode) {
      return await toggleFlag(x, y);
    }
    return false;
  };

  // 处理模式切换
  const handleModeChange = (newMode) => {
    console.log('模式切换到:', newMode);
    // 模式切换后重置连接状态
    setIsConnected(false);
    setCurrentAccount('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-mint-50 to-lavender-50">
      {/* 头部导航 */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-lavender-500 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">区块链扫雷</h1>
                <p className="text-sm text-gray-600">可爱温馨的链上游戏</p>
              </div>
            </div>

            {/* 导航按钮 */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentView('game')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  currentView === 'game'
                    ? 'bg-pink-100 text-pink-700'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                游戏
              </button>
              <button
                onClick={() => setCurrentView('stats')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  currentView === 'stats'
                    ? 'bg-mint-100 text-mint-700'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                统计
              </button>
              <button
                onClick={() => setCurrentView('test')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  currentView === 'test'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                🧪 测试
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* 全局错误提示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <div className="flex items-center gap-2 text-red-700">
              <span className="font-semibold">错误:</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧边栏 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 游戏模式选择 */}
            <GameModeSelector onModeChange={handleModeChange} />

            {/* 钱包连接 - 仅区块链模式显示 */}
            {isBlockchainMode && (
              <WalletConnect onConnectionChange={handleConnectionChange} />
            )}

            {/* 游戏设置 */}
            {currentView === 'game' && (
              <GameSettings
                onStartGame={handleStartGame}
                isConnected={isLocalMode || isConnected}
                isGameActive={gameStarted && !gameEnded}
                gameMode={currentMode}
              />
            )}
          </div>

          {/* 主要内容区域 */}
          <div className={currentView === 'test' ? 'lg:col-span-3' : 'lg:col-span-2'}>
            {currentView === 'game' ? (
              <GameBoard
                gameInfo={gameInfo}
                board={board}
                revealedCells={revealedCells}
                flaggedCells={flaggedCells}
                onCellClick={handleCellClick}
                onCellRightClick={handleCellRightClick}
                isLoading={isLoading}
                isGameWon={isGameWon}
                isGameLost={isGameLost}
                isGameInProgress={isGameInProgress}
                getGameDuration={getGameDuration}
                gameMode={currentMode}
                showFlags={isLocalMode}
              />
            ) : currentView === 'stats' ? (
              <PlayerStats
                playerStats={playerStats}
                gameInfo={gameInfo}
                isConnected={isConnected}
              />
            ) : (
              <TestMode />
            )}
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-white/50 backdrop-blur-sm border-t border-white/20 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <Heart className="w-4 h-4 text-pink-500" />
              <span className="text-sm">Made with love by 青蛙会点头</span>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
              <a
                href="https://sepolia.etherscan.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Etherscan
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
