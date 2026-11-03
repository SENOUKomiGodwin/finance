import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from typing import Dict, List, Any, Tuple
import json

class AnomalyDetector:
    """Detect anomalies in financial data using Isolation Forest"""
    
    def __init__(self, contamination: float = 0.1):
        """
        Initialize anomaly detector
        
        Args:
            contamination: Expected proportion of outliers in the dataset
        """
        self.contamination = contamination
        self.model = None
        self.scaler = StandardScaler()
    
    def prepare_features(self, df: pd.DataFrame) -> np.ndarray:
        """Prepare features for anomaly detection"""
        features = []
        
        # Amount is the primary feature
        features.append(df['amount'].values)
        
        # Add time-based features if date is available
        if 'date' in df.columns:
            df['date'] = pd.to_datetime(df['date'])
            features.append(df['date'].dt.dayofyear.values)
            features.append(df['date'].dt.month.values)
        
        # Add category encoding if available
        if 'category' in df.columns and df['category'].nunique() > 1:
            category_encoded = pd.get_dummies(df['category'], prefix='cat')
            for col in category_encoded.columns:
                features.append(category_encoded[col].values)
        
        # Stack features
        feature_matrix = np.column_stack(features)
        
        # Handle NaN values
        feature_matrix = np.nan_to_num(feature_matrix, nan=0.0)
        
        return feature_matrix
    
    def fit(self, df: pd.DataFrame) -> None:
        """Fit the isolation forest model"""
        features = self.prepare_features(df)
        
        # Scale features
        features_scaled = self.scaler.fit_transform(features)
        
        # Fit model
        self.model = IsolationForest(
            contamination=self.contamination,
            random_state=42,
            n_estimators=100
        )
        self.model.fit(features_scaled)
    
    def predict(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """
        Predict anomalies
        
        Returns:
            Tuple of (anomaly_labels, anomaly_scores)
            -1 indicates anomaly, 1 indicates normal
        """
        if self.model is None:
            raise ValueError("Model must be fitted before prediction")
        
        features = self.prepare_features(df)
        features_scaled = self.scaler.transform(features)
        
        labels = self.model.predict(features_scaled)
        scores = self.model.decision_function(features_scaled)
        
        return labels, scores
    
    def detect_anomalies(self, data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Detect anomalies in financial data
        
        Args:
            data: List of financial records
            
        Returns:
            Dictionary with anomalies and statistics
        """
        df = pd.DataFrame(data)
        
        # Ensure amount is numeric
        df['amount'] = pd.to_numeric(df['amount'], errors='coerce')
        df = df.dropna(subset=['amount'])
        
        if len(df) < 10:
            return {
                'anomalies': [],
                'statistics': {
                    'mean': float(df['amount'].mean()),
                    'stdDev': float(df['amount'].std()),
                    'threshold': 0,
                    'message': 'Insufficient data for anomaly detection (need at least 10 records)'
                }
            }
        
        # Fit model
        self.fit(df)
        
        # Predict
        labels, scores = self.predict(df)
        
        # Identify anomalies
        anomaly_indices = np.where(labels == -1)[0]
        anomalies = []
        
        for idx in anomaly_indices:
            anomalies.append({
                'index': int(idx),
                'date': str(df.iloc[idx].get('date', 'Unknown')),
                'amount': float(df.iloc[idx]['amount']),
                'category': str(df.iloc[idx].get('category', 'Unknown')),
                'description': str(df.iloc[idx].get('description', 'Unknown')),
                'anomaly_score': float(scores[idx])
            })
        
        # Calculate statistics
        mean_amount = float(df['amount'].mean())
        std_amount = float(df['amount'].std())
        threshold = mean_amount + 2 * std_amount
        
        return {
            'anomalies': anomalies,
            'statistics': {
                'mean': round(mean_amount, 2),
                'stdDev': round(std_amount, 2),
                'threshold': round(threshold, 2),
                'total_anomalies': len(anomalies),
                'anomaly_percentage': round((len(anomalies) / len(df)) * 100, 2)
            }
        }
