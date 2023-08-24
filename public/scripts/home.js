window.addEventListener("DOMContentLoaded", async () => {

    groups = await get_groups( get_username() );

    for(group of groups){

        console.log(group);

    }

});

async function get_groups(user){
    try{
        // fetch from groups from DB
        const response = await fetch('/get_groups', {

            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user }) // user to get groups from

        });

        // try to return array of groups in json format
        try{ const data = await response.json(); return data.groups; }

        catch(err){ console.error('Error during parse:', err); }
    }
    catch(err){ console.error('Error during fetch:', err); }
    
    // return null if fetch failed somewhere
    return null; 
}

// function will get users lowercase username
function get_username(){

    const url = new URL( window.location.href );
    paths = url.split('/');

    // return last path - aka username path
    return paths[-1];

}