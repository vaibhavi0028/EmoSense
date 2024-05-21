import llmware
from flask import Flask, jsonify, request
import pandas as pd

app = Flask(__name__)

def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response

try:
    df = pd.read_csv('https://query.data.world/s/jfdmcynpnwlycfcssgghoexwtc2rtj?dws=00000')
    connection_status = "Connection successfull"
except Exception as e:
    print("Error:", e)
    df = pd.DataFrame()
    connection_status = "Connection failed"

@app.route('/')
def index():
    return connection_status

@app.route('/data')
def get_data():
    data = df.to_dict(orient='records')
    return jsonify(data)

@app.route('/analyze', methods=['POST'])
def analyze_sentiment():
    text = request.json.get('text')
    if text:
        sentiment_analysis = llmware.SentimentAnalysis()
        result = sentiment_analysis.analyze(text)
        sentiment_score = result['score']
        return jsonify({'sentiment': sentiment_score})
    else:
        return jsonify({'error': 'No text provided'}), 400

@app.after_request
def after_request(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response

if __name__ == '__main__':
    app.run(debug=True)
