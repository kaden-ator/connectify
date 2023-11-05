window.addEventListener('DOMContentLoaded', async () => {

    // get group and user
    const username = (JSON.parse(localStorage.getItem('user'))).lowercase_username;
    const user = await get_user(username);

    document.querySelector('.homebutton').href = 'http://' + window.location.host + '/home/' + username;

    const pages = document.querySelectorAll('.pages-content');

    for(const page of pages){
        page.addEventListener('click', () => {

            for(const underline of document.querySelectorAll('.underline')){ underline.classList.remove('selected'); }

            page.querySelector('.underline').classList.add('selected');

        });
    }

    // update user in local storage
    localStorage.setItem('user', JSON.stringify(user));

    // init group queue for user
    await display_playback_queue();

    document.querySelector('.queue').addEventListener('click', async () => { await display_playback_queue(); });
    document.querySelector('.addsong').addEventListener('click', async () => { await populate_songs(); });
    document.querySelector('.suggestionbutton').addEventListener('click', async () => { await display_suggestions(); });

});

async function add_suggestion(song_id, group_id, user_id){

    try{
        await fetch('/add_suggestion', {

            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ song_id, group_id, user_id })

        });
    }
    catch(err){ console.error('Error during fetch:', err); }

}

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

    document.querySelector('.legend').style.display = 'none';
    document.querySelector('.queue-content').style.display = 'none';
    document.querySelector('.suggestions').style.display = 'none';

    const song_list = document.querySelector('.songs-list');
    song_list.innerHTML = '';
    song_list.style.display = 'flex';
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
        const song_id = song.id

        // use all song data to create elements to display song
        const song_div = document.createElement('div');
        song_div.className = 'song';

        const id = document.createElement('div');
        id.className = 'hidden-id';
        id.innerHTML = song_id;
        id.style.display = 'none';

        const name = document.createElement('p');
        name.innerHTML = song_name;

        const image = document.createElement('img');
        image.src = song_img_url;

        const button = document.createElement('button');
        button.innerHTML = 'Suggest';
        button.className = 'suggest-to-queue-button'

        song_div.appendChild(id);
        song_div.appendChild(image);
        song_div.appendChild(name);
        song_div.appendChild(button);
        
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

async function fetch_spotify(url){

    const user = JSON.parse(localStorage.getItem('user'));

    const user_id = user._id;
    const access_token = user.access_key;
    const refresh_token = user.refresh_key;

    try{
        // fetch from validate_username in server.js
        const response = await fetch('/spotify_api_interact', {

            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, user_id, access_token, refresh_token }) // username sent to be checked

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


async function fetch_by_group_id(URL){

    const group_id = get_group_id();

    try{
        const response = await fetch(URL, {

            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ group_id })

        });

        try{ return await response.json(); }
        catch(err){ console.error('Error during parse:', err); }
    }
    catch(err){ console.error('Error during fetch:', err); }

    return null;

}

async function display_suggestions() {
    const suggestions = (await fetch_by_group_id('/get_suggestions')).suggestions;
    document.querySelector('.legend').style.display = 'none';
    document.querySelector('.queue-content').style.display = 'none';
    document.querySelector('.songs-list').style.display = 'none';
  
    // Get a reference to the hidden-queue-page
    const queue = document.querySelector('.suggestions');
    queue.style.display = 'flex';
  
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

async function display_playback_queue() {

    const queue = (await fetch_spotify('https://api.spotify.com/v1/me/player/queue/')).data.queue;
    document.querySelector('.legend').style.display = 'flex';
    document.querySelector('.queue-content').style.display = 'block';
    document.querySelector('.songs-list').style.display = 'none';
    document.querySelector('.suggestions').style.display = 'none';
  
    // Get a reference to the hidden-queue-page
    const playbackQueue = document.querySelector('.queue-content');
  
    // Clear any existing elements on the page
    playbackQueue.innerHTML = '<h3>Next In Queue</h3>';
    var counter = 2;
  
    // Loop through the queue and create HTML elements for each song
    for(var song of queue){
  
        // Create a playback queue element
        const playbackQueueElement = document.createElement('div');
        playbackQueueElement.className = 'queue-element';

        const elementNum = document.createElement('div');
        elementNum.innerHTML = counter;
  
        const albumCoverElement = document.createElement('img');
        albumCoverElement.src = song.album.images[0].url;
  
        const songNameElement = document.createElement('p');
        songNameElement.textContent = song.name;

        var artistNames = [];
        for(var artist of song.album.artists){ artistNames.push(artist.name); }

        const artistsElement = document.createElement('p');
        artistsElement.textContent = artistNames.join(', ');
        
        const title = document.createElement('div');
        title.classList.add('title');
        title.appendChild(songNameElement);
        title.appendChild(artistsElement);

        // Append elements to the playback queue element
        playbackQueueElement.appendChild(elementNum);
        playbackQueueElement.appendChild(albumCoverElement);
        playbackQueueElement.appendChild(title);
  
        // Append the suggestion element to the playback queue content
        playbackQueue.appendChild(playbackQueueElement);
        counter++;
    }
}

async function display_currently_playing(){

    const owner = (await fetch_by_group_id('/get_owner')).owner;

}