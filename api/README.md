# vomowa-api

## Overview

RESTful API for vomowa - serving political spending data.

## Tech Stack

- Node.js 20
- Express.js
- Prisma ORM
- PostgreSQL
- Redis (caching)

## Endpoints

### Politicians
```
GET /api/politicians              # List all
GET /api/politicians/:id          # Get by ID
GET /api/politicians/:id/spending # Get spending
```

### Spending
```
GET /api/spending                 # List all
GET /api/spending/stats           # Statistics
GET /api/spending/trends          # Trends over time
```

### Notifications
```
POST /api/subscriptions           # Subscribe to alerts
DELETE /api/subscriptions/:id   # Unsubscribe
```

## Installation

```bash
cd api
npm install
cp .env.example .env
npm run db:migrate
npm run dev
```

## License

MIT