var mongoose = require("mongoose");
var userMessages;
var users;

function dbConnect() {
    mongoose.connect('mongodb://localhost/AppChatDB');
}

/** Message Model */

function messagesInit() {
    if (!userMessages)
        userMessages = mongoose.model('messages', {
            user: {type: mongoose.Schema.ObjectId, ref: 'users', required: true},
            direction: String, body: String, time: Date, read: {type: Boolean, default: false}
        });
    return userMessages;
}

function getMessageModel() {
    if (!userMessages)
        return messagesInit();
    else
        return userMessages
}

function getMessagesByQuery(query, callback) {
    if (userMessages)      // .populate('user')
        userMessages.find(query).sort('time').exec(function (err, data) {
            return callback(err, data);
        });
    else
        return callback("the Messages  model didn't initiated");
}

function getMessagesAll(callback) {
    if (userMessages)
        userMessages.find({}, null,
            {sort: {date: -1}}, function (err, data) {
                return callback(err, data);
            });
    else
        return callback("the Messages  model didn't initiated");
}

function getMessagesHistoryById(id, callback) {
    if (userMessages)
        userMessages.find({user: id}).sort('time').exec(function (err, data) {
            if (err)
                console.log(err);
            return callback(err, data);
        });
    else
        return callback("the Messages  model didn't initiated");
}

function saveMessage(message, callback) {
    message.save(function (err, msg) {
        if (err) // ...
            callback(err);
        else
            addMessageToUserUnread(msg, function (err) {
                if (err)
                    callback(err, msg._id);
                else
                    callback(null, msg._id);
            });
    });

}

function messageIsRead(id, callback) {
    userMessages.findOneAndUpdate({_id: id}, {read: true}, function (err, data) {
        if (err) // ...
            callback(err);
        else
            callback(null);
    });
}

function deleteMessagesOfUser(id, callback) {
    if (userMessages)
        userMessages.find({user: id}).remove().exec(function (err, data) {
            callback(err);
        });
    else
        return callback("the Messages  model didn't initiated");
}
/** User Model */

function usersInit() {
    if (!users)
        users = mongoose.model('users', {
            name: {type: String, required: true},
            androidVersion: String,
            deviceModel: String,
            lastMessage: {type: mongoose.Schema.ObjectId, ref: 'messages'},
            unreadMessages: [{type: mongoose.Schema.ObjectId, ref: 'messages'}],
            archived: {type: Boolean, default: false}
        });
    return users;
}

function getUsersModel() {
    if (!users)
        return usersInit();
    else
        return users;
}

function getUsersAll(callback) {
    if (users)
        users.find({lastMessage: {$ne: null}}).sort('time').populate('lastMessage')
            .populate({
                path: 'unreadMessages',
                match: {'read': false},
                select: '_id + body'
            })
            .exec(function (err, data) {
            return callback(err, data);
        });
    else
        return callback("the user model didn't initiated");
}

function saveUser(usr, callback) {
    var userData = usr.toObject();
    console.log(userData);
    delete userData.unreadMessages;
    delete userData._id;
    console.log(userData);
    users.findOneAndUpdate({name: usr.name}, userData, {upsert: true, new: true}, function (err, doc) {
        if (err) // ...
            callback(err, doc._id);
        else
            callback(null, doc._id);
    });
}

function updateUserLastMessage(id, msgId, callback) {
    users.findOneAndUpdate({_id: id}, {lastMessage: msgId}, {upsert: true}, function (err, data) {
        if (err) // ...
            callback(err);
        else
            callback(null);
    });
}

function updateUserArchive(id, status, callback) {
    users.findOneAndUpdate({_id: id}, {archived: status}, {upsert: true}, function (err, data) {
        if (err) // ...
            callback(err);
        else
            callback(null);
    });
}

function addMessageToUserUnread(msg, callback) {
    users.findByIdAndUpdate(
        msg.user,
        {$push: {"unreadMessages": msg._id}},
        {upsert: true, new: true},
        function (err, model) {
            callback(err);
        }
    );
}

function getUserByName(name, callback) {
    if (users)
        users.find({name: name}).populate('lastMessage').exec(function (err, data) {
            if (err)
                callback(err, data);
            return callback(err, data);
        });
    else
        return callback("the user model didn't initiated");
}

function getUsersByQuery(query, callback) {
    if (users)
        users.find(query).populate('lastMessage')
            .populate({
                path: 'unreadMessages',
                match: {'read': false},
                select: '_id + body'
            }).exec(function (err, data) {
            if (err)
                callback(err, data);
            else
            return callback(err, data);
        });
    else
        return callback("the user model didn't initiated");
}

function getUnreadMessagesOfUser(id, callback) {
    if (userMessages)
        userMessages.find({user: id, read: false}).exec(function (err, data) {
            return callback(err, data.length);
        });
    else
        return callback("the Messages  model didn't initiated");
}

function deleteUserAndMessages(id, callback) {
    if (users)
        users.find({_id: id}).remove().exec(function (err, data) {

        });
    else
        return callback("the users  model didn't initiated");

}

module.exports = {
    connect: dbConnect,
    messages: {
        init: messagesInit,
        getAll: getMessagesAll,
        getByQuery: getMessagesByQuery,
        getHistoryById: getMessagesHistoryById,
        save: saveMessage,
        model: getMessageModel,
        hasRead: messageIsRead
    },
    users: {
        init: usersInit,
        model: getUsersModel,
        getAll: getUsersAll,
        save: saveUser,
        delete: deleteUserAndMessages,
        updateLastMsg: updateUserLastMessage,
        setArchive: updateUserArchive,
        getByName: getUserByName,
        getByQuery: getUsersByQuery,
        getUnread: getUnreadMessagesOfUser
    }
};