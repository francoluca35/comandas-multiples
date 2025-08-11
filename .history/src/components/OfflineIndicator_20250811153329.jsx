"use client";
import { useOfflineStatus } from '../hooks/useOfflineStatus';

const OfflineIndicator = () => {
  const { isOnline, isInstalled } = useOfflineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 px-4 z-50">
      <div className="flex items-center justify-center space-x-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
        </svg>
        <span className="text-sm font-medium">
          Sin conexión - Modo offline
        </span>
      </div>
    </div>
  );
};

export default OfflineIndicator;
