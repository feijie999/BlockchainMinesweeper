// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Minesweeper
 * @dev 区块链扫雷游戏智能合约
 * @author The Augster
 */
contract Minesweeper {
    // 游戏状态枚举
    enum GameStatus {
        NotStarted,    // 未开始
        InProgress,    // 进行中
        Won,          // 胜利
        Lost          // 失败
    }
    
    // 游戏数据结构
    struct Game {
        uint8 width;           // 棋盘宽度
        uint8 height;          // 棋盘高度
        uint16 mineCount;      // 地雷数量
        uint256 revealedCells; // 已揭示格子的位图 (最大支持 20x20 = 400 格子)
        uint256 mineBitmap;    // 地雷位置位图
        GameStatus status;     // 游戏状态
        uint32 score;          // 当前积分
        uint32 clickCount;     // 点击次数
        uint256 startTime;     // 游戏开始时间
        uint256 endTime;       // 游戏结束时间
        bool initialized;      // 是否已初始化
    }
    
    // 玩家游戏记录
    mapping(address => Game) public games;
    
    // 玩家历史最高分
    mapping(address => uint32) public highScores;
    
    // 玩家总游戏次数
    mapping(address => uint32) public totalGames;
    
    // 玩家胜利次数
    mapping(address => uint32) public winCount;
    
    // 常量定义
    uint8 public constant MIN_SIZE = 5;      // 最小棋盘尺寸
    uint8 public constant MAX_SIZE = 20;     // 最大棋盘尺寸
    uint8 public constant MIN_MINE_RATE = 10; // 最小地雷密度 10%
    uint8 public constant MAX_MINE_RATE = 30; // 最大地雷密度 30%
    uint32 public constant CELL_SCORE = 1;   // 每个安全格子的积分
    uint32 public constant WIN_BONUS = 5;    // 胜利奖励积分
    
    // 事件定义
    event GameStarted(address indexed player, uint8 width, uint8 height, uint16 mineCount);
    event CellRevealed(address indexed player, uint8 x, uint8 y, bool isMine, uint8 adjacentMines);
    event GameWon(address indexed player, uint32 score, uint32 clickCount, uint256 duration);
    event GameLost(address indexed player, uint8 x, uint8 y, uint32 clickCount);
    event HighScoreUpdated(address indexed player, uint32 newHighScore);
    
    // 修饰符：检查游戏是否存在且进行中
    modifier gameInProgress() {
        require(games[msg.sender].initialized, "Game not initialized");
        require(games[msg.sender].status == GameStatus.InProgress, "Game not in progress");
        _;
    }
    
    // 修饰符：检查坐标是否有效
    modifier validCoordinate(uint8 x, uint8 y) {
        Game storage game = games[msg.sender];
        require(x < game.width && y < game.height, "Invalid coordinate");
        _;
    }
    
    /**
     * @dev 开始新游戏
     * @param width 棋盘宽度 (5-20)
     * @param height 棋盘高度 (5-20)
     * @param mineCount 地雷数量
     */
    function startGame(uint8 width, uint8 height, uint16 mineCount) external {
        require(width >= MIN_SIZE && width <= MAX_SIZE, "Invalid width");
        require(height >= MIN_SIZE && height <= MAX_SIZE, "Invalid height");
        
        uint16 totalCells = uint16(width) * uint16(height);
        uint16 minMines = totalCells * MIN_MINE_RATE / 100;
        uint16 maxMines = totalCells * MAX_MINE_RATE / 100;
        
        require(mineCount >= minMines && mineCount <= maxMines, "Invalid mine count");
        require(mineCount < totalCells, "Too many mines");
        
        // 如果有正在进行的游戏，先结束它
        if (games[msg.sender].initialized && games[msg.sender].status == GameStatus.InProgress) {
            games[msg.sender].status = GameStatus.Lost;
        }
        
        // 初始化新游戏
        Game storage game = games[msg.sender];
        game.width = width;
        game.height = height;
        game.mineCount = mineCount;
        game.revealedCells = 0;
        game.mineBitmap = 0;
        game.status = GameStatus.InProgress;
        game.score = 0;
        game.clickCount = 0;
        game.startTime = block.timestamp;
        game.endTime = 0;
        game.initialized = true;
        
        // 生成地雷位置
        _generateMines(game, totalCells);
        
        // 更新统计
        totalGames[msg.sender]++;
        
        emit GameStarted(msg.sender, width, height, mineCount);
    }
    
    /**
     * @dev 揭示指定位置的格子
     * @param x X坐标
     * @param y Y坐标
     */
    function revealCell(uint8 x, uint8 y) external gameInProgress validCoordinate(x, y) {
        Game storage game = games[msg.sender];
        uint16 cellIndex = uint16(y) * uint16(game.width) + uint16(x);
        
        // 检查格子是否已经被揭示
        require(!_isCellRevealed(game.revealedCells, cellIndex), "Cell already revealed");
        
        game.clickCount++;
        
        // 检查是否是地雷
        bool isMine = _isMine(game.mineBitmap, cellIndex);
        
        if (isMine) {
            // 踩到地雷，游戏结束
            game.status = GameStatus.Lost;
            game.endTime = block.timestamp;
            emit GameLost(msg.sender, x, y, game.clickCount);
        } else {
            // 安全格子，标记为已揭示
            game.revealedCells = _setCellRevealed(game.revealedCells, cellIndex);
            game.score += CELL_SCORE;
            
            // 计算周围地雷数量
            uint8 adjacentMines = _countAdjacentMines(game, x, y);
            
            emit CellRevealed(msg.sender, x, y, false, adjacentMines);
            
            // 检查是否获胜
            uint16 totalCells = uint16(game.width) * uint16(game.height);
            uint16 revealedCount = _countRevealedCells(game.revealedCells, totalCells);
            
            if (revealedCount == totalCells - game.mineCount) {
                // 获胜
                game.status = GameStatus.Won;
                game.endTime = block.timestamp;
                game.score += WIN_BONUS;
                
                // 根据难度计算倍率加成
                uint16 difficulty = (game.mineCount * 100) / totalCells;
                if (difficulty >= 25) {
                    game.score = game.score * 3 / 2; // 1.5倍
                } else if (difficulty >= 20) {
                    game.score = game.score * 5 / 4; // 1.25倍
                }
                
                // 更新统计
                winCount[msg.sender]++;
                
                // 更新最高分
                if (game.score > highScores[msg.sender]) {
                    highScores[msg.sender] = game.score;
                    emit HighScoreUpdated(msg.sender, game.score);
                }
                
                uint256 duration = game.endTime - game.startTime;
                emit GameWon(msg.sender, game.score, game.clickCount, duration);
            }
        }
    }
    
    /**
     * @dev 获取游戏信息
     */
    function getGameInfo() external view returns (
        uint8 width,
        uint8 height,
        uint16 mineCount,
        GameStatus status,
        uint32 score,
        uint32 clickCount,
        uint256 startTime,
        uint256 endTime,
        bool initialized
    ) {
        Game storage game = games[msg.sender];
        return (
            game.width,
            game.height,
            game.mineCount,
            game.status,
            game.score,
            game.clickCount,
            game.startTime,
            game.endTime,
            game.initialized
        );
    }
    
    /**
     * @dev 检查指定格子是否已揭示
     */
    function isCellRevealed(uint8 x, uint8 y) external view validCoordinate(x, y) returns (bool) {
        Game storage game = games[msg.sender];
        uint16 cellIndex = uint16(y) * uint16(game.width) + uint16(x);
        return _isCellRevealed(game.revealedCells, cellIndex);
    }
    
    /**
     * @dev 获取指定格子周围的地雷数量（仅在格子已揭示时返回）
     */
    function getAdjacentMineCount(uint8 x, uint8 y) external view validCoordinate(x, y) returns (uint8) {
        Game storage game = games[msg.sender];
        uint16 cellIndex = uint16(y) * uint16(game.width) + uint16(x);
        require(_isCellRevealed(game.revealedCells, cellIndex), "Cell not revealed");
        return _countAdjacentMines(game, x, y);
    }
    
    /**
     * @dev 获取玩家统计信息
     */
    function getPlayerStats() external view returns (
        uint32 totalGamesPlayed,
        uint32 gamesWon,
        uint32 currentHighScore,
        uint8 winRate
    ) {
        uint32 total = totalGames[msg.sender];
        uint32 wins = winCount[msg.sender];
        uint8 rate = total > 0 ? uint8((wins * 100) / total) : 0;

        return (total, wins, highScores[msg.sender], rate);
    }

    // ============ 内部函数 ============

    /**
     * @dev 生成地雷位置
     * @param game 游戏实例
     * @param totalCells 总格子数
     */
    function _generateMines(Game storage game, uint16 totalCells) internal {
        uint256 seed = uint256(keccak256(abi.encodePacked(
            block.prevrandao,
            block.timestamp,
            msg.sender,
            game.width,
            game.height
        )));

        uint16 minesPlaced = 0;
        uint256 currentSeed = seed;

        while (minesPlaced < game.mineCount) {
            uint16 position = uint16(currentSeed % totalCells);

            if (!_isMine(game.mineBitmap, position)) {
                game.mineBitmap = _setMine(game.mineBitmap, position);
                minesPlaced++;
            }

            // 更新种子以获得下一个随机数
            currentSeed = uint256(keccak256(abi.encodePacked(currentSeed, minesPlaced)));
        }
    }

    /**
     * @dev 检查指定位置是否是地雷
     */
    function _isMine(uint256 mineBitmap, uint16 position) internal pure returns (bool) {
        return (mineBitmap >> position) & 1 == 1;
    }

    /**
     * @dev 在指定位置设置地雷
     */
    function _setMine(uint256 mineBitmap, uint16 position) internal pure returns (uint256) {
        return mineBitmap | (1 << position);
    }

    /**
     * @dev 检查指定格子是否已揭示
     */
    function _isCellRevealed(uint256 revealedCells, uint16 position) internal pure returns (bool) {
        return (revealedCells >> position) & 1 == 1;
    }

    /**
     * @dev 标记指定格子为已揭示
     */
    function _setCellRevealed(uint256 revealedCells, uint16 position) internal pure returns (uint256) {
        return revealedCells | (1 << position);
    }

    /**
     * @dev 计算已揭示格子的数量
     */
    function _countRevealedCells(uint256 revealedCells, uint16 totalCells) internal pure returns (uint16) {
        uint16 count = 0;
        for (uint16 i = 0; i < totalCells; i++) {
            if ((revealedCells >> i) & 1 == 1) {
                count++;
            }
        }
        return count;
    }

    /**
     * @dev 计算指定位置周围的地雷数量
     */
    function _countAdjacentMines(Game storage game, uint8 x, uint8 y) internal view returns (uint8) {
        uint8 count = 0;

        // 检查周围8个方向
        for (int8 dx = -1; dx <= 1; dx++) {
            for (int8 dy = -1; dy <= 1; dy++) {
                if (dx == 0 && dy == 0) continue; // 跳过自己

                int16 newX = int16(int8(x)) + dx;
                int16 newY = int16(int8(y)) + dy;

                // 检查边界
                if (newX >= 0 && newX < int16(int8(game.width)) &&
                    newY >= 0 && newY < int16(int8(game.height))) {

                    uint16 cellIndex = uint16(newY) * uint16(game.width) + uint16(newX);
                    if (_isMine(game.mineBitmap, cellIndex)) {
                        count++;
                    }
                }
            }
        }

        return count;
    }
}
