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

// Live P2000 data ophalen via een slimme proxy om de serverblokkade te omzeilen
app.get('/api/meldingen', async (req, res) => {
    try {
        const targetUrl = 'https://www.alarmeringen.nl/feed/safety-region/groningen.rss';
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
        
        const response = await fetch(proxyUrl);
        if (!response.ok) {
            throw new Error(`Proxy fout: ${response.status}`);
        }

        const xmlText = await response.text();
        const items = [];
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match;

        while ((match = itemRegex.exec(xmlText)) !== null && items.length < 30) {
            const itemContent = match[1];
            
            const getTagContent = (tag) => {
                const tagMatch = new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\/${tag}>`, 's').exec(itemContent);
                return tagMatch ? tagMatch[1].trim() : '';
            };

            const title = getTagContent('title');
            const description = getTagContent('description');
            const pubDate = getTagContent('pubDate');

            let formattedTime = 'Net binnen';
            let rawTimestamp = Date.now();

            if (pubDate) {
                const d = new Date(pubDate);
                if (!isNaN(d)) {
                    rawTimestamp = d.getTime();
                    formattedTime = d.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                }
            }

            items.push({
                time: formattedTime,
                rawTime: rawTimestamp,
                city: title || 'Groningen',
                text: description || title || 'Geen omschrijving'
            });
        }

        // Sorteer direct op tijd (nieuwste bovenaan)
        items.sort((a, b) => b.rawTime - a.rawTime);

        res.json(items);
    } catch (error) {
        console.error("Fout bij ophalen via proxy:", error.message);
        res.json([]);
    }
});

app.listen(port, () => {
    console.log(`Live server draait op poort ${port}`);
});
