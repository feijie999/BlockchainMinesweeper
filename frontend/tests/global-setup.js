/**
 * 全局测试设置
 * 在所有测试开始前运行
 */
async function globalSetup(config) {
  console.log('🚀 开始区块链扫雷游戏测试...');

  // 设置测试环境变量
  process.env.NODE_ENV = 'test';

  // 可以在这里添加其他全局设置
  // 例如：启动测试数据库、清理缓存等

  return async () => {
    console.log('🧹 清理全局测试环境...');
  };
}

export default globalSetup;
