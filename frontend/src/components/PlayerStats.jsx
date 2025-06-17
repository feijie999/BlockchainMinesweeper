import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Trophy, 
  Target, 
  TrendingUp, 
  Award, 
  Star,
  Calendar,
  Zap,
  Crown,
  Medal
} from 'lucide-react';

const PlayerStats = ({ playerStats, gameInfo, isConnected }) => {
  const [animatedStats, setAnimatedStats] = useState({
    totalGamesPlayed: 0,
    gamesWon: 0,
    currentHighScore: 0,
    winRate: 0
  });

  // 动画效果更新统计数据
  useEffect(() => {
    if (!playerStats) return;

    const animateValue = (key, targetValue, duration = 1000) => {
      const startValue = animatedStats[key];
      const difference = targetValue - startValue;
      const startTime = Date.now();

      const updateValue = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentValue = Math.floor(startValue + difference * progress);

        setAnimatedStats(prev => ({
          ...prev,
          [key]: currentValue
        }));

        if (progress < 1) {
          requestAnimationFrame(updateValue);
        }
      };

      requestAnimationFrame(updateValue);
    };

    // 为每个统计数据添加动画
    Object.keys(playerStats).forEach(key => {
      if (playerStats[key] !== animatedStats[key]) {
        animateValue(key, playerStats[key]);
      }
    });
  }, [playerStats, animatedStats]);

  // 获取等级信息
  const getPlayerLevel = () => {
    const totalGames = animatedStats.totalGamesPlayed;
    
    if (totalGames < 5) return { level: '新手', icon: '🌱', color: 'text-green-600', bg: 'bg-green-100' };
    if (totalGames < 20) return { level: '初级', icon: '🌸', color: 'text-pink-600', bg: 'bg-pink-100' };
    if (totalGames < 50) return { level: '中级', icon: '🌺', color: 'text-purple-600', bg: 'bg-purple-100' };
    if (totalGames < 100) return { level: '高级', icon: '🌹', color: 'text-red-600', bg: 'bg-red-100' };
    return { level: '专家', icon: '👑', color: 'text-yellow-600', bg: 'bg-yellow-100' };
  };

  // 获取成就列表
  const getAchievements = () => {
    const achievements = [];
    const { totalGamesPlayed, gamesWon, currentHighScore, winRate } = animatedStats;

    if (totalGamesPlayed >= 1) {
      achievements.push({ name: '初次尝试', icon: '🎯', description: '完成第一局游戏' });
    }
    if (gamesWon >= 1) {
      achievements.push({ name: '首次胜利', icon: '🏆', description: '赢得第一局游戏' });
    }
    if (totalGamesPlayed >= 10) {
      achievements.push({ name: '坚持不懈', icon: '💪', description: '完成10局游戏' });
    }
    if (winRate >= 50) {
      achievements.push({ name: '胜率达人', icon: '⭐', description: '胜率达到50%' });
    }
    if (currentHighScore >= 100) {
      achievements.push({ name: '高分选手', icon: '🎊', description: '单局得分超过100' });
    }
    if (gamesWon >= 10) {
      achievements.push({ name: '连胜王者', icon: '👑', description: '累计胜利10局' });
    }

    return achievements;
  };

  // 获取胜率颜色
  const getWinRateColor = (rate) => {
    if (rate >= 70) return 'text-green-600';
    if (rate >= 50) return 'text-yellow-600';
    if (rate >= 30) return 'text-orange-600';
    return 'text-red-600';
  };

  // 获取进度条宽度
  const getProgressWidth = (current, max) => {
    return Math.min((current / max) * 100, 100);
  };

  const playerLevel = getPlayerLevel();
  const achievements = getAchievements();

  if (!isConnected) {
    return (
      <div className="card-cute text-center py-8">
        <BarChart3 className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500">连接钱包查看统计数据</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 玩家等级卡片 */}
      <div className="card-cute">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-bold text-gray-800">玩家等级</h3>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full ${playerLevel.bg} flex items-center justify-center text-2xl`}>
            {playerLevel.icon}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`font-bold ${playerLevel.color}`}>{playerLevel.level}</span>
              <span className="text-sm text-gray-500">扫雷专家</span>
            </div>
            
            <div className="text-sm text-gray-600 mb-2">
              总游戏次数: {animatedStats.totalGamesPlayed}
            </div>
            
            {/* 升级进度条 */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-pink-400 to-purple-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${getProgressWidth(animatedStats.totalGamesPlayed % 20, 20)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              距离下一等级: {20 - (animatedStats.totalGamesPlayed % 20)} 局
            </div>
          </div>
        </div>
      </div>

      {/* 统计数据卡片 */}
      <div className="card-cute">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-mint-500" />
          <h3 className="text-lg font-bold text-gray-800">游戏统计</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* 总游戏数 */}
          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
            <Target className="w-6 h-6 mx-auto text-blue-600 mb-2" />
            <div className="text-2xl font-bold text-blue-800 mb-1">
              {animatedStats.totalGamesPlayed}
            </div>
            <div className="text-xs text-blue-600">总游戏数</div>
          </div>

          {/* 胜利次数 */}
          <div className="text-center p-3 bg-gradient-to-br from-mint-50 to-mint-100 rounded-2xl">
            <Trophy className="w-6 h-6 mx-auto text-mint-600 mb-2" />
            <div className="text-2xl font-bold text-mint-800 mb-1">
              {animatedStats.gamesWon}
            </div>
            <div className="text-xs text-mint-600">胜利次数</div>
          </div>

          {/* 最高分 */}
          <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl">
            <Star className="w-6 h-6 mx-auto text-yellow-600 mb-2" />
            <div className="text-2xl font-bold text-yellow-800 mb-1">
              {animatedStats.currentHighScore}
            </div>
            <div className="text-xs text-yellow-600">最高分</div>
          </div>

          {/* 胜率 */}
          <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
            <TrendingUp className="w-6 h-6 mx-auto text-purple-600 mb-2" />
            <div className={`text-2xl font-bold mb-1 ${getWinRateColor(animatedStats.winRate)}`}>
              {animatedStats.winRate}%
            </div>
            <div className="text-xs text-purple-600">胜率</div>
          </div>
        </div>
      </div>

      {/* 当前游戏状态 */}
      {gameInfo.initialized && (
        <div className="card-cute">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-pink-500" />
            <h3 className="text-lg font-bold text-gray-800">当前游戏</h3>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-2 bg-gray-50 rounded-xl">
              <div className="text-sm font-semibold text-gray-800">{gameInfo.width}×{gameInfo.height}</div>
              <div className="text-xs text-gray-600">棋盘大小</div>
            </div>
            
            <div className="p-2 bg-gray-50 rounded-xl">
              <div className="text-sm font-semibold text-gray-800">{gameInfo.mineCount}</div>
              <div className="text-xs text-gray-600">地雷数量</div>
            </div>
            
            <div className="p-2 bg-gray-50 rounded-xl">
              <div className="text-sm font-semibold text-gray-800">{gameInfo.score}</div>
              <div className="text-xs text-gray-600">当前得分</div>
            </div>
          </div>
        </div>
      )}

      {/* 成就系统 */}
      <div className="card-cute">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-lavender-500" />
          <h3 className="text-lg font-bold text-gray-800">成就徽章</h3>
        </div>

        {achievements.length > 0 ? (
          <div className="grid grid-cols-1 gap-2">
            {achievements.map((achievement, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-lavender-50 to-pink-50 rounded-2xl"
              >
                <div className="text-2xl">{achievement.icon}</div>
                <div>
                  <div className="font-semibold text-gray-800 text-sm">{achievement.name}</div>
                  <div className="text-xs text-gray-600">{achievement.description}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <Medal className="w-8 h-8 mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">开始游戏解锁成就徽章</p>
          </div>
        )}
      </div>

      {/* 游戏小贴士 */}
      <div className="card-cute bg-gradient-to-r from-mint-50 to-lavender-50">
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-4 h-4 text-mint-600" />
          <h4 className="text-sm font-semibold text-gray-800">游戏小贴士</h4>
        </div>
        
        <div className="text-xs text-gray-600 space-y-1">
          <p>• 从角落和边缘开始，这些位置相对安全</p>
          <p>• 利用数字提示推理地雷位置</p>
          <p>• 右键标记可疑的地雷位置</p>
          <p>• 保持冷静，仔细分析每一步</p>
        </div>
      </div>
    </div>
  );
};

export default PlayerStats;
