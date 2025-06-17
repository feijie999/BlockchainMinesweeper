/**
 * 全局测试清理
 * 在所有测试结束后运行
 */
async function globalTeardown(config) {
  console.log('✅ 区块链扫雷游戏测试完成！');

  // 清理测试产生的文件或数据
  // 例如：关闭数据库连接、清理临时文件等
}

export default globalTeardown;
