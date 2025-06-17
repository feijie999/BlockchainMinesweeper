import React, { useState, useEffect } from 'react';
import { Monitor, Wifi, WifiOff, Settings, Info } from 'lucide-react';
import { gameManager, GameMode } from '../utils/GameManager';

const GameModeSelector = ({ onModeChange }) => {
  const [currentMode, setCurrentMode] = useState(gameManager.getCurrentMode());
  const [isWeb3Available, setIsWeb3Available] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    checkWeb3Availability();
    
    // 设置模式切换回调
    gameManager.onModeChange = (newMode) => {
      setCurrentMode(newMode);
      if (onModeChange) {
        onModeChange(newMode);
      }
    };

    return () => {
      gameManager.onModeChange = null;
    };
  }, [onModeChange]);

  const checkWeb3Availability = async () => {
    const available = await gameManager.isModeAvailable(GameMode.BLOCKCHAIN);
    setIsWeb3Available(available);
  };

  const handleModeChange = async (newMode) => {
    if (newMode === currentMode || isChanging) return;

    setIsChanging(true);
    try {
      // 检查模式是否可用
      const available = await gameManager.isModeAvailable(newMode);
      if (!available) {
        alert('该模式当前不可用，请检查 MetaMask 是否已安装');
        return;
      }

      gameManager.setGameMode(newMode);
      
      // 如果切换到区块链模式，提示用户连接钱包
      if (newMode === GameMode.BLOCKCHAIN) {
        setTimeout(() => {
          alert('已切换到区块链模式，请点击"连接钱包"按钮连接 MetaMask');
        }, 500);
      }
    } catch (error) {
      console.error('切换模式失败:', error);
      alert('切换模式失败: ' + error.message);
    } finally {
      setIsChanging(false);
    }
  };

  const getModeIcon = (mode) => {
    if (mode === GameMode.LOCAL) {
      return <Monitor className="w-5 h-5" />;
    } else {
      return isWeb3Available ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />;
    }
  };

  const getModeStatus = (mode) => {
    if (mode === GameMode.LOCAL) {
      return '可用';
    } else {
      return isWeb3Available ? '可用' : '不可用';
    }
  };

  const getModeStatusColor = (mode) => {
    if (mode === GameMode.LOCAL) {
      return 'text-green-600';
    } else {
      return isWeb3Available ? 'text-green-600' : 'text-red-500';
    }
  };

  return (
    <div className="card-cute" data-testid="game-mode-selector">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Settings className="w-5 h-5 text-pink-500" />
          游戏模式
        </h3>
        
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          title="模式说明"
        >
          <Info className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {showInfo && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-2xl text-sm text-blue-800">
          <div className="space-y-2">
            <div>
              <strong>本地模式：</strong>离线游戏，数据保存在浏览器本地，支持标记功能，无需网络连接
            </div>
            <div>
              <strong>区块链模式：</strong>连接 MetaMask 钱包，游戏数据存储在区块链上，支持代币奖励
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {/* 本地模式 */}
        <div
          className={`mode-option ${currentMode === GameMode.LOCAL ? 'mode-option-active' : ''}`}
          onClick={() => handleModeChange(GameMode.LOCAL)}
          data-testid="local-mode-option"
        >
          <div className="flex items-center gap-3">
            {getModeIcon(GameMode.LOCAL)}
            <div className="flex-1">
              <div className="font-semibold text-gray-800">本地模式</div>
              <div className="text-sm text-gray-600">离线游戏，快速响应</div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={`text-xs font-medium ${getModeStatusColor(GameMode.LOCAL)}`}>
                {getModeStatus(GameMode.LOCAL)}
              </span>
              {currentMode === GameMode.LOCAL && (
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
              )}
            </div>
          </div>
        </div>

        {/* 区块链模式 */}
        <div
          className={`mode-option ${currentMode === GameMode.BLOCKCHAIN ? 'mode-option-active' : ''} ${
            !isWeb3Available ? 'mode-option-disabled' : ''
          }`}
          onClick={() => isWeb3Available && handleModeChange(GameMode.BLOCKCHAIN)}
          data-testid="blockchain-mode-option"
        >
          <div className="flex items-center gap-3">
            {getModeIcon(GameMode.BLOCKCHAIN)}
            <div className="flex-1">
              <div className="font-semibold text-gray-800">区块链模式</div>
              <div className="text-sm text-gray-600">
                {isWeb3Available ? '连接钱包，数据上链' : '需要安装 MetaMask'}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={`text-xs font-medium ${getModeStatusColor(GameMode.BLOCKCHAIN)}`}>
                {getModeStatus(GameMode.BLOCKCHAIN)}
              </span>
              {currentMode === GameMode.BLOCKCHAIN && (
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isChanging && (
        <div className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-600">
          <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          切换中...
        </div>
      )}

      {!isWeb3Available && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-2xl">
          <div className="text-sm text-yellow-800">
            <strong>提示：</strong>要使用区块链模式，请先安装 
            <a 
              href="https://metamask.io/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-yellow-900 underline hover:text-yellow-700"
            >
              MetaMask 钱包
            </a>
          </div>
        </div>
      )}

      <style jsx>{`
        .mode-option {
          @apply p-4 border-2 border-gray-200 rounded-2xl cursor-pointer transition-all duration-200 hover:border-pink-300 hover:bg-pink-50;
        }
        
        .mode-option-active {
          @apply border-pink-400 bg-pink-50;
        }
        
        .mode-option-disabled {
          @apply opacity-50 cursor-not-allowed;
        }
        
        .mode-option-disabled:hover {
          @apply border-gray-200 bg-white;
        }
      `}</style>
    </div>
  );
};

export default GameModeSelector;
