const express = require('express');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    try {
        // Vraag een lijst op van alle bestanden in de servermap
        const bestanden = fs.readdirSync(__dirname);
        res.send('Bestanden die Render hier ziet staan: ' + JSON.stringify(bestanden));
    } catch (error) {
        res.status(500).send('Fout bij uitlezen map: ' + error.message);
    }
});

app.listen(port, () => {
    console.log(`Server draait op poort ${port}`);
});
