var db = require('./db');                 // TODO fix Overriding connections.  systemTyping
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

function getClientsByName(name, callback) {
    var sockets = [];
    for (var i in clients) {
        if (clients[i].name == name) {
            sockets.push(clients.splice(i, 1));
        }
    }
    return callback(sockets);
}

function getClientIndexByName(name) {
    for (var i in clients) {
        if (clients[i].name == name)
            return i;
    }
    return -1;
}

function getSystemClients() {
    console.log('GSC - Looking for System clients');
    var sysClients = [];
    for (var i in clients) {
        console.log('GSC - checking:', clients[i]);
        if (clients[i].name == 'System') {
            console.log('GSC - Found:', i, '(index)');
            sysClients.push(clients[i]);
        }
    }
    console.log('Returning System Clients');
    return sysClients;
}

function initSockets(io) {
    io.on("connection", function (socket) {
        console.log('Client connected to the server (' + socket.id + ')');
        socket.on("login", function (name, callback) {
            console.log(name, 'logged in.');
            //getClientsByName(name, function(clients){
            //    for (var i in clients){
            //        if (clients[i].id !== socket.id)
            //         io.sockets.connected[clients.id].disconnect();
            //    }
            //});
            socket.name = name;
            clients.push(new Client(socket.id, name));
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
                var Message = new msgModel({user: name, direction: 'in', body: msg, time: Date.now()});   // Creating new instance of msg model.
                db.messages.save(Message, function (err) {                                            // and saving it to the db
                    if (err)
                        console.log(err);
                    console.log('message wrote to db');
                });
                callback(Message);
                console.log(name + ': ' + msg);
                var system = getSystemClients();
                for (var i in system)
                    io.to(system[i].id).emit('message', Message, socket.id)
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
                    io.to(client.id).emit('message', Message);
                var system = getSystemClients();
                for (var i in system)
                    io.to(system[i].id).emit('message', Message, socket.id)

            });
            socket.on("userTyping", function (data) {
                console.log(socket.name, 'is typing', data);
                var system = getSystemClients();
                console.log(system);
                for (var i in system) {
                    io.to(system[i].id).emit('typing', {isTyping: data, name: socket.name});
                    console.log('emitted typing to', system[i].id)

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