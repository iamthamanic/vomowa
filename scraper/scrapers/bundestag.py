import os
import requests
import pandas as pd
from io import StringIO
from typing import List, Dict, Optional
from datetime import datetime
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv

load_dotenv()

class BundestagScraper:
    """Scraper for Bundestag travel expenses (Dienstreisen)"""
    
    BASE_URL = "https://www.bundestag.de/abgeordnete/dienstreisen"
    
    def __init__(self):
        self.db_url = os.getenv('DATABASE_URL', 'postgresql://vomowa:vomowa_password@localhost:5432/vomowa')
        self.conn = None
        
    def connect_db(self):
        """Connect to PostgreSQL database"""
        self.conn = psycopg2.connect(self.db_url)
        
    def close_db(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()
    
    def get_politician_id(self, name: str, party: str) -> Optional[str]:
        """Get or create politician and return ID"""
        cursor = self.conn.cursor()
        
        # Check if politician exists
        cursor.execute(
            "SELECT id FROM \"Politician\" WHERE name = %s",
            (name,)
        )
        result = cursor.fetchone()
        
        if result:
            return result[0]
        
        # Create new politician
        cursor.execute(
            """INSERT INTO \"Politician\" (name, party, state, photo_url, \"bundestagId\") 
               VALUES (%s, %s, NULL, NULL, NULL) 
               RETURNING id""",
            (name, party)
        )
        
        self.conn.commit()
        return cursor.fetchone()[0]
    
    def fetch_travel_data(self) -> pd.DataFrame:
        """Fetch travel data from Bundestag CSV"""
        # The Bundestag provides CSV data
        # Note: In production, this would need to handle the actual URL/dynamic fetching
        # For MVP, we'll simulate with known structure
        
        csv_url = f"{self.BASE_URL}/data.csv"
        
        try:
            response = requests.get(csv_url, timeout=30)
            response.raise_for_status()
            
            # Parse CSV
            df = pd.read_csv(StringIO(response.content.decode('utf-8')))
            return df
            
        except requests.exceptions.RequestException as e:
            print(f"Error fetching CSV: {e}")
            # Return empty DataFrame with expected columns
            return pd.DataFrame(columns=[
                'name', 'party', 'date', 'destination', 'purpose', 'cost'
            ])
    
    def parse_travel_data(self, df: pd.DataFrame) -> List[Dict]:
        """Parse and clean travel data"""
        if df.empty:
            return []
        
        records = []
        
        for _, row in df.iterrows():
            try:
                # Map CSV columns to our schema
                # Adjust column names based on actual Bundestag CSV structure
                record = {
                    'name': str(row.get('name', '')).strip(),
                    'party': str(row.get('party', '')).strip(),
                    'date': pd.to_datetime(row.get('date', ''), errors='coerce'),
                    'destination': str(row.get('destination', '')).strip(),
                    'purpose': str(row.get('purpose', '')).strip(),
                    'cost': float(row.get('cost', 0)) if pd.notna(row.get('cost')) else 0
                }
                
                if record['name'] and record['date']:
                    records.append(record)
                    
            except Exception as e:
                print(f"Error parsing row: {e}")
                continue
        
        return records
    
    def save_to_database(self, records: List[Dict]) -> int:
        """Save records to database"""
        if not records:
            print("No records to save")
            return 0
        
        cursor = self.conn.cursor()
        saved_count = 0
        
        for record in records:
            try:
                # Get or create politician
                politician_id = self.get_politician_id(
                    record['name'],
                    record['party']
                )
                
                if not politician_id:
                    continue
                
                # Check if spending already exists (avoid duplicates)
                cursor.execute(
                    """SELECT id FROM \"Spending\" 
                       WHERE \"politicianId\" = %s 
                       AND date = %s 
                       AND amount = %s""",
                    (politician_id, record['date'], record['cost'])
                )
                
                if cursor.fetchone():
                    continue  # Skip duplicate
                
                # Insert spending record
                cursor.execute(
                    """INSERT INTO \"Spending\" 
                       (\"politicianId\", amount, currency, category, date, 
                        description, destination, \"sourceUrl\")
                       VALUES (%s, %s, 'EUR', 'dienstreise', %s, %s, %s, %s)""",
                    (
                        politician_id,
                        record['cost'],
                        record['date'],
                        record['purpose'],
                        record['destination'],
                        self.BASE_URL
                    )
                )
                
                saved_count += 1
                
            except Exception as e:
                print(f"Error saving record: {e}")
                continue
        
        self.conn.commit()
        return saved_count
    
    def run(self):
        """Run full scraping process"""
        print(f"[{datetime.now()}] Starting Bundestag scraper...")
        
        try:
            self.connect_db()
            
            # Fetch data
            print("Fetching travel data...")
            df = self.fetch_travel_data()
            print(f"Fetched {len(df)} rows")
            
            # Parse records
            records = self.parse_travel_data(df)
            print(f"Parsed {len(records)} valid records")
            
            # Save to database
            saved = self.save_to_database(records)
            print(f"Saved {saved} new records")
            
            return {
                'status': 'success',
                'fetched': len(df),
                'parsed': len(records),
                'saved': saved
            }
            
        except Exception as e:
            print(f"Error during scraping: {e}")
            return {
                'status': 'error',
                'message': str(e)
            }
            
        finally:
            self.close_db()


def main():
    """CLI entry point"""
    scraper = BundestagScraper()
    result = scraper.run()
    print(result)


if __name__ == '__main__':
    main()