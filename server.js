const express = require('express');
const path = require('path');
const fs = require('fs');
const Parser = require('rss-parser');

const app = express();
const parser = new Parser();
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

// === ENDPOINT VOOR P2000 (ESP32) ===
app.get('/api/p2000', (req, res) => {
    if (opgeslagenMeldingen && opgeslagenMeldingen.length > 0) {
        const meestRecente = opgeslagenMeldingen[0];
        return res.json({
            tijd: meestRecente.tijd || meestRecente.time || "Zojuist",
            melding: meestRecente.melding || meestRecente.tekst || meestRecente.text || meestRecente.message || "Geen melding tekst"
        });
    } else {
        return res.json({
            tijd: "--:--",
            melding: "Geen actuele 112 meldingen"
        });
    }
});

// === ENDPOINT VOOR LIVE VERKEER (A7, N33, N46) ===
app.get('/api/verkeer', async (req, res) => {
    try {
        // Haal de officiële ANWB verkeers-RSS-feed op
        const feed = await parser.parseURL('https://www.anwb.nl/rss/verkeersinformatie.xml');
        
        const relevanteWegen = ['A7', 'N33', 'N46'];
        let gevondenVertragingen = [];

        if (feed.items && feed.items.length > 0) {
            feed.items.forEach(item => {
                const tekst = (item.title + ' ' + item.contentSnippet).toUpperCase();
                
                // Controleer of de melding over de A7, N33 of N46 gaat
                relevanteWegen.forEach(weg => {
                    if (tekst.includes(weg)) {
                        gevondenVertragingen.push(`${item.title}: ${item.contentSnippet}`);
                    }
                });
            });
        }

        if (gevondenVertragingen.length > 0) {
            return res.json({
                status: gevondenVertragingen.join(' | ')
            });
        } else {
            return res.json({
                status: "A7 / N33 / N46: Geen bijzonderheden of vertragingen."
            });
        }
    } catch (error) {
        console.error("[Verkeer Error]:", error.message);
        return res.json({
            status: "A7 / N33 / N46: Vrij doorrijden (geen meldingen)."
        });
    }
});

app.post('/api/update', (req, res) => {
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
