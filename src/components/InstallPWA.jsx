import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';

export const InstallPWA = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            // Prevenir que el navegador muestre su propio prompt
            e.preventDefault();
            // Guardar el evento para dispararlo después
            setDeferredPrompt(e);
            setShowInstallPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Mostrar el prompt de instalación
        deferredPrompt.prompt();

        // Esperar a que el usuario responda
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('Usuario aceptó la instalación');
        } else {
            console.log('Usuario rechazó la instalación');
        }

        // Limpiar el prompt
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
    };

    const handleDismiss = () => {
        setShowInstallPrompt(false);
        // Guardar en localStorage que el usuario no quiere ver el prompt por un tiempo
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    };

    useEffect(() => {
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (dismissed) {
            const dismissedTime = parseInt(dismissed);
            const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

            // Si han pasado más de 7 días, mostrar el prompt de nuevo
            if (daysSinceDismissed < 7) {
                setShowInstallPrompt(false);
            }
        }
    }, []);

    if (!showInstallPrompt) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-in slide-in-from-bottom">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-purple-200 dark:border-purple-600 p-4">
                <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Download className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-1">
                        <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1">
                            ¡Instala la App! 📱
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                            Accede rápidamente a tus herramientas desde tu pantalla de inicio
                        </p>

                        <div className="flex gap-2">
                            <button
                                onClick={handleInstallClick}
                                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
                            >
                                Instalar
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                            >
                                Ahora no
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleDismiss}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    </button>
                </div>
            </div>
        </div>
    );
};
