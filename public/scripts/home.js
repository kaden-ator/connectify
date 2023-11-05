window.addEventListener('DOMContentLoaded', async () => {

    const username = get_username();
    const groups = await get_groups(username);
    const user = await get_user(username);

    const createGroupBtn = document.querySelector('.create-group-button');
    const createGroupPage = document.querySelector('.create-group');
    const leftArrows = document.querySelectorAll('.left-arrow');
    const groupNameInput = document.querySelector('#groupName');
    const submitGroup = document.querySelector('.submit-group');
    const joinGroupPage = document.querySelector('.join-group');
    const joinGroupBtn = document.querySelector('.join-group-button');

    // add user data to local storage for future use
    localStorage.setItem('user', JSON.stringify( user ));

    for(var group of groups){

        document.querySelector('.groups').appendChild( make_group_button(group) );

    }

    createGroupBtn.addEventListener('click', () => { createGroupPage.style.display = 'flex'; createGroupPage.style.opacity = 1; joinGroupPage.style.display = 'none'; joinGroupPage.style.opacity = 0; });
    for(const leftArrow of leftArrows){ leftArrow.addEventListener('click', () => { createGroupPage.style.display = 'none'; createGroupPage.style.opacity = 0; joinGroupPage.style.display = 'none'; joinGroupPage.style.opacity = 0; }); }
    submitGroup.addEventListener('click', async () => { 
        await create_group(groupNameInput.value, user._id); 
        createGroupPage.style.display = 'none'; 
        createGroupPage.style.opacity = 0; 
        const groupElement =document.querySelector('.groups');
        groupElement.innerHTML = '';
        for(var group of await get_groups(username)){ groupElement.appendChild( make_group_button(group) ); }
    });
    joinGroupBtn.addEventListener('click', () => { createGroupPage.style.display = 'none'; createGroupPage.style.opacity = 0; joinGroupPage.style.display = 'flex'; joinGroupPage.style.opacity = 1; });
    document.querySelector('.submit-join').addEventListener('click', async () => {
        const group_id = document.querySelector('#groupID').value;
        await join_group(user._id, group_id);
        joinGroupPage.style.display = 'none'; 
        joinGroupPage.style.opacity = 0; 
        const groupElement=document.querySelector('.groups');
        groupElement.innerHTML = '';
        for(var group of await get_groups(username)){ groupElement.appendChild( make_group_button(group) ); }
    })
});

async function join_group(user_id, group_id){

    try{
        // fetch from get_user in server.js by username
        const response = await fetch('/join_group', {

            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id, group_id })

        });

    }
    catch(err){ console.error('Error during fetch:', err); }

    return null;

}

async function create_group(name, id){

    try{
        // fetch from get_user in server.js by username
        const response = await fetch('/create_group', {

            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, id })

        });
        return null;
    }
    catch(err){ console.error('Error during fetch:', err); }

    return null;

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
    link.innerHTML = group.group_name;

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