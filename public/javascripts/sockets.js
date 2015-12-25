var socket = io.connect(window.location.hostname + ":8081");
var user = window.prompt("Enter user");
document.getElementById('Name').innerText = user;

if (user)
    socket.emit("login", user, function (history) {
        console.log(history);
    });
socket.on("message", function (msg) {
    var output = document.getElementById('output');
    var newMessage = document.createElement('div');
    newMessage.innerText = msg.body;
    output.appendChild(newMessage);

});

function messageEmit(msg) {
    socket.emit('userMessage', msg, function (err) {
        if (err)
            console.log(err);
        else
            console.log('Message sent.');
    });
}