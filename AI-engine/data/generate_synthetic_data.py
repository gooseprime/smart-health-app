import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

def generate_case_data(start_date='2020-01-01', days=730, regions=5):
    """
    Generate synthetic case count data.
    
    Args:
        start_date: Start date for the time series
        days: Number of days to generate
        regions: Number of regions to generate data for
        
    Returns:
        DataFrame with synthetic case data
    """
    # Create date range
    dates = [datetime.strptime(start_date, '%Y-%m-%d') + timedelta(days=i) for i in range(days)]
    
    # Create empty DataFrame
    data = []
    
    # Generate data for each region
    for region_id in range(1, regions + 1):
        region_name = f"Region_{region_id}"
        
        # Base case count (different for each region)
        base_cases = np.random.randint(10, 50)
        
        # Seasonal component (yearly cycle)
        seasonal_amplitude = np.random.randint(20, 100)
        
        # Trend component
        trend_slope = np.random.uniform(0.05, 0.2)
        
        # Outbreak simulation parameters
        outbreak_starts = np.random.choice(range(days - 30), size=3, replace=False)
        outbreak_durations = np.random.randint(14, 30, size=3)
        outbreak_magnitudes = np.random.randint(50, 200, size=3)
        
        for i, date in enumerate(dates):
            # Base component
            cases = base_cases
            
            # Add seasonal component
            day_of_year = date.timetuple().tm_yday
            seasonal_component = seasonal_amplitude * np.sin(2 * np.pi * day_of_year / 365)
            cases += seasonal_component
            
            # Add trend component
            cases += trend_slope * i
            
            # Add outbreak effects
            for start, duration, magnitude in zip(outbreak_starts, outbreak_durations, outbreak_magnitudes):
                if start <= i < start + duration:
                    # Outbreak curve (rises quickly, falls slowly)
                    position_in_outbreak = i - start
                    if position_in_outbreak < duration / 3:
                        # Rising phase
                        outbreak_effect = magnitude * (position_in_outbreak / (duration / 3))
                    else:
                        # Falling phase
                        outbreak_effect = magnitude * (1 - (position_in_outbreak - duration / 3) / (2 * duration / 3))
                    cases += outbreak_effect
            
            # Add random noise
            noise = np.random.normal(0, max(5, cases * 0.1))
            cases = max(0, cases + noise)
            
            # Round to integer
            cases = round(cases)
            
            data.append({
                'date': date,
                'region': region_name,
                'cases': cases
            })
    
    # Convert to DataFrame
    df = pd.DataFrame(data)
    return df

def generate_weather_data(start_date='2020-01-01', days=730, regions=5):
    """
    Generate synthetic weather data.
    
    Args:
        start_date: Start date for the time series
        days: Number of days to generate
        regions: Number of regions to generate data for
        
    Returns:
        DataFrame with synthetic weather data
    """
    # Create date range
    dates = [datetime.strptime(start_date, '%Y-%m-%d') + timedelta(days=i) for i in range(days)]
    
    # Create empty DataFrame
    data = []
    
    # Generate data for each region
    for region_id in range(1, regions + 1):
        region_name = f"Region_{region_id}"
        
        # Base values (different for each region)
        base_temp = np.random.uniform(5, 15)
        base_humidity = np.random.uniform(40, 70)
        
        # Seasonal amplitudes
        temp_amplitude = np.random.uniform(10, 20)
        humidity_amplitude = np.random.uniform(10, 30)
        
        for i, date in enumerate(dates):
            # Day of year for seasonal patterns
            day_of_year = date.timetuple().tm_yday
            
            # Temperature with seasonal pattern
            temperature = base_temp + temp_amplitude * np.sin(2 * np.pi * (day_of_year - 30) / 365)
            temperature += np.random.normal(0, 2)  # Add noise
            
            # Humidity with seasonal pattern (inverse to temperature)
            humidity = base_humidity - humidity_amplitude * np.sin(2 * np.pi * (day_of_year - 30) / 365)
            humidity += np.random.normal(0, 5)  # Add noise
            humidity = max(0, min(100, humidity))  # Clip to valid range
            
            # Precipitation (more in winter, less in summer)
            precip_base = 5 - 4 * np.sin(2 * np.pi * (day_of_year - 30) / 365)
            precipitation = max(0, np.random.exponential(precip_base))
            
            data.append({
                'date': date,
                'region': region_name,
                'temperature': round(temperature, 1),
                'humidity': round(humidity, 1),
                'precipitation': round(precipitation, 1)
            })
    
    # Convert to DataFrame
    df = pd.DataFrame(data)
    return df

def generate_wastewater_data(case_data, lag_days=7):
    """
    Generate synthetic wastewater viral load data based on case data.
    
    Args:
        case_data: DataFrame with case data
        lag_days: Number of days wastewater signal precedes cases
        
    Returns:
        DataFrame with synthetic wastewater data
    """
    # Create a copy of case data and shift dates back
    wastewater_data = case_data.copy()
    
    # Shift dates forward (viral load appears in wastewater before cases)
    wastewater_data['date'] = wastewater_data['date'] - pd.Timedelta(days=lag_days)
    
    # Transform case counts to viral load
    # Viral load is proportional to cases but with different scaling and more noise
    wastewater_data['viral_load'] = wastewater_data['cases'] * np.random.uniform(0.8, 1.2, size=len(wastewater_data))
    wastewater_data['viral_load'] *= np.random.uniform(5, 15)  # Scale factor
    wastewater_data['viral_load'] += np.random.normal(0, wastewater_data['viral_load'] * 0.2)  # Add noise
    wastewater_data['viral_load'] = wastewater_data['viral_load'].round(2)
    
    # Drop the cases column
    wastewater_data = wastewater_data.drop(columns=['cases'])
    
    # Sort by date and region
    wastewater_data = wastewater_data.sort_values(['region', 'date'])
    
    return wastewater_data

def save_synthetic_data(output_dir='../data'):
    """
    Generate and save all synthetic datasets.
    
    Args:
        output_dir: Directory to save the data files
    """
    os.makedirs(output_dir, exist_ok=True)
    
    # Generate case data
    print("Generating case data...")
    case_data = generate_case_data()
    case_data.to_csv(os.path.join(output_dir, 'case_counts.csv'), index=False)
    print(f"Case data saved with shape: {case_data.shape}")
    
    # Generate weather data
    print("Generating weather data...")
    weather_data = generate_weather_data()
    weather_data.to_csv(os.path.join(output_dir, 'weather_data.csv'), index=False)
    print(f"Weather data saved with shape: {weather_data.shape}")
    
    # Generate wastewater data based on case data
    print("Generating wastewater data...")
    wastewater_data = generate_wastewater_data(case_data)
    wastewater_data.to_csv(os.path.join(output_dir, 'wastewater_data.csv'), index=False)
    print(f"Wastewater data saved with shape: {wastewater_data.shape}")
    
    print(f"All synthetic data saved to {output_dir}")

if __name__ == "__main__":
    save_synthetic_data()