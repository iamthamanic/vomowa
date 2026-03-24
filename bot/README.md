# vomowa-bot

## Overview

Telegram bot for real-time notifications about political spending.

## Commands

- `/start` - Welcome message
- `/subscribe` - Subscribe to alerts
- `/unsubscribe` - Unsubscribe
- `/latest` - Latest spending
- `/stats` - Quick statistics
- `/help` - Help message

## Tech Stack

- Node.js
- node-telegram-bot-api
- i18n (German)

## Installation

```bash
cd bot
npm install
cp .env.example .env
npm start
```

## Environment Variables

```env
TELEGRAM_BOT_TOKEN=xxx
API_URL=http://api:3001
```

## License

MIT