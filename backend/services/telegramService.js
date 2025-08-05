const TelegramBot = require('node-telegram-bot-api');
const User = require('../models/userModel');

class TelegramBotService {
  constructor() {
    this.bot = null;
    this.isInitialized = false;
  }

  init() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!token) {
      console.log('⚠️  Telegram bot token not found. Telegram bot will not be started.');
      return;
    }

    try {
      this.bot = new TelegramBot(token, { polling: true });
      this.setupEventHandlers();
      this.isInitialized = true;
      console.log('✅ Telegram bot initialized and polling for messages...');
    } catch (error) {
      console.error('❌ Failed to initialize Telegram bot:', error.message);
    }
  }

  setupEventHandlers() {
    if (!this.bot) return;

    // Handle incoming messages
    this.bot.on('message', async (msg) => {
      const chatId = msg.chat.id;
      const text = msg.text;

      console.log(`Telegram message from ${chatId}: ${text}`);

      // Handle /start command
      if (text === '/start') {
        this.bot.sendMessage(chatId, 
          '👋 Welcome to Travel Agency Bot!\n\n' +
          'To link your account, please send your email address that you used to register on our platform.'
        );
        return;
      }

      // Handle /help command
      if (text === '/help') {
        this.bot.sendMessage(chatId, 
          '🤖 *Travel Agency Bot Help*\n\n' +
          '• Send your email address to link your account\n' +
          '• Once linked, you\'ll receive notifications here\n' +
          '• Use /unlink to disconnect your account\n' +
          '• Use /status to check your link status',
          { parse_mode: 'Markdown' }
        );
        return;
      }

      // Handle /status command
      if (text === '/status') {
        try {
          const user = await User.findOne({ telegramChatId: chatId });
          if (user) {
            this.bot.sendMessage(chatId, 
              `✅ Your account is linked!\n` +
              `📧 Email: ${user.email}\n` +
              `👤 Name: ${user.name}`
            );
          } else {
            this.bot.sendMessage(chatId, '❌ Your account is not linked. Please send your email address to link it.');
          }
        } catch (error) {
          this.bot.sendMessage(chatId, '❌ Error checking status. Please try again later.');
        }
        return;
      }

      // Handle /unlink command
      if (text === '/unlink') {
        try {
          const user = await User.findOneAndUpdate(
            { telegramChatId: chatId },
            { $unset: { telegramChatId: 1 } }
          );
          if (user) {
            this.bot.sendMessage(chatId, '✅ Your account has been unlinked successfully.');
          } else {
            this.bot.sendMessage(chatId, '❌ No linked account found.');
          }
        } catch (error) {
          this.bot.sendMessage(chatId, '❌ Error unlinking account. Please try again later.');
        }
        return;
      }

      // If the message looks like an email, try to link it
      if (text && text.includes('@') && text.includes('.')) {
        try {
          const user = await User.findOneAndUpdate(
            { email: text.trim().toLowerCase() },
            { telegramChatId: chatId },
            { new: true }
          );
          
          if (user) {
            this.bot.sendMessage(chatId, 
              '✅ *Account Linked Successfully!*\n\n' +
              `📧 Email: ${user.email}\n` +
              `👤 Name: ${user.name}\n\n` +
              'You will now receive notifications here for:\n' +
              '• Password reset requests\n' +
              '• Account updates\n' +
              '• Important announcements',
              { parse_mode: 'Markdown' }
            );
          } else {
            this.bot.sendMessage(chatId, 
              '❌ *Email not found*\n\n' +
              'Please make sure you:\n' +
              '• Entered the correct email address\n' +
              '• Have registered an account on our platform\n' +
              '• The email is verified',
              { parse_mode: 'Markdown' }
            );
          }
        } catch (error) {
          console.error('Error linking Telegram account:', error);
          this.bot.sendMessage(chatId, '❌ An error occurred while linking your account. Please try again later.');
        }
      } else {
        this.bot.sendMessage(chatId, 
          '📧 Please send a valid email address to link your account.\n\n' +
          'Example: user@example.com\n\n' +
          'Use /help for more commands.'
        );
      }
    });

    // Handle polling errors
    this.bot.on('polling_error', (error) => {
      console.error('Telegram polling error:', error.message);
    });

    // Handle webhook errors
    this.bot.on('webhook_error', (error) => {
      console.error('Telegram webhook error:', error.message);
    });
  }

  // Method to send notifications to users
  async sendNotification(userId, message) {
    if (!this.isInitialized || !this.bot) {
      console.log('Telegram bot not initialized, skipping notification');
      return false;
    }

    try {
      const user = await User.findById(userId);
      if (user && user.telegramChatId) {
        await this.bot.sendMessage(user.telegramChatId, message, { parse_mode: 'Markdown' });
        console.log(`Telegram notification sent to user ${userId}`);
        return true;
      }
    } catch (error) {
      console.error('Error sending Telegram notification:', error.message);
    }
    return false;
  }

  // Method to send notification by email
  async sendNotificationByEmail(email, message) {
    if (!this.isInitialized || !this.bot) {
      console.log('Telegram bot not initialized, skipping notification');
      return false;
    }

    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (user && user.telegramChatId) {
        await this.bot.sendMessage(user.telegramChatId, message, { parse_mode: 'Markdown' });
        console.log(`Telegram notification sent to email ${email}`);
        return true;
      }
    } catch (error) {
      console.error('Error sending Telegram notification:', error.message);
    }
    return false;
  }

  // Method to broadcast message to all linked users
  async broadcastMessage(message) {
    if (!this.isInitialized || !this.bot) {
      console.log('Telegram bot not initialized, skipping broadcast');
      return 0;
    }

    try {
      const users = await User.find({ telegramChatId: { $exists: true } });
      let sentCount = 0;

      for (const user of users) {
        try {
          await this.bot.sendMessage(user.telegramChatId, message, { parse_mode: 'Markdown' });
          sentCount++;
        } catch (error) {
          console.error(`Failed to send broadcast to ${user.email}:`, error.message);
        }
      }

      console.log(`Broadcast sent to ${sentCount} users`);
      return sentCount;
    } catch (error) {
      console.error('Error broadcasting message:', error.message);
      return 0;
    }
  }

  // Graceful shutdown
  shutdown() {
    if (this.bot) {
      console.log('Shutting down Telegram bot...');
      this.bot.stopPolling();
      this.isInitialized = false;
      console.log('Telegram bot stopped');
    }
  }
}

// Export singleton instance
const telegramBotService = new TelegramBotService();
module.exports = telegramBotService;
