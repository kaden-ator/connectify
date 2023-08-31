window.addEventListener('DOMContentLoaded', async () => {

    const songs = await get_top_songs();

    // get group and user
    const group = get_group();
    const user = JSON.parse( localStorage.getItem('user') );

    const queueIcon = document.querySelector(".queue-icon");
    const hiddenPage = document.querySelector(".hidden-page");
    const footer = document.querySelector(".footer");

    queueIcon.addEventListener("click", function () {
        console.log(hiddenPage.style.display);
        // Toggle the position of the hidden page and the height of the footer
        if (hiddenPage.style.display === '') {
            hiddenPage.style.top = '40px';
            footer.style.bottom = 'calc(100vh - 40px)';
            hiddenPage.style.display = 'block';
        } 
        else{
            hiddenPage.style.top = '100vh';
            footer.style.bottom = '0';
            hiddenPage.style.display = '';
        }
    });

});

function populate_songs(){



}

async function get_top_songs(){

    const user = JSON.parse(localStorage.getItem('user'));
    const access_token = user.access_key

    try{
        // fetch from validate_username in server.js
        const response = await fetch('/get_top_user_songs', {

            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ access_token }) // username sent to be checked

        });
        try{

            const songs = await response.json();
            return songs;

        }
        catch(err){ console.error('Error during parse:', err); }
    }
    catch(err){ console.error('Error during fetch:', err); }

    return null;

}

// function will return the id of the current group
function get_group(){

    const url = window.location.href;
    const paths = url.split('/');

    // return last path - aka group id
    return paths[paths.length - 1];

}