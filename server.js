const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Statische bestanden laden
app.use(express.static(__dirname));

// Expliciet de hoofdpagina koppelen aan index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Live P2000 API route voor Groningen (gebruikt de ingebouwde fetch van Node)
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
