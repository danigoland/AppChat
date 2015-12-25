$('#form-keyboard').submit(function (e) {           // replacing the form submit.
    e.preventDefault();
    messageEmit($('#messageInput').val());
    $('#messageInput').val('');
});
