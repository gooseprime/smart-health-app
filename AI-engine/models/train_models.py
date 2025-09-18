import pandas as pd
import numpy as np
import os
import sys
import argparse
from datetime import datetime

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from data_pipeline.pipeline import DataPipeline
from models.arima_model import ARIMAModel
from models.prophet_model import ProphetModel
from models.lstm_model import LSTMModel
from models.model_evaluation import ModelEvaluator

def train_and_evaluate_models(data_path=None, forecast_horizons=[7, 14], save_forecasts=True):
    """
    Train and evaluate all models on the provided data.
    
    Args:
        data_path: Path to processed data (if None, run the data pipeline)
        forecast_horizons: List of forecast horizons to evaluate
        save_forecasts: Whether to save forecasts to disk
    """
    print("=" * 50)
    print("OUTBREAK PREDICTION MODEL TRAINING")
    print("=" * 50)
    
    # Step 1: Load or process data
    if data_path is None:
        print("\nStep 1: Running data pipeline to process data...")
        pipeline = DataPipeline()
        data = pipeline.run_pipeline()
    else:
        print(f"\nStep 1: Loading processed data from {data_path}...")
        if data_path.endswith('.csv'):
            data = pd.read_csv(data_path, parse_dates=['date'])
        else:
            # Assume SQLite
            from data_pipeline.data_storage import DataStorage
            storage = DataStorage()
            data = storage.load_from_sqlite('processed_data')
    
    print(f"Data loaded with shape: {data.shape}")
    print(f"Columns: {data.columns.tolist()}")
    
    # Step 2: Split data into train and test sets
    print("\nStep 2: Splitting data into train and test sets...")
    
    # Group by region
    regions = data['region'].unique()
    print(f"Found {len(regions)} regions: {regions}")
    
    train_data = {}
    test_data = {}
    
    for region in regions:
        region_data = data[data['region'] == region].sort_values('date')
        
        # Use the last 30 days as test data
        split_idx = len(region_data) - 30
        
        if split_idx <= 0:
            print(f"Not enough data for region {region}, skipping...")
            continue
            
        train_data[region] = region_data.iloc[:split_idx]
        test_data[region] = region_data.iloc[split_idx:]
    
    # Combine all regions
    train_df = pd.concat([df for df in train_data.values()])
    test_df = pd.concat([df for df in test_data.values()])
    
    print(f"Train data shape: {train_df.shape}")
    print(f"Test data shape: {test_df.shape}")
    
    # Step 3: Train models
    print("\nStep 3: Training models...")
    
    # Initialize models
    arima_model = ARIMAModel()
    prophet_model = ProphetModel()
    lstm_model = LSTMModel()
    
    # Train ARIMA model
    print("\nTraining ARIMA model...")
    arima_model.train(train_df)
    
    # Train Prophet model
    print("\nTraining Prophet model...")
    prophet_model.train(train_df)
    
    # Train LSTM model
    print("\nTraining LSTM model...")
    feature_cols = [col for col in train_df.columns if col not in ['date', 'region', 'cases']]
    lstm_model.train(train_df, feature_cols=feature_cols)
    
    # Step 4: Generate forecasts
    print("\nStep 4: Generating forecasts...")
    
    forecasts = {}
    
    # Generate forecasts for each horizon
    for horizon in forecast_horizons:
        print(f"\nGenerating {horizon}-day forecasts...")
        
        # ARIMA forecasts
        arima_forecast = arima_model.forecast(train_df, horizon=horizon)
        arima_forecast['model'] = 'ARIMA'
        
        # Prophet forecasts
        prophet_forecast = prophet_model.forecast(train_df, horizon=horizon)
        prophet_forecast['model'] = 'Prophet'
        
        # LSTM forecasts
        lstm_forecast = lstm_model.forecast(train_df, horizon=horizon, feature_cols=feature_cols)
        lstm_forecast['model'] = 'LSTM'
        
        # Combine all forecasts
        combined_forecast = pd.concat([arima_forecast, prophet_forecast, lstm_forecast])
        forecasts[horizon] = combined_forecast
        
        if save_forecasts:
            output_dir = "../data"
            os.makedirs(output_dir, exist_ok=True)
            combined_forecast.to_csv(f"{output_dir}/forecast_{horizon}day.csv", index=False)
            print(f"Saved {horizon}-day forecasts to {output_dir}/forecast_{horizon}day.csv")
    
    # Step 5: Evaluate forecasts
    print("\nStep 5: Evaluating forecasts...")
    
    evaluator = ModelEvaluator()
    evaluation_results = {}
    
    for horizon, forecast_df in forecasts.items():
        print(f"\nEvaluating {horizon}-day forecasts...")
        
        # Filter test data to match forecast dates
        test_dates = forecast_df['date'].unique()
        test_subset = test_df[test_df['date'].isin(test_dates)]
        
        if test_subset.empty:
            print(f"No matching test data for {horizon}-day horizon")
            continue
        
        # Evaluate by model
        for model in forecast_df['model'].unique():
            model_forecast = forecast_df[forecast_df['model'] == model]
            
            metrics = evaluator.evaluate(test_subset, model_forecast)
            evaluation_results[f"{model}_{horizon}day"] = metrics
            
            # Print summary
            print(f"\n{model} {horizon}-day forecast metrics:")
            for region, region_metrics in metrics.items():
                for horizon_key, horizon_metrics in region_metrics.items():
                    print(f"  {region} - {horizon_key}:")
                    for metric_name, metric_value in horizon_metrics.items():
                        print(f"    {metric_name}: {metric_value:.4f}")
    
    # Step 6: Save models
    print("\nStep 6: Saving models...")
    
    models_dir = "../models"
    os.makedirs(models_dir, exist_ok=True)
    
    arima_model.save_models(f"{models_dir}/arima_models.pkl")
    prophet_model.save_models(f"{models_dir}/prophet_models.pkl")
    lstm_model.save_models(f"{models_dir}/lstm_models")
    
    print("\nModel training and evaluation completed!")
    return forecasts, evaluation_results

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Train and evaluate outbreak prediction models')
    parser.add_argument('--data_path', type=str, help='Path to processed data')
    parser.add_argument('--horizons', type=int, nargs='+', default=[7, 14], 
                        help='Forecast horizons to evaluate')
    
    args = parser.parse_args()
    
    train_and_evaluate_models(args.data_path, args.horizons)