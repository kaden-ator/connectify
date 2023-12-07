const DB_interact = require('./mongoose');
const querystring = require('querystring');
require('dotenv').config

const AUTHORIZATION_URL = 'https://accounts.spotify.com/authorize?';
const AUTH_REDIRECT_URI = 'http://localhost:3000/access_token';
const AUTH = new Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64');

// this function will make the URL that the user will
// be redirected to in order to connect their spotify 
// account to be accessed using the api
function makeAuthURL()
{
    // scope will be allowed perms thru API
    return AUTHORIZATION_URL + querystring.stringify({
        client_id:  process.env.CLIENT_ID,
        response_type:  'code',
        redirect_uri:   encodeURI(AUTH_REDIRECT_URI),
        scope: 'user-read-private user-read-email user-library-read user-read-playback-state user-modify-playback-state user-top-read user-read-currently-playing'
    });
}

// this will get the access + refresh token for the user
// from the spotify API
async function getTokens(code){

    // access token request required grant_type, code, and redirect
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', AUTH_REDIRECT_URI);

    // fetch tokens
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

// function will refresh the users access token once it has expired
async function refreshAccessToken(user_id, refresh_token){

    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refresh_token);

    // fetch token 
    const result = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Authorization': 'Basic ' + AUTH },
        body: params
    });

    const data = await result.json();

    // new access token
    const new_token = data.access_token;
    await DB_interact.update_access_token(user_id, new_token);

    return new_token;

}

// this function will get any track from the spotify api
async function getTracks(URL, user_id, access_token, refresh_token){

    try{
        // fetch from api
        const response = await fetch(URL, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + access_token }
        });

        // handle the response from the server in a separate function
        try{ return await handleResponse(response, URL, user_id, refresh_token); }
        catch(err){ console.error('Error during parse:', err); }
    }
    catch(err){ console.error('Error during fetch:', err); }

    return null;

}

// this function will handle a response from the spotify API
async function handleResponse(response, URL, user_id, refresh_token){
    
    // successful response + holds data in body, return data
    if(200 === response.status){ return await response.json(); }
    
    // access token expired reponse, refresh token, return new call on previous response
    else if(response.status === 401){ 

        const new_access_token = await refreshAccessToken(user_id, refresh_token); 
        return await getTracks(URL, user_id, new_access_token, refresh_token);

    }
    
    // bad response, log status and return null
    else{ console.log("ERR - Response Status: " + response.status); return null; }

}

// this function will add a song to the users queue
async function addToQueue(URL, user_id, access_token, refresh_token){

    try{

        // add to queue
        const response = await fetch(URL, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + access_token }
        });

        // handle response
        try{ return await handleResponse(response, URL, user_id, refresh_token); }
        catch(err){ console.error('Error during parse:', err); }
    }
    catch(err){ console.error('Error during fetch:', err); }

    return null;

}

module.exports = { getTokens, makeAuthURL, getTracks, addToQueue };