const DB_interact = require('./mongoose');
const express = require('express');
const app = express();

app.use(express.static('../public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const REDIRECT_URI = 'http://localhost:3000';

app.post('/create_account', async (req, res) => {
    DB_interact.add_user( DB_interact.create_user(req.body.email, req.body.username, req.body.pass) );
    res.redirect('index.html');
});

app.listen(3000);