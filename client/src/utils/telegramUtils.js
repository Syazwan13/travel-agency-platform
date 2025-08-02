// Utility functions for Telegram modal functionality

/**
 * Check if the Telegram notification modal should be shown to the user
 * @param {Object} user - The current user object
 * @returns {boolean} - Whether to show the modal
 */
export const shouldShowTelegramModal = (user) => {
  // Don't show if user is not logged in
  if (!user) return false;
  
  // Don't show if user already has Telegram linked
  if (user.telegramChatId) return false;
  
  // Don't show if user has dismissed it permanently
  const dismissed = localStorage.getItem('telegram_modal_dismissed');
  if (dismissed === 'true') return false;
  
  return true;
};

/**
 * Reset the "don't show again" preference for Telegram modal
 * This allows the modal to be shown again
 */
export const resetTelegramModalPreference = () => {
  localStorage.removeItem('telegram_modal_dismissed');
};

/**
 * Mark the Telegram modal as permanently dismissed
 */
export const dismissTelegramModalPermanently = () => {
  localStorage.setItem('telegram_modal_dismissed', 'true');
};
