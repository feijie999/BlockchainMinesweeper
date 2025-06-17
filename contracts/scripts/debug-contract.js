const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 调试合约问题...");

  const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  
  // 获取合约实例
  const Minesweeper = await ethers.getContractFactory("Minesweeper");
  const minesweeper = Minesweeper.attach(contractAddress);
  
  console.log("📍 合约地址:", contractAddress);
  
  try {
    // 获取账户
    const [player] = await ethers.getSigners();
    console.log("👤 测试账户:", player.address);
    
    // 检查合约代码是否存在
    const code = await ethers.provider.getCode(contractAddress);
    console.log("📝 合约代码长度:", code.length);
    
    if (code === "0x") {
      console.log("❌ 合约代码为空！合约可能没有正确部署。");
      return;
    }
    
    // 测试基本常量
    console.log("\n🧪 测试合约常量:");
    try {
      const minSize = await minesweeper.MIN_SIZE();
      console.log("✅ MIN_SIZE:", Number(minSize));
    } catch (error) {
      console.log("❌ MIN_SIZE 调用失败:", error.message);
    }
    
    // 测试 getGameInfo 方法
    console.log("\n🎮 测试 getGameInfo (调用前):");
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
    
    // 开始游戏
    console.log("\n🚀 开始游戏:");
    try {
      const tx = await minesweeper.startGame(8, 8, 10);
      console.log("📤 交易已发送，等待确认...");
      const receipt = await tx.wait();
      console.log("✅ 交易确认成功!");
      console.log("  - 区块号:", receipt.blockNumber);
      console.log("  - Gas 使用:", Number(receipt.gasUsed));
      console.log("  - 状态:", receipt.status);
    } catch (error) {
      console.log("❌ 开始游戏失败:", error.message);
      return;
    }
    
    // 再次测试 getGameInfo
    console.log("\n🎮 测试 getGameInfo (游戏开始后):");
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
    
    // 测试 getPlayerStats
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
    
    console.log("\n✅ 调试完成!");
    
  } catch (error) {
    console.error("❌ 调试过程中出现错误:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 脚本执行失败:", error);
    process.exit(1);
  });
