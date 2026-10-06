require('dotenv').config();

const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();

// Startpagina melding zodat Render laat zien dat de server online is
app.get('/', (req, res) => {
  res.send('P2000 Dashboard Server is online en draait!');
});

// CORS volledig openzetten voor jouw GitHub dashboard
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-API-Key']
}));

app.use(express.json());

const checkApiKey = (req, res, next) => {
  const apiKey = req.get('X-API-Key');
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }
  next();
};

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'P2000',
  timezone: 'Europe/Amsterdam',
  connectionLimit: 10,
});

// --- 1. Ontvangst-route voor je Python pusher.py script (beveiligd met API-key) ---
app.post('/api/update', checkApiKey, (req, res) => {
  const meldingen = req.body;
  if (!Array.isArray(meldingen) || meldingen.length === 0) {
    return res.status(400).json({ error: 'Geen geldige data ontvangen' });
  }

  let verwerkt = 0;
  meldingen.forEach((m) => {
    const query = 'INSERT INTO `groningen` (timestamp, plaats, tekst) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE tekst=tekst';
    pool.query(query, [new Date(), m.city || 'Eemsdelta', m.text || ''], (err) => {
      verwerkt++;
      if (verwerkt === meldingen.length) {
        res.json({ success: true, message: `${meldingen.length} meldingen verwerkt in database.` });
      }
    });
  });
});

// --- 2. Ophaal-route voor jouw GitHub dashboard (open zodat je website direct de data laadt) ---
app.get('/api/groningen', (req, res) => {
  pool.query('SELECT * FROM `groningen` ORDER BY timestamp DESC LIMIT 30', (error, results) => {
    if (error) {
      console.error('Error fetching groningen data:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(results);
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
