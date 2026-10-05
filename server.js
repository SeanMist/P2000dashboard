const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));

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
    const nieuweMeldingen = req.body;
    if (Array.isArray(nieuweMeldingen) && nieuweMeldingen.length > 0) {
        opgeslagenMeldingen = nieuweMeldingen;
        console.log(`[Update] ${nieuweMeldingen.length} meldingen ontvangen van thuisserver.`);
        return res.json({ status: 'success' });
    }
    res.status(400).json({ status: 'error', message: 'Geen geldige data' });
});

app.listen(port, () => {
    console.log(`Live server draait op poort ${port}`);
});
