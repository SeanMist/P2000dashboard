const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Start met een lege lijst; zodra je pc start vult dit zich direct met echte meldingen
let opgeslagenMeldingen = [];

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
    // Accepteer de binnengekomen lijst met echte meldingen
    const data = req.body.meldingen || req.body;
    
    if (Array.isArray(data) && data.length > 0) {
        opgeslagenMeldingen = data;
        console.log(`[Update] ${data.length} echte meldingen opgeslagen.`);
        return res.json({ status: 'success', received: data.length });
    }
    
    return res.status(400).json({ status: 'error', message: 'Geen geldige data' });
});

app.listen(port, () => {
    console.log(`Live server draait op poort ${port}`);
});
