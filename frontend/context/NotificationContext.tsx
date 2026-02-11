
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
    id: string;
    message: string;
    type: NotificationType;
}

interface NotificationContextType {
    showNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setNotifications((prev) => [...prev, { id, message, type }]);

        // Auto-remove after 4 seconds
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, 4000);
    }, []);

    const removeNotification = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}

            {/* Notification UI Portal-like rendering */}
            <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
                {notifications.map((n) => (
                    <div
                        key={n.id}
                        className={`
              pointer-events-auto
              min-w-[300px] max-w-md p-4 rounded-2xl shadow-2xl border 
              flex items-center justify-between gap-4
              animate-slide-in-right transition-all duration-300
              ${n.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : ''}
              ${n.type === 'error' ? 'bg-red-50 border-red-200 text-red-900' : ''}
              ${n.type === 'warning' ? 'bg-orange-50 border-orange-200 text-orange-900' : ''}
              ${n.type === 'info' ? 'bg-majorelle/5 border-majorelle/20 text-majorelle' : 'bg-white border-gray-100 text-gray-900'}
            `}
                    >
                        <div className="flex items-center gap-3">
                            {n.type === 'success' && <span className="text-xl">✅</span>}
                            {n.type === 'error' && <span className="text-xl">❌</span>}
                            {n.type === 'warning' && <span className="text-xl">⚠️</span>}
                            {n.type === 'info' && <span className="text-xl">ℹ️</span>}
                            <p className="font-medium text-sm">{n.message}</p>
                        </div>
                        <button
                            onClick={() => removeNotification(n.id)}
                            className="text-current opacity-50 hover:opacity-100 transition"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
};
