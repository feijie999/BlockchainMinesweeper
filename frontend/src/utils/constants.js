// 游戏状态常量
export const GameStatus = {
  NOT_STARTED: 0,
  IN_PROGRESS: 1,
  WON: 2,
  LOST: 3
};

// 难度级别配置
export const DIFFICULTY_LEVELS = {
  EASY: {
    name: '简单',
    emoji: '🌸',
    width: 8,
    height: 8,
    mineCount: 10,
    minePercentage: 12
  },
  MEDIUM: {
    name: '中等',
    emoji: '🌺',
    width: 12,
    height: 12,
    mineCount: 21,
    minePercentage: 15
  },
  HARD: {
    name: '困难',
    emoji: '🌹',
    width: 16,
    height: 16,
    mineCount: 51,
    minePercentage: 20
  },
  EXPERT: {
    name: '专家',
    emoji: '🏵️',
    width: 20,
    height: 20,
    mineCount: 100,
    minePercentage: 25
  }
};

// 游戏配置限制
export const GAME_LIMITS = {
  MIN_WIDTH: 5,
  MAX_WIDTH: 30,
  MIN_HEIGHT: 5,
  MAX_HEIGHT: 30,
  MIN_MINE_PERCENTAGE: 5,
  MAX_MINE_PERCENTAGE: 40
};

// 颜色配置
export const CELL_COLORS = {
  1: 'text-blue-600',
  2: 'text-green-600',
  3: 'text-red-600',
  4: 'text-purple-600',
  5: 'text-yellow-600',
  6: 'text-pink-600',
  7: 'text-gray-800',
  8: 'text-gray-600'
};

// 动画持续时间
export const ANIMATION_DURATION = {
  CELL_REVEAL: 300,
  GAME_END: 500,
  LOADING: 200
};

// 本地存储键名
export const STORAGE_KEYS = {
  GAME_SETTINGS: 'minesweeper_settings',
  PLAYER_STATS: 'minesweeper_stats',
  HIGH_SCORES: 'minesweeper_high_scores'
};

// 网络配置
export const NETWORK_CONFIG = {
  SEPOLIA_CHAIN_ID: 11155111,
  LOCALHOST_CHAIN_ID: 31337
};

// 合约地址（这里使用占位符，实际部署时需要更新）
export const CONTRACT_ADDRESSES = {
  MINESWEEPER: '0x0000000000000000000000000000000000000000'
};

// 错误消息
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: '请先连接钱包',
  GAME_NOT_STARTED: '游戏尚未开始',
  CELL_ALREADY_REVEALED: '格子已经被揭示',
  INVALID_COORDINATES: '无效的坐标',
  TRANSACTION_FAILED: '交易失败',
  NETWORK_ERROR: '网络错误'
};

// 成功消息
export const SUCCESS_MESSAGES = {
  WALLET_CONNECTED: '钱包连接成功',
  GAME_STARTED: '游戏开始',
  GAME_WON: '恭喜获胜！',
  CELL_REVEALED: '格子揭示成功'
};
