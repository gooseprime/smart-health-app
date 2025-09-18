import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Union

class DataProcessor:
    """
    Class for cleaning and aligning time-series data from multiple sources.
    """
    
    def __init__(self):
        """Initialize the DataProcessor class."""
        pass
        
    def clean_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Clean a DataFrame by handling missing values and outliers.
        
        Args:
            df: Input DataFrame to clean
            
        Returns:
            Cleaned DataFrame
        """
        # Make a copy to avoid modifying the original
        df_clean = df.copy()
        
        # Handle missing values
        for col in df_clean.columns:
            if col not in ['date', 'region']:
                # Fill missing values with forward fill, then backward fill
                df_clean[col] = df_clean[col].fillna(method='ffill').fillna(method='bfill')
                
                # If still missing (e.g., at the beginning), fill with median
                if df_clean[col].isna().any():
                    df_clean[col] = df_clean[col].fillna(df_clean[col].median())
        
        # Handle outliers using IQR method for numeric columns
        for col in df_clean.select_dtypes(include=[np.number]).columns:
            Q1 = df_clean[col].quantile(0.25)
            Q3 = df_clean[col].quantile(0.75)
            IQR = Q3 - Q1
            
            # Define outlier bounds
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            
            # Cap outliers at bounds
            df_clean[col] = df_clean[col].clip(lower=lower_bound, upper=upper_bound)
        
        return df_clean
    
    def align_by_date_region(self, data_dict: Dict[str, pd.DataFrame]) -> pd.DataFrame:
        """
        Align multiple DataFrames by date and region.
        
        Args:
            data_dict: Dictionary of DataFrames to align
            
        Returns:
            Single aligned DataFrame
        """
        dfs = []
        
        # Process each DataFrame
        for source, df in data_dict.items():
            if df.empty:
                continue
                
            # Ensure date and region columns exist
            if 'date' not in df.columns or 'region' not in df.columns:
                print(f"Skipping {source} data: missing date or region columns")
                continue
                
            # Clean the data
            df_clean = self.clean_data(df)
            
            # Rename columns to avoid conflicts
            rename_dict = {}
            for col in df_clean.columns:
                if col not in ['date', 'region']:
                    rename_dict[col] = f"{source}_{col}"
            
            df_clean = df_clean.rename(columns=rename_dict)
            dfs.append(df_clean)
        
        if not dfs:
            return pd.DataFrame()
            
        # Merge all DataFrames on date and region
        merged_df = dfs[0]
        for df in dfs[1:]:
            merged_df = pd.merge(merged_df, df, on=['date', 'region'], how='outer')
        
        # Sort by date and region
        merged_df = merged_df.sort_values(['region', 'date'])
        
        return merged_df
    
    def create_time_features(self, df):
        """
        Create time-based features from date column.
        
        Args:
            df: Input DataFrame with a date column
            
        Returns:
            DataFrame with additional time features
        """
        df_with_features = df.copy()
        
        # Ensure date column is datetime type
        if 'date' not in df_with_features.columns:
            raise KeyError("DataFrame must contain a 'date' column")
            
        # Convert date to datetime if it's not already
        if not pd.api.types.is_datetime64_any_dtype(df_with_features['date']):
            df_with_features['date'] = pd.to_datetime(df_with_features['date'])
        
        # Extract date components
        df_with_features['day_of_week'] = df_with_features['date'].dt.dayofweek
        df_with_features['month'] = df_with_features['date'].dt.month
        df_with_features['year'] = df_with_features['date'].dt.year
        df_with_features['day'] = df_with_features['date'].dt.day
        
        # Create seasonal features using sine and cosine transformations
        # This captures the cyclical nature of time features
        df_with_features['day_of_year_sin'] = np.sin(2 * np.pi * df_with_features['date'].dt.dayofyear / 365.25)
        df_with_features['day_of_year_cos'] = np.cos(2 * np.pi * df_with_features['date'].dt.dayofyear / 365.25)
        
        return df_with_features