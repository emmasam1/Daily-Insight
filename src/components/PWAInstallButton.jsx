import React, { useState, useEffect } from 'react';

const PWAInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      // Prevent browser's mini-infobar from appearing automatically
      e.preventDefault();
      // Save the event to trigger later
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    // Trigger the native browser install prompt
    deferredPrompt.prompt();
    
    // Wait for user choice
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false); // Hide button after installation
    }
    setDeferredPrompt(null);
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={handleInstall}
      className="fixed bottom-6 right-6 z-50 bg-black text-white px-6 py-3 rounded-full shadow-2xl hover:bg-gray-800 transition-all duration-300 font-medium tracking-tight border border-gray-700"
    >
      Install App
    </button>
  );
};

export default PWAInstallButton;