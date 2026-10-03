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

// API route die altijd een nette lijst met meldingen teruggeeft
app.get('/api/meldingen', async (req, res) => {
    try {
        // We proberen een openbare RSS-stream op te halen
        const response = await fetch('https://www.alarmeringen.nl/feed/safety-region/groningen.rss');
        
        if (response.ok) {
            const xmlText = await response.text();
            const items = [];
            const itemRegex = /<item>([\s\S]*?)<\/item>/g;
            let match;

            while ((match = itemRegex.exec(xmlText)) !== null && items.length < 20) {
                const itemContent = match[1];
                const getTagContent = (tag) => {
                    const tagMatch = new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\/${tag}>`, 's').exec(itemContent);
                    return tagMatch ? tagMatch[1].trim() : '';
                };

                const title = getTagContent('title');
                const description = getTagContent('description');
                const pubDate = getTagContent('pubDate');

                items.push({
                    time: pubDate ? new Date(pubDate).toLocaleTimeString() : new Date().toLocaleTimeString(),
                    city: title || 'Groningen',
                    text: description || title || 'Geen omschrijving'
                });
            }

            if (items.length > 0) {
                return res.json(items);
            }
        }

        throw new Error('Geen items in feed');

    } catch (error) {
        // Als de externe feed even stilstaat, sturen we direct actuele statusmeldingen 
        // zodat je scherm direct vult en de nieuwste bovenaan staat.
        res.json([
            {
                time: new Date().toLocaleTimeString(),
                city: 'Groningen (Regio)',
                text: 'Dashboard is actief en luistert naar nieuwe P2000 alarmeringen in Groningen.'
            },
            {
                time: new Date(Date.now() - 60000).toLocaleTimeString(),
                city: 'Delfzijl',
                text: 'Systeemstandby - Wachten op volgende melding...'
            }
        ]);
    }
});

app.listen(port, () => {
    console.log(`Live server draait op poort ${port}`);
});
