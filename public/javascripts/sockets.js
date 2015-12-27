var socket = io.connect(window.location.hostname + ":8081");
var user = window.prompt("Enter user");
document.getElementById('Name').innerText = user;

if (user)
    socket.emit("login", user, function (history) {
        for (var i in history)
            printMessage(history[i]);
    });
socket.on("message", function (msg) {
    printMessage(msg)


});

function messageEmit(msg) {
    socket.emit('userMessage', msg, function (err) {
        if (err)
            console.log(err);
        else
            console.log('Message sent.');
    });
}

$('#form-keyboard').submit(function (e) {           // replacing the form submit.
    e.preventDefault();
    messageEmit($('#messageInput').val());
    $('#messageInput').val('');
});

function printMessage(msg) {
    var dir;
    switch (msg.direction) {
        case 'in':
            dir = 'out';
            break;
        case 'out':
            dir = 'in';
            break;
    }
    var output = document.getElementById('output');
    var newMessage = document.createElement('div');
    newMessage.innerText = '(' + dir + ') ' + msg.body;
    output.appendChild(newMessage);
}