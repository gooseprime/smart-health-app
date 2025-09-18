import pandas as pd
import numpy as np
from statsmodels.tsa.arima.model import ARIMA
from typing import Dict, List, Tuple, Optional
import pickle
import os

class ARIMAModel:
    """
    ARIMA model for univariate time series forecasting.
    """
    
    def __init__(self, order: Tuple[int, int, int] = (5, 1, 1)):
        """
        Initialize the ARIMA model.
        
        Args:
            order: ARIMA order (p, d, q)
        """
        self.order = order
        self.models = {}  # Dictionary to store models for each region
        
    def train(self, df: pd.DataFrame, target_col: str = 'cases_cases'):
        """
        Train ARIMA models for each region in the dataset.
        
        Args:
            df: DataFrame with time series data
            target_col: Target column to forecast
        """
        # Group data by region
        grouped = df.groupby('region')
        
        # Train a model for each region
        for region, group_df in grouped:
            print(f"Training ARIMA model for {region}...")
            
            # Sort by date
            group_df = group_df.sort_values('date')
            
            # Extract the target series
            series = group_df[target_col].astype(float)
            
            try:
                # Fit ARIMA model
                model = ARIMA(series, order=self.order)
                fitted_model = model.fit()
                
                # Store the fitted model
                self.models[region] = fitted_model
                print(f"Successfully trained ARIMA model for {region}")
                
            except Exception as e:
                print(f"Error training ARIMA model for {region}: {e}")
    
    def forecast(self, df: pd.DataFrame, horizon: int = 14) -> pd.DataFrame:
        """
        Generate forecasts for each region.
        
        Args:
            df: DataFrame with historical data
            horizon: Forecast horizon in days
            
        Returns:
            DataFrame with forecasts
        """
        forecasts = []
        
        # Group data by region
        grouped = df.groupby('region')
        
        # Generate forecasts for each region
        for region, group_df in grouped:
            if region not in self.models:
                print(f"No trained model found for {region}, skipping...")
                continue
                
            # Sort by date
            group_df = group_df.sort_values('date')
            
            # Get the last date in the data
            last_date = group_df['date'].max()
            
            # Generate forecast dates
            forecast_dates = [last_date + pd.Timedelta(days=i+1) for i in range(horizon)]
            
            try:
                # Generate forecast
                model = self.models[region]
                forecast_result = model.forecast(steps=horizon)
                
                # Create forecast DataFrame
                for i, (date, value) in enumerate(zip(forecast_dates, forecast_result)):
                    forecasts.append({
                        'date': date,
                        'region': region,
                        'forecast': max(0, value),  # Ensure non-negative forecasts
                        'forecast_horizon': i + 1
                    })
                    
            except Exception as e:
                print(f"Error generating forecast for {region}: {e}")
        
        # Convert to DataFrame
        if not forecasts:
            return pd.DataFrame(columns=['date', 'region', 'forecast', 'forecast_horizon'])
            
        forecast_df = pd.DataFrame(forecasts)
        return forecast_df
    
    def save_models(self, path: str = "../models/arima_models.pkl"):
        """
        Save trained models to disk.
        
        Args:
            path: Path to save the models
        """
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, 'wb') as f:
            pickle.dump(self.models, f)
        print(f"Models saved to {path}")
    
    def load_models(self, path: str = "../models/arima_models.pkl"):
        """
        Load trained models from disk.
        
        Args:
            path: Path to load the models from
        """
        if not os.path.exists(path):
            print(f"Model file {path} not found")
            return
            
        with open(path, 'rb') as f:
            self.models = pickle.load(f)
        print(f"Models loaded from {path}")