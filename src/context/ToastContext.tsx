import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Toast, ToastType } from '../components/Toast';

interface ToastConfig {
  type: ToastType;
  title: string;
  message?: string;
  points?: number;
  icon?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (config: ToastConfig) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  showAchievement: (title: string, message?: string, points?: number) => void;
  showPoints: (points: number, reason: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  if (__DEV__) {
    console.log('✅ ToastProvider rendering...');
  }
  
  const [toast, setToast] = useState<(ToastConfig & { visible: boolean }) | null>(null);

  const showToast = (config: ToastConfig) => {
    // Hide current toast if any
    setToast(null);

    // Show new toast after a brief delay
    setTimeout(() => {
      setToast({ ...config, visible: true });
    }, 100);
  };

  const showSuccess = (title: string, message?: string) => {
    showToast({ type: 'success', title, message });
  };

  const showError = (title: string, message?: string) => {
    showToast({ type: 'error', title, message });
  };

  const showInfo = (title: string, message?: string) => {
    showToast({ type: 'info', title, message });
  };

  const showAchievement = (title: string, message?: string, points?: number) => {
    showToast({ type: 'achievement', title, message, points, duration: 4000 });
  };

  const showPoints = (points: number, reason: string) => {
    showToast({
      type: 'points',
      title: `+${points} Glow Points`,
      message: reason,
      points,
      duration: 3000,
    });
  };

  const hideToast = () => {
    setToast(null);
  };

  return (
    <ToastContext.Provider
      value={{
        showToast,
        showSuccess,
        showError,
        showInfo,
        showAchievement,
        showPoints,
      }}
    >
      {children}
      {toast && (
        <Toast
          visible={toast.visible}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          points={toast.points}
          icon={toast.icon}
          duration={toast.duration}
          onHide={hideToast}
        />
      )}
    </ToastContext.Provider>
  );
};
