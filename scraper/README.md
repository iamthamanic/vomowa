# vomowa-scraper

## Overview

Python-based data scraper for collecting political spending data from German government sources.

## Supported Sources

- [x] Bundestag Dienstreisen (CSV)
- [ ] Bundestag Nebeneinkünfte (PDF + OCR)
- [ ] Landtage (16 Bundesländer)
- [ ] FragDenStaat API

## Tech Stack

- Python 3.12
- Scrapy
- BeautifulSoup4
- Pandas
- SQLAlchemy

## Installation

```bash
cd scraper
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Usage

```bash
# Run Bundestag scraper
python -m scrapers.bundestag

# Run all scrapers
python -m scrapers.all
```

## Data Flow

```
Source → Scraper → Parser → Validator → Database
```

## License

MIT