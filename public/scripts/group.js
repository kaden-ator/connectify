window.addEventListener('DOMContentLoaded', async () => {

    // get group and user
    const username = (JSON.parse(localStorage.getItem('user'))).lowercase_username;
    const group_id = get_group_id();
    const user = await get_user(username);

    // update user in local storage
    localStorage.setItem('user', JSON.stringify(user));

    // html elements
    const queueIcon = document.querySelector('.queue-icon');
    const hiddenSongPage = document.querySelector('.hidden-song-page');
    const hiddenQueuePage = document.querySelector('.hidden-queue-page');
    const footer = document.querySelector('.footer');
    const suggestionBar = document.querySelector('.suggestion-bar');

    // populate hidden pages
    populate_songs();
    display_suggestions();

    // event listener to toggle song suggestion page
    queueIcon.addEventListener('click', () => {

        // Toggle the position of the hidden page and the height of the footer
        if(hiddenSongPage.style.top === '100vh') {
            suggestionBar.style.top = '-100vh';
            hiddenSongPage.style.top = '40px';
            footer.style.bottom = 'calc(100vh - 40px)';
        } 
        else{
            suggestionBar.style.top = '0';
            hiddenSongPage.style.top = '100vh';
            footer.style.bottom = '0';
        }
    });

    suggestionBar.addEventListener('click', () => {
        
        // Toggle the position of the hidden page and the positon of the suggestion bar
        if(hiddenQueuePage.style.right === '-100%') {
            suggestionBar.style.right = '90%';
            hiddenQueuePage.style.right = '0';
        } 
        else{
            suggestionBar.style.right = '0';
            hiddenQueuePage.style.right = '-100%';
        }

    });

});

async function get_user(username){

    try{
        // fetch from get_user in server.js by username
        const response = await fetch('/get_user', {

            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })

        });

        try{ const data = await response.json(); return data.user; }
        catch(err){ console.error('Error during parse:', err); }
    }
    catch(err){ console.error('Error during fetch:', err); }

    return null;

}

// populate the song suggestion page with top user songs or user library
async function populate_songs(){

    const song_type = document.querySelector('.song-type');
    song_type.innerHTML = 'Your top songs';

    const song_list = document.querySelector('.songs-list');
    var songs = (await get_top_songs()).songs.items;

    // get songs from library if no top songs
    if(!songs.length){ songs = await get_library().items; song_type.innerHTML = 'Your liked songs'; }

    // if no saved songs either, give no songs err message and return
    if(!songs.length){ return; }

    // make element for each song, add to song list
    for(var song of songs){

        // compile all data to be used from given track
        const song_name = song.name;
        const song_artists = (song.artists.map(object => object.name)).join(', ');
        const song_img_url = song.album.images[0].url;

        // use all song data to create elements to display song
        const song_div = document.createElement('div');
        song_div.className = 'song';

        const name = document.createElement('p');
        name.innerHTML = song_name;

        const artists = document.createElement('p');
        artists.innerHTML = song_artists;

        const image = document.createElement('img');
        image.src = song_img_url;

        song_div.appendChild(image);
        song_div.appendChild(name);
        song_div.appendChild(artists);
        
        // add song to song-list div
        song_list.appendChild(song_div);

    }

}

async function get_track_by_id(song_id){

    const user = JSON.parse(localStorage.getItem('user'));

    const user_id = user._id;
    const access_token = user.access_key;
    const refresh_token = user.refresh_key;

    try{
        // fetch from validate_username in server.js
        const response = await fetch('/get_track_by_id', {

            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ song_id, user_id, access_token, refresh_token }) // username sent to be checked

        });
        try{ return await response.json(); }
        catch(err){ console.error('Error during parse:', err); }
    }
    catch(err){ console.error('Error during fetch:', err); }

    return null;

}

// call server to interact with spotify api to get users top songs
async function get_top_songs(){

    const user = JSON.parse(localStorage.getItem('user'));

    const user_id = user._id;
    const access_token = user.access_key;
    const refresh_token = user.refresh_key;

    try{
        // fetch from validate_username in server.js
        const response = await fetch('/get_top_user_songs', {

            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id, access_token, refresh_token }) // username sent to be checked

        });
        try{ return await response.json(); }
        catch(err){ console.error('Error during parse:', err); }
    }
    catch(err){ console.error('Error during fetch:', err); }

    return null;

}

// call server to interact with spotify api to get users library
async function get_library(){

    const user = JSON.parse(localStorage.getItem('user'));

    const user_id = user._id;
    const access_token = user.access_key;
    const refresh_token = user.refresh_key;

    try{
        // fetch from validate_username in server.js
        const response = await fetch('/get_library', {

            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id, access_token, refresh_token }) // username sent to be checked

        });
        try{ return await response.json(); }
        catch(err){ console.error('Error during parse:', err); }
    }
    catch(err){ console.error('Error during fetch:', err); }

    return null;

}

// function will return the id of the current group
function get_group_id(){

    const url = window.location.href;
    const paths = url.split('/');

    // return last path - aka group id
    return paths[paths.length - 1];

}


async function get_suggestions(){

    const group_id = get_group_id();

    try{
        const response = await fetch('/get_suggestions', {

            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ group_id })

        });

        try{ const data = await response.json(); return data.suggestions; }
        catch(err){ console.error('Error during parse:', err); }
    }
    catch(err){ console.error('Error during fetch:', err); }

    return null;

}

async function display_suggestions() {
    const suggestions = await get_suggestions();
  
    // Get a reference to the hidden-queue-page
    const queue = document.querySelector('.queue-content');
  
    // Clear any existing suggestions on the page
    queue.innerHTML = '';
  
    // Loop through the suggestions and create HTML elements for each one
    for(var suggestion of suggestions){
        const { status, song_id, user } = suggestion;

        const song = await get_track_by_id(song_id);
  
        // Create a suggestion element
        const suggestionElement = document.createElement('div');
        suggestionElement.className = 'suggestion';
  
        // Create elements to display username, album cover, song name, and status
        const usernameElement = document.createElement('p');
        usernameElement.textContent = user.username; // Replace with the actual property holding the username
  
        const albumCoverElement = document.createElement('img');
        albumCoverElement.src = song.album.images[0].url;
  
        const songNameElement = document.createElement('p');
        songNameElement.textContent = song.name;
  
        const statusElement = document.createElement('p');
        statusElement.textContent = status;
  
        // Append elements to the suggestion element
        suggestionElement.appendChild(usernameElement);
        suggestionElement.appendChild(albumCoverElement);
        suggestionElement.appendChild(songNameElement);
        suggestionElement.appendChild(statusElement);
  
        // Append the suggestion element to the hidden-queue-page
        queue.appendChild(suggestionElement);
    }
  }