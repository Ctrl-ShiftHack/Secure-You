import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download } from 'lucide-react';

export const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return; // Already installed
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show install prompt after 10 seconds
      setTimeout(() => {
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (!dismissed) {
          setShowInstallPrompt(true);
        }
      }, 10000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA installed');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-card border border-border rounded-lg shadow-lg p-4">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Download className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-1">Install SecureYou App</h3>
            <p className="text-xs text-muted-foreground">
              Install our app for quick access, offline support, and a better experience!
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleInstallClick}
            size="sm"
            className="flex-1"
          >
            Install
          </Button>
          <Button
            onClick={handleDismiss}
            variant="outline"
            size="sm"
          >
            Not Now
          </Button>
        </div>
      </div>
    </div>
  );
};
