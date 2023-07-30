const DB_interact = require('./mongoose');
const Spotify_API = require('./spotify');
const express = require('express');
const app = express();

app.use(express.static('../public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => { res.redirect('/create_account.html'); })

app.get('/create_account.html', (req, res) => { 
    
});

app.post('/create_account', async (req, res) => {

    res.redirect( Spotify_API.makeAuthURL(req.body.email, req.body.username, req.body.pass) );

    DB_interact.add_user( DB_interact.create_user(req.body.email, req.body.username, req.body.pass) );

});

app.listen(3000);