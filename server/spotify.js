const { access } = require('fs');
const querystring = require('querystring');
require('dotenv').config

const AUTHORIZATION_URL = 'https://accounts.spotify.com/authorize?';
var AUTH_REDIRECT_URI = 'http://localhost:3000/access_token';

function makeAuthURL()
{
    return AUTHORIZATION_URL + querystring.stringify({
        client_id:  process.env.CLIENT_ID,
        response_type:  'code',
        redirect_uri:   encodeURI(AUTH_REDIRECT_URI),
        scope: 'user-read-private user-read-email user-library-read user-read-playback-state user-modify-playback-state user-read-playback-state '
    });
}

async function getAccessToken(code){

    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", AUTH_REDIRECT_URI);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { 
            'Authorization': 'Basic ' + (new Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64')),
            'Content-Type': "application/x-www-form-urlencoded" 
        },
        body: params
    });

    const data = await result.json();

    return data.access_token;
}

async function get_top_songs(){

    const TOP_SONG_URL = 'https://api.spotify.com/v1/me/top/tracks?limit=50&offset=0&time_range=short_term';

    const auth = process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET;

    try{
        // fetch from validate_username in server.js
        const response = await fetch(TOP_SONG_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username }) // username sent to be checked
        });
        try{
    
            const data = await response.json();
    
        }
        catch(err){ console.error('Error during parse:', err); }
    }
    catch(err){ console.error('Error during fetch:', err); }

}

module.exports = { getAccessToken, makeAuthURL };