require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const User = require('./models/userModel');

// Connect to MongoDB if not already connected
if (mongoose.connection.readyState === 0) {
  mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
}

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });
console.log("✅ Telegram bot is running and polling for messages...");

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // If the message looks like an email, try to link it
  if (text && text.includes('@')) {
    try {
      const user = await User.findOneAndUpdate(
        { email: text.trim() },
        { telegramChatId: chatId }
      );
      if (user) {
        bot.sendMessage(chatId, '✅ Your Telegram account is now linked! You will receive notifications here.');
      } else {
        bot.sendMessage(chatId, '❌ Email not found. Please make sure you signed up with this email.');
      }
    } catch (err) {
      bot.sendMessage(chatId, '❌ An error occurred while linking your account. Please try again later.');
    }
  } else {
    bot.sendMessage(chatId, '👋 Please send your email address to link your Telegram account.');
  }
}); 