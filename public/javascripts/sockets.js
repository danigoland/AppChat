var socket = io.connect(window.location.hostname + ":8081");
var user = window.prompt("Enter user");

socket.emit("login", user, function (history) {
    console.log(history);
});

function messageEmit(msg) {
    socket.emit('userMessage', msg);
    console.log('Sending:', msg);
}