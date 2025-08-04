import React from "react";

// Componente de spinner optimizado
const LoadingSpinner = React.memo(({ 
  size = "md", 
  variant = "primary", 
  text = "", 
  className = "" 
}) => {
  const sizeClasses = {
    xs: "w-3 h-3",
    sm: "w-4 h-4", 
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const variantClasses = {
    primary: "border-blue-500/30 border-t-blue-500",
    secondary: "border-slate-500/30 border-t-slate-500",
    success: "border-green-500/30 border-t-green-500",
    warning: "border-yellow-500/30 border-t-yellow-500",
    danger: "border-red-500/30 border-t-red-500",
    white: "border-white/30 border-t-white",
  };

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <div
        className={`
          ${sizeClasses[size]} 
          ${variantClasses[variant]}
          border-2 rounded-full animate-spin
        `}
      />
      {text && (
        <span className="text-sm text-slate-400 animate-pulse">{text}</span>
      )}
    </div>
  );
});

// Componente de skeleton para contenido
const Skeleton = React.memo(({ 
  variant = "text", 
  lines = 1, 
  className = "" 
}) => {
  const baseClasses = "animate-pulse bg-slate-700/50 rounded";
  
  const variantClasses = {
    text: "h-4",
    title: "h-6",
    avatar: "w-10 h-10 rounded-full",
    card: "h-32",
    button: "h-10 w-24",
  };

  if (lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${variantClasses[variant]} ${
              index === lines - 1 ? "w-3/4" : "w-full"
            }`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
  );
});

// Componente de loading overlay
const LoadingOverlay = React.memo(({ 
  isLoading, 
  children, 
  text = "Cargando...",
  backdrop = true 
}) => {
  if (!isLoading) return children;

  return (
    <div className="relative">
      {children}
      <div className={`
        absolute inset-0 flex items-center justify-center
        ${backdrop ? 'bg-slate-900/50 backdrop-blur-sm' : ''}
        z-50
      `}>
        <div className="bg-slate-800/90 border border-slate-700/50 rounded-xl p-6 shadow-2xl">
          <LoadingSpinner size="lg" text={text} />
        </div>
      </div>
    </div>
  );
});

// Componente de loading inline
const LoadingInline = React.memo(({ 
  isLoading, 
  children, 
  fallback = null 
}) => {
  if (isLoading) {
    return fallback || <LoadingSpinner size="sm" />;
  }
  
  return children;
});

// Componente de loading con progreso
const LoadingProgress = React.memo(({ 
  progress = 0, 
  text = "", 
  className = "" 
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {text && (
        <p className="text-sm text-slate-400 text-center">{text}</p>
      )}
      <div className="w-full bg-slate-700/50 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      <p className="text-xs text-slate-500 text-center">
        {Math.round(progress)}%
      </p>
    </div>
  );
});

// Componente de loading con dots
const LoadingDots = React.memo(({ 
  text = "Cargando", 
  className = "" 
}) => {
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <span className="text-slate-400">{text}</span>
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
            style={{
              animationDelay: `${i * 0.1}s`,
              animationDuration: "1s",
            }}
          />
        ))}
      </div>
    </div>
  );
});

// Componente de loading con pulso
const LoadingPulse = React.memo(({ 
  size = "md", 
  className = "" 
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div
      className={`
        ${sizeClasses[size]} 
        bg-blue-500 rounded-full animate-pulse
        ${className}
      `}
    />
  );
});

// Componente de loading con skeleton para listas
const LoadingList = React.memo(({ 
  items = 5, 
  className = "" 
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4">
          <Skeleton variant="avatar" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="title" />
            <Skeleton variant="text" lines={2} />
          </div>
        </div>
      ))}
    </div>
  );
});

// Componente de loading con skeleton para cards
const LoadingCards = React.memo(({ 
  cards = 3, 
  className = "" 
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {Array.from({ length: cards }).map((_, index) => (
        <div key={index} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <Skeleton variant="title" className="mb-4" />
          <Skeleton variant="text" lines={3} />
          <div className="mt-4 flex space-x-2">
            <Skeleton variant="button" />
            <Skeleton variant="button" />
          </div>
        </div>
      ))}
    </div>
  );
});

// Componente de loading con skeleton para tablas
const LoadingTable = React.memo(({ 
  rows = 5, 
  columns = 4, 
  className = "" 
}) => {
  return (
    <div className={`overflow-hidden border border-slate-700/50 rounded-xl ${className}`}>
      <div className="bg-slate-800/50 p-4 border-b border-slate-700/50">
        <Skeleton variant="title" />
      </div>
      <div className="divide-y divide-slate-700/50">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4 flex space-x-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="flex-1">
                <Skeleton variant="text" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
});

// Hook para manejar estados de loading
const useLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = React.useState(initialState);
  const [loadingText, setLoadingText] = React.useState("");

  const startLoading = React.useCallback((text = "") => {
    setIsLoading(true);
    setLoadingText(text);
  }, []);

  const stopLoading = React.useCallback(() => {
    setIsLoading(false);
    setLoadingText("");
  }, []);

  const withLoading = React.useCallback(async (asyncFn, text = "") => {
    startLoading(text);
    try {
      const result = await asyncFn();
      return result;
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  return {
    isLoading,
    loadingText,
    startLoading,
    stopLoading,
    withLoading,
  };
};

export {
  LoadingSpinner,
  Skeleton,
  LoadingOverlay,
  LoadingInline,
  LoadingProgress,
  LoadingDots,
  LoadingPulse,
  LoadingList,
  LoadingCards,
  LoadingTable,
  useLoading,
}; 