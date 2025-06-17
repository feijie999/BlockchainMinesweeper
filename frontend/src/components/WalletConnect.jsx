import { useState, useEffect } from 'react';
import { Wallet, WifiOff, AlertCircle, CheckCircle, Copy, ExternalLink } from 'lucide-react';
import { web3Manager } from '../utils/web3';

const WalletConnect = ({ onConnectionChange }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('0');
  const [network, setNetwork] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // 检查连接状态
  useEffect(() => {
    checkConnection();
  }, []);

  // 检查现有连接
  const checkConnection = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          await connectWallet();
        }
      }
    } catch (error) {
      console.error('检查连接失败:', error);
    }
  };

  // 连接钱包
  const connectWallet = async () => {
    setIsConnecting(true);
    setError('');

    try {
      const account = await web3Manager.connectWallet();
      setAccount(account);
      setIsConnected(true);

      // 获取余额和网络信息
      await updateWalletInfo();

      // 通知父组件连接状态变化
      if (onConnectionChange) {
        onConnectionChange(true, account);
      }
    } catch (error) {
      setError(error.message);
      console.error('连接钱包失败:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  // 断开连接
  const disconnectWallet = () => {
    web3Manager.disconnect();
    setIsConnected(false);
    setAccount('');
    setBalance('0');
    setNetwork(null);
    setError('');

    if (onConnectionChange) {
      onConnectionChange(false, '');
    }
  };

  // 更新钱包信息
  const updateWalletInfo = async () => {
    try {
      const [balanceResult, networkResult] = await Promise.all([
        web3Manager.getBalance(),
        web3Manager.getNetwork()
      ]);

      setBalance(balanceResult || '0');
      setNetwork(networkResult);
    } catch (error) {
      console.error('更新钱包信息失败:', error);
    }
  };

  // 复制地址
  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  // 格式化地址显示
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // 格式化余额显示
  const formatBalance = (balance) => {
    const num = parseFloat(balance);
    if (num === 0) return '0';
    if (num < 0.001) return '< 0.001';
    return num.toFixed(4);
  };

  // 获取网络显示名称
  const getNetworkName = (network) => {
    if (!network) return '未知网络';
    
    const networkNames = {
      1: 'Ethereum 主网',
      11155111: 'Sepolia 测试网',
      31337: '本地测试网',
      5: 'Goerli 测试网'
    };

    return networkNames[network.chainId] || `网络 ${network.chainId}`;
  };

  // 检查是否为支持的网络
  const isSupportedNetwork = (network) => {
    if (!network) return false;
    const supportedChainIds = [1, 11155111, 31337, 5]; // 主网、Sepolia、本地、Goerli
    return supportedChainIds.includes(Number(network.chainId));
  };

  if (!isConnected) {
    return (
      <div className="card-cute" data-testid="wallet-connect">
        <div className="text-center">
          <div className="mb-4">
            <Wallet className="w-16 h-16 mx-auto text-pink-400 animate-bounce-soft" />
          </div>

          <h3 className="text-xl font-bold text-gray-800 mb-2">
            连接钱包
          </h3>

          <p className="text-gray-600 mb-6">
            连接您的 MetaMask 钱包开始游戏
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-red-700" data-testid="error-message">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="btn-pink w-full disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="connect-wallet-btn"
          >
            {isConnecting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" data-testid="loading-spinner"></div>
                连接中...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Wallet className="w-4 h-4" />
                连接 MetaMask
              </div>
            )}
          </button>

          {typeof window.ethereum === 'undefined' && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-2xl">
              <p className="text-sm text-yellow-700 mb-2">
                请安装 MetaMask
              </p>
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-yellow-600 hover:text-yellow-800 underline"
              >
                下载 MetaMask
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="card-cute" data-testid="wallet-connect">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-mint-500" />
          <span className="font-semibold text-gray-800">钱包已连接</span>
        </div>

        <button
          onClick={disconnectWallet}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          data-testid="disconnect-wallet-btn"
        >
          断开连接
        </button>
      </div>

      {/* 账户信息 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
          <div>
            <p className="text-xs text-gray-500 mb-1">账户地址</p>
            <p className="font-mono text-sm text-gray-800" data-testid="wallet-address">{formatAddress(account)}</p>
          </div>
          <button
            onClick={copyAddress}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            title="复制地址"
            data-testid="copy-address-btn"
          >
            {copied ? (
              <CheckCircle className="w-4 h-4 text-mint-500" />
            ) : (
              <Copy className="w-4 h-4 text-gray-500" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
          <div>
            <p className="text-xs text-gray-500 mb-1">余额</p>
            <p className="font-semibold text-gray-800" data-testid="wallet-balance">{formatBalance(balance)} ETH</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
          <div>
            <p className="text-xs text-gray-500 mb-1">网络</p>
            <p className="text-sm text-gray-800" data-testid="network-info">{getNetworkName(network)}</p>
          </div>
          <div className="flex items-center gap-1">
            {isSupportedNetwork(network) ? (
              <CheckCircle className="w-4 h-4 text-mint-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
          </div>
        </div>

        {!isSupportedNetwork(network) && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">网络不支持</span>
            </div>
            <p className="text-xs text-yellow-700">
              请切换到 Sepolia 测试网
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletConnect;
