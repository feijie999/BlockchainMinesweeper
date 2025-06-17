import { useState, useEffect } from 'react';
import { Settings, Zap, Target, Sparkles, Play, RotateCcw } from 'lucide-react';

const GameSettings = ({ onStartGame, isConnected, isGameActive }) => {
  const [width, setWidth] = useState(10);
  const [height, setHeight] = useState(10);
  const [mineRate, setMineRate] = useState(15); // 百分比
  const [selectedPreset, setSelectedPreset] = useState('medium');
  const [isCustom, setIsCustom] = useState(false);

  // 预设难度配置
  const presets = {
    easy: {
      name: '简单',
      icon: '🌸',
      width: 8,
      height: 8,
      mineRate: 12,
      description: '8×8 棋盘，12% 地雷密度'
    },
    medium: {
      name: '中等',
      icon: '🌺',
      width: 12,
      height: 12,
      mineRate: 15,
      description: '12×12 棋盘，15% 地雷密度'
    },
    hard: {
      name: '困难',
      icon: '🌹',
      width: 16,
      height: 16,
      mineRate: 20,
      description: '16×16 棋盘，20% 地雷密度'
    },
    expert: {
      name: '专家',
      icon: '🏵️',
      width: 20,
      height: 20,
      mineRate: 25,
      description: '20×20 棋盘，25% 地雷密度'
    }
  };

  // 当预设改变时更新设置
  useEffect(() => {
    if (!isCustom && presets[selectedPreset]) {
      const preset = presets[selectedPreset];
      setWidth(preset.width);
      setHeight(preset.height);
      setMineRate(preset.mineRate);
    }
  }, [selectedPreset, isCustom]);

  // 计算地雷数量
  const calculateMineCount = () => {
    const totalCells = width * height;
    return Math.floor(totalCells * mineRate / 100);
  };

  // 计算预估游戏时间
  const getEstimatedTime = () => {
    const totalCells = width * height;
    const mineCount = calculateMineCount();
    const safeCells = totalCells - mineCount;
    
    // 基于安全格子数量的简单时间估算
    if (safeCells < 50) return '2-5 分钟';
    if (safeCells < 100) return '5-10 分钟';
    if (safeCells < 200) return '10-20 分钟';
    return '20+ 分钟';
  };

  // 获取难度等级
  const getDifficultyLevel = () => {
    if (mineRate < 15) return { level: '简单', color: 'text-mint-600', bg: 'bg-mint-100' };
    if (mineRate < 20) return { level: '中等', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (mineRate < 25) return { level: '困难', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { level: '专家', color: 'text-red-600', bg: 'bg-red-100' };
  };

  // 处理开始游戏
  const handleStartGame = () => {
    const mineCount = calculateMineCount();
    onStartGame({
      width,
      height,
      mineCount,
      difficulty: getDifficultyLevel().level
    });
  };

  // 处理预设选择
  const handlePresetSelect = (presetKey) => {
    setSelectedPreset(presetKey);
    setIsCustom(false);
  };

  // 处理自定义设置
  const handleCustomChange = () => {
    setIsCustom(true);
    setSelectedPreset('');
  };

  const difficulty = getDifficultyLevel();

  return (
    <div className="card-cute" data-testid="game-settings">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-5 h-5 text-pink-500" />
        <h3 className="text-xl font-bold text-gray-800">游戏设置</h3>
      </div>

      {/* 预设难度选择 */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">选择难度</h4>
        <div className="grid grid-cols-2 gap-3" data-testid="difficulty-presets">
          {Object.entries(presets).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => handlePresetSelect(key)}
              className={`p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                selectedPreset === key && !isCustom
                  ? 'border-pink-400 bg-pink-50 shadow-cute'
                  : 'border-gray-200 bg-white hover:border-pink-300 hover:bg-pink-25'
              }`}
              data-testid={`difficulty-${key}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{preset.icon}</span>
                <span className="font-semibold text-gray-800">{preset.name}</span>
              </div>
              <p className="text-xs text-gray-600">{preset.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 自定义设置 */}
      <div className="mb-6" data-testid="custom-settings">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-700">自定义设置</h4>
          <button
            onClick={handleCustomChange}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${
              isCustom
                ? 'bg-lavender-100 text-lavender-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            data-testid="enable-custom-btn"
          >
            {isCustom ? '已启用' : '启用自定义'}
          </button>
        </div>

        <div className="space-y-4">
          {/* 棋盘尺寸 */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              棋盘尺寸: {width} × {height}
            </label>
            <div className="space-y-2">
              <div>
                <span className="text-xs text-gray-500">宽度</span>
                <input
                  type="range"
                  min="5"
                  max="20"
                  value={width}
                  onChange={(e) => {
                    setWidth(parseInt(e.target.value));
                    handleCustomChange();
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-pink"
                  data-testid="width-input"
                />
              </div>
              <div>
                <span className="text-xs text-gray-500">高度</span>
                <input
                  type="range"
                  min="5"
                  max="20"
                  value={height}
                  onChange={(e) => {
                    setHeight(parseInt(e.target.value));
                    handleCustomChange();
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-pink"
                  data-testid="height-input"
                />
              </div>
            </div>
          </div>

          {/* 地雷密度 */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              地雷密度: {mineRate}% ({calculateMineCount()} 个地雷)
            </label>
            <input
              type="range"
              min="10"
              max="30"
              value={mineRate}
              onChange={(e) => {
                setMineRate(parseInt(e.target.value));
                handleCustomChange();
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-pink"
              data-testid="mine-count-input"
            />
          </div>
        </div>
      </div>

      {/* 游戏信息预览 */}
      <div className="mb-6 p-4 bg-gradient-to-r from-pink-50 to-lavender-50 rounded-2xl">
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Target className="w-4 h-4" />
          游戏预览
        </h4>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">棋盘大小:</span>
            <span className="ml-2 font-semibold text-gray-800">{width} × {height}</span>
          </div>
          <div>
            <span className="text-gray-600">总格子:</span>
            <span className="ml-2 font-semibold text-gray-800">{width * height}</span>
          </div>
          <div>
            <span className="text-gray-600">地雷数量:</span>
            <span className="ml-2 font-semibold text-gray-800">{calculateMineCount()}</span>
          </div>
          <div>
            <span className="text-gray-600">安全格子:</span>
            <span className="ml-2 font-semibold text-gray-800">{width * height - calculateMineCount()}</span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-sm">难度:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${difficulty.bg} ${difficulty.color}`}>
              {difficulty.level}
            </span>
          </div>
          <div className="text-xs text-gray-600">
            预估时间: {getEstimatedTime()}
          </div>
        </div>
      </div>

      {/* 开始游戏按钮 */}
      <div className="space-y-3">
        <button
          onClick={handleStartGame}
          disabled={!isConnected || isGameActive}
          className="btn-pink w-full disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="start-game-btn"
        >
          <div className="flex items-center justify-center gap-2">
            {isGameActive ? (
              <>
                <RotateCcw className="w-4 h-4" />
                游戏进行中
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                开始新游戏
              </>
            )}
          </div>
        </button>

        {!isConnected && (
          <p className="text-center text-sm text-gray-500" data-testid="connect-wallet-prompt">
            请先连接钱包以开始游戏
          </p>
        )}
      </div>

      {/* 游戏规则提示 */}
      <div className="mt-6 p-3 bg-mint-50 rounded-2xl">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-mint-600" />
          <span className="text-sm font-semibold text-mint-800">游戏规则</span>
        </div>
        <ul className="text-xs text-mint-700 space-y-1">
          <li>• 点击格子揭示内容，避免点到地雷</li>
          <li>• 数字表示周围8个格子中的地雷数量</li>
          <li>• 揭示所有安全格子即可获胜</li>
          <li>• 每个安全格子 +1 分，完成游戏额外 +5 分</li>
        </ul>
      </div>
    </div>
  );
};

export default GameSettings;
