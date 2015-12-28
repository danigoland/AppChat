var db = require('./db');                 // TODO fix Overriding connections.
var msgModel = db.messages.model();


var clients = [];
function Client(id, name) {
    this.id = id;
    this.name = name;
}

function getClientByName(name) {
    for (var i in clients) {
        console.log('GCBN - name:', name);
        console.log('GCBN - checking:', clients[i]);
        if (clients[i].name == name) {
            console.log('GCBN - Found:', i, '(index)');
            return clients[i];
        }
    }
    return null;
}

function overrideSession(name, io) {
    console.log('Overriding', name, 'session..');
    for (var i in clients) {
        if (clients[i].name == name) {
            var poppedId = clients.splice(i, 1);
            console.log(poppedId);
            //io.sockets.connected[poppedId].disconnect();
            console.log('connection found at | index:', i, 'id:', poppedId, '| terminating..');

        }
    }
    return null;
}

function getClientIndexByName(name) {
    for (var i in clients) {
        if (clients[i].name == name)
            return i;
    }
    return -1;
}

function initSockets(io) {
    io.on("connection", function (socket) {
        console.log('Client connected to the server (' + socket.id + ')');
        socket.on("login", function (name, callback) {
            console.log(name, 'logged in.');
            overrideSession(name, io);
            clients.push(new Client(socket.id, name));
            socket.name = name;
            console.log('Online clients: ', clients);
            if (name !== 'System') {
                socket.emit('message', {body: 'Welcome!'});
                db.messages.getHistoryByName(name, function (err, data) {    // calling back the chat  history
                    callback(data);
                });
            }
            else
                callback();
            socket.on("userMessage", function (msg, callback) {
                callback(null);
                var Message = new msgModel({user: name, direction: 'in', body: msg, time: Date.now()});   // Creating new instance of msg model.
                db.messages.save(Message, function (err) {                                            // and saving it to the db
                    if (err)
                        console.log(err);
                    console.log('message wrote to db');
                });
                console.log(name + ': ' + msg);
                var client = getClientByName('System');
                if (client)
                    io.to(client.id).emit('message', Message, socket.id)
            });
            socket.on("systemMessage", function (data, callback) {
                callback();
                var Message = new msgModel({user: data.user, direction: 'out', body: data.body, time: Date.now()});   // Creating new instance of msg model.
                db.messages.save(Message, function (err) {                                            // and saving it to the db
                    if (err)
                        console.log(err);
                });
                var client = getClientByName(data.user);
                if (client)
                    io.to(client.id).emit('message', Message)
            });
            socket.on("userTyping", function (data) {
                console.log(socket.id, 'is typing', data);
                var client = getClientByName('System');
                console.log(client);
                if (client) {
                    io.to(client.id).emit('typing', {isTyping: data, id: socket.id});
                    console.log('emitted typing to', client.id)

                }
            });
        });
        socket.on('disconnect', function () {
            console.log('Client disconnected to the server (' + socket.id + ')');
            socket.emit('disconnected');
            if (socket.name) {
                var clientIndex = getClientIndexByName(socket.name);
                clients.splice(clientIndex, 1);
                console.log(socket.name, 'logged off.');
                console.log('Online clients: ', clients);

            }

        });
    });
}

module.exports = {
    initSockets: initSockets
}