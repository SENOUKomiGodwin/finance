import pandas as pd
import numpy as np
from typing import Dict, List, Any
import json

class DataProcessor:
    """Process and validate financial data"""
    
    def __init__(self):
        self.required_fields = ['date', 'amount']
        self.optional_fields = ['type', 'category', 'description', 'region', 'department']
    
    def validate_data(self, data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Validate financial data structure"""
        if not isinstance(data, list):
            return {'valid': False, 'error': 'Data must be a list'}
        
        if len(data) == 0:
            return {'valid': False, 'error': 'Data cannot be empty'}
        
        # Check first record for required fields
        first_record = data[0]
        missing_fields = [field for field in self.required_fields if field not in first_record]
        
        if missing_fields:
            return {
                'valid': False,
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }
        
        # Validate data types
        for i, record in enumerate(data):
            if 'date' not in record or not record['date']:
                return {'valid': False, 'error': f'Record {i}: Missing date field'}
            
            if 'amount' not in record:
                return {'valid': False, 'error': f'Record {i}: Missing amount field'}
            
            try:
                float(record['amount'])
            except (ValueError, TypeError):
                return {'valid': False, 'error': f'Record {i}: Amount must be numeric'}
        
        return {'valid': True, 'record_count': len(data)}
    
    def clean_data(self, data: List[Dict[str, Any]]) -> pd.DataFrame:
        """Clean and normalize financial data"""
        df = pd.DataFrame(data)
        
        # Convert amount to numeric
        df['amount'] = pd.to_numeric(df['amount'], errors='coerce')
        
        # Convert date to datetime
        df['date'] = pd.to_datetime(df['date'], errors='coerce')
        
        # Fill missing optional fields
        for field in self.optional_fields:
            if field not in df.columns:
                df[field] = 'Unknown'
            else:
                df[field] = df[field].fillna('Unknown')
        
        # Remove rows with invalid dates or amounts
        df = df.dropna(subset=['date', 'amount'])
        
        return df
    
    def calculate_basic_statistics(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Calculate basic statistics"""
        return {
            'total_records': len(df),
            'total_amount': float(df['amount'].sum()),
            'mean_amount': float(df['amount'].mean()),
            'median_amount': float(df['amount'].median()),
            'std_amount': float(df['amount'].std()),
            'min_amount': float(df['amount'].min()),
            'max_amount': float(df['amount'].max()),
            'date_range': {
                'start': df['date'].min().isoformat() if not df.empty else None,
                'end': df['date'].max().isoformat() if not df.empty else None
            }
        }
    
    def group_by_category(self, df: pd.DataFrame, category: str = 'category') -> Dict[str, Any]:
        """Group data by category"""
        if category not in df.columns:
            return {}
        
        grouped = df.groupby(category)['amount'].agg(['sum', 'count', 'mean']).to_dict('index')
        
        return {
            cat: {
                'total': float(stats['sum']),
                'count': int(stats['count']),
                'average': float(stats['mean'])
            }
            for cat, stats in grouped.items()
        }
    
    def filter_by_date_range(self, df: pd.DataFrame, start_date: str, end_date: str) -> pd.DataFrame:
        """Filter data by date range"""
        df['date'] = pd.to_datetime(df['date'])
        mask = (df['date'] >= start_date) & (df['date'] <= end_date)
        return df[mask]
    
    def filter_by_category(self, df: pd.DataFrame, categories: List[str]) -> pd.DataFrame:
        """Filter data by categories"""
        return df[df['category'].isin(categories)]
    
    def filter_by_region(self, df: pd.DataFrame, regions: List[str]) -> pd.DataFrame:
        """Filter data by regions"""
        return df[df['region'].isin(regions)]
