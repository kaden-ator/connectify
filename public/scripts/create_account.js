const url = new URL( window.location.href );
const query_params = new URLSearchParams( url.search );
var email = undefined;
var username = undefined;

// function will determine if the email is already in the DB
async function email_valid(email){

    try{

        // fetch from validate_email in server.js
        const response = await fetch('/validate_email', {

            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email }) // email sent to be checked

        });

        try{

            const data = await response.json();

            // email valid if doesn't already exist in DB
            if( !data.email_exists ){ return true; }                

        }
        catch(err){ console.error('Error during parse:', err); }
    }
    catch(err){ console.error('Error during fetch:', err); }
    return false; 
}

// regex checking for email
function regex_valid_email(email){

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());

}

// function will determine if the username is already within the DB
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
            if( !data.username_exists ){ return true; }                
            else{ return false; }

        }
        catch(err){ 

            console.error('Error during parse:', err);
            return false; 

        }
    }
    catch(err){ 

        console.error('Error during fetch:', err);
        return false; 

    }

}

window.addEventListener('DOMContentLoaded', () => {

    // save users access and refresh tokens for later use
    document.getElementById('access_token').value = query_params.get('access_token');
    document.getElementById('refresh_token').value = query_params.get('refresh_token');
    const errmsg = document.querySelector('.error-msg');

    // check if entered email already exists
    document.getElementById('email').addEventListener('blur', async () => {

        // update email
        email = document.getElementById('email').value;
        const email_valid_bool = await email_valid(email);

        // add message stating why email not valid
        if( email_valid_bool ){ errmsg.style.display = 'none'; }
        else{ 
            console.log('invalid');
            errmsg.textContent = 'Invalid Email'
            errmsg.style.display = 'flex';
        }

    });

    // dont post form if email invalid
    document.getElementById('account-form').addEventListener('submit', async (event) => {

        event.preventDefault();

        // update email & username
        username = document.getElementById('username').value;
        email = document.getElementById('email').value;
        
        // validate fields
        const email_is_valid = await email_valid(email);
        const username_is_valid = await username_valid(username);

        if(!username_is_valid){ 
            errmsg.textContent = "Username Taken"; 
            errmsg.style.display = 'flex'; 
        }
        else{ errmsg.style.display = 'none';}

        if( regex_valid_email(email) && email_is_valid && username_is_valid ){ event.target.submit(); }

    }); 
});
