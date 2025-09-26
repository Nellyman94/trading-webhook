const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const payload = req.body;
  const chatId = 1758858576;  // Replace with your Telegram chat ID
  const botToken = process.env.TELEGRAM_TOKEN;
  const aiApiKey = process.env.AI_API_KEY;

  let message = `🚨 Trading Alert: ${payload.action?.toUpperCase()} ${payload.symbol} at $${payload.price}\nRSI: ${payload.rsi}\nTime: ${new Date(payload.time).toLocaleString()}`;

  if (aiApiKey) {
    try {
      const aiResponse = await axios.post('https://api.x.ai/v1/chat/completions', {
        model: 'grok-beta',
        messages: [{ role: 'user', content: `Analyze trading signal: ${payload.action} on ${payload.symbol} at ${payload.price}. Predict upside/downside risk based on RSI ${payload.rsi}. Keep response under 100 chars.` }],
      }, { headers: { Authorization: `Bearer ${aiApiKey}` } });
      message += `\n🤖 AI Insight: ${aiResponse.data.choices[0].message.content}`;
    } catch (err) {
      message += '\n🤖 AI: Analysis unavailable.';
    }
  }

  const bot = new TelegramBot(botToken);
  await bot.sendMessage(chatId, message);

  res.status(200).json({ received: true, message: 'Alert forwarded to Telegram' });
};
