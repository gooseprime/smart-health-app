import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping
from sklearn.preprocessing import MinMaxScaler
import os
from typing import Dict, List, Tuple, Optional

class LSTMModel:
    """
    LSTM model for multivariate time series forecasting.
    """
    
    def __init__(self, sequence_length: int = 14, n_features: Optional[int] = None):
        """
        Initialize the LSTM model.
        
        Args:
            sequence_length: Number of time steps to use as input
            n_features: Number of features (will be determined from data if None)
        """
        self.sequence_length = sequence_length
        self.n_features = n_features
        self.models = {}  # Dictionary to store models for each region
        self.scalers = {}  # Dictionary to store scalers for each region
        
    def _create_sequences(self, data: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Create sequences for LSTM input.
        
        Args:
            data: Input data array
            
        Returns:
            Tuple of (X, y) where X is the input sequences and y is the target values
        """
        X, y = [], []
        for i in range(len(data) - self.sequence_length):
            X.append(data[i:i + self.sequence_length])
            y.append(data[i + self.sequence_length, 0])  # Target is the first column (cases)
        return np.array(X), np.array(y)
    
    def _build_model(self, input_shape: Tuple[int, int]) -> tf.keras.Model:
        """
        Build LSTM model architecture.
        
        Args:
            input_shape: Shape of input data (sequence_length, n_features)
            
        Returns:
            Compiled Keras model
        """
        model = Sequential([
            LSTM(64, activation='relu', input_shape=input_shape, return_sequences=True),
            Dropout(0.2),
            LSTM(32, activation='relu'),
            Dropout(0.2),
            Dense(16, activation='relu'),
            Dense(1)  # Output layer for regression
        ])
        
        model.compile(optimizer='adam', loss='mse')
        return model
    
    def train(self, df: pd.DataFrame, target_col: str = 'cases_cases', feature_cols: Optional[List[str]] = None):
        """
        Train LSTM models for each region in the dataset.
        
        Args:
            df: DataFrame with time series data
            target_col: Target column to forecast
            feature_cols: List of feature columns to use (if None, will use all numeric columns)
        """
        # Group data by region
        grouped = df.groupby('region')
        
        # Determine feature columns if not provided
        if feature_cols is None:
            # Use all numeric columns except date, region, and target
            feature_cols = [col for col in df.select_dtypes(include=[np.number]).columns 
                           if col != target_col]
        
        # Update n_features
        self.n_features = len(feature_cols) + 1  # +1 for target column
        
        # Train a model for each region
        for region, group_df in grouped:
            print(f"Training LSTM model for {region}...")
            
            # Sort by date
            group_df = group_df.sort_values('date')
            
            # Extract features and target
            features = group_df[feature_cols].values
            target = group_df[[target_col]].values
            
            # Combine target and features
            data = np.concatenate([target, features], axis=1)
            
            # Scale the data
            scaler = MinMaxScaler()
            scaled_data = scaler.fit_transform(data)
            self.scalers[region] = scaler
            
            # Create sequences
            X, y = self._create_sequences(scaled_data)
            
            if len(X) < 10:
                print(f"Not enough data for {region}, skipping...")
                continue
            
            try:
                # Build and train model
                model = self._build_model((self.sequence_length, self.n_features))
                
                # Early stopping to prevent overfitting
                early_stopping = EarlyStopping(
                    monitor='val_loss',
                    patience=10,
                    restore_best_weights=True
                )
                
                # Split data into train and validation sets
                train_size = int(len(X) * 0.8)
                X_train, X_val = X[:train_size], X[train_size:]
                y_train, y_val = y[:train_size], y[train_size:]
                
                # Train the model
                model.fit(
                    X_train, y_train,
                    epochs=100,
                    batch_size=32,
                    validation_data=(X_val, y_val),
                    callbacks=[early_stopping],
                    verbose=0
                )
                
                # Store the trained model
                self.models[region] = model
                print(f"Successfully trained LSTM model for {region}")
                
            except Exception as e:
                print(f"Error training LSTM model for {region}: {e}")
    
    def forecast(self, df: pd.DataFrame, horizon: int = 14, feature_cols: Optional[List[str]] = None) -> pd.DataFrame:
        """
        Generate forecasts for each region.
        
        Args:
            df: DataFrame with historical data
            horizon: Forecast horizon in days
            feature_cols: List of feature columns to use (must match training)
            
        Returns:
            DataFrame with forecasts
        """
        forecasts = []
        
        # Group data by region
        grouped = df.groupby('region')
        
        # Determine feature columns if not provided
        if feature_cols is None:
            # Use all numeric columns except date and region
            feature_cols = [col for col in df.select_dtypes(include=[np.number]).columns 
                           if col not in ['forecast', 'forecast_horizon']]
        
        # Generate forecasts for each region
        for region, group_df in grouped:
            if region not in self.models or region not in self.scalers:
                print(f"No trained model found for {region}, skipping...")
                continue
                
            # Sort by date
            group_df = group_df.sort_values('date')
            
            # Get the last date in the data
            last_date = group_df['date'].max()
            
            # Generate forecast dates
            forecast_dates = [last_date + pd.Timedelta(days=i+1) for i in range(horizon)]
            
            try:
                # Get the model and scaler
                model = self.models[region]
                scaler = self.scalers[region]
                
                # Extract the last sequence_length days of data
                last_sequence = group_df.tail(self.sequence_length)
                
                # Extract features and target
                features = last_sequence[feature_cols].values
                target = last_sequence[['cases']].values
                
                # Combine target and features
                data = np.concatenate([target, features], axis=1)
                
                # Scale the data
                scaled_data = scaler.transform(data)
                
                # Reshape for LSTM input
                current_sequence = scaled_data.reshape(1, self.sequence_length, self.n_features)
                
                # Generate forecasts iteratively
                forecast_values = []
                for i in range(horizon):
                    # Predict the next value
                    next_pred = model.predict(current_sequence, verbose=0)[0, 0]
                    forecast_values.append(next_pred)
                    
                    # Create a new row with the prediction and last feature values
                    new_row = np.zeros((1, self.n_features))
                    new_row[0, 0] = next_pred
                    new_row[0, 1:] = scaled_data[-1, 1:]  # Use last feature values
                    
                    # Update the sequence by removing the first timestep and adding the new prediction
                    current_sequence = np.append(current_sequence[:, 1:, :], 
                                               new_row.reshape(1, 1, self.n_features), 
                                               axis=1)
                
                # Inverse transform to get actual values
                # Create a dummy array with the same shape as the original data
                dummy = np.zeros((horizon, self.n_features))
                dummy[:, 0] = forecast_values
                dummy[:, 1:] = scaled_data[-1, 1:]  # Use last feature values for all forecasts
                
                # Inverse transform
                forecast_values_rescaled = scaler.inverse_transform(dummy)[:, 0]
                
                # Create forecast DataFrame
                for i, (date, value) in enumerate(zip(forecast_dates, forecast_values_rescaled)):
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
    
    def save_models(self, base_path: str = "../models/lstm_models"):
        """
        Save trained models and scalers to disk.
        
        Args:
            base_path: Base path to save the models
        """
        os.makedirs(base_path, exist_ok=True)
        
        # Save models
        for region, model in self.models.items():
            model_path = os.path.join(base_path, f"{region}_model.h5")
            model.save(model_path)
        
        # Save scalers
        import joblib
        scaler_path = os.path.join(base_path, "scalers.pkl")
        joblib.dump(self.scalers, scaler_path)
        
        print(f"Models and scalers saved to {base_path}")
    
    def load_models(self, base_path: str = "../models/lstm_models"):
        """
        Load trained models and scalers from disk.
        
        Args:
            base_path: Base path to load the models from
        """
        if not os.path.exists(base_path):
            print(f"Model directory {base_path} not found")
            return
        
        # Load models
        for file in os.listdir(base_path):
            if file.endswith("_model.h5"):
                region = file.replace("_model.h5", "")
                model_path = os.path.join(base_path, file)
                self.models[region] = load_model(model_path)
        
        # Load scalers
        import joblib
        scaler_path = os.path.join(base_path, "scalers.pkl")
        if os.path.exists(scaler_path):
            self.scalers = joblib.load(scaler_path)
        
        print(f"Models and scalers loaded from {base_path}")