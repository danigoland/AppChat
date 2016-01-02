var socket = io.connect(window.location.hostname + ":3333");
var user = {};
user.name = window.prompt("Enter user");
user.androidVersion = 'v1.0.2';
user.deviceModel = 'LG G4';
document.getElementById('Name').innerText = user.name;
if (user.name)
    socket.emit("login", user, function (history) {
        for (var i in history)
            printMessage(history[i]);
    });

socket.on("message", function (msg) {
    printMessage(msg)
});

socket.on('sysTyping', function (data) {
    if (data)
        $('#typing').css('display', 'block');
    else
        $('#typing').css('display', 'none');
    console.log(data);
});

socket.on('disconnect', function (reason) {
    console.log('socket disconnected.', reason);
});


function messageEmit(msg) {
    socket.emit('userMessage', msg, function (msg) {
        printMessage(msg);
    });
}

$('#form-keyboard').submit(function (e) {           // replacing the form submit.
    e.preventDefault();
    messageEmit($('#keyboard-message-input').val());
    $('#keyboard-message-input').val('');
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

// ------------- IS TYPING ---------- //

var typing = false;
var timeout = undefined;
var emitTimeout = undefined;


function timeoutFunction() {
    typing = false;
    clearTimeout(emitTimeout);
    //socket.emit('userTyping', false);
    console.log('stopped typing', new Date().toLocaleTimeString());
}

$("#keyboard-message-input").keydown(function (e) {
    if (e.which !== 13) {
        if (typing === false && $("#keyboard-message-input").is(":focus")) {
            typing = true;
            TypingInterval();
            //socket.emit("userTyping", true);
            console.log('typing..', new Date().toLocaleTimeString());
            clearTimeout(timeout);
            timeout = setTimeout(timeoutFunction, 3000);
        } else {
            clearTimeout(timeout);
            timeout = setTimeout(timeoutFunction, 3000);
        }
    }
    else {
        clearTimeout(timeout);
        clearTimeout(emitTimeout);
        console.log('stopped typing', new Date().toLocaleTimeString());
        typing = false;
        socket.emit('userTyping', false);
    }
});

function TypingInterval() {
    if (typing) {
        socket.emit('userTyping', true);
        console.log('emitting true');
        emitTimeout = setTimeout(TypingInterval, 2000);
    }
    else {
        console.log('emitting false');
        //socket.emit('userTyping', false);
        clearTimeout(emitTimeout);
    }


}
