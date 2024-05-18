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
      const response = await axios.get('http://vaibhavi0028.pythonanywhere.com/data');
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
      const response = await axios.post('http://vaibhavi0028.pythonanywhere.com/analyze', { text: inputText });
      setSentiment(response.data.sentiment);
      setConnected(true);
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      setConnected(false);
    }
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