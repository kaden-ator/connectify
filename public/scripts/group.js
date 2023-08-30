window.addEventListener('DOMContentLoaded', async () => {

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

// function will return the id of the current group
function get_group(){

    const url = window.location.href;
    const paths = url.split('/');

    // return last path - aka group id
    return paths[paths.length - 1];

}