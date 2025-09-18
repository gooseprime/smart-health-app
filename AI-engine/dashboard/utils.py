import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
import os
import sys

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def create_forecast_plot(actual_data, forecast_data, region, forecast_horizon):
    """
    Create a plotly figure showing actual vs predicted cases for a specific region.
    
    Args:
        actual_data (pd.DataFrame): DataFrame with actual case data
        forecast_data (pd.DataFrame): DataFrame with forecast data
        region (str): Region to plot
        forecast_horizon (int): Forecast horizon in days
        
    Returns:
        plotly.graph_objects.Figure: Plotly figure object
    """
    # Filter data for the specified region
    region_actual = actual_data[actual_data['region'] == region].sort_values('date')
    region_forecasts = forecast_data[forecast_data['region'] == region]
    
    if region_forecasts.empty:
        return None
    
    # Create figure
    fig = go.Figure()
    
    # Add actual data
    fig.add_trace(go.Scatter(
        x=region_actual['date'],
        y=region_actual['cases_cases'],
        mode='lines+markers',
        name='Actual Cases',
        line=dict(color='black', width=2)
    ))
    
    # Add forecasts for each model
    for model in region_forecasts['model'].unique():
        model_data = region_forecasts[region_forecasts['model'] == model].sort_values('forecast_horizon')
        
        fig.add_trace(go.Scatter(
            x=model_data['date'],
            y=model_data['forecast'],
            mode='lines+markers',
            name=f'{model} Forecast',
            line=dict(dash='dash')
        ))
        
        # Add prediction intervals if available
        if 'forecast_lower' in model_data.columns and 'forecast_upper' in model_data.columns:
            fig.add_trace(go.Scatter(
                x=model_data['date'],
                y=model_data['forecast_upper'],
                mode='lines',
                line=dict(width=0),
                showlegend=False
            ))
            fig.add_trace(go.Scatter(
                x=model_data['date'],
                y=model_data['forecast_lower'],
                mode='lines',
                line=dict(width=0),
                fill='tonexty',
                fillcolor='rgba(0, 176, 246, 0.2)',
                name=f'{model} Prediction Interval'
            ))
    
    # Update layout
    fig.update_layout(
        title=f"{region} - {forecast_horizon}-Day Forecast",
        xaxis_title="Date",
        yaxis_title="Cases",
        legend_title="Data Source",
        height=500
    )
    
    return fig

def create_risk_heatmap(risk_data):
    """
    Create a heatmap showing outbreak risk by region.
    
    Args:
        risk_data (pd.DataFrame): DataFrame with risk assessment data
        
    Returns:
        plotly.graph_objects.Figure: Plotly figure object
    """
    # Aggregate risk by region (take maximum across models)
    region_risk = risk_data.groupby('region')['risk_probability'].max().reset_index()
    
    # Create bar chart (fallback from choropleth which would need geo data)
    fig = px.bar(
        region_risk.sort_values('risk_probability', ascending=False),
        x='region',
        y='risk_probability',
        color='risk_probability',
        color_continuous_scale=[(0, "green"), (0.4, "yellow"), (0.7, "red")],
        range_color=[0, 1],
        title="Outbreak Risk by Region"
    )
    
    fig.update_layout(
        xaxis_title="Region",
        yaxis_title="Risk Probability",
        height=500
    )
    
    return fig

def calculate_outbreak_risk(forecasts, actual, threshold_factor=1.5):
    """
    Calculate outbreak risk based on forecasts vs historical average.
    
    Args:
        forecasts (pd.DataFrame): DataFrame with forecast data
        actual (pd.DataFrame): DataFrame with actual case data
        threshold_factor (float): Factor multiplied by standard deviation to determine outbreak threshold
        
    Returns:
        pd.DataFrame: DataFrame with risk assessment data
    """
    if forecasts.empty:
        return pd.DataFrame()
    
    risk_data = []
    
    for region in forecasts['region'].unique():
        region_forecasts = forecasts[forecasts['region'] == region]
        region_actual = actual[actual['region'] == region]
        
        if region_actual.empty:
            continue
        
        # Calculate historical average and standard deviation
        historical_avg = region_actual['cases_cases'].mean()
        historical_std = region_actual['cases_cases'].std()
        
        # Calculate threshold for outbreak
        outbreak_threshold = historical_avg + threshold_factor * historical_std
        
        # Calculate risk for each model
        for model in region_forecasts['model'].unique():
            model_forecasts = region_forecasts[region_forecasts['model'] == model]
            
            # Calculate maximum forecast
            max_forecast = model_forecasts['forecast'].max()
            
            # Calculate risk probability (simplified)
            if historical_std > 0:
                z_score = (max_forecast - historical_avg) / historical_std
                risk_prob = min(1.0, max(0.0, (z_score - 1) / 3))
            else:
                risk_prob = 0.5  # Default if no variation in historical data
            
            # Determine risk level
            if risk_prob >= 0.7:
                risk_level = "High"
            elif risk_prob >= 0.4:
                risk_level = "Medium"
            else:
                risk_level = "Low"
            
            risk_data.append({
                'region': region,
                'model': model,
                'max_forecast': max_forecast,
                'historical_avg': historical_avg,
                'outbreak_threshold': outbreak_threshold,
                'risk_probability': risk_prob,
                'risk_level': risk_level
            })
    
    if not risk_data:
        return pd.DataFrame()
        
    return pd.DataFrame(risk_data)

def generate_alert_html(region, risk_prob, forecast_horizon):
    """
    Generate HTML for risk alerts.
    
    Args:
        region (str): Region name
        risk_prob (float): Risk probability
        forecast_horizon (int): Forecast horizon in days
        
    Returns:
        str: HTML string for alert
    """
    alert_class = "alert-high" if risk_prob >= 0.7 else "alert-medium"
    
    return f"""
    <div class="{alert_class}">
        ⚠️ ALERT: {region} has a {risk_prob:.1%} probability of outbreak in the next {forecast_horizon} days!
    </div>
    """

def format_risk_data_for_display(risk_data):
    """
    Format risk data for display in a table.
    
    Args:
        risk_data (pd.DataFrame): DataFrame with risk assessment data
        
    Returns:
        pd.DataFrame: Formatted DataFrame for display
    """
    display_risk = risk_data.copy()
    display_risk['risk_probability'] = display_risk['risk_probability'].apply(lambda x: f"{x:.1%}")
    display_risk = display_risk.sort_values(['region', 'risk_probability'], ascending=[True, False])
    
    return display_risk[['region', 'model', 'max_forecast', 'historical_avg', 
                         'outbreak_threshold', 'risk_probability', 'risk_level']]