from flask import Flask, request, jsonify
from flask_cors import CORS
from data_processor import DataProcessor
from anomaly_detection import AnomalyDetector
from forecasting import RevenueForecaster

app = Flask(__name__)
CORS(app)

# Initialize processors
data_processor = DataProcessor()
anomaly_detector = AnomalyDetector()
revenue_forecaster = RevenueForecaster()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'analytics'})

@app.route('/api/validate', methods=['POST'])
def validate_data():
    """Validate financial data"""
    try:
        data = request.json.get('data', [])
        result = data_processor.validate_data(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/statistics', methods=['POST'])
def calculate_statistics():
    """Calculate basic statistics"""
    try:
        data = request.json.get('data', [])
        df = data_processor.clean_data(data)
        stats = data_processor.calculate_basic_statistics(df)
        return jsonify(stats)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/group', methods=['POST'])
def group_data():
    """Group data by category"""
    try:
        data = request.json.get('data', [])
        category = request.json.get('category', 'category')
        df = data_processor.clean_data(data)
        grouped = data_processor.group_by_category(df, category)
        return jsonify(grouped)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/anomalies', methods=['POST'])
def detect_anomalies():
    """Detect anomalies in financial data"""
    try:
        data = request.json.get('data', [])
        contamination = request.json.get('contamination', 0.1)
        
        anomaly_detector.contamination = contamination
        result = anomaly_detector.detect_anomalies(data)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/forecast', methods=['POST'])
def generate_forecast():
    """Generate revenue forecast"""
    try:
        data = request.json.get('data', [])
        periods = request.json.get('periods', 12)
        
        result = revenue_forecaster.forecast(data, periods)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001, debug=True)
