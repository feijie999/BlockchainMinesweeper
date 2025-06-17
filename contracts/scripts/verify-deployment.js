const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 验证合约部署状态...");

  // 新的合约地址
  const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  
  // 获取合约实例
  const Minesweeper = await ethers.getContractFactory("Minesweeper");
  const minesweeper = Minesweeper.attach(contractAddress);
  
  console.log("📍 合约地址:", contractAddress);
  
  try {
    // 测试基本合约调用
    console.log("\n🧪 测试合约常量:");
    const minSize = await minesweeper.MIN_SIZE();
    const maxSize = await minesweeper.MAX_SIZE();
    const cellScore = await minesweeper.CELL_SCORE();
    
    console.log("- 最小尺寸:", Number(minSize));
    console.log("- 最大尺寸:", Number(maxSize));
    console.log("- 每格积分:", Number(cellScore));
    
    // 获取测试账户
    const [player] = await ethers.getSigners();
    console.log("\n👤 测试账户:", player.address);
    
    // 测试 getGameInfo (这是前端报错的方法)
    console.log("\n🎮 测试 getGameInfo:");
    const gameInfo = await minesweeper.getGameInfo();
    console.log("✅ getGameInfo 调用成功:");
    console.log("  - 宽度:", Number(gameInfo[0]));
    console.log("  - 高度:", Number(gameInfo[1]));
    console.log("  - 地雷数:", Number(gameInfo[2]));
    console.log("  - 状态:", Number(gameInfo[3]));
    console.log("  - 已初始化:", gameInfo[8]);
    
    // 测试 getPlayerStats
    console.log("\n📊 测试 getPlayerStats:");
    const stats = await minesweeper.getPlayerStats();
    console.log("✅ getPlayerStats 调用成功:");
    console.log("  - 总游戏数:", Number(stats[0]));
    console.log("  - 胜利次数:", Number(stats[1]));
    console.log("  - 最高分:", Number(stats[2]));
    console.log("  - 胜率:", Number(stats[3]));
    
    // 测试开始游戏
    console.log("\n🚀 测试开始游戏:");
    const tx = await minesweeper.startGame(8, 8, 10);
    await tx.wait();
    console.log("✅ 游戏开始成功!");
    
    // 再次获取游戏信息验证
    const newGameInfo = await minesweeper.getGameInfo();
    console.log("🎮 新游戏信息:");
    console.log("  - 宽度:", Number(newGameInfo[0]));
    console.log("  - 高度:", Number(newGameInfo[1]));
    console.log("  - 地雷数:", Number(newGameInfo[2]));
    console.log("  - 状态:", Number(newGameInfo[3]));
    console.log("  - 已初始化:", newGameInfo[8]);
    
    console.log("\n✅ 合约部署验证完成! 前端应该可以正常连接了。");
    
  } catch (error) {
    console.error("❌ 验证失败:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 脚本执行失败:", error);
    process.exit(1);
  });
