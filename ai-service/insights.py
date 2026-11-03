import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional
from dataclasses import dataclass

@dataclass
class Insight:
    """Generated insight about financial data"""
    type: str
    title: str
    description: str
    severity: str  # info, warning, critical
    data: Optional[Dict[str, Any]] = None

class InsightGenerator:
    """Generate automated insights from financial data"""
    
    def __init__(self):
        self.data = None
        self.df = None
    
    def load_data(self, data: List[Dict[str, Any]]) -> None:
        """Load financial data for insight generation"""
        self.data = data
        self.df = pd.DataFrame(data)
        
        # Ensure numeric types
        if 'amount' in self.df.columns:
            self.df['amount'] = pd.to_numeric(self.df['amount'], errors='coerce')
        
        if 'date' in self.df.columns:
            self.df['date'] = pd.to_datetime(self.df['date'], errors='coerce')
    
    def generate_all_insights(self) -> List[Insight]:
        """Generate all available insights"""
        insights = []
        
        if self.df is None or self.df.empty:
            return [Insight(
                type='error',
                title='No Data',
                description='No data available for insight generation.',
                severity='info'
            )]
        
        insights.extend(self._revenue_insights())
        insights.extend(self._expense_insights())
        insights.extend(self._trend_insights())
        insights.extend(self._anomaly_insights())
        insights.extend(self._category_insights())
        
        return insights
    
    def _revenue_insights(self) -> List[Insight]:
        """Generate revenue-related insights"""
        insights = []
        
        # Filter revenue records
        if 'type' in self.df.columns:
            revenue_df = self.df[self.df['type'].str.lower() == 'revenue']
        elif 'category' in self.df.columns:
            revenue_df = self.df[self.df['category'].str.lower() == 'revenue']
        else:
            revenue_df = self.df
        
        if revenue_df.empty:
            return insights
        
        total_revenue = revenue_df['amount'].sum()
        avg_revenue = revenue_df['amount'].mean()
        
        # Revenue trend
        if 'date' in revenue_df.columns:
            revenue_df = revenue_df.sort_values('date')
            recent_revenue = revenue_df.tail(30)['amount'].sum()
            earlier_revenue = revenue_df.head(30)['amount'].sum() if len(revenue_df) > 30 else 0
            
            if earlier_revenue > 0:
                growth_rate = ((recent_revenue - earlier_revenue) / earlier_revenue) * 100
                
                if growth_rate > 20:
                    insights.append(Insight(
                        type='revenue_growth',
                        title='Strong Revenue Growth',
                        description=f'Revenue has increased by {growth_rate:.1f}% in the recent period compared to earlier data.',
                        severity='info',
                        data={'growth_rate': growth_rate, 'recent': recent_revenue, 'earlier': earlier_revenue}
                    ))
                elif growth_rate < -20:
                    insights.append(Insight(
                        type='revenue_decline',
                        title='Revenue Decline Detected',
                        description=f'Revenue has decreased by {abs(growth_rate):.1f}% in the recent period. This may require attention.',
                        severity='warning',
                        data={'growth_rate': growth_rate, 'recent': recent_revenue, 'earlier': earlier_revenue}
                    ))
        
        return insights
    
    def _expense_insights(self) -> List[Insight]:
        """Generate expense-related insights"""
        insights = []
        
        # Filter expense records
        if 'type' in self.df.columns:
            expense_df = self.df[self.df['type'].str.lower() == 'expense']
        else:
            expense_df = self.df
        
        if expense_df.empty:
            return insights
        
        total_expenses = expense_df['amount'].sum()
        
        # High expense categories
        if 'category' in expense_df.columns:
            category_totals = expense_df.groupby('category')['amount'].sum().sort_values(ascending=False)
            
            if len(category_totals) > 0:
                top_category = category_totals.index[0]
                top_amount = category_totals.iloc[0]
                category_percentage = (top_amount / total_expenses) * 100
                
                if category_percentage > 50:
                    insights.append(Insight(
                        type='high_expense_category',
                        title='High Expense Concentration',
                        description=f'The "{top_category}" category accounts for {category_percentage:.1f}% of total expenses.',
                        severity='warning',
                        data={'category': top_category, 'amount': top_amount, 'percentage': category_percentage}
                    ))
        
        return insights
    
    def _trend_insights(self) -> List[Insight]:
        """Generate trend-related insights"""
        insights = []
        
        if 'date' not in self.df.columns:
            return insights
        
        df_sorted = self.df.sort_values('date')
        
        # Monthly trend
        if len(df_sorted) >= 12:
            df_sorted['month'] = df_sorted['date'].dt.to_period('M')
            monthly_totals = df_sorted.groupby('month')['amount'].sum()
            
            # Check for declining trend
            recent_months = monthly_totals.tail(3).values
            earlier_months = monthly_totals.head(3).values if len(monthly_totals) >= 6 else monthly_totals.values
            
            if len(recent_months) == 3 and len(earlier_months) >= 3:
                recent_avg = np.mean(recent_months)
                earlier_avg = np.mean(earlier_months)
                
                if recent_avg < earlier_avg * 0.8:
                    insights.append(Insight(
                        type='declining_trend',
                        title='Declining Trend Detected',
                        description=f'Recent monthly averages are {(recent_avg/earlier_avg)*100:.1f}% of earlier averages.',
                        severity='warning',
                        data={'recent_avg': recent_avg, 'earlier_avg': earlier_avg}
                    ))
        
        return insights
    
    def _anomaly_insights(self) -> List[Insight]:
        """Generate anomaly-related insights using statistical methods"""
        insights = []
        
        if 'amount' not in self.df.columns:
            return insights
        
        amounts = self.df['amount'].dropna()
        
        if len(amounts) < 10:
            return insights
        
        # Statistical anomaly detection
        mean = amounts.mean()
        std = amounts.std()
        
        # Find outliers (beyond 2 standard deviations)
        outliers = self.df[(self.df['amount'] > mean + 2*std) | (self.df['amount'] < mean - 2*std)]
        
        if len(outliers) > 0:
            insights.append(Insight(
                type='statistical_anomalies',
                title=f'{len(outliers)} Statistical Anomalies Detected',
                description=f'Found {len(outliers)} records with amounts beyond 2 standard deviations from the mean.',
                severity='info',
                data={'anomaly_count': len(outliers), 'mean': mean, 'std': std}
            ))
        
        return insights
    
    def _category_insights(self) -> List[Insight]:
        """Generate category-related insights"""
        insights = []
        
        if 'category' not in self.df.columns:
            return insights
        
        category_counts = self.df['category'].value_counts()
        
        # Too many categories
        if len(category_counts) > 20:
            insights.append(Insight(
                type='category_fragmentation',
                title='High Category Fragmentation',
                description=f'Data is spread across {len(category_counts)} different categories. Consider consolidating for better analysis.',
                severity='info',
                data={'category_count': len(category_counts)}
            ))
        
        # Missing categories
        missing_categories = self.df['category'].isna().sum()
        if missing_categories > 0:
            insights.append(Insight(
                type='missing_categories',
                title='Missing Category Data',
                description=f'{missing_categories} records are missing category information.',
                severity='warning',
                data={'missing_count': missing_categories}
            ))
        
        return insights
