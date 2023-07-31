const querystring = require('querystring');
require('dotenv').config

const AUTHORIZATION_URL = 'https://accounts.spotify.com/authorize?';
var REDIRECT_URI = 'http://localhost:3000/create_account';

function makeAuthURL()
{

    return AUTHORIZATION_URL + querystring.stringify({
        client_id:  process.env.CLIENT_ID,
        response_type:  'code',
        redirect_uri:   encodeURI(REDIRECT_URI),
        scope: 'user-read-private'
    });
}

module.exports = { makeAuthURL };