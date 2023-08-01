const DB_interact = require('./mongoose');
const Spotify_API = require('./spotify');
const querystring = require('querystring');
const express = require('express');
const app = express();

app.use(express.static('../public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => { res.redirect('/create_account.html'); })

app.get('/delete_all', (req, res) => { DB_interact.clear_db(); res.redirect('/'); });

app.get('/login', (req, res) => {

    res.redirect('/login.html');

})

app.get('/spotify_redirect', (req, res) => { 
    res.redirect( Spotify_API.makeAuthURL() );
});

app.get('/create_account', (req, res) => {

    res.redirect('/create_account.html?' + querystring.stringify({
        code: req.query.code
    }));

})

app.post('/create_account', async (req, res) => {

    const USER = await DB_interact.create_user(req.body.email.toLowerCase(), req.body.username, req.body.pass, req.body.code);
    await DB_interact.add_user( USER );
    
    res.redirect("/");
});

app.post('/validate_email', async (req, res) => {

    email = req.body.email.toLowerCase();
    const email_exists = await DB_interact.email_exists(email);

    res.json({ email_exists });
});

app.post('/validate_username', async (req, res) => {

    username = req.body.username.toLowerCase();
    const username_exists = await DB_interact.username_exists(username);

    res.json({ username_exists });
});

app.listen(3000);