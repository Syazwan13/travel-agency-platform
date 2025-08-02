import React, { useState, useRef } from "react";
import { dismissTelegramModalPermanently, shouldShowTelegramModal, resetTelegramModalPreference } from "../../utils/telegramUtils";

const TELEGRAM_BOT_LINK = "https://t.me/Travelagencypackagesbot"; // TODO: Replace with your actual bot username

const TelegramNotificationModal = ({ isOpen, onClose, refreshUser, user }) => {
  const [polling, setPolling] = useState(false);
  const intervalRef = useRef(null);

  const handleConnectClick = () => {
    window.open(TELEGRAM_BOT_LINK, "_blank");
    setPolling(true);
    let attempts = 0;
    intervalRef.current = setInterval(async () => {
      await refreshUser();
      attempts++;
      if (user && user.telegramChatId) {
        clearInterval(intervalRef.current);
        setPolling(false);
        onClose();
      }
      if (attempts > 10) {
        clearInterval(intervalRef.current);
        setPolling(false);
      }
    }, 3000);
  };

  const handleDontShowAgain = () => {
    // Store preference in localStorage using utility function
    dismissTelegramModalPermanently();
    onClose();
  };

  // Hide modal if not open or already linked
  if (!isOpen) return null;
  if (user && user.telegramChatId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16c-.169 1.858-.896 6.728-.896 6.728-.377 2.618-1.407 3.07-2.296 3.07-.613 0-1.315-.613-2.296-1.315l-3.68-2.296c-.981-.613-1.407-1.407-.613-2.296l7.728-7.728c.377-.377.896-.377 1.315 0l.613.613c.377.377.377.896 0 1.315z"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Get Notified on Telegram!</h2>
          <p className="text-gray-600 mb-6">
            Connect your Telegram account to receive instant updates about your bookings and packages.
          </p>
        </div>
        <button
          onClick={handleConnectClick}
          className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded text-center mb-3"
          disabled={polling}
        >
          {polling ? "Checking..." : "Connect Telegram"}
        </button>
        
        <button
          onClick={handleDontShowAgain}
          className="block w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-4 rounded text-center"
          disabled={polling}
        >
          Don't show again
        </button>
        
        <p className="text-xs text-gray-500 mt-2 text-center">
          After clicking Connect, please send your email address to the bot to complete the connection.
        </p>
      </div>
    </div>
  );
};

// Re-export utility functions for convenience
export { shouldShowTelegramModal, resetTelegramModalPreference };

export default TelegramNotificationModal; 