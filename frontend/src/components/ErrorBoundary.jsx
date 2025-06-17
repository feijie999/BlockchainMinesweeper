import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 你同样可以将错误日志上报给服务器
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // 你可以自定义降级后的 UI 并渲染
      return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-mint-50 to-lavender-50 flex items-center justify-center p-4">
          <div className="card-cute max-w-md w-full text-center">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                哎呀，出错了！
              </h2>
              
              <p className="text-gray-600 mb-4">
                应用遇到了一个意外错误，请尝试刷新页面或重置应用。
              </p>
            </div>

            {/* 错误详情（开发模式下显示） */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-2xl text-left">
                <h3 className="text-sm font-semibold text-red-800 mb-2">错误详情:</h3>
                <pre className="text-xs text-red-700 overflow-auto max-h-32">
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="btn-pink w-full"
              >
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  刷新页面
                </div>
              </button>
              
              <button
                onClick={this.handleReset}
                className="btn-mint w-full"
              >
                <div className="flex items-center justify-center gap-2">
                  <Home className="w-4 h-4" />
                  重置应用
                </div>
              </button>
            </div>

            {/* 联系信息 */}
            <div className="mt-6 p-3 bg-gray-50 rounded-2xl">
              <p className="text-xs text-gray-600">
                如果问题持续存在，请联系开发者或查看浏览器控制台获取更多信息。
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
