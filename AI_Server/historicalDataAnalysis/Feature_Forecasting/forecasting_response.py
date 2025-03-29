import pandas as pd
import numpy as np
from datetime import datetime
from tensorflow.keras.models import load_model
import joblib

class TimeSeriesForecaster:
    def __init__(self, data_path="Dataset/Better_Dataset.csv"):
        # Configuration
        self.look_back = 18
        self.forecast_horizon = 6
        self.data_path = data_path
        
        # Load artifacts
        self.models = {
            'temperature': load_model('Feature_Forecasting/temperature_model.h5', compile=False),
            'humidity': load_model('Feature_Forecasting/humidity_model.h5', compile=False)
        }
        self.scalers = {
            'temperature': joblib.load('Feature_Forecasting/temp_scaler.pkl'),
            'humidity': joblib.load('Feature_Forecasting/humidity_scaler.pkl')
        }
        
        # Initialize with latest data
        self._refresh_data()

    def _refresh_data(self):
        """Load and preprocess latest data from CSV"""
        self.df = pd.read_csv(self.data_path, parse_dates=['date'])
        self.df = self.df.sort_values('date').set_index('date')
        
        # Add scaled values
        self.df['temperature_scaled'] = self.scalers['temperature'].transform(self.df[['temperature']])
        self.df['humidity_scaled'] = self.scalers['humidity'].transform(self.df[['humidity']])

    def _get_forecast_window(self):
        """Calculate next 6 timestamps starting from next 4-hour slot"""
        now = datetime.now()
        current_hour = now.hour
        next_slot = ((current_hour // 4) * 4 + 4) % 24
        
        start_time = now.replace(
            hour=next_slot, 
            minute=0, 
            second=0, 
            microsecond=0
        )
        
        if next_slot == 0:  # Handle midnight crossover
            start_time += pd.Timedelta(days=1)
            
        return pd.date_range(
            start=start_time,
            periods=self.forecast_horizon,
            freq='4H'
        )

    def generate_forecast(self):
        """Main method to generate forecasts"""
        try:
            # 1. Refresh data from CSV
            self._refresh_data()
            
            # 2. Validate data sufficiency
            if len(self.df) < self.look_back:
                raise ValueError(f"Need at least {self.look_back} historical data points")
            
            # 3. Prepare input sequence
            last_sequence = self.df.iloc[-self.look_back:]
            
            # 4. Generate forecast
            forecast_df = pd.DataFrame(index=self._get_forecast_window())
            
            for target in ['temperature', 'humidity']:
                input_seq = last_sequence[f'{target}_scaled'].values[-self.look_back:]
                input_seq = input_seq.reshape(1, self.look_back, 1)
                
                scaled_pred = self.models[target].predict(input_seq)[0]
                forecast_df[target] = self.scalers[target].inverse_transform(
                    scaled_pred.reshape(-1, 1)
                ).flatten()
            
            return forecast_df.reset_index().rename(columns={'index': 'timestamp'})
        
        except Exception as e:
            raise RuntimeError(f"Forecast generation failed: {str(e)}")

# Singleton instance for the app
forecaster = TimeSeriesForecaster()