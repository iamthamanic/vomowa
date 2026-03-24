#!/usr/bin/env python3
"""vomowa scraper - Main entry point"""

import sys
import argparse
from scrapers.bundestag import BundestagScraper

def main():
    parser = argparse.ArgumentParser(description='vomowa data scraper')
    parser.add_argument(
        'source',
        choices=['bundestag', 'all'],
        help='Data source to scrape'
    )
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Verbose output'
    )
    
    args = parser.parse_args()
    
    if args.source in ['bundestag', 'all']:
        print("Running Bundestag scraper...")
        scraper = BundestagScraper()
        result = scraper.run()
        
        if args.verbose:
            print("\nResult:", result)
        
        if result['status'] == 'error':
            sys.exit(1)
    
    print("Scraping complete!")

if __name__ == '__main__':
    main()