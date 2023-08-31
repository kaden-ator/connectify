const DB_interact = require('./mongoose');
const querystring = require('querystring');
require('dotenv').config

const AUTHORIZATION_URL = 'https://accounts.spotify.com/authorize?';
const AUTH_REDIRECT_URI = 'http://localhost:3000/access_token';
const AUTH = new Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64');

function makeAuthURL()
{
    return AUTHORIZATION_URL + querystring.stringify({
        client_id:  process.env.CLIENT_ID,
        response_type:  'code',
        redirect_uri:   encodeURI(AUTH_REDIRECT_URI),
        scope: 'user-read-private user-read-email user-library-read user-read-playback-state user-modify-playback-state user-read-playback-state user-top-read'
    });
}

async function getTokens(code){

    // access token request required grant_type, code, and redirect
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', AUTH_REDIRECT_URI);

    const result = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 
            'Authorization': 'Basic ' + AUTH,
            'Content-Type': 'application/x-www-form-urlencoded' 
        },
        body: params
    });
    const data = await result.json();

    // fill tokens arr with access and refresh token
    var tokens = [];
    tokens.push(data.access_token);
    tokens.push(data.refresh_token);

    return tokens;
}

async function refreshAccessToken(refresh_token){

    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refresh_token);

    const result = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 
            'Authorization': 'Basic ' + AUTH,
            'Content-Type': 'application/x-www-form-urlencoded' 
        },
        body: params
    });
    const data = await result.json();

    // new access token
    const new_token = data.access_token;
    await DB_interact.update_access_token(new_token, refresh_token);

    return new_token;

}

async function getTracks(URL, access_token, refresh_token){

    try{
        // fetch from validate_username in server.js
        const response = await fetch(URL, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + access_token }
        });

        console.log(URL);
        console.log(response);

        try{ return await handleResponse(response, URL, access_token, refresh_token); }
        catch(err){ console.error('Error during parse:', err); }
    }
    catch(err){ console.error('Error during fetch:', err); }

    return null;

}

async function handleResponse(response, URL, access_token, refresh_token){
    
    // successful response, return data
    if(response.status === 200){ return await response.json(); }
    
    // access token expired reponse, refresh token, return new call on previous response
    else if(response.status === 401){ 

        const new_access_token = await refreshAccessToken(refresh_token); 
        return await getTracks(URL, new_access_token, refresh_token);

    }
    
    // bad response, log status and return null
    else{ console.log("ERR - Response Status: " + response.status); return null; }

}

module.exports = { getTokens, makeAuthURL, getTracks };