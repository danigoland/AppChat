var db = require('./db');
var msgModel = db.messages.model();
var usrModel = db.users.model();


var clients = [];
function Client(socketId, id, name) {
    this.socketId = socketId;
    this.id = id;
    this.name = name;
}

function getClientById(id) {
    for (var i in clients) {
        console.log('GCBN - i:', id);
        console.log('GCBN - checking:', clients[i]);
        if (clients[i].id == id) {
            console.log('GCBN - Found:', i, '(index)');
            return clients[i];
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

function getSystemClients() {
    var sysClients = [];
    for (var i in clients) {
        if (clients[i].name == 'System') {
            sysClients.push(clients[i]);
        }
    }
    console.log('Returning System Clients');
    return sysClients;
}

function initSockets(io) {
    io.on("connection", function (socket) {
        console.log('Client connected to the server (' + socket.id + ')');
        socket.on("login", function (data, callback) {
            console.log('data recived', data);
            if (data)
            if (data.name !== null || data.name !== undefined) {
                var typing = false;
                var timeout = undefined;
                if (data.name !== 'System') {
                    var User = new usrModel({
                        name: data.name, deviceModel: data.deviceModel,
                        androidVersion: data.androidVersion
                    });
                    db.users.save(User, function (err, userId) {
                        if (err) {
                            console.log('error saving user to db:', err);
                            socket.disconnect();
                        }
                        socket.name = data.name;
                        socket.userId = userId;
                        clients.push(new Client(socket.id, userId, data.name));
                        console.log(data.name, 'logged in.');
                        console.log('Online clients: ', clients);
                        socket.emit('message', {direction: 'out', body: 'Welcome!'});
                        db.messages.getHistoryById(socket.userId, function (err, data) {    // calling back the chat  history
                            callback(data);
                        });
                    });

                }
                else {
                    clients.push(new Client(socket.id, undefined, data.name));
                    socket.name = 'System';
                    console.log(data.name, 'logged in.');
                    console.log('Online clients: ', clients);
                    callback();
                }
                socket.on("userMessage", function (msg, callback) {
                    var Message = new msgModel({user: socket.userId, direction: 'in', body: msg, time: Date.now()});   // Creating new instance of msg model.
                    console.log('-- New Message:', Message);
                    db.messages.save(Message, function (err, msgId) {                                               // and saving it to the db
                        if (err)
                            console.log(err);
                        else
                            db.users.updateLastMsg(Message.user, msgId, function (err) {
                                if (err)
                                    console.log(err);
                            });
                    });
                    callback(Message);
                    console.log(data.name + ': ' + msg);
                    var system = getSystemClients();
                    for (var i in system) {
                        io.to(system[i].socketId).emit('message', Message);
                        console.log('emitted message to', system[i]);
                    }
                });

                socket.on("systemMessage", function (data, callback) {
                    callback();
                    var Message = new msgModel({user: data.user, direction: 'out', body: data.body, time: Date.now()});   // Creating new instance of msg model.
                    db.messages.save(Message, function (err, msgId) {                                                           // and saving it to the db
                        if (err)
                            console.log(err);
                        else
                            db.users.updateLastMsg(Message.user, msgId, function (err) {
                                if (err)
                                    console.log(err);
                            });
                    });
                    var client = getClientById(data.user);
                    console.log('---', client, data.user);
                    if (client)
                        io.to(client.socketId).emit('message', Message);
                    var system = getSystemClients();
                    for (var i in system)
                        io.to(system[i].socketId).emit('message', Message, socket.id)

                });

                socket.on("userTyping", function (data) {
                    function emitTyping() {
                        //console.log(socket.name, 'is typing', typing);
                        var system = getSystemClients();
                        for (var i in system) {
                            io.to(system[i].socketId).emit('typing', {isTyping: typing, id: socket.userId});
                            console.log('emitted typing to', system[i])
                        }
                    }

                    if (data) {
                        if (typing === false) {
                            typing = true;
                            emitTyping();
                        }
                        clearTimeout(timeout);
                        timeout = setTimeout(function () {
                            typing = false;
                            emitTyping();
                        }, 3000);
                    }
                    else {
                        typing = false;
                        clearTimeout(timeout);
                        emitTyping();
                    }
                });

                socket.on("systemTyping", function (data) {
                    console.log(socket.name, 'is typing to', data.to, data.state);
                    var client = getClientById(data.to);
                    if (client) {
                        console.log('emitted typing to', client);
                        io.to(client.socketId).emit('sysTyping', data.state);
                        console.log('emitted typing to', client.socketId);
                    }
                });

                socket.on('messageIsRead', function (id) {
                    console.log('message', id, 'is read');
                    db.messages.hasRead(id, function (err) {
                        if (err)
                            throw err;
                        else {
                            var system = getSystemClients();
                            for (var i in system) {
                                io.to(system[i].socketId).emit('messageChangedToRead', id);
                            }
                        }

                    });
                });
            }
            else
                socket.disconnect();
        });
        socket.on('disconnect', function (reason) {
            console.log('Client disconnected to the server (' + socket.id + ')[' + reason + ']');
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