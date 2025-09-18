import pandas as pd
import os
from datetime import datetime
from typing import Dict, List, Optional, Union

class DataIngestion:
    """
    Class for ingesting time-series data from multiple sources.
    Supports case counts, weather data, and wastewater viral load data.
    """
    
    def __init__(self, data_dir: str = "../data"):
        """
        Initialize the DataIngestion class.
        
        Args:
            data_dir: Directory where data files are stored
        """
        self.data_dir = data_dir
        
    def load_case_data(self, file_path: Optional[str] = None) -> pd.DataFrame:
        """
        Load case count data from CSV file.
        
        Args:
            file_path: Path to the case data file
            
        Returns:
            DataFrame with case data
        """
        if file_path is None:
            file_path = os.path.join(self.data_dir, "case_counts.csv")
            
        try:
            df = pd.read_csv(file_path, parse_dates=['date'])
            print(f"Successfully loaded case data from {file_path}")
            return df
        except Exception as e:
            print(f"Error loading case data: {e}")
            # Return empty DataFrame with expected columns
            return pd.DataFrame(columns=['date', 'region', 'cases'])
    
    def load_weather_data(self, file_path: Optional[str] = None) -> pd.DataFrame:
        """
        Load weather data from CSV file.
        
        Args:
            file_path: Path to the weather data file
            
        Returns:
            DataFrame with weather data
        """
        if file_path is None:
            file_path = os.path.join(self.data_dir, "weather_data.csv")
            
        try:
            df = pd.read_csv(file_path, parse_dates=['date'])
            print(f"Successfully loaded weather data from {file_path}")
            return df
        except Exception as e:
            print(f"Error loading weather data: {e}")
            # Return empty DataFrame with expected columns
            return pd.DataFrame(columns=['date', 'region', 'temperature', 'humidity', 'precipitation'])
    
    def load_wastewater_data(self, file_path: Optional[str] = None) -> pd.DataFrame:
        """
        Load wastewater viral load data from CSV file.
        
        Args:
            file_path: Path to the wastewater data file
            
        Returns:
            DataFrame with wastewater viral load data
        """
        if file_path is None:
            file_path = os.path.join(self.data_dir, "wastewater_data.csv")
            
        try:
            df = pd.read_csv(file_path, parse_dates=['date'])
            print(f"Successfully loaded wastewater data from {file_path}")
            return df
        except Exception as e:
            print(f"Error loading wastewater data: {e}")
            # Return empty DataFrame with expected columns
            return pd.DataFrame(columns=['date', 'region', 'viral_load'])
    
    def load_all_data(self) -> Dict[str, pd.DataFrame]:
        """
        Load all available data sources.
        
        Returns:
            Dictionary with all loaded data frames
        """
        return {
            'cases': self.load_case_data(),
            'weather': self.load_weather_data(),
            'wastewater': self.load_wastewater_data()
        }