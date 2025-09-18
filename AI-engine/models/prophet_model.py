import pandas as pd
import numpy as np
from prophet import Prophet
from typing import Dict, List, Optional
import pickle
import os

class ProphetModel:
    """
    Prophet model for univariate time series forecasting with seasonality.
    """
    
    def __init__(self):
        """Initialize the Prophet model."""
        self.models = {}  # Dictionary to store models for each region
        
    def train(self, df: pd.DataFrame, target_col: str = 'cases_cases'):
        """
        Train Prophet models for each region in the dataset.
        
        Args:
            df: DataFrame with time series data
            target_col: Target column to forecast
        """
        # Group data by region
        grouped = df.groupby('region')
        
        # Train a model for each region
        for region, group_df in grouped:
            print(f"Training Prophet model for {region}...")
            
            # Sort by date
            group_df = group_df.sort_values('date')
            
            # Prepare data for Prophet (requires 'ds' and 'y' columns)
            prophet_df = group_df[['date', target_col]].rename(columns={'date': 'ds', target_col: 'y'})
            
            try:
                # Initialize and fit Prophet model
                model = Prophet(
                    yearly_seasonality=True,
                    weekly_seasonality=True,
                    daily_seasonality=False,
                    seasonality_mode='multiplicative'
                )
                
                # Add additional regressors if available
                for col in group_df.columns:
                    if col in ['temperature', 'humidity', 'precipitation', 'viral_load']:
                        if f'{col}' in group_df.columns:
                            model.add_regressor(col)
                
                model.fit(prophet_df)
                
                # Store the fitted model
                self.models[region] = model
                print(f"Successfully trained Prophet model for {region}")
                
            except Exception as e:
                print(f"Error training Prophet model for {region}: {e}")
    
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
            
            try:
                # Create future dataframe
                model = self.models[region]
                future = model.make_future_dataframe(periods=horizon)
                
                # Add regressors to future dataframe if they were used in training
                for regressor in model.extra_regressors:
                    if regressor['name'] in group_df.columns:
                        # For simplicity, use the last value for future predictions
                        # In a real application, you might want to forecast these values separately
                        last_value = group_df[regressor['name']].iloc[-1]
                        future[regressor['name']] = last_value
                
                # Generate forecast
                forecast_result = model.predict(future)
                
                # Extract the forecast for the horizon period
                forecast_result = forecast_result.tail(horizon)
                
                # Create forecast DataFrame
                for i, (date, value) in enumerate(zip(forecast_result['ds'], forecast_result['yhat'])):
                    forecasts.append({
                        'date': date,
                        'region': region,
                        'forecast': max(0, value),  # Ensure non-negative forecasts
                        'forecast_lower': max(0, forecast_result['yhat_lower'].iloc[i]),
                        'forecast_upper': max(0, forecast_result['yhat_upper'].iloc[i]),
                        'forecast_horizon': i + 1
                    })
                    
            except Exception as e:
                print(f"Error generating forecast for {region}: {e}")
        
        # Convert to DataFrame
        if not forecasts:
            return pd.DataFrame(columns=['date', 'region', 'forecast', 'forecast_lower', 'forecast_upper', 'forecast_horizon'])
            
        forecast_df = pd.DataFrame(forecasts)
        return forecast_df
    
    def save_models(self, path: str = "../models/prophet_models.pkl"):
        """
        Save trained models to disk.
        
        Args:
            path: Path to save the models
        """
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, 'wb') as f:
            pickle.dump(self.models, f)
        print(f"Models saved to {path}")
    
    def load_models(self, path: str = "../models/prophet_models.pkl"):
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