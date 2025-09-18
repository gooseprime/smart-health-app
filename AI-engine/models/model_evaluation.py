import pandas as pd
import numpy as np
from typing import Dict, List, Optional
from sklearn.metrics import mean_absolute_error, mean_squared_error

class ModelEvaluator:
    """
    Class for evaluating forecasting model performance.
    """
    
    def __init__(self):
        """Initialize the ModelEvaluator class."""
        pass
        
    def evaluate(self, actual: pd.DataFrame, forecast: pd.DataFrame, 
                target_col: str = 'cases_cases', forecast_col: str = 'forecast') -> Dict[str, Dict[str, float]]:
        """
        Evaluate forecast accuracy using multiple metrics.
        
        Args:
            actual: DataFrame with actual values
            forecast: DataFrame with forecast values
            target_col: Column name for actual values
            forecast_col: Column name for forecast values
            
        Returns:
            Dictionary with evaluation metrics by region
        """
        # Merge actual and forecast data
        merged = pd.merge(
            actual[['date', 'region', target_col]],
            forecast[['date', 'region', forecast_col, 'forecast_horizon']],
            on=['date', 'region'],
            how='inner'
        )
        
        if merged.empty:
            print("No matching data points for evaluation")
            return {}
        
        # Group by region and forecast horizon
        grouped = merged.groupby(['region', 'forecast_horizon'])
        
        # Calculate metrics for each group
        metrics = {}
        
        for (region, horizon), group in grouped:
            if region not in metrics:
                metrics[region] = {}
                
            # Extract actual and forecast values
            y_true = group[target_col].values
            y_pred = group[forecast_col].values
            
            # Calculate metrics
            mae = mean_absolute_error(y_true, y_pred)
            rmse = np.sqrt(mean_squared_error(y_true, y_pred))
            mape = np.mean(np.abs((y_true - y_pred) / np.maximum(1, y_true))) * 100
            
            # Calculate CRPS (Continuous Ranked Probability Score)
            # For simplicity, we'll use a Gaussian approximation
            if 'forecast_lower' in forecast.columns and 'forecast_upper' in forecast.columns:
                # Extract prediction intervals
                lower = group['forecast_lower'].values
                upper = group['forecast_upper'].values
                
                # Calculate standard deviation from the prediction interval
                std = (upper - lower) / 3.92  # 95% confidence interval is approximately ±1.96 std
                
                # Calculate CRPS using the analytical formula for Gaussian distribution
                crps = np.mean([self._crps_gaussian(y_true[i], y_pred[i], std[i]) for i in range(len(y_true))])
            else:
                # If no prediction intervals are available, use a simple approximation
                std = np.std(y_true - y_pred)
                crps = np.mean([self._crps_gaussian(y_true[i], y_pred[i], std) for i in range(len(y_true))])
            
            # Store metrics
            metrics[region][f'horizon_{horizon}'] = {
                'MAE': mae,
                'RMSE': rmse,
                'MAPE': mape,
                'CRPS': crps
            }
        
        return metrics
    
    def _crps_gaussian(self, y_true: float, mu: float, sigma: float) -> float:
        """
        Calculate CRPS for a Gaussian forecast.
        
        Args:
            y_true: Actual value
            mu: Predicted mean
            sigma: Predicted standard deviation
            
        Returns:
            CRPS value
        """
        # Avoid division by zero
        if sigma < 1e-6:
            return abs(y_true - mu)
            
        # Standardized forecast error
        z = (y_true - mu) / sigma
        
        # CRPS formula for Gaussian distribution
        crps = sigma * (z * (2 * self._norm_cdf(z) - 1) + 
                       2 * self._norm_pdf(z) - 
                       1 / np.sqrt(np.pi))
        
        return crps
    
    def _norm_cdf(self, x: float) -> float:
        """
        Standard normal cumulative distribution function.
        
        Args:
            x: Input value
            
        Returns:
            CDF value
        """
        return 0.5 * (1 + np.math.erf(x / np.sqrt(2)))
    
    def _norm_pdf(self, x: float) -> float:
        """
        Standard normal probability density function.
        
        Args:
            x: Input value
            
        Returns:
            PDF value
        """
        return np.exp(-0.5 * x**2) / np.sqrt(2 * np.pi)
    
    def summarize_metrics(self, metrics: Dict[str, Dict[str, Dict[str, float]]]) -> pd.DataFrame:
        """
        Summarize evaluation metrics into a DataFrame.
        
        Args:
            metrics: Dictionary with evaluation metrics by region and horizon
            
        Returns:
            DataFrame with summarized metrics
        """
        rows = []
        
        for region, horizons in metrics.items():
            for horizon, metric_values in horizons.items():
                row = {
                    'region': region,
                    'horizon': horizon.replace('horizon_', '')
                }
                row.update(metric_values)
                rows.append(row)
        
        if not rows:
            return pd.DataFrame()
            
        df = pd.DataFrame(rows)
        return df