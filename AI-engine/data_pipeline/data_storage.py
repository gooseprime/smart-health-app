import pandas as pd
import sqlite3
import os
from typing import Optional

class DataStorage:
    """
    Class for storing processed time-series data in various formats.
    Supports CSV and SQLite storage.
    """
    
    def __init__(self, output_dir: str = "../data"):
        """
        Initialize the DataStorage class.
        
        Args:
            output_dir: Directory where output files will be stored
        """
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
        
    def save_to_csv(self, df: pd.DataFrame, filename: str) -> str:
        """
        Save DataFrame to CSV file.
        
        Args:
            df: DataFrame to save
            filename: Name of the output file
            
        Returns:
            Path to the saved file
        """
        if not filename.endswith('.csv'):
            filename += '.csv'
            
        output_path = os.path.join(self.output_dir, filename)
        df.to_csv(output_path, index=False)
        print(f"Data saved to {output_path}")
        return output_path
    
    def save_to_sqlite(self, df: pd.DataFrame, table_name: str, db_name: str = "outbreak_data.db") -> str:
        """
        Save DataFrame to SQLite database.
        
        Args:
            df: DataFrame to save
            table_name: Name of the table in the database
            db_name: Name of the database file
            
        Returns:
            Path to the database file
        """
        db_path = os.path.join(self.output_dir, db_name)
        
        # Connect to SQLite database
        conn = sqlite3.connect(db_path)
        
        # Save DataFrame to database
        df.to_sql(table_name, conn, if_exists='replace', index=False)
        
        # Create index on date and region for faster queries
        cursor = conn.cursor()
        cursor.execute(f"CREATE INDEX IF NOT EXISTS idx_{table_name}_date_region ON {table_name} (date, region)")
        conn.commit()
        conn.close()
        
        print(f"Data saved to SQLite database {db_path}, table {table_name}")
        return db_path
    
    def load_from_sqlite(self, table_name: str, db_name: str = "outbreak_data.db") -> pd.DataFrame:
        """
        Load data from SQLite database.
        
        Args:
            table_name: Name of the table to load
            db_name: Name of the database file
            
        Returns:
            DataFrame with loaded data
        """
        db_path = os.path.join(self.output_dir, db_name)
        
        if not os.path.exists(db_path):
            print(f"Database file {db_path} does not exist")
            return pd.DataFrame()
        
        # Connect to SQLite database
        conn = sqlite3.connect(db_path)
        
        # Load data from database
        query = f"SELECT * FROM {table_name}"
        try:
            df = pd.read_sql_query(query, conn)
            print(f"Data loaded from SQLite database {db_path}, table {table_name}")
        except Exception as e:
            print(f"Error loading data from SQLite: {e}")
            df = pd.DataFrame()
        finally:
            conn.close()
            
        return df