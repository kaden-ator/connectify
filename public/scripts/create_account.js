const url = new URL( window.location.href );
const query_params = new URLSearchParams( url.search );
var email = undefined;
var username = undefined;

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

function regex_valid_email(email){

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());

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

    document.getElementById('code').value = query_params.get('code');

    // check if entered email already exists
    document.getElementById('email').addEventListener('blur', async () => {

        // update email
        email = document.getElementById('email').value;

        if( await !email_valid(email) ){  }

    });

    // dont post form if email invalid
    document.getElementById('account-form').addEventListener('submit', async (event) => {

        event.preventDefault();

        // update email & username

        username = document.getElementById('username').value;
        email = document.getElementById('email').value;

        const email_is_valid = await email_valid(email);
        const username_is_valid = await username_valid(username);

        if( regex_valid_email(email) && email_is_valid && username_is_valid ){ event.target.submit(); }

    }); 
});
