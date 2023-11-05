const DB_interact = require('./mongoose');
const Spotify_API = require('./spotify');
const querystring = require('querystring');
const path = require('path');
const express = require('express');
const { access } = require('fs');
const app = express();

app.use(express.static('../public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => { res.redirect('/create_account.html'); })

// route to homepage for user - all user groups will be displayed
app.get('/home/:username', (req, res) => {

    const cur_path = path.join(__dirname.replace('server', 'public'), 'home.html');

    res.sendFile(cur_path);
    
});

// redirect to get method for home after successful login attempt
app.post('/home/:username', (req, res) => { res.redirect('/home/' + req.params.username); });

// route to group page
app.get('/group/:group_id', (req, res) => {

    const cur_path = path.join(__dirname.replace('server', 'public'), 'group.html');

    res.sendFile(cur_path);
    
});

// route to login page
app.get('/login', (req, res) => {

    res.redirect('/login.html');

});

// route will verify a users spotify account
app.get('/spotify_redirect', (req, res) => { 
    res.redirect( Spotify_API.makeAuthURL() );
});

// route will create an account and link the user with their api verification key
app.get('/create_account', (req, res) => {

    

})

app.get('/access_token', async (req, res) => {

    const tokens = await Spotify_API.getTokens(req.query.code);

    // redirect user to creating account
    res.redirect('/create_account.html?' + querystring.stringify({
        access_token: tokens[0],
        refresh_token: tokens[1]
    }));

});

// route will add the user to the database
app.post('/create_account', async (req, res) => {

    const USER = await DB_interact.create_user(req.body.email.toLowerCase(), req.body.username, req.body.pass, req.body.access_token, req.body.refresh_token);
    await DB_interact.add_user( USER );
    
    res.redirect('/home/' + req.body.username.toLowerCase());
});

app.post('/get_user', async(req, res) => {

    const username = req.body.username;
    const user = await DB_interact.get_user_by_name(username);

    res.json({ user });

})

// route will validate that a given email is in the database
app.post('/validate_email', async (req, res) => {

    const email = req.body.email.toLowerCase();
    const email_exists = await DB_interact.email_exists(email);

    res.json({ email_exists });
});

// route will validate that a given username is in the database
app.post('/validate_username', async (req, res) => {

    const username = req.body.username.toLowerCase();
    const username_exists = await DB_interact.username_exists(username);

    res.json({ username_exists });
});

// route will get all groups from a user
app.post('/get_groups', async (req, res) => {

    const user = req.body.user;
    const groups = await DB_interact.get_users_groups(user);

    res.json({ groups });
})

// route will get all suggestions from a group
app.post('/get_suggestions', async (req, res) => {

    const group_id = req.body.group_id;
    const suggestions = await DB_interact.get_suggestions(group_id);

    res.json({ suggestions });
})

app.post('/get_track_by_id', async (req, res) => {

    // required params to execute API call
    const get_track_by_id_url = 'https://api.spotify.com/v1/tracks/' + req.body.song_id;
    const user_id = req.body.user_id;
    const access_token = req.body.access_token;
    const refresh_token = req.body.refresh_token;

    const song = await Spotify_API.getTracks(get_track_by_id_url, user_id, access_token, refresh_token);

    res.json( song );
});

app.post('/get_top_user_songs', async (req, res) => {

    // required params to execute API call
    const top_songs_url = 'https://api.spotify.com/v1/me/top/tracks?limit=50';
    const user_id = req.body.user_id;
    const access_token = req.body.access_token;
    const refresh_token = req.body.refresh_token;

    const songs = await Spotify_API.getTracks(top_songs_url, user_id, access_token, refresh_token);

    res.json({ songs });
});

app.post('/get_library', async (req, res) => {

    // required params to execute API call
    const lib_songs_url = 'https://api.spotify.com/v1/me/tracks?limit=50';
    const user_id = req.body.user_id;
    const access_token = req.body.access_token;
    const refresh_token = req.body.refresh_token;

    const songs = await Spotify_API.getTracks(lib_songs_url, user_id, access_token, refresh_token);

    res.json({ songs });
});

app.post('/add_suggestion', async (req, res) => {

    // required params to execute API call
    const song_id = req.body.song_id;
    const group_id = req.body.group_id;
    const user_id = req.body.user_id;

    await DB_interact.add_suggestion( DB_interact.create_suggestion( song_id, group_id, user_id ) );

    res.json({});
});

app.post('/spotify_api_interact', async (req, res) => {

    const URL = req.body.url; 
    const user_id = req.body.user_id;
    const access_token = req.body.access_token;
    const refresh_token = req.body.refresh_token;

    const data = await Spotify_API.getTracks(URL, user_id, access_token, refresh_token);

    res.json({ data });

})

// this route will handle all data that can be gotten with only group id
app.post('/get_owner', async (req, res) => {

    const owner = DB_interact.get_owner(req.body.group_id);

    res.json({ owner });

});

app.post('/create_group', async (req, res) => {

    const group = await DB_interact.create_group( req.body.name, req.body.id )

    await DB_interact.add_group( group );
    res.json({});

});

app.post('/join_group', async (req, res) => {

    await DB_interact.join_group(req.body.user_id, req.body.group_id);
    res.json({});

});

app.post('/add_to_queue', async (req,res) => {

    await Spotify_API.addToQueue( req.body.url, req.body.user_id, req.body.access_token, req.body.refresh_token );
    console.log("made it here");
    res.json({});

})

app.listen(3000);