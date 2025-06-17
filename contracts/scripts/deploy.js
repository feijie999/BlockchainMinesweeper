const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 开始部署扫雷游戏智能合约...");

  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log("📝 部署账户:", deployer.address);

  // 获取账户余额
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 账户余额:", ethers.formatEther(balance), "ETH");

  // 部署合约
  console.log("\n📦 正在部署 Minesweeper 合约...");
  const Minesweeper = await ethers.getContractFactory("Minesweeper");
  const minesweeper = await Minesweeper.deploy();
  
  await minesweeper.waitForDeployment();
  const contractAddress = await minesweeper.getAddress();

  console.log("✅ Minesweeper 合约部署成功!");
  console.log("📍 合约地址:", contractAddress);

  // 验证合约常量
  console.log("\n🔍 验证合约配置:");
  console.log("- 最小棋盘尺寸:", await minesweeper.MIN_SIZE());
  console.log("- 最大棋盘尺寸:", await minesweeper.MAX_SIZE());
  console.log("- 最小地雷密度:", await minesweeper.MIN_MINE_RATE(), "%");
  console.log("- 最大地雷密度:", await minesweeper.MAX_MINE_RATE(), "%");
  console.log("- 每格积分:", await minesweeper.CELL_SCORE());
  console.log("- 胜利奖励:", await minesweeper.WIN_BONUS());

  // 保存部署信息
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber(),
  };

  console.log("\n📋 部署信息:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // 如果是测试网，提供一些使用示例
  if (hre.network.name !== "hardhat") {
    console.log("\n🎮 使用示例:");
    console.log("1. 开始游戏: startGame(10, 10, 15)");
    console.log("2. 揭示格子: revealCell(0, 0)");
    console.log("3. 查看游戏信息: getGameInfo()");
    console.log("4. 查看统计: getPlayerStats()");
    
    console.log("\n🔗 区块链浏览器:");
    if (hre.network.name === "sepolia") {
      console.log(`https://sepolia.etherscan.io/address/${contractAddress}`);
    }
  }

  return contractAddress;
}

// 错误处理
main()
  .then((contractAddress) => {
    console.log(`\n🎉 部署完成! 合约地址: ${contractAddress}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  });
