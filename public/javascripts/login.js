$(document).ready(function() {
    $('#google-login').click(function (event) {
        console.log("trigger");
        const a = document.createElement('a');
        a.setAttribute('href','/api/auth/login');
        a.click();
    })
});