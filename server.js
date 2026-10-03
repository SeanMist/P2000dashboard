const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    try {
        const filePath = path.join(__dirname, 'index.html');
        const html = fs.readFileSync(filePath, 'utf8');
        res.send(html);
    } catch (error) {
        res.status(500).send('Kan index.html niet inlezen: ' + error.message);
    }
});

// Directe en stabiele koppeling voor live Groningen meldingen
app.get('/api/meldingen', async (req, res) => {
    try {
        // We halen direct de actieve JSON-feed op via een betrouwbare proxy-endpoint
        const response = await fetch('https://p2000-data.nl/api/messages?province=Groningen&limit=20', {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });

        if (response.ok) {
            const data = await response.json();
            return res.json(data);
        }

        // Fallback naar een alternatieve openbare stream als de eerste even rustig is
        const altResponse = await fetch('https://api.p2000-online.nl/v1/messages?province=Groningen', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        
        if (altResponse.ok) {
            const altData = await altResponse.json();
            return res.json(altData);
        }

        throw new Error('Geen data beschikbaar uit externe bronnen');

    } catch (error) {
        console.error("Fout bij ophalen:", error.message);
        
        // Stuur een lege lijst in plaats van een vastlopende melding, 
        // zodat de pagina netjes blijft zoeken naar echte binnendruppelende meldingen.
        res.json([]);
    }
});

app.listen(port, () => {
    console.log(`Live server draait op poort ${port}`);
});
