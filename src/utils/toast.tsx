import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

// Типы для тоста
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number; // ms, 0 for sticky
  action?: ToastAction;
}

// Контекст для управления тостами
interface ToastContextType {
  showToast: (type: ToastType, message: string, duration?: number, action?: ToastAction) => void;
  showError: (message: string, duration?: number, action?: ToastAction) => void;
  showSuccess: (message: string, duration?: number, action?: ToastAction) => void;
  showInfo: (message: string, duration?: number, action?: ToastAction) => void;
  showWarning: (message: string, duration?: number, action?: ToastAction) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Хук для использования тостов
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Компонент ToastProvider
export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, message: string, duration: number = 5000, action?: ToastAction) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, type, message, duration, action };
    setToasts((prevToasts) => [...prevToasts, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const showError = useCallback((message: string, duration?: number, action?: ToastAction) => showToast('error', message, duration, action), [showToast]);
  const showSuccess = useCallback((message: string, duration?: number, action?: ToastAction) => showToast('success', message, duration, action), [showToast]);
  const showInfo = useCallback((message: string, duration?: number, action?: ToastAction) => showToast('info', message, duration, action), [showToast]);
  const showWarning = useCallback((message: string, duration?: number, action?: ToastAction) => showToast('warning', message, duration, action), [showToast]);

  const getToastClasses = (type: ToastType) => {
    switch (type) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'info': return 'bg-blue-500';
      case 'warning': return 'bg-yellow-500';
      default: return 'bg-gray-700';
    }
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return <CheckCircleIcon className="h-6 w-6 text-white" />;
      case 'error': return <ExclamationCircleIcon className="h-6 w-6 text-white" />;
      case 'info': return <InformationCircleIcon className="h-6 w-6 text-white" />;
      case 'warning': return <ExclamationTriangleIcon className="h-6 w-6 text-white" />;
      default: return null;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, showError, showSuccess, showInfo, showWarning }}>
      {children}
      {createPortal(
        <div className="fixed bottom-4 right-4 z-[1000] flex flex-col-reverse items-end space-y-4">
          <TransitionGroup>
            {toasts.map((toast) => (
              <CSSTransition
                key={toast.id}
                timeout={300}
                classNames={{
                  enter: 'animate-slideInRight',
                  exit: 'animate-slideOutRight',
                }}
              >
                <div
                  className={`${getToastClasses(toast.type)} text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 min-w-[280px] max-w-sm`}
                  role="alert"
                >
                  {getIcon(toast.type)}
                  <div className="flex-grow">
                    <p className="font-semibold">{toast.message}</p>
                    {toast.action && (
                      <button
                        onClick={() => {
                          toast.action?.onClick();
                          removeToast(toast.id);
                        }}
                        className="text-white underline text-sm mt-1 hover:text-gray-200"
                      >
                        {toast.action.label}
                      </button>
                    )}
                  </div>
                  <button onClick={() => removeToast(toast.id)} className="ml-auto p-1 rounded-full hover:bg-white/20 transition-colors">
                    <XMarkIcon className="h-5 w-5 text-white" />
                  </button>
                </div>
              </CSSTransition>
            ))}
          </TransitionGroup>
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

export default ToastContext;