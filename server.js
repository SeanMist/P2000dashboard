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

// Live P2000 API route voor Groningen met extra controle in de logs
app.get('/api/meldingen', async (req, res) => {
    try {
        const response = await fetch('https://api.p2000.nl/api/v1/messages?province=Groningen&limit=10');
        const data = await response.json();
        
        // Print de data in de Render logs zodat we kunnen zien wat de API teruggeeft
        console.log("API Data ontvangen:", JSON.stringify(data).substring(0, 200)); 
        
        res.json(data);
    } catch (error) {
        console.error("Fout bij ophalen API:", error);
        res.status(500).json({ error: 'Fout bij ophalen live data: ' + error.message });
    }
});

app.listen(port, () => {
    console.log(`Live server draait op poort ${port}`);
});
