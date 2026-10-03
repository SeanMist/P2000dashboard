const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// De hoofdpagina direct inlezen en tonen
app.get('/', (req, res) => {
    try {
        const filePath = path.join(__dirname, 'index.html');
        const html = fs.readFileSync(filePath, 'utf8');
        res.send(html);
    } catch (error) {
        res.status(500).send('Kan index.html niet inlezen: ' + error.message);
    }
});

// Live P2000 API route via een alternatieve, werkende bron voor Groningen
app.get('/api/meldingen', async (req, res) => {
    try {
        // We gebruiken een openbare en stabiele alternatieve data-bron
        const response = await fetch('https://p2000.landelijk.net/api/messages?province=Groningen'); // of een alternatieve feed
        
        if (!response.ok) {
            throw new Error(`HTTP-fout! Status: ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Fout bij ophalen API:", error.message);
        // Terugvaloptie of duidelijke foutmelding naar de frontend
        res.status(500).json({ error: 'Fout bij ophalen live data: ' + error.message });
    }
});

app.listen(port, () => {
    console.log(`Live server draait op poort ${port}`);
});
