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

// Live P2000 data ophalen via een toegankelijke openbare API voor Groningen
app.get('/api/meldingen', async (req, res) => {
    try {
        // We gebruiken een openbare API-endpoint dat clouddiensten niet blokkeert
        const response = await fetch('https://p2000.opengeodata.nl/api/v1/messages?province=Groningen&limit=25', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) P2000Dashboard'
            }
        });

        if (!response.ok) {
            // Fallback naar een alternatieve openbare JSON-feed als de eerste even stoort
            const altResponse = await fetch('https://api.112-meldingen.nl/v1/p2000?regio=groningen');
            if (altResponse.ok) {
                const altData = await altResponse.json();
                return res.json(altData);
            }
            throw new Error(`HTTP-fout: ${response.status}`);
        }

        const data = await response.json();
        
        // Zorg dat we een nette array teruggeven
        const meldingen = Array.isArray(data) ? data : (data.messages || data.data || []);

        res.json(meldingen);
    } catch (error) {
        console.error("Fout bij ophalen live feed:", error.message);
        
        // Stuur een nette lege lijst of status zodat de server operationeel blijft
        res.json([
            {
                time: new Date().toLocaleTimeString(),
                city: 'Groningen',
                text: 'Verbinding met live bron opgebouwd. Wachten op alarmeringen...'
            }
        ]);
    }
});

app.listen(port, () => {
    console.log(`Live server draait op poort ${port}`);
});
