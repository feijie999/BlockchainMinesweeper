const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 测试合约连接...");

  // 合约地址
  const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  
  // 获取合约实例
  const Minesweeper = await ethers.getContractFactory("Minesweeper");
  const minesweeper = Minesweeper.attach(contractAddress);
  
  console.log("📍 合约地址:", contractAddress);
  
  try {
    // 测试基本合约调用
    console.log("\n🧪 测试合约常量:");
    console.log("- 最小尺寸:", await minesweeper.MIN_SIZE());
    console.log("- 最大尺寸:", await minesweeper.MAX_SIZE());
    console.log("- 每格积分:", await minesweeper.CELL_SCORE());
    
    // 获取测试账户
    const [player] = await ethers.getSigners();
    console.log("\n👤 测试账户:", player.address);
    
    // 测试 getGameInfo (这是前端报错的方法)
    console.log("\n🎮 测试 getGameInfo:");
    try {
      const gameInfo = await minesweeper.getGameInfo();
      console.log("✅ getGameInfo 调用成功:");
      console.log("  - 宽度:", Number(gameInfo[0]));
      console.log("  - 高度:", Number(gameInfo[1]));
      console.log("  - 地雷数:", Number(gameInfo[2]));
      console.log("  - 状态:", Number(gameInfo[3]));
      console.log("  - 已初始化:", gameInfo[8]);
    } catch (error) {
      console.log("❌ getGameInfo 调用失败:", error.message);
    }
    
    // 测试玩家统计
    console.log("\n📊 测试 getPlayerStats:");
    try {
      const stats = await minesweeper.getPlayerStats();
      console.log("✅ getPlayerStats 调用成功:");
      console.log("  - 总游戏数:", Number(stats[0]));
      console.log("  - 胜利次数:", Number(stats[1]));
      console.log("  - 最高分:", Number(stats[2]));
      console.log("  - 胜率:", Number(stats[3]));
    } catch (error) {
      console.log("❌ getPlayerStats 调用失败:", error.message);
    }
    
    console.log("\n✅ 合约连接测试完成!");
    
  } catch (error) {
    console.error("❌ 测试失败:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 脚本执行失败:", error);
    process.exit(1);
  });
