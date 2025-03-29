import pandas as pd
import numpy as np
from statsmodels.tsa.seasonal import seasonal_decompose

df = pd.read_csv("Dataset/Better_Dataset.csv", parse_dates=["date"])
df = df.set_index("date")

def decompose_sensor_data(data, column, period=6):
    """Decompose sensor data into trend, seasonal, and residual components."""
    decomposition = seasonal_decompose(
        data[column], 
        model="additive",  
        period=period      # Daily seasonality (6 readings/day)
    )
    data[f"{column}_trend"] = decomposition.trend
    data[f"{column}_seasonal"] = decomposition.seasonal
    data[f"{column}_resid"] = decomposition.resid
    return data

# Apply decomposition to temperature and humidity
df = decompose_sensor_data(df, "temperature")
df = decompose_sensor_data(df, "humidity")

# Extract time slot (0-5) for each 4-hour interval
df["time_slot"] = (df.index.hour // 4) % 6

# Compute average seasonal component for each time slot
seasonal_means = {
    "temperature": df.groupby("time_slot")["temperature_seasonal"].mean(),
    "humidity": df.groupby("time_slot")["humidity_seasonal"].mean(),
}

# Compute historical residuals' mean and std
residual_stats = {
    "temperature": {
        "mu": df["temperature_resid"].mean(),
        "sigma": df["temperature_resid"].std()
    },
    "humidity": {
        "mu": df["humidity_resid"].mean(),
        "sigma": df["humidity_resid"].std()
    }
}

class AnomalyDetector:
    def __init__(self, seasonal_means, residual_stats, window_size=6):
        self.seasonal_means = seasonal_means
        self.residual_stats = residual_stats
        self.window_size = window_size  # 24-hour window (6 readings)
        
        # Initialize history with dummy data (mean values)
        self.history = {
            "temperature": [self.residual_stats["temperature"]["mu"]] * self.window_size,
            "humidity": [self.residual_stats["humidity"]["mu"]] * self.window_size,
        }

    def _get_time_slot(self, hour):
        """Convert timestamp to 0-5 time slot."""
        return (hour // 4) % 6

    def detect(self, hour, temperature, humidity):
        """Check for anomalies in temperature and humidity."""
        anomalies = {"temperature": False, "humidity": False}
        time_slot = self._get_time_slot(hour)

        for sensor, value in [("temperature", temperature), ("humidity", humidity)]:
            # Update history with new data point
            self.history[sensor].append(value)
            if len(self.history[sensor]) > self.window_size:
                self.history[sensor].pop(0)

            # Calculate moving average (trend estimate)
            trend = np.mean(self.history[sensor][-self.window_size:])
            seasonal = self.seasonal_means[sensor].iloc[time_slot]
            residual = value - (trend + seasonal)

            # Calculate Z-score
            mu = self.residual_stats[sensor]["mu"]
            sigma = self.residual_stats[sensor]["sigma"]
            z_score = (residual - mu) / sigma

            anomalies[sensor] = abs(z_score) > 3  # 3σ threshold

        return anomalies

detector = AnomalyDetector(seasonal_means, residual_stats)