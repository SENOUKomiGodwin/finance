import os
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
import pandas as pd
import numpy as np

@dataclass
class QueryResult:
    """Result of a data query"""
    answer: str
    data: Optional[List[Dict[str, Any]]] = None
    query_type: Optional[str] = None
    confidence: float = 1.0

class DataQueryEngine:
    """Query engine for financial data with zero hallucinations"""
    
    def __init__(self):
        self.data = None
        self.df = None
    
    def load_data(self, data: List[Dict[str, Any]]) -> None:
        """Load financial data for querying"""
        self.data = data
        self.df = pd.DataFrame(data)
        
        # Ensure numeric types
        if 'amount' in self.df.columns:
            self.df['amount'] = pd.to_numeric(self.df['amount'], errors='coerce')
        
        if 'date' in self.df.columns:
            self.df['date'] = pd.to_datetime(self.df['date'], errors='coerce')
    
    def query_total(self, filters: Optional[Dict[str, Any]] = None) -> QueryResult:
        """Query total amount"""
        if self.df is None or self.df.empty:
            return QueryResult(answer="No data available to query.")
        
        df_filtered = self._apply_filters(filters)
        
        if df_filtered.empty:
            return QueryResult(answer="No matching records found.")
        
        total = df_filtered['amount'].sum()
        count = len(df_filtered)
        
        return QueryResult(
            answer=f"The total amount is ${total:,.2f} across {count} records.",
            data=[{'total': float(total), 'count': int(count)}],
            query_type='total',
            confidence=1.0
        )
    
    def query_average(self, filters: Optional[Dict[str, Any]] = None) -> QueryResult:
        """Query average amount"""
        if self.df is None or self.df.empty:
            return QueryResult(answer="No data available to query.")
        
        df_filtered = self._apply_filters(filters)
        
        if df_filtered.empty:
            return QueryResult(answer="No matching records found.")
        
        avg = df_filtered['amount'].mean()
        count = len(df_filtered)
        
        return QueryResult(
            answer=f"The average amount is ${avg:,.2f} across {count} records.",
            data=[{'average': float(avg), 'count': int(count)}],
            query_type='average',
            confidence=1.0
        )
    
    def query_by_category(self, category: Optional[str] = None) -> QueryResult:
        """Query data grouped by category"""
        if self.df is None or self.df.empty:
            return QueryResult(answer="No data available to query.")
        
        if 'category' not in self.df.columns:
            return QueryResult(answer="Category field not available in the dataset.")
        
        if category:
            df_filtered = self.df[self.df['category'].str.lower() == category.lower()]
            if df_filtered.empty:
                return QueryResult(answer=f"No records found for category: {category}")
            
            total = df_filtered['amount'].sum()
            count = len(df_filtered)
            avg = df_filtered['amount'].mean()
            
            return QueryResult(
                answer=f"For category '{category}': Total: ${total:,.2f}, Average: ${avg:,.2f}, Count: {count}",
                data=[{
                    'category': category,
                    'total': float(total),
                    'average': float(avg),
                    'count': int(count)
                }],
                query_type='category',
                confidence=1.0
            )
        else:
            # Group by all categories
            grouped = self.df.groupby('category')['amount'].agg(['sum', 'count', 'mean'])
            
            result_text = "Breakdown by category:\n"
            results = []
            
            for cat, row in grouped.iterrows():
                result_text += f"- {cat}: ${row['sum']:,.2f} (avg: ${row['mean']:,.2f}, count: {int(row['count'])})\n"
                results.append({
                    'category': cat,
                    'total': float(row['sum']),
                    'average': float(row['mean']),
                    'count': int(row['count'])
                })
            
            return QueryResult(
                answer=result_text.strip(),
                data=results,
                query_type='category_grouped',
                confidence=1.0
            )
    
    def query_by_region(self, region: Optional[str] = None) -> QueryResult:
        """Query data by region"""
        if self.df is None or self.df.empty:
            return QueryResult(answer="No data available to query.")
        
        if 'region' not in self.df.columns:
            return QueryResult(answer="Region field not available in the dataset.")
        
        if region:
            df_filtered = self.df[self.df['region'].str.lower() == region.lower()]
            if df_filtered.empty:
                return QueryResult(answer=f"No records found for region: {region}")
            
            total = df_filtered['amount'].sum()
            count = len(df_filtered)
            
            return QueryResult(
                answer=f"For region '{region}': Total: ${total:,.2f}, Count: {count}",
                data=[{'region': region, 'total': float(total), 'count': int(count)}],
                query_type='region',
                confidence=1.0
            )
        else:
            grouped = self.df.groupby('region')['amount'].agg(['sum', 'count'])
            
            result_text = "Breakdown by region:\n"
            results = []
            
            for reg, row in grouped.iterrows():
                result_text += f"- {reg}: ${row['sum']:,.2f} (count: {int(row['count'])})\n"
                results.append({
                    'region': reg,
                    'total': float(row['sum']),
                    'count': int(row['count'])
                })
            
            return QueryResult(
                answer=result_text.strip(),
                data=results,
                query_type='region_grouped',
                confidence=1.0
            )
    
    def query_top_n(self, n: int = 5, by: str = 'amount') -> QueryResult:
        """Query top N records"""
        if self.df is None or self.df.empty:
            return QueryResult(answer="No data available to query.")
        
        if by not in self.df.columns:
            return QueryResult(answer=f"Field '{by}' not available in the dataset.")
        
        df_sorted = self.df.sort_values(by, ascending=False).head(n)
        
        result_text = f"Top {n} records by {by}:\n"
        results = []
        
        for _, row in df_sorted.iterrows():
            result_text += f"- {row.get('date', 'N/A')}: ${row[by]:,.2f}\n"
            results.append(row.to_dict())
        
        return QueryResult(
            answer=result_text.strip(),
            data=results,
            query_type='top_n',
            confidence=1.0
        )
    
    def query_date_range(self, start_date: str, end_date: str) -> QueryResult:
        """Query data within date range"""
        if self.df is None or self.df.empty:
            return QueryResult(answer="No data available to query.")
        
        if 'date' not in self.df.columns:
            return QueryResult(answer="Date field not available in the dataset.")
        
        df_filtered = self.df[
            (self.df['date'] >= start_date) & 
            (self.df['date'] <= end_date)
        ]
        
        if df_filtered.empty:
            return QueryResult(answer=f"No records found between {start_date} and {end_date}")
        
        total = df_filtered['amount'].sum()
        count = len(df_filtered)
        avg = df_filtered['amount'].mean()
        
        return QueryResult(
            answer=f"Between {start_date} and {end_date}: Total: ${total:,.2f}, Average: ${avg:,.2f}, Count: {count}",
            data=[{
                'start_date': start_date,
                'end_date': end_date,
                'total': float(total),
                'average': float(avg),
                'count': int(count)
            }],
            query_type='date_range',
            confidence=1.0
        )
    
    def _apply_filters(self, filters: Optional[Dict[str, Any]]) -> pd.DataFrame:
        """Apply filters to dataframe"""
        if not filters:
            return self.df
        
        df_filtered = self.df.copy()
        
        for key, value in filters.items():
            if key in df_filtered.columns:
                if isinstance(value, str):
                    df_filtered = df_filtered[df_filtered[key].str.lower() == value.lower()]
                else:
                    df_filtered = df_filtered[df_filtered[key] == value]
        
        return df_filtered
    
    def parse_natural_query(self, query: str) -> QueryResult:
        """Parse natural language query and execute appropriate function"""
        query_lower = query.lower()
        
        # Detect query type
        if 'total' in query_lower or 'sum' in query_lower:
            return self.query_total()
        elif 'average' in query_lower or 'mean' in query_lower:
            return self.query_average()
        elif 'category' in query_lower:
            # Extract category if specified
            words = query_lower.split()
            if 'by' in words:
                idx = words.index('by')
                if idx + 1 < len(words):
                    category = words[idx + 1]
                    return self.query_by_category(category)
            return self.query_by_category()
        elif 'region' in query_lower:
            words = query_lower.split()
            if 'by' in words:
                idx = words.index('by')
                if idx + 1 < len(words):
                    region = words[idx + 1]
                    return self.query_by_region(region)
            return self.query_by_region()
        elif 'top' in query_lower:
            # Extract number
            import re
            match = re.search(r'top (\d+)', query_lower)
            n = int(match.group(1)) if match else 5
            return self.query_top_n(n)
        elif 'highest' in query_lower or 'maximum' in query_lower:
            return self.query_top_n(1)
        elif 'lowest' in query_lower or 'minimum' in query_lower:
            # Query bottom N
            if self.df is None or self.df.empty:
                return QueryResult(answer="No data available to query.")
            df_sorted = self.df.sort_values('amount', ascending=True).head(5)
            result_text = "Lowest amounts:\n"
            for _, row in df_sorted.iterrows():
                result_text += f"- {row.get('date', 'N/A')}: ${row['amount']:,.2f}\n"
            return QueryResult(answer=result_text.strip(), query_type='bottom_n', confidence=1.0)
        else:
            return QueryResult(
                answer="I couldn't understand your query. Try asking about totals, averages, categories, regions, or top records.",
                confidence=0.0
            )
