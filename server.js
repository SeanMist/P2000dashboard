const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

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
    // Accepteer direct alles wat binnenkomt, ongeacht de opmaak
    if (req.body) {
        if (Array.isArray(req.body)) {
            opgeslagenMeldingen = req.body;
        } else if (req.body.meldingen && Array.isArray(req.body.meldingen)) {
            opgeslagenMeldingen = req.body.meldingen;
        }
    }
    console.log(`[Update] Ontvangen! Aantal meldingen: ${opgeslagenMeldingen.length}`);
    return res.json({ status: 'success', count: opgeslagenMeldingen.length });
});

app.listen(port, () => {
    console.log(`Live server draait op poort ${port}`);
});
