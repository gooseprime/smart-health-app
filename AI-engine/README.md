# AI Outbreak Prediction Engine

An AI-based outbreak prediction engine that uses health and environmental data to forecast disease outbreaks.

## Project Overview

This system uses multiple data sources (case counts, weather data, wastewater viral load) to predict potential disease outbreaks. It implements:

- A modular data pipeline for ingestion, cleaning, and storage
- Multiple forecasting models (ARIMA, Prophet, LSTM)
- 7-day and 14-day forecasts with evaluation metrics
- Interactive Streamlit dashboard for visualization and risk assessment

## Project Structure

```
AI-engine/
├── data_pipeline/         # Data ingestion and processing modules
│   ├── __init__.py
│   ├── data_ingestion.py  # Load data from different sources
│   ├── data_processing.py # Clean and align data
│   ├── data_storage.py    # Store processed data
│   └── pipeline.py        # Main pipeline orchestration
├── models/                # Forecasting models
│   ├── __init__.py
│   ├── arima_model.py     # ARIMA model implementation
│   ├── prophet_model.py   # Prophet model implementation
│   ├── lstm_model.py      # LSTM model implementation
│   ├── model_evaluation.py # Evaluation metrics
│   └── train_models.py    # Model training script
├── dashboard/             # Streamlit dashboard
│   ├── __init__.py
│   ├── app.py             # Main dashboard application
│   ├── utils.py           # Dashboard utility functions
│   └── run_dashboard.py   # Script to run the dashboard
├── notebooks/             # Jupyter notebooks for analysis
├── data/                  # Data directory
│   └── generate_synthetic_data.py # Generate test data
└── README.md              # This file
```

## Installation

1. Clone the repository
2. Install dependencies:

```bash
pip install -r requirements.txt
```

Required packages:
- pandas
- numpy
- matplotlib
- seaborn
- scikit-learn
- statsmodels
- prophet
- tensorflow
- streamlit
- plotly

## Usage Instructions

### 1. Generate Synthetic Data (if no real data available)

```bash
python data/generate_synthetic_data.py
```

This will create synthetic datasets for:
- Case counts by region and date
- Weather data (temperature, humidity) by region and date
- Wastewater viral load by region and date

### 2. Run the Data Pipeline

The data pipeline can be run as follows:

```bash
python -c "from data_pipeline.pipeline import DataPipeline; pipeline = DataPipeline(); pipeline.run_pipeline()"
```

This will:
1. Ingest data from the specified sources
2. Clean and align the data by date and region
3. Store the processed data in CSV and/or SQLite format

### 3. Train Models

To train all forecasting models:

```bash
python models/train_models.py
```

This script will:
1. Load the processed data
2. Split into training and testing sets
3. Train ARIMA, Prophet, and LSTM models
4. Generate 7-day and 14-day forecasts
5. Evaluate model performance using MAE, RMSE, and CRPS metrics
6. Save trained models and forecasts

### 4. Launch the Dashboard

To start the interactive dashboard:

```bash
python dashboard/run_dashboard.py
```

Or directly with Streamlit:

```bash
streamlit run dashboard/app.py
```

The dashboard provides:
- Interactive visualization of actual vs predicted outbreaks
- Heatmap by region for outbreak risk
- Configurable alert thresholds
- Data exploration tools

## Customization

### Using Real Data

To use real data instead of synthetic data:
1. Place your CSV files in the `data/` directory
2. Update the data paths in `data_pipeline/data_ingestion.py`
3. Ensure your data has the required columns:
   - Case data: 'date', 'region', 'cases'
   - Weather data: 'date', 'region', 'temperature', 'humidity'
   - Wastewater data: 'date', 'region', 'viral_load'

### Adding New Models

To add a new forecasting model:
1. Create a new file in the `models/` directory
2. Implement a class with the following methods:
   - `__init__`: Initialize the model
   - `train`: Train the model on historical data
   - `predict`: Generate forecasts
   - `save`: Save the trained model
   - `load`: Load a trained model
3. Update `models/train_models.py` to include your new model

## Evaluation Metrics

The system evaluates forecasts using:
- MAE (Mean Absolute Error)
- RMSE (Root Mean Square Error)
- MAPE (Mean Absolute Percentage Error)
- CRPS (Continuous Ranked Probability Score) for probabilistic forecasts

## License

[MIT License](LICENSE)