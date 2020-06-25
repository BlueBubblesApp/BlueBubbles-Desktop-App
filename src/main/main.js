const socket = require('./database/databaseSocket.js');
const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Home route');
});

app.listen(4000, () => console.log('Frontend server listening on port 3000'));
