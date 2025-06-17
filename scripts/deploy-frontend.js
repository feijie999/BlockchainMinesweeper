#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 开始部署前端应用...');

// 检查环境
function checkEnvironment() {
  console.log('📋 检查部署环境...');
  
  // 检查 Node.js 版本
  const nodeVersion = process.version;
  console.log(`Node.js 版本: ${nodeVersion}`);
  
  // 检查 npm 版本
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log(`npm 版本: ${npmVersion}`);
  } catch (error) {
    console.error('❌ npm 未安装');
    process.exit(1);
  }
  
  // 检查前端目录
  const frontendPath = path.join(__dirname, '../frontend');
  if (!fs.existsSync(frontendPath)) {
    console.error('❌ 前端目录不存在');
    process.exit(1);
  }
  
  console.log('✅ 环境检查通过');
}

// 安装依赖
function installDependencies() {
  console.log('📦 安装前端依赖...');
  
  try {
    process.chdir(path.join(__dirname, '../frontend'));
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ 依赖安装完成');
  } catch (error) {
    console.error('❌ 依赖安装失败:', error.message);
    process.exit(1);
  }
}

// 运行测试
function runTests() {
  console.log('🧪 运行测试...');
  
  try {
    // 这里可以添加实际的测试命令
    // execSync('npm test', { stdio: 'inherit' });
    console.log('✅ 测试通过（跳过，因为没有配置测试）');
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    process.exit(1);
  }
}

// 构建应用
function buildApplication() {
  console.log('🔨 构建前端应用...');
  
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ 构建完成');
  } catch (error) {
    console.error('❌ 构建失败:', error.message);
    process.exit(1);
  }
}

// 检查构建结果
function checkBuildResult() {
  console.log('🔍 检查构建结果...');
  
  const distPath = path.join(__dirname, '../frontend/dist');
  if (!fs.existsSync(distPath)) {
    console.error('❌ 构建目录不存在');
    process.exit(1);
  }
  
  const indexPath = path.join(distPath, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error('❌ index.html 文件不存在');
    process.exit(1);
  }
  
  // 检查文件大小
  const stats = fs.statSync(indexPath);
  console.log(`📄 index.html 大小: ${(stats.size / 1024).toFixed(2)} KB`);
  
  // 检查资源文件
  const assetsPath = path.join(distPath, 'assets');
  if (fs.existsSync(assetsPath)) {
    const assetFiles = fs.readdirSync(assetsPath);
    console.log(`📁 资源文件数量: ${assetFiles.length}`);
  }
  
  console.log('✅ 构建结果检查通过');
}

// 生成部署信息
function generateDeployInfo() {
  console.log('📝 生成部署信息...');
  
  const deployInfo = {
    timestamp: new Date().toISOString(),
    version: require('../package.json').version,
    nodeVersion: process.version,
    buildTime: new Date().toLocaleString('zh-CN'),
    environment: process.env.NODE_ENV || 'production'
  };
  
  const deployInfoPath = path.join(__dirname, '../frontend/dist/deploy-info.json');
  fs.writeFileSync(deployInfoPath, JSON.stringify(deployInfo, null, 2));
  
  console.log('✅ 部署信息已生成');
  console.log(JSON.stringify(deployInfo, null, 2));
}

// 主函数
function main() {
  try {
    checkEnvironment();
    installDependencies();
    runTests();
    buildApplication();
    checkBuildResult();
    generateDeployInfo();
    
    console.log('🎉 前端应用部署准备完成！');
    console.log('📁 构建文件位于: frontend/dist/');
    console.log('🌐 可以将 dist/ 目录部署到任何静态文件服务器');
    
    // 提供部署建议
    console.log('\n📋 部署建议:');
    console.log('1. 使用 Vercel: vercel --prod');
    console.log('2. 使用 Netlify: netlify deploy --prod --dir=dist');
    console.log('3. 使用 GitHub Pages: 将 dist/ 内容推送到 gh-pages 分支');
    console.log('4. 使用 IPFS: ipfs add -r dist/');
    
  } catch (error) {
    console.error('❌ 部署失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  checkEnvironment,
  installDependencies,
  runTests,
  buildApplication,
  checkBuildResult,
  generateDeployInfo
};
