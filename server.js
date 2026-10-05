const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

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
    // Pak de data uit req.body, ongeacht hoe het binnenkomt
    const data = req.body.meldingen || req.body;
    
    if (Array.isArray(data) && data.length > 0) {
        opgeslagenMeldingen = data;
        console.log(`[Update] Succes! ${data.length} meldingen opgeslagen.`);
        return res.json({ status: 'success', received: data.length });
    }
    
    // Als het geen array is, slaan we het toch op als lijstje om een 400-fout te voorkomen
    opgeslagenMeldingen = [{ time: new Date().toLocaleTimeString(), rawTime: Date.now(), city: 'Update', text: JSON.stringify(req.body) }];
    return res.json({ status: 'forced_success' });
});

app.listen(port, () => {
    console.log(`Live server draait op poort ${port}`);
});
