import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style.css';

function App() {
  const [data, setData] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sentiment, setSentiment] = useState(null);
  const [connected, setConnected] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('https://emosense-backend.vercel.app/data');
      setData(response.data);
      setConnected(true);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setButtonClicked(true);

    if (!inputText.trim()) {
      setSentiment(null);
      return;
    }

    try {
      const response = await axios.post('https://emosense-backend.vercel.app/analyze', { text: inputText });
      setSentiment(response.data.sentiment);
      setConnected(true);
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      setConnected(false);
      analyzeSentimentLocally(inputText); // Call local sentiment analysis if backend is not connected
    }
  };

  const analyzeSentimentLocally = (text) => {
    const customSentiments = { enthralled: 0.85, sad: -0.9, happy: 0.9, angry: -0.8, bored: -0.7 }; // Custom sentiments
    const blob = new window.TextBlob(text.toLowerCase());
    const words = blob.words;
    let sentimentScore = 0;
    for (const word of words) {
      if (word in customSentiments) {
        sentimentScore += customSentiments[word];
      }
    }
    sentimentScore = Math.min(1, Math.max(-1, sentimentScore));
    setSentiment(sentimentScore);
  };

  return (
    <div>
      <nav className="nav">
        <div className="cont">
          <div className="navtxt">
            <Typewriter text="EmoSense" />
          </div>
        </div>
      </nav>
      <h1>Want to analyse your emotions?</h1>
      {connected ? (
        <p>Connected to backend</p>
      ) : (
        <p>Connecting to backend...</p>
      )}
      <form onSubmit={handleSubmit}>
        <label>
          <h2>Enter what you feel!!</h2>
          <textarea value={inputText} onChange={handleInputChange} placeholder="Type something..." />
        </label>
        <button type="submit">Analyze</button>
      </form>
      {buttonClicked && !inputText.trim() && (
        <div className="output-container">
          <p className="output-text">Please enter text to analyze sentiment.</p>
        </div>
      )}
      {sentiment !== null && (
        <div className="output-container">
          <p className="output-text">
            {sentiment > 0 ? 'Positive Emotions! Stay happy😊' : sentiment < 0 ? 'Negative Emotions! Try to stay positive😔' : 'Neutral Emotions! Keep a balance🙂'}
          </p>
        </div>
      )}
    </div>
  );
}

const Typewriter = ({ text }) => {
  const [currentText, setCurrentText] = useState('');
  const [direction, setDirection] = useState(1);
  const [isWaiting, setIsWaiting] = useState(false);

  useEffect(() => {
    let intervalId;

    const typeWriter = () => {
      intervalId = setInterval(() => {
        setCurrentText((prevText) => {
          const nextIndex = prevText.length + direction;
          if (nextIndex === text.length || nextIndex === 0) {
            if (prevText === text) {
              clearInterval(intervalId);
              setIsWaiting(true);
              setTimeout(() => {
                setDirection(-direction);
                setIsWaiting(false);
              }, 3000);
            } else {
              setDirection(-direction);
            }
          }
          return text.slice(0, nextIndex);
        });
      }, 250);
    };

    if (!isWaiting) {
      typeWriter();
    }

    return () => clearInterval(intervalId);
  }, [text, direction, isWaiting]);

  return <>{currentText}</>;
};

export default App;

from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
from textblob import TextBlob

app = Flask(__name__)
CORS(app)

try:
    df = pd.read_csv('text_emotion.csv')
    connection_status = "Connection successful"
except Exception as e:
    print("Error:", e)
    df = pd.DataFrame()
    connection_status = "Connection failed"

custom_sentiments = {'enthralled': 0.85, 'sad': -0.9, 'low':-0.5, 'high':0.5, 'praiseworthy': 0.85, 'excitement': 0.8, 'enlightened': 0.85, 'boring': -0.7, 'grief': -0.95, 'celebrated': 0.9, 'unacceptable': -0.8, 'frustrated': -0.7, 'uplifter': 0.85, 'chaotic': -0.8, 'wretched': -0.95, 'convivial': 0.85, 'annoy': -0.7, 'despondency': -0.95, 'rhapsodizing': 0.95, 'charismatically': 0.85, 'exultation': 0.95, 'zealous': 0.9, 'charmfully': 0.8, 'radiant': 0.9, 'fear': -0.4, 'euphoric': 0.95, 'animated': 0.8, 'frightened': -0.8, 'ardent': 0.9, 'enjoyment': 0.8, 'eager': 0.7, 'overjoyed': 0.95, 'serenity': 0.85, 'laudable': 0.85, 'agony': -0.95, 'suck': -0.8, 'casualty': -0.9, 'discouragement': -0.7, 'passion': 0.9, 'enthrall': 0.85, 'satisfactory': 0.7, 'exuberant': 0.9, 'celebrate': 0.9, 'hatred': -0.9, 'amazing': 0.9, 'upliftingly': 0.85, 'enlightening': 0.85, 'captivateness': 0.85, 'unexceptional': -0.7, 'ravishingly': 0.95, 'courageous': 0.8, 'festivity': 0.85, 'advancement': 0.6, 'growth': 0.5, 'affection': 0.85, 'enchantment': 0.85, 'blithesome': 0.85, 'upliftment': 0.85, 'sulky': -0.8, 'dejection': -0.9, 'passionate': 0.9, 'pleasant': 0.8, 'rapturing': 0.95, 'euphoria': 0.95, 'alluringly': 0.8, 'allured': 0.8, 'bright': 0.7, 'awful': -0.9, 'despair': -0.95, 'breakthrough': 0.8, 'achievement': 0.85, 'disappointment': -0.8, 'rhapsodized': 0.95, 'dismal': -0.85, 'happy': 0.9, 'positivity': 0.9, 'honest': 0.8, 'rhapsodically': 0.95, 'triumphal': 0.9, 'hate': -0.95, 'fatality': -0.95, 'thrilled': 0.9, 'delighted': 0.95, 'humility': 0.8, 'joyous': 0.9, 'joyless': -0.8, 'rapturously': 0.95, 'praised': 0.85, 'doleful': -0.8, 'enraptures': 0.9, 'rhapsodic': 0.95, 'acceptable': 0.7, 'morose': -0.7, 'adequate': 0.7, 'celebration': 0.9, 'arrogant': -0.8, 'troubled': -0.7, 'lively': 0.75, 'exciting': 0.8, 'motivation': 0.7, 'disappointed': -0.8, 'greedy': -0.8, 'distraught': -0.8, 'anxiety': -0.9, 'test': -0.5, 'calmness': 0.7, 'moody': -0.6, 'gladdening': 0.8, 'worry': -0.7, 'enraptured': 0.9, 'angriness': -0.9, 'empty': -0.8, 'ecstasy': 0.95, 'bewitch': 0.85, 'enchanting': 0.85, 'exam': -0.6, 'desolate': -0.9, 'celebrative': 0.9, 'inspiration': 0.8, 'subpar': -0.7, 'frightening': -0.8, 'cheery': 0.8, 'quiz': -0.4, 'gloomy': -0.9, 'enrapturing': 0.9, 'flawless': 0.95, 'humble': 0.8, 'satisfy': 0.8, 'elated': 0.9, 'melancholic': -0.9, 'love': 0.95, 'marvelous': 0.9, 'courage': 0.8, 'miserable': -0.9, 'dejected': -0.95, 'agonized': -0.95, 'entrance': 0.85, 'gleeful': 0.9, 'imperfect': -0.85, 'captivates': 0.85, 'overjoy': 0.95, 'super': 0.8, 'buoyant': 0.8, 'merry': 0.8, 'unpleasant': -0.8, 'honesty': 0.8, 'rapturousness': 0.95, 'fright': -0.8, 'enchantresses': 0.85, 'revulsion': -0.9, 'blitheful': 0.85, 'enjoy': 0.8, 'bitterness': -0.9, 'charisma': 0.85, 'generosity': 0.8, 'happiness': 0.9, 'delightful': 0.85, 'depression': -0.95, 'captivationally': 0.85, 'sunny': 0.8, 'exultant': 0.95, 'enlightenment': 0.85, 'fascinated': 0.8, 'cram': -0.7, 'victory': 0.9, 'injury': -0.6, 'chipper': 0.8, 'failure': -0.9, 'relaxed': 0.8, 'misery': -0.9, 'peaceful': 0.8, 'gloom': -0.7, 'excellent': 0.9, 'ravishment': 0.95, 'elatedly': 0.9, 'tense': -0.7, 'rhapsody': 0.95, 'resentment': -0.8, 'torment': -0.95, 'angry': -0.8, 'glum': -0.9, 'chill': 0.6, 'charmingly': 0.8, 'entrancingly': 0.85, 'joy': 0.9, 'progress': 0.7, 'charmful': 0.8, 'bemused': 0.6, 'content': 0.7, 'aspiration': 0.6, 'evaluation': -0.1, 'relax': 0.7, 'depressed': -0.85, 'triumph': 0.9, 'determination': 0.8, 'coward': -0.8, 'blithesomeness': 0.85, 'blissful': 0.9, 'enthusiasm': 0.9, 'ecstatic': 0.95, 'pleasurable': 0.8, 'enrapturement': 0.9, 'entrancing': 0.85, 'criticized': -0.8, 'notable': 0.85, 'setback': -0.6, 'hope': 0.7, 'unsatisfying': -0.7, 'flaw': -0.2, 'gladden': 0.8, 'alluring': 0.8, 'enthusiastic': 0.8, 'disaster': -0.85, 'delight': 0.9, 'melancholy': -0.85, 'stellar': 0.9, 'buoyancy': 0.8, 'crestfallen': -0.95, 'disappoint': -0.8, 'terrific': 0.9, 'awesome': 0.9, 'perfect': 0.95, 'pleasure': 0.8, 'charming': 0.8, 'superb': 0.9, 'kindness': 0.8, 'ambition': 0.5, 'enlightenedly': 0.85, 'attraction': 0.8, 'enrapturize': 0.9, 'infatuation': 0.8, 'festivities': 0.85, 'rapturizing': 0.95, 'pessimism': -0.8, 'downcast': -0.9, 'jovial': 0.85, 'unsatisfactory': -0.7, 'hostility': -0.95, 'lighthearted': 0.8, 'thrilling': 0.9, 'celebrates': 0.9, 'celebratory': 0.9, 'ravishing': 0.95, 'bravery': 0.8, 'enrapturizing': 0.9, 'imperfection': -0.1, 'surprise': 0.7, 'indifference': -0.5, 'jocund': 0.9, 'wonderful': 0.9, 'defeat': -0.8, 'disgusting': -0.9, 'accomplishment': 0.85, 'uplifting': 0.85, 'forlorn': -0.9, 'pleased': 0.8, 'enlighten': 0.85, 'faultless': 0.95, 'kind': 0.8, 'calm': 0.7, 'neutral': 0, 'exhilarate': 0.9, 'satisfiedly': 0.8, 'stress': -0.8, 'despondent': -0.95, 'captivating': 0.85, 'spite': -0.8, 'cheerful': 0.85, 'elate': 0.9, 'fearless': 0.7, 'shortcoming': -0.5, 'sorrow': -0.9, 'tranquil': 0.7, 'bewitchingly': 0.85, 'jubilee': 0.9, 'lust': 0.6, 'unhappy': -0.7, 'tragedy': -0.9, 'uplifts': 0.85, 'triumphantly': 0.9, 'charm': 0.8, 'gratified': 0.9, 'good': 0.8, 'genial': 0.7, 'exhilaration': 0.9, 'pain': -0.9, 'charismatic': 0.85, 'disagreeable': -0.7, 'discontented': -0.9, 'loss': -0.7, 'success': 0.9, 'enchantingly': 0.85, 'somber': -0.8, 'hopelessness': -0.9, 'encouragement': 0.7, 'apathy': -0.6, 'animosity': -0.9, 'malice': -0.9, 'desire': 0.7, 'triumphant': 0.9, 'bewitched': 0.85, 'triumphs': 0.9, 'satisfying': 0.8, 'perturbed': -0.6, 'invigorated': 0.85, 'contempt': -0.85, 'abhorrence': -0.95, 'commendable': 0.85, 'stimulated': 0.85, 'entrancement': 0.85, 'nightmare': -0.9, 'celebrations': 0.9, 'lousy': -0.8, 'blithe': 0.7, 'gladsomeness': 0.8, 'sadness': -0.9, 'suffering': -0.95, 'bewitchment': 0.85, 'captivate': 0.85, 'poor': -0.8, 'crush': 0.7, 'joyful': 0.85, 'rhapsodize': 0.95, 'generous': 0.8, 'perseverance': 0.9, 'sullen': -0.8, 'distressed': -0.8, 'gladsomely': 0.8, 'terrible': -0.9, 'allures': 0.8, 'jubilant': 0.95, 'woe': -0.95, 'enthrallingly': 0.85, 'error': -0.3, 'sorrowful': -0.9, 'captivator': 0.85, 'blithely': 0.85, 'exhilarated': 0.9, 'horrible': -0.9, 'assessment': -0.2, 'frightful': -0.8, 'great': 0.85, 'mistake': -0.4, 'jolly': 0.9, 'magnificent': 0.9, 'glee': 0.85, 'enchantress': 0.85, 'study': -0.3, 'victorious': 0.9, 'optimism': 0.8, 'exhilarating': 0.9, 'celebrating': 0.9, 'rhapsodies': 0.95, 'rapture': 0.95, 'bad': -0.8, 'elating': 0.9, 'agreeable': 0.7, 'boredom': -0.8, 'rapturize': 0.95, 'fearful': -0.8, 'captivated': 0.85, 'uplift': 0.85, 'prepare': 0.2, 'anger': -0.9, 'dreadful': -0.9, 'intimacy': 0.7, 'hurt': -0.8, 'unkind': -0.8, 'criticizable': -0.8, 'serene': 0.8, 'elation': 0.9, 'jubilation': 0.95, 'mediocre': -0.7, 'enthralling': 0.85, 'gladsome': 0.8, 'spirited': 0.8, 'blemished': -0.85, 'satisfied': 0.8, 'excited': 0.8, 'adoration': 0.9, 'enthralls': 0.85, 'splendid': 0.9, 'woeful': -0.8, 'triumphing': 0.9, 'relief': 0.85, 'dissatisfied': -0.8, 'anguish': -0.95, 'development': 0.4, 'fantastic': 0.9, 'festive': 0.85, 'enthrallment': 0.85, 'disheartened': -0.9, 'raptured': 0.95, 'lovely': 0.9, 'romance': 0.8, 'atrocious': -0.9, 'vivacious': 0.85, 'upbeat': 0.7, 'joyously': 0.9, 'abysmal': -0.9, 'death': -0.95, 'captivators': 0.85, 'bliss': 0.95, 'festively': 0.85, 'bewitching': 0.85, 'fun': 0.8, 'accident': -0.7, 'allure': 0.8, 'captivation': 0.85, 'brave': 0.8, 'optimistic': 0.8, 'cowardice': -0.8, 'dishonest': -0.8, 'exhilaratedly': 0.9, 'allurement': 0.8, 'entranced': 0.85, 'desolation': -0.8, 'disgust': -0.8, 'chaos': -0.8, 'amazed': 0.9, 'stressful': -0.8, 'rapturous': 0.95, 'enrapture': 0.9, 'rejuvenated': 0.9, 'dynamic': 0.8, 'exceptional': 0.9}

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
    blob = TextBlob(text.lower()) 
    words = blob.words
    sentiment_score = 0
    for word in words:
        if word in custom_sentiments:
            sentiment_score += custom_sentiments[word]
    sentiment_score = min(1, max(-1, sentiment_score))
    return jsonify({'sentiment': sentiment_score})

if __name__ == '__main__':
    app.run(debug=True)
