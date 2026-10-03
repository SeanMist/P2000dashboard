const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Hallo! De server werkt!');
});

app.listen(port, () => {
    console.log(`Test server draait op poort ${port}`);
});
