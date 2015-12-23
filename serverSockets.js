var db = require('./db');
var msgModel = db.messages.model();

function initSockets(io) {
    io.on("connection", function (socket) {
        console.log('Someone connected to the server');
        socket.on("login", function (name, callback) {
            console.log(name, 'connected.');
            db.messages.getHistoryByName(name, function (err, data) {    // calling back the chat  history
                callback(data);
            });
            socket.on("userMessage", function (msg) {
                var Message = new msgModel({from: name, to: 'System', body: msg, time: Date.now()});   // Creating new instance of msg model.
                db.messages.save(Message, function (err) {                                            // and saving it to the db
                    if (err)
                        console.log(err);
                });
                console.log(name + ': ' + msg);
            });
            socket.on("systemMessage", function (name, msg) {
                var Message = new msgModel({from: 'System', to: name, body: msg, time: Date.now()});   // Creating new instance of msg model.
                db.messages.save(Message, function (err) {                                            // and saving it to the db
                    if (err)
                        console.log(err);
                });
                socket.emit('message');   //TODO: a: send Message as is / b: send simple object.
            });
        });
    });
}

module.exports = {
    initSockets: initSockets
}