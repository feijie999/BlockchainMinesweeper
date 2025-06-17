const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 完整部署和测试流程...");

  try {
    // 获取部署账户
    const [deployer] = await ethers.getSigners();
    console.log("📝 部署账户:", deployer.address);
    
    // 检查账户余额
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 账户余额:", ethers.formatEther(balance), "ETH");

    // 部署合约
    console.log("\n📦 部署 Minesweeper 合约...");
    const Minesweeper = await ethers.getContractFactory("Minesweeper");
    const minesweeper = await Minesweeper.deploy();
    await minesweeper.waitForDeployment();
    
    const contractAddress = await minesweeper.getAddress();
    console.log("✅ 合约部署成功!");
    console.log("📍 合约地址:", contractAddress);
    
    // 验证合约代码
    const code = await ethers.provider.getCode(contractAddress);
    console.log("📝 合约代码长度:", code.length);
    
    if (code === "0x") {
      throw new Error("合约代码为空！");
    }
    
    // 测试合约常量
    console.log("\n🧪 测试合约常量:");
    const minSize = await minesweeper.MIN_SIZE();
    const maxSize = await minesweeper.MAX_SIZE();
    const cellScore = await minesweeper.CELL_SCORE();
    
    console.log("- 最小尺寸:", Number(minSize));
    console.log("- 最大尺寸:", Number(maxSize));
    console.log("- 每格积分:", Number(cellScore));
    
    // 测试 getGameInfo (游戏开始前)
    console.log("\n🎮 测试 getGameInfo (游戏开始前):");
    const gameInfoBefore = await minesweeper.getGameInfo();
    console.log("✅ getGameInfo 调用成功:");
    console.log("  - 宽度:", Number(gameInfoBefore[0]));
    console.log("  - 高度:", Number(gameInfoBefore[1]));
    console.log("  - 地雷数:", Number(gameInfoBefore[2]));
    console.log("  - 状态:", Number(gameInfoBefore[3]));
    console.log("  - 已初始化:", gameInfoBefore[8]);
    
    // 开始游戏
    console.log("\n🚀 开始游戏:");
    const tx = await minesweeper.startGame(8, 8, 10);
    console.log("📤 交易已发送，等待确认...");
    const receipt = await tx.wait();
    console.log("✅ 交易确认成功!");
    console.log("  - 区块号:", receipt.blockNumber);
    console.log("  - Gas 使用:", Number(receipt.gasUsed));
    console.log("  - 状态:", receipt.status);
    
    // 测试 getGameInfo (游戏开始后)
    console.log("\n🎮 测试 getGameInfo (游戏开始后):");
    const gameInfoAfter = await minesweeper.getGameInfo();
    console.log("✅ getGameInfo 调用成功:");
    console.log("  - 宽度:", Number(gameInfoAfter[0]));
    console.log("  - 高度:", Number(gameInfoAfter[1]));
    console.log("  - 地雷数:", Number(gameInfoAfter[2]));
    console.log("  - 状态:", Number(gameInfoAfter[3]));
    console.log("  - 已初始化:", gameInfoAfter[8]);
    
    // 测试 getPlayerStats
    console.log("\n📊 测试 getPlayerStats:");
    const stats = await minesweeper.getPlayerStats();
    console.log("✅ getPlayerStats 调用成功:");
    console.log("  - 总游戏数:", Number(stats[0]));
    console.log("  - 胜利次数:", Number(stats[1]));
    console.log("  - 最高分:", Number(stats[2]));
    console.log("  - 胜率:", Number(stats[3]));
    
    // 测试揭示格子
    console.log("\n🔍 测试揭示格子:");
    const revealTx = await minesweeper.revealCell(0, 0);
    await revealTx.wait();
    console.log("✅ 格子揭示成功!");
    
    // 检查格子状态
    const isRevealed = await minesweeper.isCellRevealed(0, 0);
    console.log("  - 格子 (0,0) 已揭示:", isRevealed);
    
    const adjacentMines = await minesweeper.getAdjacentMineCount(0, 0);
    console.log("  - 相邻地雷数:", Number(adjacentMines));
    
    console.log("\n✅ 所有测试通过!");
    console.log("🎯 前端可以使用合约地址:", contractAddress);
    
    return contractAddress;
    
  } catch (error) {
    console.error("❌ 测试失败:", error);
    throw error;
  }
}

main()
  .then((contractAddress) => {
    console.log(`\n🎉 部署和测试完成! 合约地址: ${contractAddress}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ 脚本执行失败:", error);
    process.exit(1);
  });
