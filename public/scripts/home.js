window.addEventListener("DOMContentLoaded", async () => {

    const groups = await get_groups( get_username() );

    for(var group of groups){

        console.log("group name: " + group.group_name);
        document.body.appendChild( group_to_page(group.group_name) );

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
        try{ const data = await response.json(); console.log(data); return data.groups; }

        catch(err){ console.error('Error during parse:', err); }
    }
    catch(err){ console.error('Error during fetch:', err); }
    
    // return null if fetch failed somewhere
    return null; 
}

function group_to_page(name){

    var button = document.createElement('button');
    button.innerHTML = name;

    console.log(button);

    return button;

}

// function will get users lowercase username
function get_username(){

    const url = window.location.href;
    const paths = url.split('/');

    // return last path - aka username path
    return paths[paths.length - 1];

}