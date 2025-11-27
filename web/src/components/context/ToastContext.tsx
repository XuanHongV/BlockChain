import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { ToastNotification, ToastType } from '../UI/ToastNotification';

export interface NotificationHistory {
  id: number;
  message: string;
  type: ToastType;
  txHash?: string;
  timestamp: string;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType, txHash?: string) => void;
  hideToast: () => void;
  notifications: NotificationHistory[];
  clearNotifications: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean; txHash?: string }>({
    message: '',
    type: 'success',
    isVisible: false,
  });

  
  const [notifications, setNotifications] = useState<NotificationHistory[]>(() => {
    try {
        const saved = localStorage.getItem('toast_history');
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('toast_history', JSON.stringify(notifications));
  }, [notifications]);

  const showToast = (message: string, type: ToastType, txHash?: string) => {
    setToast({ message, type, isVisible: true, txHash });

    const newNotif: NotificationHistory = {
        id: Date.now(),
        message,
        type,
        txHash,
        timestamp: new Date().toISOString() 
    };
    
    setNotifications((prev) => [newNotif, ...prev].slice(0, 20));
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('toast_history');
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast, notifications, clearNotifications }}>
      {children}
      <ToastNotification 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={hideToast}
        txHash={toast.txHash}
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};