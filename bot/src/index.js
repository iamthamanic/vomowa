const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const cron = require('node-cron');
require('dotenv').config();

const API_URL = process.env.API_URL || 'http://api:3001';
const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error('TELEGRAM_BOT_TOKEN is required');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

// Store user subscriptions (in production, use database)
const userSubscriptions = new Map();

// Commands
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const welcome = `
🦝 *Willkommen bei vomowa!*

Ich benachrichtige dich über neue politische Ausgaben.

*Verfügbare Befehle:*
/subscribe - Benachrichtigungen aktivieren
/unsubscribe - Benachrichtigungen deaktivieren
/latest - Neueste Ausgaben anzeigen
/stats - Statistiken anzeigen
/help - Hilfe anzeigen

_Dein VolksMoneyWatch Bot_ 🏛️
  `;
  
  bot.sendMessage(chatId, welcome, { parse_mode: 'Markdown' });
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const help = `
📋 *vomowa Hilfe*

*/subscribe* - Aktiviere Benachrichtigungen für neue Ausgaben
*/unsubscribe* - Deaktiviere alle Benachrichtigungen
*/latest* - Zeige die 10 neuesten Ausgaben
*/stats* - Zeige Statistiken über politische Ausgaben
*/help* - Zeige diese Hilfe

*Hinweis:* Alle Daten stammen vom Bundestag und sind öffentlich zugänglich.
  `;
  
  bot.sendMessage(chatId, help, { parse_mode: 'Markdown' });
});

bot.onText(/\/subscribe/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    // Subscribe user via API
    await axios.post(`${API_URL}/api/subscriptions`, {
      telegramId: chatId.toString(),
      preferences: {
        minAmount: 500,
        categories: [],
        parties: [],
        politicians: []
      }
    });
    
    userSubscriptions.set(chatId, true);
    
    bot.sendMessage(
      chatId,
      '✅ *Abonniert!*\n\nDu erhältst jetzt Benachrichtigungen über neue politische Ausgaben.',
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    console.error('Error subscribing:', error.message);
    bot.sendMessage(
      chatId,
      '❌ Fehler beim Abonnieren. Bitte versuche es später erneut.'
    );
  }
});

bot.onText(/\/unsubscribe/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    // Find and delete subscription
    const response = await axios.get(`${API_URL}/api/subscriptions`);
    const subscriptions = response.data?.data || [];
    
    const subscription = subscriptions.find(s => s.telegramId === chatId.toString());
    
    if (subscription) {
      await axios.delete(`${API_URL}/api/subscriptions/${subscription.id}`);
    }
    
    userSubscriptions.delete(chatId);
    
    bot.sendMessage(
      chatId,
      '❎ *Abmeldung erfolgreich*\n\nDu erhältst keine Benachrichtigungen mehr.',
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    console.error('Error unsubscribing:', error.message);
    bot.sendMessage(
      chatId,
      '❌ Fehler beim Abmelden.'
    );
  }
});

bot.onText(/\/latest/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const response = await axios.get(`${API_URL}/api/spending?limit=10`);
    const spending = response.data?.data || [];
    
    if (spending.length === 0) {
      return bot.sendMessage(chatId, '📭 Keine Daten verfügbar.');
    }
    
    let message = '📊 *Neueste Ausgaben*\n\n';
    
    spending.forEach((item, index) => {
      const date = new Date(item.date).toLocaleDateString('de-DE');
      const amount = new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR'
      }).format(item.amount);
      
      message += `${index + 1}. *${item.politician?.name || 'Unbekannt'}* (${item.politician?.party || '-'})
💶 ${amount} | 📅 ${date}
📝 ${item.description || 'Dienstreise'} ${item.destination ? `→ ${item.destination}` : ''}\n\n`;
    });
    
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Error fetching latest:', error.message);
    bot.sendMessage(chatId, '❌ Fehler beim Abrufen der Daten.');
  }
});

bot.onText(/\/stats/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const response = await axios.get(`${API_URL}/api/spending/stats`);
    const stats = response.data;
    
    const totalAmount = new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(stats.summary?.totalAmount || 0);
    
    const message = `
📈 *Statistiken*

💰 *Gesamtausgaben:* ${totalAmount}
📝 *Transaktionen:* ${(stats.summary?.totalTransactions || 0).toLocaleString('de-DE')}

*Top 3 Ausgabenkategorien:*
${(stats.byCategory?.slice(0, 3) || []).map((cat, i) => {
  const amount = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(cat._sum?.amount || 0);
  return `${i + 1}. ${cat.category}: ${amount}`;
}).join('\n')}

*Top 3 Spender:*
${(stats.topSpenders?.slice(0, 3) || []).map((s, i) => {
  const amount = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(s._sum?.amount || 0);
  return `${i + 1}. ${s.politician?.name || 'Unbekannt'}: ${amount}`;
}).join('\n')}
    `;
    
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Error fetching stats:', error.message);
    bot.sendMessage(chatId, '❌ Fehler beim Abrufen der Statistiken.');
  }
});

// Scheduled job to check for new spending (runs every hour)
cron.schedule('0 * * * *', async () => {
  console.log('Checking for new spending...');
  
  // In production, this would:
  // 1. Query last check timestamp
  // 2. Fetch spending since then
  // 3. Send notifications to subscribers
  
  console.log(`Active subscriptions: ${userSubscriptions.size}`);
});

// Error handling
bot.on('error', (error) => {
  console.error('Bot error:', error);
});

bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

console.log('🤖 vomowa bot is running...');

module.exports = bot;