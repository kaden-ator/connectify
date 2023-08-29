window.addEventListener("DOMContentLoaded", async () => {

    const username = get_username();
    const groups = await get_groups(username);

    for(var group of groups){

        document.body.appendChild( make_group_button(group) );

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
            body: JSON.stringify({ user }) // send user to get groups from

        });

        // try to return array of groups in json format
        try{ const data = await response.json(); return data.groups; }

        catch(err){ console.error('Error during parse:', err); }
    }
    catch(err){ console.error('Error during fetch:', err); }
    
    // return null if fetch failed somewhere
    return null; 
}

// makes button to navigate to page
function make_group_button(group){

    var link = document.createElement('a');
    link.href = make_link(group._id);

    var button = document.createElement('button');
    button.innerHTML = group.group_name;

    link.appendChild(button);

    return link;

}

function make_link(id){

    return 'http://localhost:3000/group/' + id;

}

// function will get users lowercase username
function get_username(){

    const url = window.location.href;
    const paths = url.split('/');

    // return last path - aka username path
    return paths[paths.length - 1];

}