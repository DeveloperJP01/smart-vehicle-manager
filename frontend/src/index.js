import React from 'react'; 
import ReactDOM from 'react-dom/client'; 
import App from './App'; 
import './App.css';

// Global safeguard: prevent 'Unexpected end of JSON input' crashes
// when the proxy or backend returns empty/invalid bodies during restarts.
const originalJson = Response.prototype.json;
Response.prototype.json = async function() {
  try {
    const text = await this.text();
    return text ? JSON.parse(text) : null;
  } catch (e) {
    console.warn("Safely caught JSON parse error from backend:", e);
    return null;
  }
};

const root = ReactDOM.createRoot(document.getElementById('root')); 
root.render(<App />);
