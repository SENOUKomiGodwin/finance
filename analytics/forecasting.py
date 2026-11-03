import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from typing import Dict, List, Any
import json

class RevenueForecaster:
    """Forecast revenue using time series analysis"""
    
    def __init__(self):
        self.model = None
        self.poly_features = None
        self.use_polynomial = False
    
    def prepare_time_series(self, df: pd.DataFrame) -> pd.DataFrame:
        """Prepare time series data for forecasting"""
        df = df.copy()
        
        # Ensure date is datetime
        df['date'] = pd.to_datetime(df['date'])
        
        # Sort by date
        df = df.sort_values('date')
        
        # Filter only revenue records
        if 'type' in df.columns:
            df = df[df['type'].str.lower() == 'revenue']
        elif 'category' in df.columns:
            df = df[df['category'].str.lower() == 'revenue']
        
        # Ensure amount is numeric
        df['amount'] = pd.to_numeric(df['amount'], errors='coerce')
        df = df.dropna(subset=['amount', 'date'])
        
        # Aggregate by date (sum amounts for same date)
        df = df.groupby('date')['amount'].sum().reset_index()
        
        # Add time index
        df['time_index'] = range(len(df))
        
        return df
    
    def fit_linear(self, df: pd.DataFrame) -> None:
        """Fit linear regression model"""
        X = df[['time_index']].values
        y = df['amount'].values
        
        self.model = LinearRegression()
        self.model.fit(X, y)
        self.use_polynomial = False
    
    def fit_polynomial(self, df: pd.DataFrame, degree: int = 2) -> None:
        """Fit polynomial regression model"""
        X = df[['time_index']].values
        y = df['amount'].values
        
        self.poly_features = PolynomialFeatures(degree=degree)
        X_poly = self.poly_features.fit_transform(X)
        
        self.model = LinearRegression()
        self.model.fit(X_poly, y)
        self.use_polynomial = True
    
    def predict(self, periods: int, last_index: int) -> List[Dict[str, Any]]:
        """Generate forecast for specified periods"""
        forecast = []
        
        for i in range(1, periods + 1):
            future_index = [[last_index + i]]
            
            if self.use_polynomial:
                future_index_poly = self.poly_features.transform(future_index)
                predicted = self.model.predict(future_index_poly)[0]
            else:
                predicted = self.model.predict(future_index)[0]
            
            forecast.append({
                'period': i,
                'predicted': round(float(predicted), 2)
            })
        
        return forecast
    
    def calculate_growth_rate(self, df: pd.DataFrame) -> float:
        """Calculate historical growth rate"""
        if len(df) < 2:
            return 0.0
        
        first_value = df.iloc[0]['amount']
        last_value = df.iloc[-1]['amount']
        
        if first_value == 0:
            return 0.0
        
        growth_rate = ((last_value - first_value) / first_value) * 100
        return round(growth_rate, 2)
    
    def forecast(self, data: List[Dict[str, Any]], periods: int = 12) -> Dict[str, Any]:
        """
        Generate revenue forecast
        
        Args:
            data: List of financial records
            periods: Number of periods to forecast
            
        Returns:
            Dictionary with forecast and metadata
        """
        df = self.prepare_time_series(data)
        
        if len(df) < 2:
            return {
                'forecast': [],
                'method': 'insufficient_data',
                'growth_rate': 0,
                'error': 'Need at least 2 data points for forecasting'
            }
        
        # Calculate growth rate
        growth_rate = self.calculate_growth_rate(df)
        
        # Choose model based on data size
        if len(df) >= 10:
            self.fit_polynomial(df, degree=2)
            method = 'polynomial_regression'
        else:
            self.fit_linear(df)
            method = 'linear_regression'
        
        # Generate forecast
        last_index = df['time_index'].max()
        forecast = self.predict(periods, last_index)
        
        # Calculate confidence metrics
        actual_values = df['amount'].values
        predicted_values = []
        
        if self.use_polynomial:
            X_poly = self.poly_features.transform(df[['time_index']].values)
            predicted_values = self.model.predict(X_poly)
        else:
            predicted_values = self.model.predict(df[['time_index']].values)
        
        # Calculate RMSE
        rmse = np.sqrt(np.mean((actual_values - predicted_values) ** 2))
        
        return {
            'forecast': forecast,
            'method': method,
            'growth_rate': growth_rate,
            'metrics': {
                'rmse': round(float(rmse), 2),
                'historical_periods': len(df),
                'forecast_periods': periods
            },
            'historical_data': {
                'start_date': df['date'].min().isoformat(),
                'end_date': df['date'].max().isoformat(),
                'total_revenue': round(float(df['amount'].sum()), 2)
            }
        }
