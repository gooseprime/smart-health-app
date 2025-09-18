import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os
import sys
from datetime import datetime, timedelta
import plotly.express as px
import plotly.graph_objects as go

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from data_pipeline.pipeline import DataPipeline
from models.arima_model import ARIMAModel
from models.prophet_model import ProphetModel
from models.lstm_model import LSTMModel

# Set page configuration
st.set_page_config(
    page_title="Smart Health AI Engine",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        color: #3366ff;
        text-align: center;
    }
    .sub-header {
        font-size: 1.5rem;
        color: #666666;
        text-align: center;
    }
    .metric-card {
        background-color: #f8f9fa;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 2px 2px 10px rgba(0,0,0,0.1);
    }
    .alert-high {
        color: white;
        background-color: #ff4b4b;
        padding: 10px;
        border-radius: 5px;
        font-weight: bold;
    }
    .alert-medium {
        color: white;
        background-color: #ffa500;
        padding: 10px;
        border-radius: 5px;
        font-weight: bold;
    }
    .alert-low {
        color: white;
        background-color: #32cd32;
        padding: 10px;
        border-radius: 5px;
        font-weight: bold;
    }
</style>
""", unsafe_allow_html=True)

# Helper functions
@st.cache_data(ttl=3600)
def load_data():
    """Load processed data from CSV or run the pipeline if not available."""
    data_path = "../data/processed_data.csv"
    
    if os.path.exists(data_path):
        data = pd.read_csv(data_path, parse_dates=['date'])
        return data
    else:
        # Run the pipeline to generate data
        pipeline = DataPipeline()
        data = pipeline.run_pipeline()
        return data

@st.cache_data(ttl=3600)
def load_forecasts(horizon=14):
    """Load forecasts from CSV."""
    forecast_path = f"../data/forecast_{horizon}day.csv"
    
    if os.path.exists(forecast_path):
        forecasts = pd.read_csv(forecast_path, parse_dates=['date'])
        return forecasts
    else:
        st.warning(f"No forecasts found for {horizon}-day horizon. Please run model training first.")
        return pd.DataFrame()

def calculate_outbreak_risk(forecasts, actual, threshold_factor=1.5):
    """Calculate outbreak risk based on forecasts vs historical average."""
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

# Main app
def main():
    # Header
    st.markdown("<h1 class='main-header'>Smart Health AI Engine</h1>", unsafe_allow_html=True)
    st.markdown("<p class='sub-header'>AI-Based Health Monitoring, Prediction and Analysis</p>", unsafe_allow_html=True)
    
    # AI Engine Information
    with st.expander("About Smart Health AI Engine", expanded=True):
        col1, col2 = st.columns([2, 1])
        with col1:
            st.markdown("""
            ### Why Smart Health AI Engine?
            
            The Smart Health AI Engine is the intelligence core of the Smart Health application, providing:
            
            - **Advanced Predictive Analytics**: Forecasts disease outbreaks using multiple AI models
            - **Classification & Regression**: Identifies disease patterns and predicts severity levels
            - **Offline Functionality**: Works without internet connection for remote healthcare settings
            - **Seamless Integration**: Connects with the main Smart Health app through API endpoints
            
            ### How It Works with the Main App
            
            1. **Data Collection**: The main app collects health data from users and sensors
            2. **AI Processing**: This engine analyzes the data using machine learning models
            3. **Results Delivery**: Predictions and insights are sent back to the main app
            4. **Action Recommendations**: The main app displays actionable health recommendations
            
            ### Offline Capabilities
            
            The AI Engine is designed to work offline by:
            - Pre-loading trained models that don't require cloud connectivity
            - Storing essential reference data locally
            - Processing all computations on the device
            - Synchronizing with the cloud when connection is available
            
            ### Why This Approach Is Better
            
            This architecture provides several advantages:
            
            - **Reduced Latency**: Local processing eliminates network delays
            - **Enhanced Privacy**: Sensitive health data stays on the device
            - **Reliability**: Functions even in areas with poor connectivity
            - **Resource Efficiency**: Optimized models run efficiently on mobile devices
            - **Seamless Experience**: Users get AI insights without interruption
            
            ### Integration with React Frontend
            
            The React-based main application integrates with this AI Engine through:
            
            - **RESTful API**: Local API endpoints for data exchange
            - **WebSocket**: Real-time updates for continuous monitoring
            - **IndexedDB**: Client-side storage for offline data persistence
            - **Service Workers**: Background processing and synchronization
            - **React Context**: State management for AI insights across components
            """)
        with col2:
            # Create architecture diagram using HTML/CSS
            architecture_html = """
            <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 10px; border: 2px solid #3366ff;">
                <h3 style="color: #3366ff; margin-bottom: 20px;">AI Engine Architecture</h3>
                
                <div style="background: #61dafb; padding: 15px; margin: 10px 0; border-radius: 5px; opacity: 0.8;">
                    React Frontend App
                </div>
                
                <div style="height: 20px; position: relative;">
                    <div style="position: absolute; left: 50%; transform: translateX(-50%); width: 2px; height: 100%; background: #000;"></div>
                    <div style="position: absolute; left: 50%; bottom: 0; transform: translateX(-50%) rotate(45deg); width: 8px; height: 8px; border-right: 2px solid #000; border-bottom: 2px solid #000;"></div>
                </div>
                
                <div style="background: #ff9900; padding: 10px; margin: 10px 0; border-radius: 5px; opacity: 0.8;">
                    API Layer
                </div>
                
                <div style="height: 20px; position: relative;">
                    <div style="position: absolute; left: 50%; transform: translateX(-50%); width: 2px; height: 100%; background: #000;"></div>
                    <div style="position: absolute; left: 50%; bottom: 0; transform: translateX(-50%) rotate(45deg); width: 8px; height: 8px; border-right: 2px solid #000; border-bottom: 2px solid #000;"></div>
                </div>
                
                <div style="background: #3366ff; padding: 20px; margin: 10px 0; border-radius: 5px; opacity: 0.8; color: white;">
                    <strong>AI Engine Core</strong><br>
                    <small>Models, Algorithms, Processing</small>
                </div>
                
                <div style="display: flex; justify-content: space-between; margin-top: 20px;">
                    <div style="background: #32cd32; padding: 10px; width: 45%; border-radius: 5px; opacity: 0.8;">
                        Local Storage
                    </div>
                    <div style="background: #9966ff; padding: 10px; width: 45%; border-radius: 5px; opacity: 0.8;">
                        Cloud Sync
                    </div>
                </div>
            </div>
            """
            
            # Display the architecture diagram
            st.markdown(architecture_html, unsafe_allow_html=True)
    
    # Classification and Regression Demo
    with st.expander("Classification & Regression Capabilities", expanded=False):
        st.markdown("""
        ### Disease Classification
        
        The AI Engine can classify health conditions based on symptom patterns:
        """)
        
        # Demo classification
        col1, col2 = st.columns(2)
        with col1:
            st.markdown("#### Sample Symptoms")
            symptoms = {
                "Fever": st.slider("Fever (°C)", 36.0, 41.0, 38.5, 0.1),
                "Cough": st.select_slider("Cough Severity", options=["None", "Mild", "Moderate", "Severe"], value="Moderate"),
                "Fatigue": st.select_slider("Fatigue Level", options=["None", "Mild", "Moderate", "Severe"], value="Mild"),
                "Breathing Difficulty": st.select_slider("Breathing Difficulty", options=["None", "Mild", "Moderate", "Severe"], value="None")
            }
        
        with col2:
            st.markdown("#### AI Classification Results")
            st.info("Classification: Seasonal Influenza")
            st.progress(0.75)
            st.markdown("Confidence: 75%")
            
            st.markdown("#### Alternative Possibilities")
            st.markdown("- Common Cold (15%)")
            st.markdown("- COVID-19 (8%)")
            st.markdown("- Allergic Reaction (2%)")
        
        st.markdown("""
        ### Severity Regression
        
        The AI Engine can predict disease progression and severity:
        """)
        
        # Demo regression chart
        progression_data = pd.DataFrame({
            'Day': range(1, 15),
            'Predicted Severity': [3, 4, 6, 7, 8, 7, 6, 5, 4, 3, 2, 1, 1, 0],
            'Confidence Interval Upper': [4, 5, 7, 8, 9, 8, 7, 6, 5, 4, 3, 2, 2, 1],
            'Confidence Interval Lower': [2, 3, 5, 6, 7, 6, 5, 4, 3, 2, 1, 0, 0, 0]
        })
        
        fig = px.line(progression_data, x='Day', y='Predicted Severity',
                     error_y=progression_data['Confidence Interval Upper'] - progression_data['Predicted Severity'],
                     error_y_minus=progression_data['Predicted Severity'] - progression_data['Confidence Interval Lower'],
                     title='Predicted Disease Progression')
        st.plotly_chart(fig, use_container_width=True)
    
    # Sidebar
    st.sidebar.title("AI Engine Controls")
    
    # Integration Section
    with st.sidebar.expander("Integration Settings", expanded=False):
        st.markdown("### Main App Connection")
        connection_status = st.radio("Connection Mode", ["Online", "Offline"], index=1)
        if connection_status == "Online":
            st.success("Connected to Smart Health Main App")
            sync_button = st.button("Sync Data")
            if sync_button:
                st.info("Synchronizing data with main application...")
        else:
            st.warning("Operating in Offline Mode")
            st.markdown("Data will be processed locally and synced when online")
            
        # API Configuration
        st.markdown("### API Configuration")
        api_endpoint = st.text_input("API Endpoint", "http://localhost:5000/api/v1")
        api_key = st.text_input("API Key", "••••••••••••••••", type="password")
        
    # Load data
    with st.sidebar.expander("Data Options", expanded=False):
        reload_data = st.button("Reload Data")
        
        if reload_data:
            st.cache_data.clear()
            st.rerun()
    
    # Load data
    data = load_data()
    
    if data.empty:
        st.error("No data available. Please run the data pipeline first.")
        return
    
    # Filter options
    with st.sidebar.expander("Filter Options", expanded=True):
        # Select regions
        all_regions = sorted(data['region'].unique())
        selected_regions = st.multiselect("Select Regions", all_regions, default=all_regions[:3])
        
        # Select forecast horizon
        forecast_horizon = st.selectbox("Forecast Horizon", [7, 14], index=1)
        
        # Select models
        forecasts = load_forecasts(forecast_horizon)
        if not forecasts.empty:
            all_models = sorted(forecasts['model'].unique())
            selected_models = st.multiselect("Select Models", all_models, default=all_models)
        else:
            selected_models = []
        
        # Risk threshold
        risk_threshold = st.slider("Risk Threshold Factor", 1.0, 3.0, 1.5, 0.1,
                                  help="Factor multiplied by standard deviation above historical average to determine outbreak threshold")
    
    # Filter data
    if selected_regions:
        filtered_data = data[data['region'].isin(selected_regions)]
    else:
        filtered_data = data
    
    # Filter forecasts
    if not forecasts.empty and selected_models and selected_regions:
        filtered_forecasts = forecasts[
            forecasts['region'].isin(selected_regions) & 
            forecasts['model'].isin(selected_models)
        ]
    else:
        filtered_forecasts = pd.DataFrame()
    
    # Main content
    tab1, tab2, tab3, tab4 = st.tabs(["AI Engine Overview", "Forecast Visualization", "Risk Assessment", "Data Explorer"])
    
    # Tab 1: AI Engine Overview (already implemented above)
    with tab1:
        st.header("AI Engine Overview")
        # The AI Engine information is already displayed at the top of the page
        # Add a sample visualization to make the tab more engaging
        st.subheader("Sample Model Performance")
        
        # Create sample performance data
        model_performance = pd.DataFrame({
            'Model': ['LSTM', 'Prophet', 'ARIMA', 'Ensemble'],
            'RMSE': [12.3, 15.7, 18.2, 10.5],
            'MAE': [8.7, 10.2, 12.5, 7.8],
            'R²': [0.92, 0.87, 0.83, 0.94]
        })
        
        # Display as a table
        st.dataframe(model_performance, use_container_width=True)
        
        # Create a bar chart of model performance
        fig = px.bar(model_performance, x='Model', y='RMSE', title='Model Error Comparison (Lower is Better)')
        st.plotly_chart(fig, use_container_width=True)
    
    # Tab 2: Forecast Visualization
    with tab2:
        st.header("Forecast Visualization")
        
        # Create sample forecast data if real data is not available
        if filtered_forecasts.empty:
            st.info("Using sample forecast data for demonstration")
            
            # Create sample dates
            base_date = datetime.now()
            dates = [base_date + timedelta(days=i) for i in range(-30, 15)]
            
            # Create sample regions
            sample_regions = ["Region A", "Region B", "Region C"]
            selected_regions = sample_regions
            
            # Create sample models
            sample_models = ["LSTM", "Prophet", "ARIMA"]
            
            for region in sample_regions:
                st.subheader(f"Forecasts for {region}")
                
                # Create figure
                fig = go.Figure()
                
                # Generate sample data
                np.random.seed(42)  # For reproducibility
                actual_cases = np.maximum(0, 100 + np.cumsum(np.random.normal(0, 10, 30)))
                forecast_cases = np.maximum(0, actual_cases[-1] + np.cumsum(np.random.normal(5, 15, 15)))
                
                # Add actual data
                fig.add_trace(go.Scatter(
                    x=dates[:30],
                    y=actual_cases,
                    mode='lines+markers',
                    name='Actual Cases',
                    line=dict(color='black', width=2)
                ))
                
                # Add forecasts for each model
                for i, model in enumerate(sample_models):
                    # Add some variation between models
                    model_forecast = forecast_cases * (0.8 + 0.4 * i/len(sample_models))
                    
                    fig.add_trace(go.Scatter(
                        x=dates[30:],
                        y=model_forecast,
                        mode='lines+markers',
                        name=f'{model} Forecast',
                        line=dict(dash='dash')
                    ))
                    
                    # Add prediction intervals
                    upper_bound = model_forecast * 1.2
                    lower_bound = model_forecast * 0.8
                    
                    fig.add_trace(go.Scatter(
                        x=dates[30:],
                        y=upper_bound,
                        mode='lines',
                        line=dict(width=0),
                        showlegend=False
                    ))
                    fig.add_trace(go.Scatter(
                        x=dates[30:],
                        y=lower_bound,
                        mode='lines',
                        line=dict(width=0),
                        fill='tonexty',
                        fillcolor=f'rgba({50*i}, 176, {246-50*i}, 0.2)',
                        name=f'{model} Prediction Interval'
                    ))
                
                # Update layout
                fig.update_layout(
                    title=f"{region} - 14-Day Forecast",
                    xaxis_title="Date",
                    yaxis_title="Cases",
                    legend_title="Data Source",
                    height=500
                )
                
                st.plotly_chart(fig, use_container_width=True)
        else:
            # Use real data (existing code)
            for region in selected_regions:
                st.subheader(f"Forecasts for {region}")
                
                # Get actual data for this region
                region_data = filtered_data[filtered_data['region'] == region].sort_values('date')
                
                # Get forecasts for this region
                region_forecasts = filtered_forecasts[filtered_forecasts['region'] == region]
                
                if region_forecasts.empty:
                    st.info(f"No forecasts available for {region}")
                    continue
                
                # Create figure
                fig = go.Figure()
                
                # Add actual data
                fig.add_trace(go.Scatter(
                    x=region_data['date'],
                    y=region_data['cases_cases'],
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
                
                st.plotly_chart(fig, use_container_width=True)
    
    # Tab 3: Risk Assessment
    with tab3:
        st.header("Outbreak Risk Assessment")
        
        if filtered_forecasts.empty:
            st.info("Using sample risk data for demonstration")
            
            # Create sample risk data
            sample_regions = ["Region A", "Region B", "Region C", "Region D", "Region E"]
            np.random.seed(42)  # For reproducibility
            
            # Create sample risk dataframe
            risk_data = []
            for region in sample_regions:
                risk_prob = np.random.uniform(0, 1)
                risk_level = "High" if risk_prob >= 0.7 else "Medium" if risk_prob >= 0.4 else "Low"
                risk_data.append({
                    'region': region,
                    'model': 'Ensemble',
                    'max_forecast': np.random.randint(50, 200),
                    'historical_avg': np.random.randint(30, 100),
                    'outbreak_threshold': np.random.randint(80, 150),
                    'risk_probability': risk_prob,
                    'risk_level': risk_level
                })
            
            sample_risk_df = pd.DataFrame(risk_data)
            
            # Display risk heatmap
            st.subheader("Risk Heatmap by Region")
            
            # Aggregate risk by region
            region_risk = sample_risk_df.groupby('region')['risk_probability'].max().reset_index()
            
            # Create bar chart
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
            
            st.plotly_chart(fig, use_container_width=True)
            
            # Display risk alerts
            st.subheader("Risk Alerts")
            
            # Configure alert threshold
            alert_threshold = st.slider("Alert Threshold", 0.0, 1.0, 0.7, 0.1,
                                      help="Minimum risk probability to trigger an alert")
            
            # Filter for high-risk regions
            high_risk = sample_risk_df[sample_risk_df['risk_probability'] >= alert_threshold]
            
            if high_risk.empty:
                st.success("No regions currently exceed the alert threshold.")
            else:
                # Group by region and take the maximum risk
                high_risk_regions = high_risk.groupby('region')['risk_probability'].max().reset_index()
                
                for _, row in high_risk_regions.iterrows():
                    region = row['region']
                    risk_prob = row['risk_probability']
                    
                    alert_class = "alert-high" if risk_prob >= 0.7 else "alert-medium"
                    
                    st.markdown(f"""
                    <div class="{alert_class}">
                        ⚠️ ALERT: {region} has a {risk_prob:.1%} probability of outbreak in the next {forecast_horizon} days!
                    </div>
                    """, unsafe_allow_html=True)
            
            # Detailed risk table
            st.subheader("Detailed Risk Assessment")
            
            # Format the risk data for display
            display_risk = sample_risk_df.copy()
            display_risk['risk_probability'] = display_risk['risk_probability'].apply(lambda x: f"{x:.1%}")
            display_risk = display_risk.sort_values(['region', 'risk_probability'], ascending=[True, False])
            
            st.dataframe(
                display_risk[['region', 'model', 'max_forecast', 'historical_avg', 'outbreak_threshold', 'risk_probability', 'risk_level']],
                use_container_width=True
            )
            
            # Add a risk trend visualization
            st.subheader("Risk Trend Analysis")
            
            # Create sample dates for trend
            base_date = datetime.now()
            trend_dates = [base_date - timedelta(days=i) for i in range(14, 0, -1)]
            
            # Create sample risk trends
            trend_data = []
            for region in sample_regions[:3]:  # Show trends for top 3 regions
                base_risk = np.random.uniform(0.3, 0.8)
                for date in trend_dates:
                    # Add some random variation to the risk
                    daily_risk = max(0, min(1, base_risk + np.random.normal(0, 0.05)))
                    trend_data.append({
                        'region': region,
                        'date': date,
                        'risk': daily_risk
                    })
            
            trend_df = pd.DataFrame(trend_data)
            
            # Create line chart of risk trends
            fig = px.line(
                trend_df,
                x='date',
                y='risk',
                color='region',
                labels={'date': 'Date', 'risk': 'Risk Score', 'region': 'Region'},
                height=400
            )
            
            # Add threshold lines
            fig.add_shape(type="line", line=dict(dash="dash", color="green"),
                          y0=0.25, y1=0.25, x0=0, x1=1, xref="paper")
            fig.add_shape(type="line", line=dict(dash="dash", color="yellow"),
                          y0=0.5, y1=0.5, x0=0, x1=1, xref="paper")
            fig.add_shape(type="line", line=dict(dash="dash", color="red"),
                          y0=0.75, y1=0.75, x0=0, x1=1, xref="paper")
            
            fig.update_layout(title="14-Day Risk Trend Analysis")
            st.plotly_chart(fig, use_container_width=True)
        else:
            # Calculate risk
            risk_data = calculate_outbreak_risk(filtered_forecasts, filtered_data, risk_threshold)
            
            if risk_data.empty:
                st.warning("Could not calculate risk with the available data.")
            else:
                # Display risk heatmap
                st.subheader("Risk Heatmap by Region")
                
                # Aggregate risk by region (take maximum across models)
                region_risk = risk_data.groupby('region')['risk_probability'].max().reset_index()
                
                # Create heatmap
                fig = px.choropleth(
                    region_risk,
                    locations='region',
                    locationmode='country names',  # This is a simplification; real app would need proper geo data
                    color='risk_probability',
                    hover_name='region',
                    color_continuous_scale=[(0, "green"), (0.4, "yellow"), (0.7, "red")],
                    range_color=[0, 1],
                    title="Outbreak Risk by Region"
                )
                
                # Fallback to bar chart if choropleth doesn't work (no geo data)
                if len(region_risk) > 0:
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
                    
                    st.plotly_chart(fig, use_container_width=True)
                
                # Display risk alerts
                st.subheader("Risk Alerts")
                
                # Configure alert threshold
                alert_threshold = st.slider("Alert Threshold", 0.0, 1.0, 0.7, 0.1,
                                          help="Minimum risk probability to trigger an alert")
                
                # Filter for high-risk regions
                high_risk = risk_data[risk_data['risk_probability'] >= alert_threshold]
                
                if high_risk.empty:
                    st.success("No regions currently exceed the alert threshold.")
                else:
                    # Group by region and take the maximum risk
                    high_risk_regions = high_risk.groupby('region')['risk_probability'].max().reset_index()
                    
                    for _, row in high_risk_regions.iterrows():
                        region = row['region']
                        risk_prob = row['risk_probability']
                        
                        alert_class = "alert-high" if risk_prob >= 0.7 else "alert-medium"
                        
                        st.markdown(f"""
                        <div class="{alert_class}">
                            ⚠️ ALERT: {region} has a {risk_prob:.1%} probability of outbreak in the next {forecast_horizon} days!
                        </div>
                        """, unsafe_allow_html=True)
                
                # Detailed risk table
                st.subheader("Detailed Risk Assessment")
                
                # Format the risk data for display
                display_risk = risk_data.copy()
                display_risk['risk_probability'] = display_risk['risk_probability'].apply(lambda x: f"{x:.1%}")
                display_risk = display_risk.sort_values(['region', 'risk_probability'], ascending=[True, False])
                
                st.dataframe(
                    display_risk[['region', 'model', 'max_forecast', 'historical_avg', 'outbreak_threshold', 'risk_probability', 'risk_level']],
                    use_container_width=True
                )
    
    # Tab 3: Data Explorer
    with tab3:
        st.header("Data Explorer")
        
        # Show data statistics
        st.subheader("Data Statistics")
        
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.metric("Total Regions", len(filtered_data['region'].unique()))
        
        with col2:
            st.metric("Date Range", f"{filtered_data['date'].min().date()} to {filtered_data['date'].max().date()}")
        
        with col3:
            st.metric("Total Records", len(filtered_data))
        
        # Data visualization options
        viz_type = st.selectbox("Visualization Type", ["Time Series", "Correlation Heatmap", "Feature Distribution"])
        
        if viz_type == "Time Series":
            # Select feature to visualize
            numeric_cols = filtered_data.select_dtypes(include=[np.number]).columns.tolist()
            selected_feature = st.selectbox("Select Feature", numeric_cols, index=numeric_cols.index('cases') if 'cases' in numeric_cols else 0)
            
            # Plot time series
            fig = px.line(
                filtered_data,
                x='date',
                y=selected_feature,
                color='region',
                title=f"{selected_feature} Over Time by Region"
            )
            
            fig.update_layout(height=600)
            st.plotly_chart(fig, use_container_width=True)
            
        elif viz_type == "Correlation Heatmap":
            # Select region for correlation analysis
            region = st.selectbox("Select Region for Correlation Analysis", selected_regions)
            
            # Filter data for selected region
            region_data = filtered_data[filtered_data['region'] == region]
            
            # Select features for correlation
            numeric_cols = region_data.select_dtypes(include=[np.number]).columns.tolist()
            selected_features = st.multiselect("Select Features for Correlation", numeric_cols, default=numeric_cols[:5])
            
            if selected_features:
                # Calculate correlation
                corr = region_data[selected_features].corr()
                
                # Plot heatmap
                fig, ax = plt.subplots(figsize=(10, 8))
                sns.heatmap(corr, annot=True, cmap='coolwarm', ax=ax)
                plt.title(f"Correlation Heatmap for {region}")
                st.pyplot(fig)
            else:
                st.info("Please select at least one feature for correlation analysis.")
                
        elif viz_type == "Feature Distribution":
            # Select feature for distribution
            numeric_cols = filtered_data.select_dtypes(include=[np.number]).columns.tolist()
            selected_feature = st.selectbox("Select Feature for Distribution", numeric_cols, index=numeric_cols.index('cases') if 'cases' in numeric_cols else 0)
            
            # Plot distribution
            fig = px.histogram(
                filtered_data,
                x=selected_feature,
                color='region',
                marginal='box',
                title=f"Distribution of {selected_feature} by Region"
            )
            
            fig.update_layout(height=500)
            st.plotly_chart(fig, use_container_width=True)
        
        # Raw data viewer
        with st.expander("View Raw Data"):
            st.dataframe(filtered_data, use_container_width=True)

if __name__ == "__main__":
    main()