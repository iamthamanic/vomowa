# vomowa-infra

## Infrastructure as Code

Docker Compose setup for local development.

## Services

- PostgreSQL 15 (Database)
- Redis 7 (Cache/Queue)
- API (Node.js)
- Web (Next.js)
- Scraper (Python)

## Usage

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Reset data
docker-compose down -v
```

## Production

TBD - Kubernetes/Helm charts

## License

MIT