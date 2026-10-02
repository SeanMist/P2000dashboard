const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));

// Een echte live server-route die de data direct ophaalt
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
