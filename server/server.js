const DB_interact = require('./mongoose');
const Spotify_API = require('./spotify');
const querystring = require('querystring');
const express = require('express');
const app = express();

app.use(express.static('../public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => { res.redirect('/create_account.html'); })

app.get('/spotify_redirect', (req, res) => { 
    res.redirect( Spotify_API.makeAuthURL() );
});

app.get('/create_account', (req, res) => {
    res.redirect('/create_account.html?' + querystring.stringify({
        code: req.query.code
    }));
})

app.post('/create_account', async (req, res) => {

    console.log("req.body.code: " + req.body.code);

    const USER = DB_interact.create_user(req.body.email, req.body.username, req.body.pass, req.body.code);
    console.log(USER);

    DB_interact.add_user( USER );
    
    res.redirect("/");

});

app.listen(3000);