var songDict = {};
const username = (JSON.parse(localStorage.getItem('user'))).lowercase_username;

// DOM CONTENT LOADED
window.addEventListener('DOMContentLoaded', async () => {

    // get group and user
    const user = await get_user(username);
    const confirmButton = document.querySelector('.confirm-button');

    // set the URL for the home button
    document.querySelector('.homebutton').href = 'http://' + window.location.host + '/home/' + username;

    // make event listener for page buttons
    const pages = document.querySelectorAll('.pages-content');
    for(const page of pages){
        page.addEventListener('click', () => {

            for(const underline of document.querySelectorAll('.underline')){ underline.classList.remove('selected'); }
            page.querySelector('.underline').classList.add('selected'); // set button as selected

        });
    }

    // update user in local storage
    localStorage.setItem('user', JSON.stringify(user));

    // init group queue for user
    populate_songs(true);
    display_playback_queue();
    
    // populate queue and song page upon clicking
    document.querySelector('.queue').addEventListener('click', async () => {  display_playback_queue(); });
    document.querySelector('.addsong').addEventListener('click', async () => {  populate_songs(false); });

    // handler for the button that adds the songs to the list
    confirmButton.addEventListener('click', async () => {

        await addToQueue(Object.keys(songDict), user._id, user.access_key, user.refresh_key);
        document.querySelector('.songs-list').innerHTML = '<div class="confirm-button"></div>';
        songDict = {};
        confirmButton.style.display = 'none';
        populate_songs(false);
        refreshEventListeners();

    });

    // handlers for leave group page
    document.querySelector('.leave-button').addEventListener('click', () => { handleLeave(user); });
    document.querySelector('.no').addEventListener('click', () => { handleLeave(user); });
    document.querySelector('.yes').addEventListener('click', () => { leaveGroup(user._id, get_group_id()); });

});

// handler for bringing up the page to leave the group
function handleLeave(user){

    const leaveDiv = document.querySelector('.leave');
    
    // switch between flex and none
    const isNone = leaveDiv.style.display != 'flex' ? true : false;
    if(isNone){ leaveDiv.style.display = 'flex'; leaveDiv.style.opacity = '75%'; }
    else{ leaveDiv.style.display = 'none'; leaveDiv.style.opacity = 0; }

}

// this button handles functionality for selecting
// a song to add to the list. it will give the song a
// border and will bring up the "add to queue" button.
function song_listener(song, confirmButton){

    const key = song.querySelector('.hidden-id').innerHTML;

    // if already selected, unselect
    if(song.classList.contains('song-selected')){ 
        song.classList.remove('song-selected'); 
        delete songDict[key];
        const numSongs = Object.keys(songDict).length;
        if( numSongs == 0 ){ confirmButton.style.display = 'none'; }
        else{ confirmButton.style.display = 'flex'; confirmButton.innerHTML = "Add " + numSongs + " songs to queue"; }
    }

    // if not selected, select 
    else{ 
        song.classList.add('song-selected'); 
        songDict[ key ] = Object.keys(songDict).length;
        const numSongs = Object.keys(songDict).length;
        confirmButton.style.display = 'flex';
        confirmButton.innerHTML = "Add " + numSongs + " songs to queue";
    }

}

// leave the group in the DB and redirect back home
async function leaveGroup(user_id, group_id){

    try{
        await fetch('/leave_group', {

            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id, group_id })

        });

        window.location.href = 'http://' + window.location.host + '/home/' + username;
    }
    catch(err){ console.error('Error during fetch:', err); }


}

// refresh the event listeners for all items after
// they have been refreshed in the page.
async function refreshEventListeners(){

    const user = await get_user(username);
    const confirmButton = document.querySelector('.confirm-button');

    // for each song in the div
    for(const song of document.querySelectorAll('.song')){

        // add the event listener back
        song.addEventListener('click', () => {

            const key = song.querySelector('.hidden-id').innerHTML;

            // functionality for selecting/unselcting songs
            if(song.classList.contains('song-selected')){ 
                song.classList.remove('song-selected'); 
                delete songDict[key];
                const numSongs = Object.keys(songDict).length;
                if( numSongs == 0 ){ confirmButton.style.display = 'none'; }
                else{ confirmButton.innerHTML = "Add " + numSongs + " songs to queue"; }
            }
            else{ 
                song.classList.add('song-selected'); 
                songDict[ key ] = Object.keys(songDict).length;
                const numSongs = Object.keys(songDict).length;
                confirmButton.style.display = 'flex';
                confirmButton.innerHTML = "Add " + numSongs + " songs to queue";
            }

        });
    }

    // refresh the confirm button event listener as well
    confirmButton.addEventListener('click', async () => {
        await addToQueue(Object.keys(songDict), user._id, user.access_key, user.refresh_key);
        document.querySelector('.songs-list').innerHTML = '<div class="confirm-button"></div>';
        songDict = {};
        confirmButton.style.display = 'none';
        await populate_songs(false);
        refreshEventListeners();
    });
}

// this will fetch a user from the database
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
async function populate_songs(init){

    const confirmButton = document.querySelector('.confirm-button');

    const song_list = document.querySelector('.songs-list');
    song_list.style.display = 'none';

    if(!init){
        song_list.innerHTML = '';
        song_list.appendChild(confirmButton);
        document.querySelector('.queue-content').style.display = 'none';
        document.querySelector('.suggestions').style.display = 'none';
        song_list.style.display = 'flex';
    }
    
    var songs = (await get_library()).songs.items;

    // make element for each song, add to song list
    for(var song of songs){

        song = song.track;

        // compile all data to be used from given track
        var song_name = song.name;
        if(song_name.length >= 45){ song_name = song_name.substring(0, 45) + "..."; }
        const song_artists = (song.artists.map(object => object.name)).join(', ');
        const song_img_url = song.album.images[0].url;
        const song_id = song.id

        // use all song data to create elements to display song
        const song_div = document.createElement('div');
        song_div.className = '';
        song_div.classList.add('song');

        // make hidden ID field for future reference
        const id = document.createElement('div');
        id.className = 'hidden-id';
        id.innerHTML = song_id;
        id.style.display = 'none';

        // make elements to display the song
        const name = document.createElement('p');
        name.innerHTML = song_name;

        const image = document.createElement('img');
        image.src = song_img_url;

        // add all elements to song div
        song_div.appendChild(id);
        song_div.appendChild(image);
        song_div.appendChild(name);

        // add event listener to this song div
        song_div.addEventListener('click', () => { song_listener(song_div, confirmButton); });
        
        // add song to song-list div
        song_list.appendChild(song_div);
    }

}

// fetch a track by its spotify song id
async function get_track_by_id(song_id){

    // get user object
    const user = JSON.parse(localStorage.getItem('user'));

    const user_id = user._id;
    const access_token = user.access_key;
    const refresh_token = user.refresh_key;

    // fetch from track from server.js 
    try{
        
        const response = await fetch('/get_track_by_id', {

            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ song_id, user_id, access_token, refresh_token }) // username sent to be checked

        });
        // return the data
        try{ return await response.json(); }
        catch(err){ console.error('Error during parse:', err); }
    }
    catch(err){ console.error('Error during fetch:', err); }

    return null;

}

// function very similar to above, route handles the
// fetching from api slightly different
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
        // fetch from get_library in server.js
        const response = await fetch('/get_library', {

            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id, access_token, refresh_token }) // username sent to be checked

        });
        // return data
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

// this will get a group from the DB given the id
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

// this function will display the currently playing song
async function display_current_song(){

    const song = (await fetch_spotify('https://api.spotify.com/v1/me/player/currently-playing')).data.item;
    
    // Create a playback queue element
    const playbackQueueElement = document.createElement('div');
    playbackQueueElement.className = 'queue-element';

    // create the number to count the element
    const elementNum = document.createElement('div');
    elementNum.classList.add('element-num');
    elementNum.innerHTML = 1;

    // create the album cover
    const albumCoverElement = document.createElement('img');
    albumCoverElement.src = song.album.images[0].url;

    // create the song name element
    const songNameElement = document.createElement('a');
    var songName = song.name;
    if(songName.length > 47){ songName = songName.substring(0, 47) + "..."; }

    // set fields for song name element
    songNameElement.innerHTML = songName;
    songNameElement.classList.add('song-name');
    songNameElement.href = "https://open.spotify.com/track/" + song.id;
    songNameElement.target = "_blank";

    var artistNames = [];
    for(var artist of song.artists){ artistNames.push(artist.name); }

    // create artists element
    const artistsElement = document.createElement('a');
    artistsElement.textContent = artistNames.join(', ');
    artistsElement.classList.add('artists');
    
    // div to hold song name + artists
    const title = document.createElement('div');
    title.classList.add('title');
    title.appendChild(songNameElement);
    title.appendChild(artistsElement);

    // create element for album name
    const albumNameElement = document.createElement('a');
    albumNameElement.classList.add('album-name');

    // set album name fields
    var albumName = song.album.name;
    if(albumName.length > 28){ albumName = albumName.substring(0, 28) + "..."; }
    albumNameElement.innerHTML = albumName;
    albumNameElement.href = "https://open.spotify.com/album/" + song.album.id;
    albumNameElement.target = "_blank";
    
    // create element for time
    const timeElement = document.createElement('p');
    timeElement.classList.add('time');
    timeElement.innerHTML = makeTime(song.duration_ms);

    // Append elements to the playback queue element
    playbackQueueElement.appendChild(elementNum);
    playbackQueueElement.appendChild(albumCoverElement);
    playbackQueueElement.appendChild(title);
    playbackQueueElement.appendChild(albumNameElement);
    playbackQueueElement.appendChild(timeElement);

    return playbackQueueElement;
}

// function will convert ms to "min:second" form
function makeTime(duration){

    const minutes = Math.floor( ( Math.floor( duration / 1000 ) ) / 60 );
    const seconds = ( Math.floor( duration / 1000 ) ) % 60;
    const secStr = seconds < 10 ? '0' + seconds : '' + seconds;
    return minutes + ':' + secStr

}

// function will display the entire playback queue
async function display_playback_queue() {

    // fetch entire queue from spotify, init some vars
    const queue = (await fetch_spotify('https://api.spotify.com/v1/me/player/queue/')).data.queue;
    document.querySelector('.queue-content').style.display = 'block';
    document.querySelector('.songs-list').style.display = 'none';
    document.querySelector('.suggestions').style.display = 'none';
    
    // Get a reference to the hidden-queue-page
    const playbackQueue = document.querySelector('.queue-content');
    playbackQueue.innerHTML = "";

    // make h3 as title for section, display currently
    // playing song
    const h3_cur = document.createElement('h3');
    h3_cur.innerHTML = "Now Playing";
    playbackQueue.appendChild(h3_cur);
    playbackQueue.appendChild( await display_current_song() );
  
    // Clear any existing elements on the page
    const h3 = document.createElement('h3');
    h3.innerHTML = "Next In Queue";
    playbackQueue.appendChild(h3);
    var counter = 2;
  
    // Loop through the queue and create HTML elements for each song
    for(var song of queue){
  
        // Create a playback queue element
        const playbackQueueElement = document.createElement('div');
        playbackQueueElement.className = 'queue-element';

        // create element number 
        const elementNum = document.createElement('div');
        elementNum.classList.add('element-num');
        elementNum.innerHTML = counter;
        
        // create album cover element
        const albumCoverElement = document.createElement('img');
        albumCoverElement.src = song.album.images[0].url;
        
        // make the song name element
        const songNameElement = document.createElement('a');
        var songName = song.name;

        // set song name element fields
        if(songName.length > 47){ songName = songName.substring(0, 47) + "..."; }
        songNameElement.innerHTML = songName;
        songNameElement.classList.add('song-name');
        songNameElement.href = "https://open.spotify.com/track/" + song.id;
        songNameElement.target = "_blank";

        // add all artist names to the list
        var artistNames = [];
        for(var artist of song.artists){ artistNames.push(artist.name); }

        // make the text for the artist element
        const artistsElement = document.createElement('a');
        artistsElement.textContent = artistNames.join(', ');
        artistsElement.classList.add('artists');
        
        // div to hold song name + artist names
        const title = document.createElement('div');
        title.classList.add('title');
        title.appendChild(songNameElement);
        title.appendChild(artistsElement);

        // make artist name element
        const albumNameElement = document.createElement('a');
        albumNameElement.classList.add('album-name');

        // add values to name element
        var albumName = song.album.name;
        if(albumName.length > 28){ albumName = albumName.substring(0, 28) + "..."; }
        albumNameElement.innerHTML = albumName;
        albumNameElement.href = "https://open.spotify.com/album/" + song.album.id;
        albumNameElement.target = "_blank";
        
        // make time element 
        const timeElement = document.createElement('p');
        timeElement.classList.add('time');
        timeElement.innerHTML = makeTime(song.duration_ms);

        // Append elements to the playback queue element
        playbackQueueElement.appendChild(elementNum);
        playbackQueueElement.appendChild(albumCoverElement);
        playbackQueueElement.appendChild(title);
        playbackQueueElement.appendChild(albumNameElement);
        playbackQueueElement.appendChild(timeElement);

        // Append the suggestion element to the playback queue content
        playbackQueue.appendChild(playbackQueueElement);
        counter++;
    }
}

// function will add a given song to the queue
async function addToQueue(songs, user_id, access_token, refresh_token){

    // for each song in song array, add to queue
    for(const song of songs){

        const url = 'https://api.spotify.com/v1/me/player/queue?uri=spotify%3Atrack%3A' + song;

        try{
            await fetch('/add_to_queue', {
    
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, user_id, access_token, refresh_token })
    
            });
        }
        catch(err){ console.error('Error during fetch:', err); }

    }

}