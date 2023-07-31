const url = new URL( window.location.href );
const query_params = new URLSearchParams( url.search );

window.addEventListener('DOMContentLoaded', () => {

    document.getElementById("code").value = query_params.get('code');

});

