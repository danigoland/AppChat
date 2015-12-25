var mongoose = require("mongoose");
var userMessages;

function dbConnect() {
    mongoose.connect('mongodb://localhost/AppChatDB');
}

function messagesInit() {
    if (!userMessages)
        userMessages = mongoose.model('messages', {user: String, direction: String, body: String, time: Date});
    return userMessages;
}

function getMessageModel() {
    if (!userMessages)
        return messagesInit();
    else
        return userMessages
}

function getMessagesByQuery(query, callback) {
    if (userMessages)
        userMessages.find(query, function (err, data) {
            return callback(err, data);
        });
    else
        return callback("the Messages  model didn't initiated");
}

function getMessagesAll(callback) {
    if (userMessages)
        userMessages.find(function (err, data) {
            return callback(err, data);
        });
    else
        return callback("the Messages  model didn't initiated");
}

function getMessagesHistoryByName(name, callback) {
    if (userMessages)
        userMessages.find({user: name}, null,
            {sort: {date: -1}}, function (err, data) {
                return callback(err, data);
            });
    else
        return callback("the Messages  model didn't initiated");
}

function saveMessage(msg, callback) {
    msg.save(function (err) {
        if (err) // ...
            callback(err);
        else
            callback();
    });
}

module.exports = {
    connect: dbConnect,
    messages: {
        init: messagesInit,
        getAll: getMessagesAll,
        getByQuery: getMessagesByQuery,
        getHistoryByName: getMessagesHistoryByName,
        save: saveMessage,
        model: getMessageModel
    }
};