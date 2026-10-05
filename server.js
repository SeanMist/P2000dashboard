const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// Verhoog de limiet voor grote JSON-pakketten
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

let opgeslagenMeldingen = [
    { time: 'Net gestart', rawTime: Date.now(), city: 'Systeem', text: 'Wachten op eerste update van thuisserver...' }
];

app.get('/', (req, res) => {
    try {
        const filePath = path.join(__dirname, 'index.html');
        const html = fs.readFileSync(filePath, 'utf8');
        res.send(html);
    } catch (error) {
        res.status(500).send('Kan index.html niet inlezen: ' + error.message);
    }
});

app.get('/api/meldingen', (req, res) => {
    res.json(opgeslagenMeldingen);
});

app.post('/api/update', (req, res) => {
    // Accepteer zowel een array als een object met een meldingen-lijst
    const nieuweMeldingen = Array.isArray(req.body) ? req.body : req.body.meldingen;
    
    if (Array.isArray(nieuweMeldingen) && nieuweMeldingen.length > 0) {
        opgeslagenMeldingen = nieuweMeldingen;
        console.log(`[Update] ${nieuweMeldingen.length} meldingen ontvangen van thuisserver.`);
        return res.json({ status: 'success' });
    }
    
    console.log("Ontvangen data was ongeldig:", req.body);
    res.status(400).json({ status: 'error', message: 'Geen geldige data' });
});

app.listen(port, () => {
    console.log(`Live server draait op poort ${port}`);
});
