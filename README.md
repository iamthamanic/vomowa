# vomowa - VolksMoneyWatch

🇩🇪 Transparency Card für deutsche Politik. Echtzeit-Tracking von politischen Ausgaben – inspiriert vom brasilianischen [Congresso em Foco](https://www.congressoemfoco.com.br/).

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-MVP%20in%20Progress-yellow.svg)

## Vision

> Jeder Bürger hat das Recht zu wissen, wie Politiker Steuergeld ausgeben.

**vomowa** macht politische Ausgaben transparent und zugänglich:
- Echtzeit-Benachrichtigungen bei neuen Ausgaben
- Dashboard mit Statistiken und Trends
- Vergleiche: Partei vs. Partei, Bund vs. Land
- Banking-Style Interface für maximale Übersicht

## Datenquellen

| Quelle | Status | Format |
|--------|--------|--------|
| Bundestag (Dienstreisen) | 🟡 In Arbeit | CSV |
| Bundestag (Nebeneinkünfte) | 🔴 Geplant | PDF |
| Landtage | 🔴 Backlog | Verschieden |
| FragDenStaat | 🔴 Backlog | API |

## Tech Stack

```
vomowa/
├── scraper/     # Python + Scrapy (Datenerfassung)
├── api/         # Node.js + Express + Prisma (Backend)
├── web/         # Next.js 15 + Tailwind + shadcn (Frontend)
├── bot/         # Telegram Bot (Notifications)
└── infra/       # Docker + docker-compose
```

## Quick Start

```bash
# Repository klonen
git clone https://github.com/iamthamanic/vomowa.git
cd vomowa

# Mit Docker starten
docker-compose up -d

# Oder lokal entwickeln
cd api && npm install && npm run dev
cd ../web && npm install && npm run dev
```

## Mitmachen

Wir suchen:
- 🐍 Python-Entwickler für Scraper
- ⚛️ Frontend-Entwickler (Next.js)
- 📊 Data-Engineers
- 🔍 Rechercheure für politische Daten

**Issues** und **Pull Requests** sind willkommen!

## Lizenz

MIT License - siehe [LICENSE](./LICENSE)

## Inspiration

- [Congresso em Foco](https://www.congressoemfoco.com.br/) (Brasilien)
- [Abgeordnetenwatch.de](https://www.abgeordnetenwatch.de/)
- [FragDenStaat.de](https://fragdenstaat.de/)

---

**Made with 🦝 by the OpenClaw Community**