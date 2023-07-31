const url = new URL( window.location.href );
const query_params = new URLSearchParams( url.search );
var email = undefined;

async function email_valid(email){

    try{

        const response = await fetch('/validate_email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        try{

            const data = await response.json();

            console.log(data);
            console.log(data.email_exists);

            if( !data.email_exists ){ console.log('Email valid.'); return true; }                // Email doesnt exist, cur email is valid
            else{ console.log('Email already exists.'); return false; }

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

window.addEventListener('DOMContentLoaded', () => {

    document.getElementById('code').value = query_params.get('code');

    // check if entered email already exists
    document.getElementById('email').addEventListener('blur', async () => {

        // update email
        email = document.getElementById('email').value;
        
        if( await email_valid(email) ){  }
        else{  }

    });

    // dont post form if email invalid
    document.getElementById('account-form').addEventListener('submit', async (event) => {

        event.preventDefault();

        // update email
        email = document.getElementById('email').value;
        const valid = await email_valid(email);

        console.log("valid: " + valid);

        if( regex_valid_email(email) && valid ){ event.target.submit(); }

    }); 
});
