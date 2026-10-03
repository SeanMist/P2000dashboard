const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// De hoofdpagina direct inlezen en opsturen
app.get('/', (req, res) => {
    try {
        const filePath = path.join(__dirname, 'index.html');
        const html = fs.readFileSync(filePath, 'utf8');
        res.send(html);
    } catch (error) {
        res.status(500).send('Kan index.html niet vinden op deze locatie: ' + error.message);
    }
});

// Live P2000 API route voor Groningen
app.get('/api/meldingen', async (req, res) => {
    try {
        const response = await fetch('https://api.p2000.nl/api/v1/messages?province=Groningen&limit=10');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Fout bij ophalen live data' });
    }
});

app.listen(port, () => {
    console.log(`Live server draait op poort ${port}`);
});
