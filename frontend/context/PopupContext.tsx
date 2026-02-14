
import React, { createContext, useContext, useState, ReactNode } from 'react';

type PopupType = 'alert' | 'confirm';

interface PopupState {
    isOpen: boolean;
    title: string;
    message: string;
    type: PopupType;
    resolve: (value: boolean) => void;
}

interface PopupContextType {
    showAlert: (title: string, message: string) => Promise<boolean>;
    showConfirm: (title: string, message: string) => Promise<boolean>;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export const usePopup = () => {
    const context = useContext(PopupContext);
    if (!context) {
        throw new Error('usePopup must be used within a PopupProvider');
    }
    return context;
};

export const PopupProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [popup, setPopup] = useState<PopupState>({
        isOpen: false,
        title: '',
        message: '',
        type: 'alert',
        resolve: () => { },
    });

    const showAlert = (title: string, message: string): Promise<boolean> => {
        return new Promise((resolve) => {
            setPopup({
                isOpen: true,
                title,
                message,
                type: 'alert',
                resolve,
            });
        });
    };

    const showConfirm = (title: string, message: string): Promise<boolean> => {
        return new Promise((resolve) => {
            setPopup({
                isOpen: true,
                title,
                message,
                type: 'confirm',
                resolve,
            });
        });
    };

    const handleClose = (value: boolean) => {
        popup.resolve(value);
        setPopup({ ...popup, isOpen: false });
    };

    return (
        <PopupContext.Provider value={{ showAlert, showConfirm }}>
            {children}

            {/* Modal UI */}
            {popup.isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white max-w-md w-full rounded-[40px] shadow-2xl border border-orange-100 overflow-hidden relative moorish-arch-modal">
                        {/* Decorative Top Bar */}
                        <div className="h-2 bg-gradient-to-r from-orange-400 via-orange-600 to-orange-800"></div>

                        <div className="p-8 text-center">
                            <h3 className="text-2xl font-heritage font-bold text-orange-950 mb-4">{popup.title}</h3>
                            <p className="text-orange-900/70 mb-8 leading-relaxed">
                                {popup.message}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                {popup.type === 'confirm' && (
                                    <button
                                        onClick={() => handleClose(false)}
                                        className="px-8 py-3 rounded-2xl text-sm font-bold text-orange-950/60 hover:bg-orange-50 transition-all border border-transparent hover:border-orange-100"
                                    >
                                        Annuler
                                    </button>
                                )}
                                <button
                                    onClick={() => handleClose(true)}
                                    className="px-8 py-3 rounded-2xl text-sm font-black uppercase tracking-widest bg-orange-700 text-white hover:bg-orange-800 transition-all shadow-lg shadow-orange-700/20 active:scale-95"
                                >
                                    {popup.type === 'confirm' ? 'Confirmer' : 'D\'accord'}
                                </button>
                            </div>
                        </div>

                        {/* Subtle Background Pattern */}
                        <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none zellige-pattern rotate-45 select-none"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 opacity-5 pointer-events-none zellige-pattern -rotate-45 select-none"></div>
                    </div>
                </div>
            )}

            <style>{`
                .moorish-arch-modal {
                    clip-path: polygon(0% 100%, 0% 15%, 8% 8%, 25% 3%, 50% 0, 75% 3%, 92% 8%, 100% 15%, 100% 100%);
                    padding-top: 1.5rem;
                }
            `}</style>
        </PopupContext.Provider>
    );
};
