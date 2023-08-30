window.addEventListener('DOMContentLoaded', async () => {

    // get group and user
    const group = get_group();
    const user = JSON.parse( localStorage.getItem('user') );

});

// function will return the id of the current group
function get_group(){

    const url = window.location.href;
    const paths = url.split('/');

    // return last path - aka group id
    return paths[paths.length - 1];

}