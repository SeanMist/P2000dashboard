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

// Live P2000 data ophalen via een stabiele openbare RSS-feed omgezet naar JSON
app.get('/api/meldingen', async (req, res) => {
    try {
        // We halen de openbare RSS-feed op voor Groningen
        const response = await fetch('https://www.alarmeringen.nl/feed/safety-region/groningen.rss');
        
        if (!response.ok) {
            throw new Error('Kon RSS-feed niet ophalen');
        }

        const xmlText = await response.text();
        
        // Simpele en snelle omzetting van de RSS-items naar een net lijstje voor je dashboard
        const items = [];
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match;

        while ((match = itemRegex.exec(xmlText)) !== null && items.length < 15) {
            const itemContent = match[1];
            
            const getTagContent = (tag) => {
                const tagMatch = new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\/${tag}>`, 's').exec(itemContent);
                return tagMatch ? tagMatch[1].trim() : '';
            };

            const title = getTagContent('title');
            const description = getTagContent('description');
            const pubDate = getTagContent('pubDate');

            // Alleen meldingen tonen die iets met Groningen te maken hebben of alles uit de feed
            items.push({
                time: new Date(pubDate).toLocaleTimeString() || 'Onbekend',
                city: title || 'Groningen',
                text: description || title || 'Geen omschrijving'
            });
        }

        if (items.length > 0) {
            res.json(items);
        } else {
            // Fallback als de feed leeg is
            res.json([{
                time: new Date().toLocaleTimeString(),
                city: 'Groningen',
                text: 'Geen recente meldingen in de feed.'
            }]);
        }

    } catch (error) {
        console.error("Fout bij ophalen P2000 feed:", error.message);
        res.json([{
            time: new Date().toLocaleTimeString(),
            city: 'Systeem',
            text: 'Wachten op nieuwe alarmeringen...'
        }]);
    }
});

app.listen(port, () => {
    console.log(`Live server draait op poort ${port}`);
});
