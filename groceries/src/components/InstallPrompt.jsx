import React from 'react';
import { FaDownload, FaTimes } from 'react-icons/fa';
import { usePWA } from '../hooks/usePWA';

const InstallPrompt = () => {
  const { isInstallable, installApp } = usePWA();
  const [showPrompt, setShowPrompt] = React.useState(false);

  React.useEffect(() => {
    if (isInstallable) {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable]);

  if (!showPrompt || !isInstallable) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FaDownload className="text-xl" />
          <div>
            <h4 className="font-semibold">Install Fresh Katale</h4>
            <p className="text-sm opacity-90">Get the app for faster shopping</p>
          </div>
        </div>
        <button
          onClick={() => setShowPrompt(false)}
          className="text-white/80 hover:text-white"
        >
          <FaTimes />
        </button>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={installApp}
          className="bg-white text-green-600 px-4 py-2 rounded font-medium text-sm flex-1"
        >
          Install
        </button>
        <button
          onClick={() => setShowPrompt(false)}
          className="border border-white/30 px-4 py-2 rounded text-sm"
        >
          Later
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;