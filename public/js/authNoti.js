$('#register-form button').on('click', function (e) {
    e.preventDefault();
    $.post('/register', {
        email: $("#register-email").val(),
        username: $("#register-username").val(),
        password: $("#register-password").val(),
        'password-confirm': $("#register-password-confirm").val(),
    }, function (data) {
        if (data.message != 'Success') {
            document.getElementById('register-notification').innerHTML = data.message
        } else {
            window.location.replace(data.url)
        }
    })
})