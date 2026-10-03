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

// Echte live P2000 feed ophalen voor Groningen met correcte browser-headers
app.get('/api/meldingen', async (req, res) => {
    try {
        const response = await fetch('https://www.alarmeringen.nl/feed/safety-region/groningen.rss', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP-fout: ${response.status}`);
        }

        const xmlText = await response.text();
        const items = [];
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match;

        while ((match = itemRegex.exec(xmlText)) !== null) {
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

        // Sorteer direct op tijd (nieuwste eerst) zodat de meest recente melding bovenaan staat
        items.sort((a, b) => b.rawTime - a.rawTime);

        res.json(items);
    } catch (error) {
        console.error("Fout bij ophalen echte feed:", error.message);
        res.status(500).json({ error: 'Kon live feed niet laden' });
    }
});

app.listen(port, () => {
    console.log(`Live server draait op poort ${port}`);
});
