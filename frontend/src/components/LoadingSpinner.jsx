import { Loader, Sparkles } from 'lucide-react';

const LoadingSpinner = ({ 
  size = 'medium', 
  text = '加载中', 
  fullScreen = false,
  color = 'pink' 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  const colorClasses = {
    pink: 'text-pink-500',
    mint: 'text-mint-500',
    lavender: 'text-lavender-500',
    blue: 'text-blue-500'
  };

  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center">
          <div className="relative mb-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-pink-400 to-lavender-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
            </div>
            <div className="absolute inset-0 w-16 h-16 mx-auto border-4 border-pink-200 rounded-full animate-spin border-t-pink-500"></div>
          </div>
          
          <p className="text-lg font-semibold text-gray-800 mb-2">{text}</p>
          <div className="flex items-center justify-center gap-1">
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-mint-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-lavender-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <Loader className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`} />
      {text && (
        <span className={`${textSizeClasses[size]} font-medium text-gray-700`}>
          {text}
        </span>
      )}
    </div>
  );
};

// 骨架屏组件
export const SkeletonLoader = ({ className = '', rows = 3 }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="mb-3 last:mb-0">
          <div className="h-4 bg-gray-200 rounded-full mb-2"></div>
          <div className="h-3 bg-gray-200 rounded-full w-3/4"></div>
        </div>
      ))}
    </div>
  );
};

// 卡片骨架屏
export const CardSkeleton = ({ className = '' }) => {
  return (
    <div className={`card-cute animate-pulse ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-5 h-5 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
      
      <div className="space-y-3">
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="h-8 bg-gray-200 rounded-xl"></div>
        <div className="h-8 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  );
};

// 按钮加载状态
export const ButtonLoader = ({ size = 'medium' }) => {
  const sizeClasses = {
    small: 'w-3 h-3',
    medium: 'w-4 h-4',
    large: 'w-5 h-5'
  };

  return (
    <div className={`${sizeClasses[size]} border-2 border-white border-t-transparent rounded-full animate-spin`}></div>
  );
};

export default LoadingSpinner;
