const url = new URL( window.location.href );
const query_params = new URLSearchParams( url.search );

var email = "";
var username = "";
var pass = "";
var spotify_connected = false;

window.addEventListener('DOMContentLoaded', () => {

    if(query_params.keys().length){ hasParams(); }

});

function hasParams(){

    email = query_params.get('email');
    username = query_params.get('username');
    pass = query_params.get('pass');

    document.getElementById('email').value = email;
    document.getElementById('username').value = username;
    document.getElementById('pass').value = pass;

    spotify_connected = true;

}

