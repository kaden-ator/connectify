var username = undefined;

async function get_user(username){

    try{
        // fetch from get_user in server.js by username
        const response = await fetch('/get_user', {

            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })

        });

        try{ const data = await response.json(); return data.user; }
        catch(err){ console.error('Error during parse:', err); }
    }
    catch(err){ console.error('Error during fetch:', err); }

    return null;

}

async function username_valid(username){

    try{
        // fetch from validate_username in server.js
        const response = await fetch('/validate_username', {

            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username }) // username sent to be checked

        });

        try{

            const data = await response.json();

            // username valid if doesn't already exist in DB
            if( data.username_exists ){ return true; }                
            else{ return false; }

        }
        catch(err){ console.error('Error during parse:', err); }
    }
    catch(err){ console.error('Error during fetch:', err); }

    return false; 

}

window.addEventListener('DOMContentLoaded', () => {

    // check if entered email already exists
    document.getElementById('username').addEventListener('blur', async () => {

        // update email
        username = document.getElementById('username').value;

    });

    const login_form = document.getElementById('login-form');

    // dont post form if email invalid
    login_form.addEventListener('submit', async (event) => {

        event.preventDefault();

        // update email & username

        username = document.getElementById('username').value;

        const username_is_valid = await username_valid(username);

        if( username_is_valid ){ 
            
            // redirect user to www.URL.com/home/:username (lower case username for simplicity) ONLY IF VALID
            const redirectURL = "http://localhost:3000/home/" + username.toLowerCase();
            login_form.action = redirectURL;

            localStorage.setItem('user', JSON.stringify( await get_user(username.toLowerCase()) ));
            
            // submit the form 
            event.target.submit(); 
        }

    }); 
});